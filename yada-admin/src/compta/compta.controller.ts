import {
  Body, Controller, Get, Header, Param, Post, Query, Req, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ComptaService } from './compta.service';
import { CreateExerciceDto, EcritureDto, LettrageDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

@Controller('entreprises/:id/compta')
@UseGuards(JwtGuard, RolesGuard)
export class ComptaController {
  constructor(private readonly service: ComptaService) {}

  @Get('exercices')
  listExercices(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listExercices(req.user.orgId, id);
  }

  @Post('exercices')
  @Roles('admin', 'collaborateur')
  createExercice(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateExerciceDto) {
    return this.service.createExercice(req.user.orgId, req.user.userId, id, dto.dateDebut, dto.dateFin);
  }

  @Post('ecritures')
  @Roles('admin', 'collaborateur')
  passer(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: EcritureDto) {
    return this.service.passerEcriture(req.user.orgId, req.user.userId, id, dto);
  }

  @Post('facture/:factureId')
  @Roles('admin', 'collaborateur')
  depuisFacture(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) fid: string) {
    return this.service.genererDepuisFacture(req.user.orgId, req.user.userId, fid);
  }

  @Post('reception/:receptionId')
  @Roles('admin', 'collaborateur')
  depuisReception(@Req() req: AuthedRequest, @Param('receptionId', ParseUUIDPipe) rid: string) {
    return this.service.genererDepuisReception(req.user.orgId, req.user.userId, rid);
  }

  @Post('lettrage')
  @Roles('admin', 'collaborateur')
  lettrer(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: LettrageDto) {
    return this.service.lettrer(req.user.orgId, req.user.userId, id, dto.compte, dto.ligneIds);
  }

  @Get('balance/:exerciceId')
  balance(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exerciceId', ParseUUIDPipe) ex: string) {
    return this.service.balance(req.user.orgId, id, ex);
  }

  @Get('grand-livre/:compte')
  grandLivre(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('compte') compte: string, @Query('exerciceId') ex?: string) {
    return this.service.grandLivre(req.user.orgId, id, compte, ex);
  }

  @Get('ca3/:exerciceId')
  ca3(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exerciceId', ParseUUIDPipe) ex: string, @Query('mois') mois?: string) {
    return this.service.ca3(req.user.orgId, id, ex, mois);
  }

  @Get('fec/:exerciceId')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  fec(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exerciceId', ParseUUIDPipe) ex: string) {
    return this.service.fec(req.user.orgId, id, ex);
  }

  @Post('cloture/:exerciceId')
  @Roles('admin', 'collaborateur')
  cloturer(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Param('exerciceId', ParseUUIDPipe) ex: string) {
    return this.service.cloturer(req.user.orgId, req.user.userId, id, ex);
  }
}
