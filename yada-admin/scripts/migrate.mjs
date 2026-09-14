// Applique les migrations SQL (db/migrations/*.sql) via le rôle propriétaire.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'db', 'migrations');
const url = process.env.DATABASE_ADMIN_URL || 'postgres://yada_owner:yada_owner_pwd@localhost:5433/yada';

const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const client = new pg.Client({ connectionString: url });
await client.connect();
for (const f of files) {
  const sql = readFileSync(join(dir, f), 'utf8');
  process.stdout.write(`→ ${f} … `);
  await client.query(sql);
  console.log('ok');
}
await client.end();
console.log('Migrations appliquées.');
