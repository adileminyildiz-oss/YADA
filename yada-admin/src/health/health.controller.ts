import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    let db = false;
    try { db = await this.db.ping(); } catch { db = false; }
    return { status: db ? 'ok' : 'degraded', db, time: new Date().toISOString() };
  }
}
