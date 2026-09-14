import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { TiersModule } from './tiers/tiers.module';
import { SirenModule } from './siren/siren.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    EntreprisesModule,
    TiersModule,
    SirenModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
