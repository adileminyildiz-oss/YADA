import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import { DepositDto, ComptabiliserDto, ValiderFicheDto } from './dto';
import { extractInvoiceData } from './extract';

/** Compte auxiliaire depuis un nom (401XXXXX fourn. / 411XXXXX client). */
function genAux(prefix: '401' | '411', nom: string): string {
  const base = (nom || 'TIERS').toUpperCase().normalize('NFD').replace(/[^A-Z0-9]/g, '');
  return prefix + (base + '00000').slice(0, 5);
}

@Injectable()
export class ReceptionService {
  constructor(private readonly db: DatabaseService) {}

  async deposit(orgId: string, userId: string, entrepriseId: string, dto: DepositDto) {
    return this.db.withTenant(orgId, async (c) => {
      const ent = await c.query('select 1 from entreprises where id=$1 and deleted_at is null', [entrepriseId]);
      if (ent.rowCount === 0) throw new NotFoundException('Entreprise introuvable.');

      const data = dto.texteOcr ? extractInvoiceData(dto.texteOcr) : null;

      const doc = await c.query(
        `insert into documents
           (organisation_id, entreprise_id, categorie, nom_fichier, chemin_stockage, mime,
            texte_ocr, hash_sha256, canal, confiance_ocr, created_by)
         values ($1,$2,'facture',$3,$4,$5,$6,$7, coalesce($8,'manuel'), $9, $10) returning id`,
        [orgId, entrepriseId, dto.nomFichier, dto.cheminStockage, dto.mime ?? null,
         dto.texteOcr ?? null, dto.hash ?? null, dto.canal ?? null, data?.confiance ?? null, userId],
      );
      const documentId = doc.rows[0].id;

      // Rapprochement fournisseur par nom (sinon fiche à créer).
      let tiersId: string | null = null;
      if (data?.fournisseur) {
        const m = await c.query(
          `select id from tiers where entreprise_id=$1 and deleted_at is null
             and lower(nom) = lower($2) limit 1`, [entrepriseId, data.fournisseur]);
        tiersId = m.rows[0]?.id ?? null;
      }

      // Détection de doublon (même numéro, sinon même tiers+TTC+date).
      let doublonDe: string | null = null;
      if (data?.numero) {
        const d = await c.query(
          `select id from receptions where entreprise_id=$1 and statut <> 'refusee'
             and numero is not null and numero = $2 limit 1`, [entrepriseId, data.numero]);
        doublonDe = d.rows[0]?.id ?? null;
      }
      if (!doublonDe && tiersId && data?.ttc != null && data?.dateFacture) {
        const d = await c.query(
          `select id from receptions where entreprise_id=$1 and statut <> 'refusee'
             and tiers_id=$2 and montant_ttc=$3 and date_facture=$4 limit 1`,
          [entrepriseId, tiersId, data.ttc, data.dateFacture]);
        doublonDe = d.rows[0]?.id ?? null;
      }

      const rec = await c.query(
        `insert into receptions
           (organisation_id, entreprise_id, document_id, sens, statut, doublon_de, tiers_id,
            numero, date_facture, montant_ht, montant_tva, montant_ttc, confiance, donnees_lues)
         values ($1,$2,$3, coalesce($4,'achat'), $5, $6, $7, $8,$9,$10,$11,$12,$13,$14) returning *`,
        [orgId, entrepriseId, documentId, dto.sens ?? null, data ? 'lue' : 'recue', doublonDe, tiersId,
         data?.numero ?? null, data?.dateFacture ?? null, data?.ht ?? null, data?.tva ?? null,
         data?.ttc ?? null, data?.confiance ?? null, JSON.stringify(data ? { extrait: data } : {})],
      );
      const reception = rec.rows[0];

      // Fournisseur inconnu → fiche à créer (regroupe plusieurs pièces).
      let fiche = null;
      if (!tiersId && data?.fournisseur) {
        const type = (dto.sens ?? 'achat') === 'vente' ? 'client' : 'fournisseur';
        const ex = await c.query(
          `select id, reception_ids from fiches_tiers
             where entreprise_id=$1 and statut <> 'validee' and lower(raison)=lower($2) limit 1`,
          [entrepriseId, data.fournisseur]);
        if (ex.rows[0]) {
          const fr = await c.query(
            'update fiches_tiers set reception_ids = array_append(reception_ids, $2) where id=$1 returning *',
            [ex.rows[0].id, reception.id]);
          fiche = fr.rows[0];
        } else {
          const fr = await c.query(
            `insert into fiches_tiers (organisation_id, entreprise_id, type, statut, raison, reception_ids)
             values ($1,$2,$3,'a_remplir',$4, array[$5]::uuid[]) returning *`,
            [orgId, entrepriseId, type, data.fournisseur, reception.id]);
          fiche = fr.rows[0];
        }
      }

      await this.db.audit(c, orgId, userId, 'receptions', reception.id, 'creation',
        { canal: dto.canal, statut: reception.statut, doublon: !!doublonDe });
      return { reception, doublon: !!doublonDe, ficheACreer: fiche };
    });
  }

