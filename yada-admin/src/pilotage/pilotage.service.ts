import { Injectable, NotFoundException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import { calcIS, calcIR } from './fisc';
import { proposeCompte } from './ia';

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

@Injectable()
export class PilotageService {
  constructor(private readonly db: DatabaseService) {}

  private async somme(c: PoolClient, ent: string, exId: string, prefixe: string, sens: 'debit' | 'credit') {
    const expr = sens === 'debit' ? 'el.debit - el.credit' : 'el.credit - el.debit';
    const r = await c.query(
      `select coalesce(sum(${expr}),0) as v
         from ecriture_lignes el join ecritures e on e.id = el.ecriture_id
        where e.entreprise_id=$1 and e.exercice_id=$2 and el.compte_numero like $3
          and e.libelle <> 'OD de résultat'`, [ent, exId, prefixe + '%']);
    return r2(Number(r.rows[0].v));
  }

  // ── Pilotage : indicateurs vivants, dérivés des écritures ────────────────
  async kpis(org: string, ent: string, exId: string) {
    return this.db.withTenant(org, async (c) => {
      const produits = await this.somme(c, ent, exId, '7', 'credit');
      const charges = await this.somme(c, ent, exId, '6', 'debit');
      const treso = await this.somme(c, ent, exId, '512', 'debit');
      const creances = await this.somme(c, ent, exId, '411', 'debit');
      const dettes = await this.somme(c, ent, exId, '401', 'credit');
      return {
        chiffreAffaires: produits, charges, resultat: r2(produits - charges),
        marge: produits > 0 ? r2(((produits - charges) / produits) * 100) : 0,
        tresorerie: treso, creancesClients: creances, dettesFournisseurs: dettes,
      };
    });
  }

  // ── Fiscalité : calculs (non stockés) ────────────────────────────────────
  async calculerFisc(org: string, ent: string, exId: string, type: 'is' | 'ir', parts = 1) {
    return this.db.withTenant(org, async (c) => {
      const produits = await this.somme(c, ent, exId, '7', 'credit');
      const charges = await this.somme(c, ent, exId, '6', 'debit');
      const resultat = r2(produits - charges);
      if (type === 'ir') return { type, base: resultat, ...calcIR(resultat, parts) };
      return { type, ...calcIS(resultat) };
    });
  }

  async declarationCreer(org: string, user: string, ent: string, dto: {
    type: string; periode: string; dateEcheance?: string; montant?: number; donnees?: unknown;
  }) {
    return this.db.withTenant(org, async (c) => {
      const e = await c.query('select 1 from entreprises where id=$1 and deleted_at is null', [ent]);
      if (e.rowCount === 0) throw new NotFoundException('Entreprise introuvable.');
      const r = await c.query(
        `insert into declarations (organisation_id, entreprise_id, type, periode, date_echeance, montant, donnees, statut)
         values ($1,$2,$3,$4,$5,$6,$7,'planifiee') returning *`,
        [org, ent, dto.type, dto.periode, dto.dateEcheance ?? null, dto.montant ?? null,
         JSON.stringify(dto.donnees ?? {})]);
      await this.db.audit(c, org, user, 'declarations', r.rows[0].id, 'creation', { type: dto.type, periode: dto.periode });
      return r.rows[0];
    });
  }

  declarationsList(org: string, ent: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select * from declarations where entreprise_id=$1 order by date_echeance nulls last, created_at`, [ent]);
      return r.rows;
    });
  }

  async declarationStatut(org: string, user: string, id: string, statut: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query('update declarations set statut=$2 where id=$1 returning *', [id, statut]);
      if (!r.rows[0]) throw new NotFoundException('Déclaration introuvable.');
      await this.db.audit(c, org, user, 'declarations', id, 'modification', { statut });
      return r.rows[0];
    });
  }

  // ── Assistant IA : propose, l'humain valide ──────────────────────────────
  async iaProposer(org: string, user: string, ent: string, libelle: string, receptionId?: string) {
    const imp = proposeCompte(libelle);
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `insert into ia_suggestions (organisation_id, entreprise_id, type, source_reception_id, proposition, justification, confiance, statut)
         values ($1,$2,'imputation',$3,$4,$5,$6,'en_attente') returning *`,
        [org, ent, receptionId ?? null,
         JSON.stringify({ compte: imp.compte, libelleCompte: imp.libelle, source: libelle }),
         `Imputation proposée « ${imp.libelle} » (${imp.compte}) d'après « ${libelle} ».`, imp.confiance]);
      await this.db.audit(c, org, user, 'ia_suggestions', r.rows[0].id, 'creation', { compte: imp.compte });
      return r.rows[0];
    });
  }

  /** Contrôle de cohérence : comptes d'attente (471) non soldés → anomalie. */
  async iaControleAttente(org: string, user: string, ent: string, exId: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select coalesce(sum(el.debit-el.credit),0) as v, count(*) n
           from ecriture_lignes el join ecritures e on e.id=el.ecriture_id
          where e.entreprise_id=$1 and e.exercice_id=$2 and el.compte_numero like '471%'`, [ent, exId]);
      const solde = r2(Number(r.rows[0].v));
      if (Math.abs(solde) < 0.005) return { anomalie: false };
      const s = await c.query(
        `insert into ia_suggestions (organisation_id, entreprise_id, type, proposition, justification, confiance, statut)
         values ($1,$2,'anomalie',$3,$4,0.95,'en_attente') returning *`,
        [org, ent, JSON.stringify({ compte: '471', solde }),
         `Compte d'attente 471 non soldé (${solde}) — à ventiler.`]);
      await this.db.audit(c, org, user, 'ia_suggestions', s.rows[0].id, 'creation', { anomalie: '471', solde });
      return { anomalie: true, suggestion: s.rows[0] };
    });
  }

  iaList(org: string, ent: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select * from ia_suggestions where entreprise_id=$1 order by created_at desc`, [ent]);
      return r.rows;
    });
  }

  async iaStatut(org: string, user: string, id: string, statut: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query('update ia_suggestions set statut=$2 where id=$1 returning *', [id, statut]);
      if (!r.rows[0]) throw new NotFoundException('Suggestion introuvable.');
      await this.db.audit(c, org, user, 'ia_suggestions', id, 'modification', { statut });
      return r.rows[0];
    });
  }
}
