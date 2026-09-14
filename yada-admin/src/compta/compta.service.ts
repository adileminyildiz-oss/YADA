import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import {
  JOURNAUX_DEFAUT, COMPTES_DEFAUT, c9, classeDe, libelleDe, estLettrable,
  TVA_COLLECTEE, TVA_DEDUCTIBLE, COMPTE_PRODUIT_DEFAUT, COMPTE_CHARGE_DEFAUT,
  COMPTE_CLIENT, COMPTE_FOURNISSEUR, RESULTAT_BENEFICE, RESULTAT_PERTE,
} from './pcg';

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface LigneEcr { compte: string; libelle?: string; debit?: number; credit?: number; }
export interface EcritureInput {
  journal: string; date: string; piece?: string; libelle: string;
  lignes: LigneEcr[]; factureId?: string; receptionId?: string;
}

function lettreSuivante(n: number): string {
  // 0→A, 25→Z, 26→AA...
  let s = ''; let x = n;
  do { s = String.fromCharCode(65 + (x % 26)) + s; x = Math.floor(x / 26) - 1; } while (x >= 0);
  return s;
}

@Injectable()
export class ComptaService {
  constructor(private readonly db: DatabaseService) {}

  // ── mise en place (idempotente) ──────────────────────────────────────────
  private async ensureSetup(c: PoolClient, org: string, ent: string) {
    for (const j of JOURNAUX_DEFAUT) {
      await c.query(
        `insert into journaux (organisation_id, entreprise_id, code, libelle, type)
         values ($1,$2,$3,$4,$5) on conflict (organisation_id, entreprise_id, code) do nothing`,
        [org, ent, j.code, j.libelle, j.type]);
    }
    for (const [num, lib] of Object.entries(COMPTES_DEFAUT)) {
      await c.query(
        `insert into comptes (organisation_id, entreprise_id, numero, libelle, classe, lettrable)
         values ($1,$2,$3,$4,$5,$6) on conflict (organisation_id, entreprise_id, numero) do nothing`,
        [org, ent, num, lib, classeDe(num), estLettrable(num)]);
    }
  }

  private async ensureCompte(c: PoolClient, org: string, ent: string, numero: string, tiersId?: string | null) {
    const n = c9(numero);
    await c.query(
      `insert into comptes (organisation_id, entreprise_id, numero, libelle, classe, lettrable, tiers_id)
       values ($1,$2,$3,$4,$5,$6,$7) on conflict (organisation_id, entreprise_id, numero) do nothing`,
      [org, ent, n, libelleDe(n), classeDe(n), estLettrable(n), tiersId ?? null]);
  }

  private async resolveExercice(c: PoolClient, ent: string, date: string): Promise<string> {
    const r = await c.query(
      `select id from exercices where entreprise_id=$1 and $2::date between date_debut and date_fin
         and statut='ouvert' order by date_debut desc limit 1`, [ent, date]);
    if (!r.rows[0]) throw new BadRequestException(`Aucun exercice ouvert ne couvre la date ${date}.`);
    return r.rows[0].id;
  }

