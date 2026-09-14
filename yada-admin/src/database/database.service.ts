import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Accès PostgreSQL via le rôle applicatif (yada_app), soumis au RLS.
 * - rpc()        : requête hors contexte tenant (fonctions SECURITY DEFINER : register / login).
 * - withTenant() : ouvre une transaction, pose app.org (RLS), exécute, valide/annule.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Database');
  private pool!: Pool;

  onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL manquant');
    this.pool = new Pool({ connectionString, max: 10 });
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  /** Requête simple (pas de contexte tenant). Réservée à l'amorçage auth. */
  async rpc<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query<T>(sql, params);
    } finally {
      client.release();
    }
  }

  /** Exécute `fn` dans une transaction où app.org = orgId (isolation RLS). */
  async withTenant<T>(orgId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      // 3e argument true → variable locale à la transaction (reset auto au commit).
      await client.query("select set_config('app.org', $1, true)", [orgId]);
      const result = await fn(client);
      await client.query('commit');
      return result;
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  /** Écrit une entrée dans la piste d'audit (dans le contexte tenant courant). */
  async audit(
    client: PoolClient,
    orgId: string,
    userId: string | null,
    entite: string,
    entiteId: string | null,
    action: 'creation' | 'modification' | 'suppression' | 'consultation' | 'connexion',
    details?: unknown,
  ): Promise<void> {
    await client.query(
      `insert into audit_log(organisation_id, utilisateur_id, entite, entite_id, action, details)
       values ($1,$2,$3,$4,$5,$6)`,
      [orgId, userId, entite, entiteId, action, details ? JSON.stringify(details) : null],
    );
  }

  async ping(): Promise<boolean> {
    const r = await this.rpc('select 1 as ok');
    return r.rows[0]?.ok === 1;
  }
}
