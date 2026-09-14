# YADA Administration — front (Next.js)

Interface branchée sur l'API (`../`, lots L0→L5). App Router + TypeScript,
design monochrome (clair/sombre), jeton JWT en `localStorage`.

## Lancer

```bash
# 1) l'API (dans ../) : docker compose up -d db && npm run migrate && npm start
cd yada-admin/web
cp .env.example .env.local        # NEXT_PUBLIC_API_URL (défaut http://localhost:3000/api)
npm install
npm run dev                       # http://localhost:3001
```

## Écrans (toute la chaîne à l'écran)

- **/login** — connexion / création d'un cabinet (multi-tenant).
- **/dossiers** — pipeline commercial (prospect → client), création, avancement.
- **/dossiers/[id]** — onglets :
  - **Fiche & CRM** — auto-remplissage SIREN, identité, interlocuteurs.
  - **Facturation** — créer, émettre (numéro FAC), Factur-X, générer l'écriture VTE.
  - **Réception** — déposer une pièce (lecture auto), bannette, fournisseur inconnu → tiers, générer l'écriture ACH.
  - **Comptabilité** — exercice, KPI, TVA (CA3), IS, balance équilibrée.

L'exercice courant est mémorisé par dossier (`localStorage`) pour ce MVP.

## Vérification

`npm run build` (compilation Next/TS) + `npm start` puis `GET /login` → 200
(voir `scripts/verify-web.sh`).