  async listExercices(org: string, ent: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select id, date_debut, date_fin, statut, created_at
           from exercices where entreprise_id=$1 order by date_debut desc`, [ent]);
      return r.rows;
    });
  }

  async createExercice(org: string, user: string, ent: string, dateDebut: string, dateFin: string) {
    return this.db.withTenant(org, async (c) => {
      const e = await c.query('select 1 from entreprises where id=$1 and deleted_at is null', [ent]);
      if (e.rowCount === 0) throw new NotFoundException('Entreprise introuvable.');
      await this.ensureSetup(c, org, ent);
      const r = await c.query(
        `insert into exercices (organisation_id, entreprise_id, date_debut, date_fin)
         values ($1,$2,$3,$4)
         on conflict (organisation_id, entreprise_id, date_debut) do update set date_fin=excluded.date_fin
         returning *`, [org, ent, dateDebut, dateFin]);
      await this.db.audit(c, org, user, 'exercices', r.rows[0].id, 'creation', { dateDebut, dateFin });
      return r.rows[0];
    });
  }

  // ── LE MOTEUR : passer une écriture (équilibre garanti par la base) ───────
  private async inserer(c: PoolClient, org: string, user: string, ent: string, e: EcritureInput) {
    const jr = await c.query('select id from journaux where entreprise_id=$1 and code=$2', [ent, e.journal]);
    if (!jr.rows[0]) throw new BadRequestException(`Journal ${e.journal} inconnu.`);
    const exId = await this.resolveExercice(c, ent, e.date);
    const ecr = await c.query(
      `insert into ecritures (organisation_id, entreprise_id, exercice_id, journal_id, date, numero_piece, libelle, facture_id, reception_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
      [org, ent, exId, jr.rows[0].id, e.date, e.piece ?? null, e.libelle, e.factureId ?? null, e.receptionId ?? null]);
    const ecrId = ecr.rows[0].id;
    for (const l of e.lignes) {
      const n = c9(l.compte);
      await this.ensureCompte(c, org, ent, n);
      await c.query(
        `insert into ecriture_lignes (organisation_id, ecriture_id, compte_numero, libelle, debit, credit)
         values ($1,$2,$3,$4,$5,$6)`,
        [org, ecrId, n, l.libelle ?? e.libelle, r2(l.debit ?? 0), r2(l.credit ?? 0)]);
    }
    await this.db.audit(c, org, user, 'ecritures', ecrId, 'creation', { journal: e.journal, piece: e.piece });
    return ecrId;
  }

  async passerEcriture(org: string, user: string, ent: string, e: EcritureInput) {
    if (!e.lignes?.length) throw new BadRequestException('Au moins une ligne est requise.');
    try {
      return await this.db.withTenant(org, async (c) => {
        const id = await this.inserer(c, org, user, ent, e);
        return this.detail(c, id);
      });
    } catch (err) {
      // Le trigger d'équilibre lève une check_violation au commit.
      if ((err as { code?: string }).code === '23514' || /déséquilibrée|sans ligne/.test((err as Error).message)) {
        throw new BadRequestException('Écriture rejetée : Σ débit doit égaler Σ crédit (écriture non équilibrée).');
      }
      throw err;
    }
  }

  private async detail(c: PoolClient, ecrId: string) {
    const e = await c.query('select * from ecritures where id=$1', [ecrId]);
    const l = await c.query('select compte_numero, libelle, debit, credit, lettre from ecriture_lignes where ecriture_id=$1 order by id', [ecrId]);
    const d = l.rows.reduce((s, x) => s + Number(x.debit), 0);
    const cr = l.rows.reduce((s, x) => s + Number(x.credit), 0);
    return { ecriture: e.rows[0], lignes: l.rows, totalDebit: r2(d), totalCredit: r2(cr), equilibree: Math.abs(d - cr) < 0.005 };
  }

