import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEntrepriseDto } from './dto';

@Injectable()
export class EntreprisesService {
  constructor(private readonly db: DatabaseService) {}

  async create(orgId: string, userId: string, dto: CreateEntrepriseDto) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `insert into entreprises
           (organisation_id, denomination, forme_juridique, siren, siret, code_ape, ville, statut)
         values ($1,$2,$3,$4,$5,$6,$7, coalesce($8,'prospect'))
         returning id, denomination, forme_juridique, siren, siret, code_ape, ville, statut, created_at`,
        [orgId, dto.denomination, dto.formeJuridique ?? null, dto.siren ?? null,
         dto.siret ?? null, dto.codeApe ?? null, dto.ville ?? null, dto.statut ?? null],
      );
      const row = r.rows[0];
      await this.db.audit(c, orgId, userId, 'entreprises', row.id, 'creation',
        { denomination: row.denomination });
      return row;
    });
  }

  async list(orgId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select id, denomination, forme_juridique, siren, ville, statut, created_at
           from entreprises where deleted_at is null order by created_at desc`,
      );
      return r.rows;
    });
  }
}
