import { Body, Controller, Get, Param, Post, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { CreateTiersDto } from './dto';
import { JwtGuard, AuthedRequest } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles';

@Controller('entreprises/:id/tiers')
@UseGuards(JwtGuard, RolesGuard)
export class TiersController {
  constructor(private readonly service: TiersService) {}

  @Post()
  @Roles('admin', 'collaborateur')
  create(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateTiersDto) {
    return this.service.create(req.user.orgId, req.user.userId, id, dto);
  }

  @Get()
  list(@Req() req: AuthedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.list(req.user.orgId, id);
  }
}