  // ── génération automatique depuis une facture (VTE) ───────────────────────
  async genererDepuisFacture(org: string, user: string, factureId: string) {
    return this.db.withTenant(org, async (c) => {
      const f = await c.query('select * from factures where id=$1 and deleted_at is null', [factureId]);
      if (!f.rows[0]) throw new NotFoundException('Facture introuvable.');
      const fac = f.rows[0];
      const exist = await c.query('select id from ecritures where facture_id=$1 limit 1', [factureId]);
      if (exist.rows[0]) throw new ConflictException('Écriture déjà générée pour cette facture.');
      const ent = fac.entreprise_id;
      await this.ensureSetup(c, org, ent);

      let clientCompte = COMPTE_CLIENT;
      if (fac.tiers_id) {
        const t = await c.query('select compte_auxiliaire from tiers where id=$1', [fac.tiers_id]);
        if (t.rows[0]?.compte_auxiliaire) { clientCompte = c9(t.rows[0].compte_auxiliaire); await this.ensureCompte(c, org, ent, clientCompte, fac.tiers_id); }
      }
      const lg = await c.query('select * from facture_lignes where facture_id=$1', [factureId]);
      const parProduit = new Map<string, number>();
      const parTaux = new Map<number, number>();
      for (const l of lg.rows) {
        const net = r2(Number(l.quantite) * Number(l.prix_unitaire_ht) * (1 - Number(l.remise_pct) / 100));
        const prod = c9(l.compte_produit || COMPTE_PRODUIT_DEFAUT);
        parProduit.set(prod, r2((parProduit.get(prod) || 0) + net));
        const taux = Number(l.taux_tva);
        parTaux.set(taux, r2((parTaux.get(taux) || 0) + net));
      }
      const lignes: LigneEcr[] = [{ compte: clientCompte, debit: Number(fac.montant_ttc), libelle: `Client — ${fac.numero}` }];
      for (const [prod, base] of parProduit) lignes.push({ compte: prod, credit: base, libelle: 'Vente' });
      for (const [taux, base] of parTaux) {
        const tva = r2(base * taux / 100);
        if (tva > 0) lignes.push({ compte: TVA_COLLECTEE, credit: tva, libelle: `TVA collectée ${taux}%` });
      }
      const dt = fac.date_emission instanceof Date ? fac.date_emission.toISOString().slice(0, 10) : String(fac.date_emission);
      const id = await this.inserer(c, org, user, ent, {
        journal: 'VTE', date: dt, piece: fac.numero, libelle: `Facture ${fac.numero}`, lignes, factureId,
      });
      return this.detail(c, id);
    });
  }

