import {
  Body, Controller, Get, Header, Param, Post, Query, Req, UseGuards, ParseUUIDPipe, StreamableFile,
} from '@nestjs/common';
import { FacturesService } from './factures.service';
import { CreateFactureDto, ReglementDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

@Controller('entreprises/:id/factures')
@UseGuards(JwtGuard, RolesGuard)
export class FacturesController {
  constructor(private readonly service: FacturesService) {}

  @Post()
  @Roles('admin', 'collaborateur')
  create(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateFactureDto) {
    return this.service.create(req.user.orgId, req.user.userId, id, dto);
  }

  @Get()
  list(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.list(req.user.orgId, id);
  }

  @Get(':factureId')
  get(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string) {
    return this.service.get(req.user.orgId, factureId);
  }

  @Post(':factureId/emettre')
  @Roles('admin', 'collaborateur')
  emettre(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string) {
    return this.service.emettre(req.user.orgId, req.user.userId, factureId);
  }

  @Post(':factureId/reglements')
  @Roles('admin', 'collaborateur')
  reglement(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string, @Body() dto: ReglementDto) {
    return this.service.addReglement(req.user.orgId, req.user.userId, factureId, dto);
  }

  @Get(':factureId/facturx')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  facturx(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string, @Query('profil') profil?: string) {
    return this.service.facturx(req.user.orgId, factureId, profil);
  }

  @Get(':factureId/pdf')
  async pdf(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string) {
    const f = await this.service.pdf(req.user.orgId, factureId);
    return new StreamableFile(f.buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="${f.numero}.pdf"`,
    });
  }

  @Get(':factureId/facturx-pdf')
  async facturxPdf(@Req() req: AuthedRequest, @Param('factureId', ParseUUIDPipe) factureId: string, @Query('profil') profil?: string) {
    const f = await this.service.facturxPdf(req.user.orgId, factureId, profil);
    return new StreamableFile(f.buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="${f.numero}-facturx.pdf"`,
    });
  }
}
