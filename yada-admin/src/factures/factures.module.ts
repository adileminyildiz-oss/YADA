import { Module } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { FacturesController } from './factures.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacturesController],
  providers: [FacturesService, JwtGuard, RolesGuard],
})
export class FacturesModule {}
