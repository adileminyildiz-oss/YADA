import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SirenService } from './siren.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('siren')
@UseGuards(JwtGuard)
export class SirenController {
  constructor(private readonly siren: SirenService) {}

  /** Fiche société pré-remplie (lecture seule, l'humain valide ensuite). */
  @Get(':siren')
  lookup(@Param('siren') siren: string) {
    return this.siren.lookup(siren);
  }
}
