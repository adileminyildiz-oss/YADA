#!/usr/bin/env bash
# Vérifie le Lot L2 (Facturation & e-invoicing) sur cluster PostgreSQL local.
# Socle L0 + L1 + L2 (migrations 0001→0004). Prouve :
#  - calculs multi-taux + Factur-X (purs, sans réseau)
#  - émission (numéro FAC continu), Factur-X live, encaissement/impayés (live).
set -euo pipefail
cd "$(dirname "$0")/.."

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PGDATA="${PGDATA:-/tmp/yada-pg}"
PGPORT="${PGPORT:-5433}"
PGRUN="${PGRUN:-postgres}"
if [ "$(id -u)" = "0" ]; then PG="su $PGRUN -c"; else PG="bash -c"; fi
pgexec(){ $PG "$1"; }

export DATABASE_URL="postgres://yada_app:yada_app_pwd@localhost:${PGPORT}/yada"
export DATABASE_ADMIN_URL="postgres://yada_owner:yada_owner_pwd@localhost:${PGPORT}/yada"
export JWT_SECRET="${JWT_SECRET:-l2-verify-secret}"
export PORT="${PORT:-3000}"
export BASE="http://localhost:${PORT}/api"

API_PID=""
cleanup(){ [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true; pgexec "$PGBIN/pg_ctl -D $PGDATA stop -m fast" >/dev/null 2>&1 || true; }
trap cleanup EXIT
wait_api(){ for i in $(seq 1 30); do curl -sf "$BASE/health" >/dev/null 2>&1 && return 0; sleep 1; done; echo "API pas prête"; tail -20 /tmp/yada-api.log; return 1; }

echo "═══ 1. Cluster PostgreSQL local ═══"
pgexec "$PGBIN/pg_ctl -D $PGDATA stop -m fast" >/dev/null 2>&1 || true
rm -rf "$PGDATA"; mkdir -p "$PGDATA"; chown "$PGRUN" "$PGDATA"; chmod 700 "$PGDATA"
pgexec "$PGBIN/initdb -D $PGDATA -U yada_owner --auth-local=trust --auth-host=trust" >/dev/null
pgexec "$PGBIN/pg_ctl -D $PGDATA -o '-p ${PGPORT} -k /tmp -c listen_addresses=localhost' -l /tmp/yada-pg.log start"
for i in $(seq 1 30); do "$PGBIN/pg_isready" -p "$PGPORT" -h localhost >/dev/null 2>&1 && break; sleep 1; done
"$PGBIN/createdb" -p "$PGPORT" -h localhost -U yada_owner yada

echo "═══ 2. Migrations (CORE + CRM + Facturation) ═══"
node scripts/migrate.mjs

echo "═══ 3. Build ═══"
npm run build >/dev/null

echo "═══ 4. Calculs multi-taux + Factur-X (purs) ═══"
node scripts/facture-calc.test.mjs

echo "═══ 5. Émission / Factur-X / encaissement (live) ═══"
node dist/main.js >/tmp/yada-api.log 2>&1 & API_PID=$!; wait_api
node scripts/l2-check.mjs

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  L2 — CRITÈRE DE SORTIE VALIDÉ ✓                ║"
echo "║  facture multi-taux + FAC continu + Factur-X   ║"
echo "║  + encaissement / impayés                      ║"
echo "╚════════════════════════════════════════════════╝"
