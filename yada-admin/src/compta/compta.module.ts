import { Module } from '@nestjs/common';
import { ComptaService } from './compta.service';
import { ComptaController } from './compta.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ComptaController],
  providers: [ComptaService, JwtGuard, RolesGuard],
})
export class ComptaModule {}
