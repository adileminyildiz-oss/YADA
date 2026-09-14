import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUser } from './auth.service';

export interface AuthedRequest extends Request {
  user: JwtUser;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Jeton manquant.');
    }
    try {
      const payload = this.jwt.verify<{ sub: string; org: string; role: string; email: string }>(
        header.slice(7),
      );
      req.user = { userId: payload.sub, orgId: payload.org, role: payload.role, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Jeton invalide ou expiré.');
    }
  }
}
