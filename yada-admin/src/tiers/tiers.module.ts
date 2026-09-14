import { Module } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { TiersController } from './tiers.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TiersController],
  providers: [TiersService, JwtGuard, RolesGuard],
})
export class TiersModule {}
