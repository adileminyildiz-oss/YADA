import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { EntreprisesService } from './entreprises.service';
import { CreateEntrepriseDto } from './dto';
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
}
