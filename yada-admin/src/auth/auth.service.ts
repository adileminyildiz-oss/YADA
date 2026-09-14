import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { RegisterDto, LoginDto } from './dto';

export interface JwtUser {
  userId: string;
  orgId: string;
  role: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.motDePasse, 10);
    try {
      const r = await this.db.rpc<{ org_id: string; user_id: string }>(
        'select * from yada_register($1,$2,$3,$4,$5)',
        [dto.organisation, dto.email, hash, dto.nom, dto.prenom],
      );
      const { org_id, user_id } = r.rows[0];
      return this.session({ userId: user_id, orgId: org_id, role: 'admin', email: dto.email });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException('Cet e-mail est déjà utilisé.');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const r = await this.db.rpc<{
      user_id: string; organisation_id: string; role: string;
      mot_de_passe_hash: string; actif: boolean; nom: string; prenom: string;
    }>('select * from yada_login_lookup($1)', [dto.email]);

    const row = r.rows[0];
    if (!row) throw new UnauthorizedException('Identifiants invalides.');
    if (!row.actif) throw new UnauthorizedException('Compte désactivé.');

    const ok = await bcrypt.compare(dto.motDePasse, row.mot_de_passe_hash);
    if (!ok) throw new UnauthorizedException('Identifiants invalides.');

    // Horodatage + audit dans le contexte tenant.
    await this.db.withTenant(row.organisation_id, async (c) => {
      await c.query('select yada_touch_login($1)', [row.user_id]);
      await this.db.audit(c, row.organisation_id, row.user_id, 'utilisateurs', row.user_id, 'connexion');
    });

    return this.session({
      userId: row.user_id, orgId: row.organisation_id, role: row.role, email: dto.email,
    });
  }

  private session(user: JwtUser) {
    const token = this.jwt.sign(
      { sub: user.userId, org: user.orgId, role: user.role, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' },
    );
    return {
      token,
      user: { id: user.userId, organisationId: user.orgId, role: user.role, email: user.email },
    };
  }
}
