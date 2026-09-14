import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { PilotageService } from './pilotage.service';
import { DeclarationDto, StatutDeclarationDto, ProposerDto, StatutSuggestionDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

@Controller('entreprises/:id/pilotage')
@UseGuards(JwtGuard, RolesGuard)
export class PilotageController {
  constructor(private readonly service: PilotageService) {}

  // Pilotage
  @Get('kpis/:exId')
  kpis(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exId', ParseUUIDPipe) ex: string) {
    return this.service.kpis(req.user.orgId, id, ex);
  }

  // Fiscalité
  @Get('fisc/:exId')
  fisc(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exId', ParseUUIDPipe) ex: string,
       @Query('type') type: 'is' | 'ir' = 'is', @Query('parts') parts?: string) {
    return this.service.calculerFisc(req.user.orgId, id, ex, type === 'ir' ? 'ir' : 'is', parts ? Number(parts) : 1);
  }

  @Post('declarations')
  @Roles('admin', 'collaborateur')
  declarer(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: DeclarationDto) {
    return this.service.declarationCreer(req.user.orgId, req.user.userId, id, dto);
  }

  @Get('declarations')
  declarations(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.declarationsList(req.user.orgId, id);
  }

  @Patch('declarations/:did')
  @Roles('admin', 'collaborateur')
  statutDecl(@Req() req: AuthedRequest, @Param('did', ParseUUIDPipe) did: string, @Body() dto: StatutDeclarationDto) {
    return this.service.declarationStatut(req.user.orgId, req.user.userId, did, dto.statut);
  }

  // Assistant IA
  @Post('ia/proposer')
  @Roles('admin', 'collaborateur')
  proposer(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ProposerDto) {
    return this.service.iaProposer(req.user.orgId, req.user.userId, id, dto.libelle, dto.receptionId);
  }

  @Post('ia/controle-attente/:exId')
  @Roles('admin', 'collaborateur')
  controle(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exId', ParseUUIDPipe) ex: string) {
    return this.service.iaControleAttente(req.user.orgId, req.user.userId, id, ex);
  }

  @Get('ia')
  iaList(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.iaList(req.user.orgId, id);
  }

  @Patch('ia/:sid')
  @Roles('admin', 'collaborateur')
  iaStatut(@Req() req: AuthedRequest, @Param('sid', ParseUUIDPipe) sid: string, @Body() dto: StatutSuggestionDto) {
    return this.service.iaStatut(req.user.orgId, req.user.userId, sid, dto.statut);
  }
}
