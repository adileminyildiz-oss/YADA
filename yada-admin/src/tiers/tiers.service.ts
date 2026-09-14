import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTiersDto } from './dto';

@Injectable()
export class TiersService {
  constructor(private readonly db: DatabaseService) {}

  async create(orgId: string, userId: string, entrepriseId: string, dto: CreateTiersDto) {
    return this.db.withTenant(orgId, async (c) => {
      const ent = await c.query('select 1 from entreprises where id=$1 and deleted_at is null', [entrepriseId]);
      if (ent.rowCount === 0) throw new NotFoundException('Entreprise introuvable.');
      const r = await c.query(
        `insert into tiers (organisation_id, entreprise_id, type, nom, fonction, principal, email, telephone)
         values ($1,$2,$3,$4,$5,coalesce($6,false),$7,$8)
         returning id, type, nom, fonction, principal, email, telephone, created_at`,
        [orgId, entrepriseId, dto.type, dto.nom, dto.fonction ?? null,
         dto.principal ?? null, dto.email ?? null, dto.telephone ?? null],
      );
      await this.db.audit(c, orgId, userId, 'tiers', r.rows[0].id, 'creation', { nom: dto.nom });
      return r.rows[0];
    });
  }

  async list(orgId: string, entrepriseId: string) {
    return this.db.withTenant(orgId, async (c) => {
      const r = await c.query(
        `select id, type, nom, fonction, principal, email, telephone, created_at
           from tiers where entreprise_id=$1 and deleted_at is null
           order by principal desc, created_at`, [entrepriseId]);
      return r.rows;
    });
  }
}
