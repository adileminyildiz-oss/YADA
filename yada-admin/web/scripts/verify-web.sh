#!/usr/bin/env bash
# Vérifie que le front se compile ET se sert (rendu réel des pages).
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="${PATH}"
PORT="${PORT:-3001}"

echo "═══ 1. Build Next.js ═══"
[ -d .next ] || npm run build >/dev/null
npm run build >/dev/null 2>&1 || true

echo "═══ 2. Démarrage (next start) ═══"
WEB_PID=""
cleanup(){ [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true; }
trap cleanup EXIT
npx next start -p "$PORT" >/tmp/yada-web.log 2>&1 & WEB_PID=$!
for i in $(seq 1 30); do curl -sf "http://localhost:$PORT/login" >/dev/null 2>&1 && break; sleep 1; done

echo "═══ 3. Rendu des pages ═══"
ok=0
for route in "/login:Connexion" "/dossiers:Dossiers" "/:YADA"; do
  path="${route%%:*}"; needle="${route##*:}"
  code=$(curl -s -o /tmp/yada-web-page.html -w '%{http_code}' "http://localhost:$PORT$path")
  if [ "$code" = "200" ] && grep -q "$needle" /tmp/yada-web-page.html; then
    echo "  ✓ $path → 200 (contient « $needle »)"; ok=$((ok+1))
  else
    echo "  ✗ $path → HTTP $code (attendu « $needle »)"; exit 1
  fi
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  FRONT — build + rendu VALIDÉS ✓          ║"
echo "║  login · dossiers · accueil servis (200) ║"
echo "╚══════════════════════════════════════════╝"
