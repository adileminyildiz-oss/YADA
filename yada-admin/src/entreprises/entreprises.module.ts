import { Module } from '@nestjs/common';
import { EntreprisesService } from './entreprises.service';
import { EntreprisesController } from './entreprises.controller';
import { RolesGuard } from '../auth/roles';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // fournit JwtModule/JwtService aux guards
  controllers: [EntreprisesController],
  providers: [EntreprisesService, JwtGuard, RolesGuard],
})
export class EntreprisesModule {}