  listBannette(orgId: string, entrepriseId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select r.*, (r.doublon_de is not null) as est_doublon, d.nom_fichier
           from receptions r left join documents d on d.id = r.document_id
           where r.entreprise_id=$1 order by r.created_at desc`, [entrepriseId]);
      return r.rows;
    });
  }

  private async getRec(c: PoolClient, id: string) {
    const r = await c.query('select * from receptions where id=$1', [id]);
    if (!r.rows[0]) throw new NotFoundException('Réception introuvable.');
    return r.rows[0];
  }

  async recevoir(orgId: string, userId: string, id: string) {
    return this.db.withTenant(orgId, async (c) => {
      const rec = await this.getRec(c, id);
      if (!['recue', 'lue'].includes(rec.statut)) throw new BadRequestException('Réception déjà traitée.');
      const r = await c.query("update receptions set statut='a_valider' where id=$1 returning *", [id]);
      await this.db.audit(c, orgId, userId, 'receptions', id, 'modification', { statut: 'a_valider' });
      return r.rows[0];
    });
  }

  async rapprocherTiers(orgId: string, userId: string, id: string, tiersId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const t = await c.query('select 1 from tiers where id=$1 and deleted_at is null', [tiersId]);
      if (t.rowCount === 0) throw new NotFoundException('Tiers introuvable.');
      const r = await c.query('update receptions set tiers_id=$2 where id=$1 returning *', [id, tiersId]);
      if (!r.rows[0]) throw new NotFoundException('Réception introuvable.');
      await this.db.audit(c, orgId, userId, 'receptions', id, 'modification', { tiersId });
      return r.rows[0];
    });
  }

  /** 2e temps de la validation cabinet. L'écriture ACH est produite au lot L4. */
  async comptabiliser(orgId: string, userId: string, id: string, dto: ComptabiliserDto) {
    return this.db.withTenant(orgId, async (c) => {
      const rec = await this.getRec(c, id);
      if (rec.statut !== 'a_valider') throw new BadRequestException('La pièce doit d\'abord être reçue (a_valider).');
      const tiersId = dto.tiersId ?? rec.tiers_id;
      if (!tiersId) throw new BadRequestException('Fournisseur non rapproché : rapprochez un tiers ou validez sa fiche.');
      const r = await c.query(
        `update receptions set statut='comptabilisee', tiers_id=$2,
           numero=coalesce($3,numero), date_facture=coalesce($4,date_facture),
           montant_ht=coalesce($5,montant_ht), montant_tva=coalesce($6,montant_tva),
           montant_ttc=coalesce($7,montant_ttc)
         where id=$1 returning *`,
        [id, tiersId, dto.numero ?? null, dto.dateFacture ?? null,
         dto.ht ?? null, dto.tva ?? null, dto.ttc ?? null]);
      await this.db.audit(c, orgId, userId, 'receptions', id, 'modification',
        { statut: 'comptabilisee', ecritureACH: 'différée (L4)' });
      return r.rows[0];
    });
  }

  async refuser(orgId: string, userId: string, id: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query("update receptions set statut='refusee' where id=$1 returning *", [id]);
      if (!r.rows[0]) throw new NotFoundException('Réception introuvable.');
      await this.db.audit(c, orgId, userId, 'receptions', id, 'modification', { statut: 'refusee' });
      return r.rows[0];
    });
  }

  fichesList(orgId: string, entrepriseId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select * from fiches_tiers where entreprise_id=$1 order by created_at desc`, [entrepriseId]);
      return r.rows;
    });
  }

  /** Valide une fiche fournisseur/client inconnu → crée le tiers + rattache ses pièces. */
  async validerFiche(orgId: string, userId: string, ficheId: string, dto: ValiderFicheDto) {
    return this.db.withTenant(orgId, async (c) => {
      const f = await c.query('select * from fiches_tiers where id=$1', [ficheId]);
      if (!f.rows[0]) throw new NotFoundException('Fiche introuvable.');
      const fiche = f.rows[0];
      const raison = dto.raison ?? fiche.raison;
      if (!raison) throw new BadRequestException('Raison sociale requise.');
      const prefix = fiche.type === 'client' ? '411' : '401';
      const aux = dto.compteAuxiliaire || genAux(prefix, raison);

      const t = await c.query(
        `insert into tiers (organisation_id, entreprise_id, type, nom, siret, tva_intra,
           email, telephone, iban, compte_auxiliaire)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id, type, nom, compte_auxiliaire`,
        [orgId, fiche.entreprise_id, fiche.type, raison, dto.siret ?? fiche.siret ?? null,
         dto.tvaIntra ?? fiche.tva_intra ?? null, dto.email ?? fiche.email ?? null,
         dto.telephone ?? fiche.telephone ?? null, dto.iban ?? fiche.iban ?? null, aux]);
      const tiers = t.rows[0];

      await c.query("update fiches_tiers set statut='validee', tiers_id=$2 where id=$1", [ficheId, tiers.id]);
      // Rattache le nouveau tiers à toutes les pièces regroupées.
      if (fiche.reception_ids?.length) {
        await c.query('update receptions set tiers_id=$2 where id = any($1::uuid[])',
          [fiche.reception_ids, tiers.id]);
      }
      await this.db.audit(c, orgId, userId, 'fiches_tiers', ficheId, 'modification',
        { validee: tiers.id, rattachees: fiche.reception_ids?.length ?? 0 });
      return { tiers, receptionsRattachees: fiche.reception_ids?.length ?? 0 };
    });
  }

  /** Coffre-fort : liste / recherche plein-texte (par contenu, pas seulement le nom). */
  documents(orgId: string, entrepriseId: string, q?: string) {
    return this.db.withTenant(orgId, async (c) => {
      if (q && q.trim()) {
        const r = await c.query(
          `select id, nom_fichier, categorie, canal, version, created_at
             from documents
             where entreprise_id=$1 and deleted_at is null
               and (to_tsvector('french', coalesce(texte_ocr,'')) @@ plainto_tsquery('french',$2)
                    or nom_fichier ilike '%'||$2||'%')
             order by created_at desc`, [entrepriseId, q.trim()]);
        return r.rows;
      }
      const r = await c.query(
        `select id, nom_fichier, categorie, canal, version, created_at
           from documents where entreprise_id=$1 and deleted_at is null order by created_at desc`,
        [entrepriseId]);
      return r.rows;
    });
  }
}
