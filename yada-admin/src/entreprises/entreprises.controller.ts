import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { EntreprisesService } from './entreprises.service';
import { CreateEntrepriseDto, PatchEntrepriseDto, EtapeDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

@Controller('entreprises')
@UseGuards(JwtGuard, RolesGuard)
export class EntreprisesController {
  constructor(private readonly service: EntreprisesService) {}

  @Post()
  @Roles('admin', 'collaborateur')
  create(@Req() req: AuthedRequest, @Body() dto: CreateEntrepriseDto) {
    return this.service.create(req.user.orgId, req.user.userId, dto);
  }

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.service.list(req.user.orgId);
  }

  @Get('pipeline')
  pipeline(@Req() req: AuthedRequest) {
    return this.service.pipeline(req.user.orgId);
  }

  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.user.orgId, id);
  }

  @Patch(':id')
  @Roles('admin', 'collaborateur')
  patch(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchEntrepriseDto) {
    return this.service.patch(req.user.orgId, req.user.userId, id, dto);
  }

  @Post(':id/etape')
  @Roles('admin', 'collaborateur')
  setEtape(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: EtapeDto) {
    return this.service.setEtape(req.user.orgId, req.user.userId, id, dto.etape, dto.missionType);
  }
}
