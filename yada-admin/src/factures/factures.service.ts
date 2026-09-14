import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import { CreateFactureDto, ReglementDto } from './dto';
import { computeTotals, facturxXML, LigneInput } from './facture.calc';
import { facturePdf } from './facture.pdf';

const PREFIX: Record<string, string> = { devis: 'DEV', facture: 'BR', avoir: 'AV', acompte: 'AC' };

@Injectable()
export class FacturesService {
  constructor(private readonly db: DatabaseService) {}

  private async loadDetail(c: PoolClient, id: string) {
    const f = await c.query('select * from factures where id=$1 and deleted_at is null', [id]);
    if (!f.rows[0]) throw new NotFoundException('Facture introuvable.');
    const l = await c.query('select * from facture_lignes where facture_id=$1 order by ordre, id', [id]);
    const r = await c.query('select id, date_reglement, montant, moyen from reglements where facture_id=$1 order by date_reglement', [id]);
    const lignes: LigneInput[] = l.rows.map((x) => ({
      designation: x.designation, quantite: Number(x.quantite), prixUnitaireHt: Number(x.prix_unitaire_ht),
      tauxTva: Number(x.taux_tva), remisePct: Number(x.remise_pct), nature: x.nature, compteProduit: x.compte_produit,
    }));
    return { facture: f.rows[0], lignes: l.rows, reglements: r.rows, ventilation: computeTotals(lignes) };
  }

  async create(orgId: string, userId: string, entrepriseId: string, dto: CreateFactureDto) {
    if (!dto.lignes?.length) throw new BadRequestException('Au moins une ligne est requise.');
    const type = dto.type || 'facture';
    const totals = computeTotals(dto.lignes as LigneInput[]);
    return this.db.withTenant(orgId, async (c) => {
      const ent = await c.query('select 1 from entreprises where id=$1 and deleted_at is null', [entrepriseId]);
      if (ent.rowCount === 0) throw new NotFoundException('Entreprise introuvable.');
      const num = await c.query('select next_numero($1,$2) as n', [entrepriseId, PREFIX[type]]);
      const numero = num.rows[0].n;
      const f = await c.query(
        `insert into factures
           (organisation_id, entreprise_id, tiers_id, type, numero, date_emission, date_echeance,
            statut, montant_ht, montant_tva, montant_ttc, conditions, regime_tva, devise, facture_origine_id)
         values ($1,$2,$3,$4,$5, coalesce($6, current_date), $7, 'brouillon', $8,$9,$10,$11,
                 coalesce($12,'normal'), coalesce($13,'EUR'), $14)
         returning id`,
        [orgId, entrepriseId, dto.tiersId ?? null, type, numero, dto.dateEmission ?? null,
         dto.dateEcheance ?? null, totals.ht, totals.tva, totals.ttc, dto.conditions ?? null,
         dto.regimeTva ?? null, dto.devise ?? null, dto.factureOrigineId ?? null],
      );
      const fid = f.rows[0].id;
      let ordre = 0;
      for (const l of dto.lignes) {
        await c.query(
          `insert into facture_lignes
             (organisation_id, facture_id, designation, quantite, prix_unitaire_ht, taux_tva, remise_pct, nature, compte_produit, ordre)
           values ($1,$2,$3,$4,$5,$6, coalesce($7,0), coalesce($8,'service'), $9, $10)`,
          [orgId, fid, l.designation, l.quantite, l.prixUnitaireHt, l.tauxTva,
           l.remisePct ?? null, l.nature ?? null, l.compteProduit ?? null, ordre++],
        );
      }
      await this.db.audit(c, orgId, userId, 'factures', fid, 'creation', { numero, type, ttc: totals.ttc });
      return this.loadDetail(c, fid);
    });
  }

