import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ReceptionService } from './reception.service';
import { DepositDto, RapprocherDto, ComptabiliserDto, ValiderFicheDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

// Réceptions & GED rattachées à une entreprise.
@Controller('entreprises/:id')
@UseGuards(JwtGuard, RolesGuard)
export class EntrepriseReceptionController {
  constructor(private readonly service: ReceptionService) {}

  @Post('receptions')
  @Roles('admin', 'collaborateur', 'client') // le client peut déposer une pièce
  deposit(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: DepositDto) {
    return this.service.deposit(req.user.orgId, req.user.userId, id, dto);
  }

  @Get('receptions')
  bannette(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listBannette(req.user.orgId, id);
  }

  @Get('fiches-tiers')
  fiches(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.fichesList(req.user.orgId, id);
  }

  @Get('documents')
  documents(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Query('q') q?: string) {
    return this.service.documents(req.user.orgId, id, q);
  }
}

// Actions sur une pièce reçue / une fiche (validation cabinet).
@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class ReceptionActionController {
  constructor(private readonly service: ReceptionService) {}

  @Post('receptions/:rid/recevoir')
  @Roles('admin', 'collaborateur')
  recevoir(@Req() req: AuthedRequest, @Param('rid', ParseUUIDPipe) rid: string) {
    return this.service.recevoir(req.user.orgId, req.user.userId, rid);
  }

  @Post('receptions/:rid/rapprocher')
  @Roles('admin', 'collaborateur')
  rapprocher(@Req() req: AuthedRequest, @Param('rid', ParseUUIDPipe) rid: string, @Body() dto: RapprocherDto) {
    return this.service.rapprocherTiers(req.user.orgId, req.user.userId, rid, dto.tiersId);
  }

  @Post('receptions/:rid/comptabiliser')
  @Roles('admin', 'collaborateur')
  comptabiliser(@Req() req: AuthedRequest, @Param('rid', ParseUUIDPipe) rid: string, @Body() dto: ComptabiliserDto) {
    return this.service.comptabiliser(req.user.orgId, req.user.userId, rid, dto);
  }

  @Post('receptions/:rid/refuser')
  @Roles('admin', 'collaborateur')
  refuser(@Req() req: AuthedRequest, @Param('rid', ParseUUIDPipe) rid: string) {
    return this.service.refuser(req.user.orgId, req.user.userId, rid);
  }

  @Post('fiches-tiers/:fid/valider')
  @Roles('admin', 'collaborateur')
  validerFiche(@Req() req: AuthedRequest, @Param('fid', ParseUUIDPipe) fid: string, @Body() dto: ValiderFicheDto) {
    return this.service.validerFiche(req.user.orgId, req.user.userId, fid, dto);
  }
}