  // ── génération automatique depuis une réception (ACH) ─────────────────────
  async genererDepuisReception(org: string, user: string, receptionId: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query('select * from receptions where id=$1', [receptionId]);
      if (!r.rows[0]) throw new NotFoundException('Réception introuvable.');
      const rec = r.rows[0];
      if (rec.statut !== 'comptabilisee') throw new BadRequestException('La réception doit être comptabilisée (validée) au préalable.');
      const exist = await c.query('select id from ecritures where reception_id=$1 limit 1', [receptionId]);
      if (exist.rows[0]) throw new ConflictException('Écriture déjà générée pour cette réception.');
      const ent = rec.entreprise_id;
      await this.ensureSetup(c, org, ent);

      const ttc = Number(rec.montant_ttc || 0);
      const tva = Number(rec.montant_tva || 0);
      const ht = rec.montant_ht != null ? Number(rec.montant_ht) : r2(ttc - tva);
      let fournCompte = COMPTE_FOURNISSEUR;
      if (rec.tiers_id) {
        const t = await c.query('select compte_auxiliaire from tiers where id=$1', [rec.tiers_id]);
        if (t.rows[0]?.compte_auxiliaire) { fournCompte = c9(t.rows[0].compte_auxiliaire); await this.ensureCompte(c, org, ent, fournCompte, rec.tiers_id); }
      }
      const lignes: LigneEcr[] = [{ compte: COMPTE_CHARGE_DEFAUT, debit: ht, libelle: 'Achat' }];
      if (tva > 0) lignes.push({ compte: TVA_DEDUCTIBLE, debit: tva, libelle: 'TVA déductible' });
      lignes.push({ compte: fournCompte, credit: r2(ht + tva), libelle: `Fournisseur — ${rec.numero || ''}` });
      const dt = rec.date_facture instanceof Date ? rec.date_facture.toISOString().slice(0, 10)
        : (rec.date_facture ? String(rec.date_facture) : new Date().toISOString().slice(0, 10));
      const id = await this.inserer(c, org, user, ent, {
        journal: 'ACH', date: dt, piece: rec.numero, libelle: `Achat ${rec.numero || ''}`.trim(), lignes, receptionId,
      });
      return this.detail(c, id);
    });
  }

  // ── lettrage ──────────────────────────────────────────────────────────────
  async lettrer(org: string, user: string, ent: string, compte: string, ligneIds: string[]) {
    if (!ligneIds?.length) throw new BadRequestException('Sélectionnez des lignes à lettrer.');
    const n = c9(compte);
    return this.db.withTenant(org, async (c) => {
      const l = await c.query(
        `select id, debit, credit from ecriture_lignes where id = any($1::uuid[]) and compte_numero=$2`,
        [ligneIds, n]);
      if (l.rowCount !== ligneIds.length) throw new BadRequestException('Lignes invalides ou compte incohérent.');
      const d = l.rows.reduce((s, x) => s + Number(x.debit), 0);
      const cr = l.rows.reduce((s, x) => s + Number(x.credit), 0);
      if (Math.abs(d - cr) > 0.005) throw new BadRequestException(`Lettrage refusé : débit (${r2(d)}) ≠ crédit (${r2(cr)}).`);
      const used = await c.query('select distinct lettre from ecriture_lignes where organisation_id=$1 and compte_numero=$2 and lettre is not null', [org, n]);
      const lettre = lettreSuivante(used.rowCount ?? 0);
      await c.query('update ecriture_lignes set lettre=$3 where id = any($1::uuid[]) and compte_numero=$2', [ligneIds, n, lettre]);
      await this.db.audit(c, org, user, 'ecriture_lignes', null, 'modification', { lettrage: lettre, compte: n });
      return { lettre, compte: n, lignes: ligneIds.length };
    });
  }

  // ── éditions ────────────────────────────────────────────────────────────
  async balance(org: string, ent: string, exerciceId: string) {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select el.compte_numero, cp.libelle,
                sum(el.debit) as debit, sum(el.credit) as credit
           from ecriture_lignes el
           join ecritures e on e.id = el.ecriture_id
           left join comptes cp on cp.entreprise_id = e.entreprise_id and cp.numero = el.compte_numero
          where e.entreprise_id=$1 and e.exercice_id=$2
          group by el.compte_numero, cp.libelle
          order by el.compte_numero`, [ent, exerciceId]);
      const lignes = r.rows.map((x) => ({
        compte: x.compte_numero, libelle: x.libelle || libelleDe(x.compte_numero),
        debit: r2(Number(x.debit)), credit: r2(Number(x.credit)), solde: r2(Number(x.debit) - Number(x.credit)),
      }));
      const totalDebit = r2(lignes.reduce((s, l) => s + l.debit, 0));
      const totalCredit = r2(lignes.reduce((s, l) => s + l.credit, 0));
      return { lignes, totalDebit, totalCredit, equilibree: Math.abs(totalDebit - totalCredit) < 0.005 };
    });
  }

  async grandLivre(org: string, ent: string, compte: string, exerciceId?: string) {
    const n = c9(compte);
    return this.db.withTenant(org, async (c) => {
      const params: unknown[] = [ent, n];
      let filtreEx = '';
      if (exerciceId) { params.push(exerciceId); filtreEx = ' and e.exercice_id=$3'; }
      const r = await c.query(
        `select el.id, e.date, j.code as journal, e.numero_piece, el.libelle, el.debit, el.credit, el.lettre
           from ecriture_lignes el
           join ecritures e on e.id = el.ecriture_id
           join journaux j on j.id = e.journal_id
          where e.entreprise_id=$1 and el.compte_numero=$2${filtreEx}
          order by e.date, e.id`, params);
      let solde = 0;
      const lignes = r.rows.map((x) => { solde = r2(solde + Number(x.debit) - Number(x.credit)); return { ...x, debit: Number(x.debit), credit: Number(x.credit), solde }; });
      return { compte: n, libelle: libelleDe(n), lignes, solde };
    });
  }

  // ── TVA (CA3) ─────────────────────────────────────────────────────────────
  async ca3(org: string, ent: string, exerciceId: string, mois?: string) {
    return this.db.withTenant(org, async (c) => {
      const params: unknown[] = [ent, exerciceId];
      let fmois = '';
      if (mois) { params.push(mois); fmois = " and to_char(e.date,'YYYY-MM')=$3"; }
      const col = await c.query(
        `select coalesce(sum(el.credit-el.debit),0) as v from ecriture_lignes el join ecritures e on e.id=el.ecriture_id
          where e.entreprise_id=$1 and e.exercice_id=$2 and el.compte_numero like '4457%'${fmois}`, params);
      const ded = await c.query(
        `select coalesce(sum(el.debit-el.credit),0) as v from ecriture_lignes el join ecritures e on e.id=el.ecriture_id
          where e.entreprise_id=$1 and e.exercice_id=$2 and el.compte_numero like '4456%' and el.compte_numero not like '44567%'${fmois}`, params);
      const collectee = r2(Number(col.rows[0].v));
      const deductible = r2(Number(ded.rows[0].v));
      const net = r2(collectee - deductible);
      return { collectee, deductible, aDecaisser: net > 0 ? net : 0, creditTva: net < 0 ? -net : 0 };
    });
  }

  // ── FEC (export normé, tabulé) ────────────────────────────────────────────
  async fec(org: string, ent: string, exerciceId: string): Promise<string> {
    return this.db.withTenant(org, async (c) => {
      const r = await c.query(
        `select j.code as jc, j.libelle as jl, e.id as ecr, e.date, e.numero_piece, e.libelle as el,
                el.compte_numero, cp.libelle as cl, el.debit, el.credit, el.lettre
           from ecriture_lignes el
           join ecritures e on e.id=el.ecriture_id
           join journaux j on j.id=e.journal_id
           left join comptes cp on cp.entreprise_id=e.entreprise_id and cp.numero=el.compte_numero
          where e.entreprise_id=$1 and e.exercice_id=$2
          order by e.date, e.id, el.id`, [ent, exerciceId]);
      const head = ['JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib',
        'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit', 'EcritureLet'].join('\t');
      const fecDate = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d)).replace(/-/g, '');
      const num = (n: unknown) => Number(n).toFixed(2).replace('.', ',');
      const rows = r.rows.map((x) => [
        x.jc, x.jl, x.ecr.slice(0, 8), fecDate(x.date), x.compte_numero, x.cl || libelleDe(x.compte_numero),
        x.numero_piece || '', fecDate(x.date), x.el, num(x.debit), num(x.credit), x.lettre || '',
      ].join('\t'));
      return [head, ...rows].join('\n');
    });
  }

  // ── clôture : OD de résultat + report des à-nouveaux (ouverture N+1) ───────
  async cloturer(org: string, user: string, ent: string, exerciceId: string) {
    return this.db.withTenant(org, async (c) => {
      const ex = await c.query('select * from exercices where id=$1 and entreprise_id=$2', [exerciceId, ent]);
      if (!ex.rows[0]) throw new NotFoundException('Exercice introuvable.');
      if (ex.rows[0].statut === 'cloture') throw new BadRequestException('Exercice déjà clôturé.');
      await this.ensureSetup(c, org, ent);
      const finIso = ex.rows[0].date_fin instanceof Date ? ex.rows[0].date_fin.toISOString().slice(0, 10) : String(ex.rows[0].date_fin);

      // Soldes par compte de l'exercice.
      const bal = await c.query(
        `select el.compte_numero, sum(el.debit) d, sum(el.credit) cr
           from ecriture_lignes el join ecritures e on e.id=el.ecriture_id
          where e.entreprise_id=$1 and e.exercice_id=$2 group by el.compte_numero`, [ent, exerciceId]);

      // 1) OD de résultat : solder les classes 6 et 7 → 120/129.
      //    produit = crédit net (classe 7), charge = débit net (classe 6).
      const odResultat: LigneEcr[] = [];
      let produits = 0, charges = 0;
      for (const b of bal.rows) {
        const cl = classeDe(b.compte_numero); const d = Number(b.d); const cr = Number(b.cr);
        if (cl === 7) { const net = r2(cr - d); if (net !== 0) { odResultat.push({ compte: b.compte_numero, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 }); produits = r2(produits + net); } }
        if (cl === 6) { const net = r2(d - cr); if (net !== 0) { odResultat.push({ compte: b.compte_numero, debit: net < 0 ? -net : 0, credit: net > 0 ? net : 0 }); charges = r2(charges + net); } }
      }
      const resultat = r2(produits - charges);
      if (resultat >= 0) odResultat.push({ compte: RESULTAT_BENEFICE, credit: resultat, debit: 0, libelle: 'Résultat (bénéfice)' });
      else odResultat.push({ compte: RESULTAT_PERTE, debit: -resultat, credit: 0, libelle: 'Résultat (perte)' });

      if (odResultat.length > 1) {
        await this.inserer(c, org, user, ent, { journal: 'OD', date: finIso, piece: 'CLOTURE', libelle: 'OD de résultat', lignes: odResultat });
      }

      // 2) Nouvel exercice (N+1) + à-nouveaux (report des soldes classes 1→5, y compris résultat).
      const nd = new Date(finIso); nd.setDate(nd.getDate() + 1);
      const debutN1 = nd.toISOString().slice(0, 10);
      const finN1b = new Date(debutN1); finN1b.setFullYear(finN1b.getFullYear() + 1); finN1b.setDate(finN1b.getDate() - 1);
      const exN1 = await c.query(
        `insert into exercices (organisation_id, entreprise_id, date_debut, date_fin) values ($1,$2,$3,$4)
         on conflict (organisation_id, entreprise_id, date_debut) do update set date_fin=excluded.date_fin returning id`,
        [org, ent, debutN1, finN1b.toISOString().slice(0, 10)]);

      // à-nouveaux : soldes bilan (classes 1-5) après résultat.
      const balAN = await c.query(
        `select el.compte_numero, sum(el.debit) d, sum(el.credit) cr
           from ecriture_lignes el join ecritures e on e.id=el.ecriture_id
          where e.entreprise_id=$1 and e.exercice_id=$2 group by el.compte_numero`, [ent, exerciceId]);
      const anLignes: LigneEcr[] = [];
      for (const b of balAN.rows) {
        const cl = classeDe(b.compte_numero); if (cl < 1 || cl > 5) continue;
        const solde = r2(Number(b.d) - Number(b.cr)); if (solde === 0) continue;
        anLignes.push({ compte: b.compte_numero, debit: solde > 0 ? solde : 0, credit: solde < 0 ? -solde : 0 });
      }
      // équilibrage par le résultat (déjà soldé en 120/129 via OD résultat qui est classe 1).
      const totD = r2(anLignes.reduce((s, l) => s + (l.debit || 0), 0));
      const totC = r2(anLignes.reduce((s, l) => s + (l.credit || 0), 0));
      if (anLignes.length && Math.abs(totD - totC) < 0.005) {
        // ouvrir N+1 sur le 1er jour
        await c.query('update exercices set statut=$2 where id=$1', [exerciceId, 'cloture']);
        // insérer les à-nouveaux dans N+1 (journal AN, date début N+1)
        const jr = await c.query('select id from journaux where entreprise_id=$1 and code=$2', [ent, 'AN']);
        const ecr = await c.query(
          `insert into ecritures (organisation_id, entreprise_id, exercice_id, journal_id, date, numero_piece, libelle)
           values ($1,$2,$3,$4,$5,'AN','À-nouveaux') returning id`,
          [org, ent, exN1.rows[0].id, jr.rows[0].id, debutN1]);
        for (const l of anLignes) {
          await this.ensureCompte(c, org, ent, l.compte);
          await c.query(`insert into ecriture_lignes (organisation_id, ecriture_id, compte_numero, libelle, debit, credit)
            values ($1,$2,$3,'À-nouveau',$4,$5)`, [org, ecr.rows[0].id, c9(l.compte), r2(l.debit || 0), r2(l.credit || 0)]);
        }
      } else {
        await c.query('update exercices set statut=$2 where id=$1', [exerciceId, 'cloture']);
      }
      await this.db.audit(c, org, user, 'exercices', exerciceId, 'modification', { cloture: true, resultat });
      return { resultat, produits, charges, exerciceSuivant: exN1.rows[0].id, aNouveaux: anLignes.length };
    });
  }
}
