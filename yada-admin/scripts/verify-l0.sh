#!/usr/bin/env bash
# Vérifie le critère de sortie du Lot L0 de bout en bout, pour de vrai :
#   PostgreSQL (docker, volume) → migrations → API → create/login/isolation
#   → REDÉMARRAGE du conteneur DB → la donnée est toujours là.
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgres://yada_app:yada_app_pwd@localhost:5433/yada}"
export DATABASE_ADMIN_URL="${DATABASE_ADMIN_URL:-postgres://yada_owner:yada_owner_pwd@localhost:5433/yada}"
export JWT_SECRET="${JWT_SECRET:-l0-verify-secret-please-change}"
export PORT="${PORT:-3000}"
export BASE="http://localhost:${PORT}/api"

API_PID=""
cleanup() { [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true; }
trap cleanup EXIT

wait_db()  { for i in $(seq 1 30); do docker exec yada-db pg_isready -U yada_owner -d yada >/dev/null 2>&1 && return 0; sleep 1; done; echo "DB pas prête"; return 1; }
wait_api() { for i in $(seq 1 30); do curl -sf "$BASE/health" >/dev/null 2>&1 && return 0; sleep 1; done; echo "API pas prête"; return 1; }
start_api(){ node dist/main.js >/tmp/yada-api.log 2>&1 & API_PID=$!; wait_api; }
stop_api() { [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true; API_PID=""; sleep 1; }

echo "═══ 1. PostgreSQL (docker, volume persistant) ═══"
docker compose up -d db
wait_db

echo "═══ 2. Migrations (socle CORE + RLS) ═══"
node scripts/migrate.mjs

echo "═══ 3. Build + démarrage API ═══"
[ -f dist/main.js ] || npm run build
start_api

echo "═══ 4. Création société/utilisateur, login, isolation ═══"
node scripts/l0-check.mjs full
stop_api

echo "═══ 5. REDÉMARRAGE du serveur de données ═══"
docker restart yada-db
wait_db
start_api

echo "═══ 6. La donnée a-t-elle survécu ? ═══"
node scripts/l0-check.mjs persist

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  L0 — CRITÈRE DE SORTIE VALIDÉ ✓              ║"
echo "║  société + user + login + persistance + RLS  ║"
echo "╚══════════════════════════════════════════════╝"
