import { Module } from '@nestjs/common';
import { ReceptionService } from './reception.service';
import { EntrepriseReceptionController, ReceptionActionController } from './reception.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EntrepriseReceptionController, ReceptionActionController],
  providers: [ReceptionService, JwtGuard, RolesGuard],
})
export class ReceptionModule {}
