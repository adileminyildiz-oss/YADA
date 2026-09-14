import { Module } from '@nestjs/common';
import { PilotageService } from './pilotage.service';
import { PilotageController } from './pilotage.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PilotageController],
  providers: [PilotageService, JwtGuard, RolesGuard],
})
export class PilotageModule {}