  list(orgId: string, entrepriseId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select id, type, numero, date_emission, statut, montant_ht, montant_tva, montant_ttc, montant_paye
           from factures where entreprise_id=$1 and deleted_at is null order by date_emission desc, numero desc`,
        [entrepriseId]);
      return r.rows;
    });
  }

  get(orgId: string, factureId: string) {
    return this.db.withTenant(orgId, (c) => this.loadDetail(c, factureId));
  }

  /** Passage brouillon → émise : la facture reçoit son numéro définitif FAC continu. */
  async emettre(orgId: string, userId: string, factureId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const f = await c.query('select id, type, numero, statut, entreprise_id from factures where id=$1 and deleted_at is null', [factureId]);
      if (!f.rows[0]) throw new NotFoundException('Facture introuvable.');
      if (f.rows[0].statut !== 'brouillon') throw new BadRequestException('Seule une facture en brouillon peut être émise.');
      let numero = f.rows[0].numero as string;
      if (f.rows[0].type === 'facture' && numero.startsWith('BR-')) {
        const n = await c.query('select next_numero($1,$2) as n', [f.rows[0].entreprise_id, 'FAC']);
        numero = n.rows[0].n;
      }
      await c.query('update factures set statut=$2, numero=$3 where id=$1', [factureId, 'emise', numero]);
      await this.db.audit(c, orgId, userId, 'factures', factureId, 'modification', { emise: numero });
      return this.loadDetail(c, factureId);
    });
  }

  async addReglement(orgId: string, userId: string, factureId: string, dto: ReglementDto) {
    return this.db.withTenant(orgId, async (c) => {
      const f = await c.query('select id, entreprise_id, montant_ttc from factures where id=$1 and deleted_at is null', [factureId]);
      if (!f.rows[0]) throw new NotFoundException('Facture introuvable.');
      await c.query(
        `insert into reglements (organisation_id, entreprise_id, facture_id, montant, moyen, date_reglement)
         values ($1,$2,$3,$4, coalesce($5,'virement'), coalesce($6, current_date))`,
        [orgId, f.rows[0].entreprise_id, factureId, dto.montant, dto.moyen ?? null, dto.dateReglement ?? null]);
      const s = await c.query('select coalesce(sum(montant),0) as paye from reglements where facture_id=$1', [factureId]);
      const paye = Number(s.rows[0].paye);
      const ttc = Number(f.rows[0].montant_ttc);
      const statut = paye >= ttc - 0.005 ? 'payee' : paye > 0 ? 'partielle' : 'emise';
      await c.query('update factures set montant_paye=$2, statut=$3 where id=$1', [factureId, paye, statut]);
      await this.db.audit(c, orgId, userId, 'factures', factureId, 'modification', { reglement: dto.montant, paye, statut });
      return this.loadDetail(c, factureId);
    });
  }

  /** PDF lisible de la facture (aperçu / téléchargement). */
  async pdf(orgId: string, factureId: string): Promise<{ numero: string; buffer: Buffer }> {
    return this.db.withTenant(orgId, async (c) => {
      const d = await this.loadDetail(c, factureId);
      const ent = await c.query('select denomination, siren, tva_intra from entreprises where id=$1', [d.facture.entreprise_id]);
      let acheteur: { nom: string; tvaIntra: string | null } = { nom: 'Client', tvaIntra: null };
      if (d.facture.tiers_id) {
        const t = await c.query('select nom, tva_intra from tiers where id=$1', [d.facture.tiers_id]);
        if (t.rows[0]) acheteur = { nom: t.rows[0].nom, tvaIntra: t.rows[0].tva_intra };
      }
      const v = ent.rows[0] || { denomination: 'Vendeur', siren: null, tva_intra: null };
      const iso = (x: unknown) => (x instanceof Date ? x.toISOString().slice(0, 10) : (x ? String(x) : null));
      const buffer = facturePdf({
        numero: d.facture.numero,
        type: d.facture.type,
        dateEmission: iso(d.facture.date_emission) || '',
        dateEcheance: iso(d.facture.date_echeance),
        devise: d.facture.devise,
        statut: d.facture.statut,
        conditions: d.facture.conditions,
        vendeur: { nom: v.denomination, siren: v.siren, tvaIntra: v.tva_intra },
        acheteur,
        lignes: d.lignes.map((x: Record<string, unknown>) => ({
          designation: x.designation as string, quantite: Number(x.quantite),
          prixUnitaireHt: Number(x.prix_unitaire_ht), tauxTva: Number(x.taux_tva),
          remisePct: Number(x.remise_pct),
        })),
        totaux: d.ventilation,
      });
      return { numero: d.facture.numero as string, buffer };
    });
  }

  /** Génère le Factur-X (XML CII) de la facture. */
  async facturx(orgId: string, factureId: string): Promise<string> {
    return this.db.withTenant(orgId, async (c) => {
      const d = await this.loadDetail(c, factureId);
      const ent = await c.query('select denomination, siren, tva_intra from entreprises where id=$1', [d.facture.entreprise_id]);
      let acheteur = { nom: 'Client', tvaIntra: null as string | null };
      if (d.facture.tiers_id) {
        const t = await c.query('select nom, tva_intra from tiers where id=$1', [d.facture.tiers_id]);
        if (t.rows[0]) acheteur = { nom: t.rows[0].nom, tvaIntra: t.rows[0].tva_intra };
      }
      const v = ent.rows[0] || { denomination: 'Vendeur', siren: null, tva_intra: null };
      return facturxXML({
        numero: d.facture.numero,
        dateEmission: (d.facture.date_emission instanceof Date
          ? d.facture.date_emission.toISOString().slice(0, 10)
          : String(d.facture.date_emission)),
        vendeur: { nom: v.denomination, siren: v.siren, tvaIntra: v.tva_intra },
        acheteur,
        lignes: d.lignes.map((x: Record<string, unknown>) => ({
          designation: x.designation as string, quantite: Number(x.quantite),
          prixUnitaireHt: Number(x.prix_unitaire_ht), tauxTva: Number(x.taux_tva),
          remisePct: Number(x.remise_pct),
        })),
        totaux: d.ventilation,
        devise: d.facture.devise,
      });
    });
  }
}
