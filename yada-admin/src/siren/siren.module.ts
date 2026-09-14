import { Module } from '@nestjs/common';
import { SirenService } from './siren.service';
import { SirenController } from './siren.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SirenController],
  providers: [SirenService, JwtGuard],
})
export class SirenModule {}
