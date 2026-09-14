import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEntrepriseDto, PatchEntrepriseDto } from './dto';

const ETAPES = ['nouveau', 'qualifie', 'proposition', 'gagne', 'perdu'] as const;

// Colonnes que PATCH autorise (fiche société + CRM). camelCase → colonne SQL.
const PATCHABLE: Record<string, string> = {
  denomination: 'denomination', formeJuridique: 'forme_juridique', siren: 'siren',
  siret: 'siret', codeApe: 'code_ape', tvaIntra: 'tva_intra', rcsVille: 'rcs_ville',
  capital: 'capital', adresse: 'adresse', codePostal: 'code_postal', ville: 'ville',
  dateCreation: 'date_creation', origine: 'origine', noteCrm: 'note_crm',
  prochaineAction: 'prochaine_action', collaborateurId: 'collaborateur_id',
};

@Injectable()
export class EntreprisesService {
  constructor(private readonly db: DatabaseService) {}

  async create(orgId: string, userId: string, dto: CreateEntrepriseDto) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `insert into entreprises
           (organisation_id, denomination, forme_juridique, siren, siret, code_ape, ville,
            statut, etape_crm, origine, collaborateur_id)
         values ($1,$2,$3,$4,$5,$6,$7, coalesce($8,'prospect'), coalesce($9,'nouveau'), $10, $11)
         returning *`,
        [orgId, dto.denomination, dto.formeJuridique ?? null, dto.siren ?? null,
         dto.siret ?? null, dto.codeApe ?? null, dto.ville ?? null, dto.statut ?? null,
         dto.etapeCrm ?? null, dto.origine ?? null, dto.collaborateurId ?? userId],
      );
      const row = r.rows[0];
      await this.db.audit(c, orgId, userId, 'entreprises', row.id, 'creation',
        { denomination: row.denomination, etape: row.etape_crm });
      return row;
    });
  }

  async list(orgId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select id, denomination, forme_juridique, siren, ville, statut, etape_crm,
                origine, prochaine_action, created_at
           from entreprises where deleted_at is null order by created_at desc`,
      );
      return r.rows;
    });
  }

  /** Pipeline commercial : dossiers regroupés par étape. */
  async pipeline(orgId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select id, denomination, statut, etape_crm, origine, prochaine_action, created_at
           from entreprises where deleted_at is null order by created_at desc`,
      );
      const groups: Record<string, unknown[]> = {};
      for (const e of ETAPES) groups[e] = [];
      for (const row of r.rows) (groups[row.etape_crm] ??= []).push(row);
      return groups;
    });
  }

  async get(orgId: string, id: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query('select * from entreprises where id = $1 and deleted_at is null', [id]);
      if (!r.rows[0]) throw new NotFoundException('Entreprise introuvable.');
      const m = await c.query(
        `select id, type, libelle, statut, date_debut, created_at
           from missions where entreprise_id = $1 and deleted_at is null order by created_at desc`, [id]);
      return { ...r.rows[0], missions: m.rows };
    });
  }

  async patch(orgId: string, userId: string, id: string, dto: PatchEntrepriseDto) {
    const entries = Object.entries(dto).filter(([k, v]) => k in PATCHABLE && v !== undefined);
    if (entries.length === 0) throw new BadRequestException('Aucun champ à modifier.');
    return this.db.withTenant(orgId, async (c) => {
      const sets = entries.map(([k], i) => `${PATCHABLE[k]} = $${i + 2}`);
      // Trace d'enrichissement : si un champ « identité » vient d'être posé, on horodate.
      const identity = entries.some(([k]) => ['siren', 'siret', 'codeApe', 'tvaIntra'].includes(k));
      const extra = identity ? ', source_maj_at = now()' : '';
      const r = await c.query(
        `update entreprises set ${sets.join(', ')}${extra}
           where id = $1 and deleted_at is null returning *`,
        [id, ...entries.map(([, v]) => v)],
      );
      if (!r.rows[0]) throw new NotFoundException('Entreprise introuvable.');
      await this.db.audit(c, orgId, userId, 'entreprises', id, 'modification',
        { champs: entries.map(([k]) => k) });
      return r.rows[0];
    });
  }

  /**
   * Fait avancer un dossier dans le pipeline.
   * → 'gagne' : statut = actif ET ouverture d'une première mission (pont vers L2/L4).
   * → 'perdu' : le prospect est fermé sans être supprimé (deleted_at reste nul).
   */
  async setEtape(orgId: string, userId: string, id: string, etape: string, missionType?: string) {
    if (!ETAPES.includes(etape as (typeof ETAPES)[number])) {
      throw new BadRequestException(`Étape invalide (${ETAPES.join(', ')}).`);
    }
    return this.db.withTenant(orgId, async (c) => {
      const cur = await c.query(
        'select id, denomination, etape_crm, statut, collaborateur_id from entreprises where id=$1 and deleted_at is null', [id]);
      if (!cur.rows[0]) throw new NotFoundException('Entreprise introuvable.');

      const statut = etape === 'gagne' ? 'actif' : cur.rows[0].statut;
      const r = await c.query(
        'update entreprises set etape_crm=$2, statut=$3 where id=$1 returning *', [id, etape, statut]);

      let mission = null;
      if (etape === 'gagne') {
        // Ne pas ouvrir de doublon si une mission existe déjà.
        const exists = await c.query(
          'select 1 from missions where entreprise_id=$1 and deleted_at is null limit 1', [id]);
        if (exists.rowCount === 0) {
          const mt = ['formalite', 'comptabilite', 'juridique', 'fiscal', 'social', 'conseil']
            .includes(missionType || '') ? missionType : 'comptabilite';
          const mr = await c.query(
            `insert into missions (organisation_id, entreprise_id, type, libelle, statut, collaborateur_id)
             values ($1,$2,$3,$4,'ouverte',$5) returning id, type, libelle, statut, created_at`,
            [orgId, id, mt, `Dossier ${cur.rows[0].denomination}`, cur.rows[0].collaborateur_id]);
          mission = mr.rows[0];
        }
      }
      await this.db.audit(c, orgId, userId, 'entreprises', id, 'modification',
        { etape, statut, missionOuverte: !!mission });
      return { entreprise: r.rows[0], mission };
    });
  }
}
