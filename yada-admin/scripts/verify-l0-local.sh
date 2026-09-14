#!/usr/bin/env bash
# Variante de vérification L0 SANS docker : cluster PostgreSQL local (initdb + pg_ctl).
# Utile là où le démon docker / le registre d'images ne sont pas disponibles.
# Prouve le même critère de sortie, avec un vrai REDÉMARRAGE du serveur (pg_ctl restart).
set -euo pipefail
cd "$(dirname "$0")/.."

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PGDATA="${PGDATA:-/tmp/yada-pg}"
PGPORT="${PGPORT:-5433}"
# initdb/postgres refusent de tourner en root : on les exécute sous un utilisateur
# non privilégié (le démon SGBD uniquement). L'API node se connecte en TCP.
PGRUN="${PGRUN:-postgres}"
if [ "$(id -u)" = "0" ]; then PG="su $PGRUN -c"; else PG="bash -c"; fi
pgexec(){ $PG "$1"; }
export DATABASE_URL="postgres://yada_app:yada_app_pwd@localhost:${PGPORT}/yada"
export DATABASE_ADMIN_URL="postgres://yada_owner:yada_owner_pwd@localhost:${PGPORT}/yada"
export JWT_SECRET="${JWT_SECRET:-l0-verify-secret}"
export PORT="${PORT:-3000}"
export BASE="http://localhost:${PORT}/api"

API_PID=""
cleanup() {
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
  pgexec "$PGBIN/pg_ctl -D $PGDATA stop -m fast" >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_api() { for i in $(seq 1 30); do curl -sf "$BASE/health" >/dev/null 2>&1 && return 0; sleep 1; done; echo "API pas prête"; tail -20 /tmp/yada-api.log; return 1; }
start_api(){ node dist/main.js >/tmp/yada-api.log 2>&1 & API_PID=$!; wait_api; }
stop_api() { [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true; API_PID=""; sleep 1; }

echo "═══ 1. Cluster PostgreSQL local (volume persistant : $PGDATA) ═══"
pgexec "$PGBIN/pg_ctl -D $PGDATA stop -m fast" >/dev/null 2>&1 || true
rm -rf "$PGDATA"; mkdir -p "$PGDATA"; chown "$PGRUN" "$PGDATA"; chmod 700 "$PGDATA"
pgexec "$PGBIN/initdb -D $PGDATA -U yada_owner --auth-local=trust --auth-host=trust" >/dev/null
pgexec "$PGBIN/pg_ctl -D $PGDATA -o '-p ${PGPORT} -k /tmp -c listen_addresses=localhost' -l /tmp/yada-pg.log start"
for i in $(seq 1 30); do "$PGBIN/pg_isready" -p "$PGPORT" -h localhost >/dev/null 2>&1 && break; sleep 1; done
"$PGBIN/createdb" -p "$PGPORT" -h localhost -U yada_owner yada

echo "═══ 2. Migrations (socle CORE + RLS) ═══"
node scripts/migrate.mjs

echo "═══ 3. Build + démarrage API ═══"
[ -f dist/main.js ] || npm run build
start_api

echo "═══ 4. Création société/utilisateur, login, isolation (RLS) ═══"
node scripts/l0-check.mjs full
stop_api

echo "═══ 5. REDÉMARRAGE du serveur de données (pg_ctl restart) ═══"
pgexec "$PGBIN/pg_ctl -D $PGDATA -o '-p ${PGPORT} -k /tmp -c listen_addresses=localhost' -l /tmp/yada-pg.log restart"
for i in $(seq 1 30); do "$PGBIN/pg_isready" -p "$PGPORT" -h localhost >/dev/null 2>&1 && break; sleep 1; done
start_api

echo "═══ 6. La donnée a-t-elle survécu ? ═══"
node scripts/l0-check.mjs persist

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  L0 — CRITÈRE DE SORTIE VALIDÉ (local) ✓      ║"
echo "║  société + user + login + persistance + RLS  ║"
echo "╚══════════════════════════════════════════════╝"
