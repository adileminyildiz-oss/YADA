# YADA Administration — SaaS

Construction du produit décrit dans le **Plan directeur** et les lots **L0 → L5**
(dossier de conception publié en artifacts). Le prototype mono-fichier
(`../precompta.html`) reste la vitrine ; **le SaaS naît sur PostgreSQL dès L0**,
il n'est pas un portage du prototype.

Stack (plan §9) : **NestJS · PostgreSQL · JWT** (Keycloak, object storage, OCR, IA
viennent aux lots suivants).

## Lot L0 — socle CORE ✅

Contenu : schéma relationnel (11 tables), authentification (JWT + bcrypt),
rôles, **isolation multi-tenant par Row-Level Security**, piste d'audit,
hébergement (docker) et persistance.

**Critère de sortie** (plan) : *« Créer une société, un utilisateur, s'y
connecter, retrouver la donnée après redémarrage serveur. »*

### Lancer en local

```bash
cd yada-admin
cp .env.example .env          # ajuster JWT_SECRET
npm install
npm run build
docker compose up -d db       # PostgreSQL 16 (volume persistant)
npm run migrate               # applique db/migrations/*.sql
npm start                     # API sur http://localhost:3000/api
```

### Vérifier le critère de sortie (bout en bout, avec redémarrage réel)

```bash
npm run verify:l0
```

Le script lance Postgres (docker), migre, démarre l'API, crée une société +
un admin, se connecte, crée un dossier, **vérifie l'isolation entre deux
organisations (RLS)**, puis **redémarre le conteneur PostgreSQL** et confirme
que la donnée est toujours là.

## Lot L1 — CRM & fiche société ✅

Se greffe sur le socle **sans nouvelle table** (migration 0003 : colonnes CRM sur
`entreprises` + `tiers`). Pipeline prospect → client, fiche pré-remplie via SIREN,
ouverture d'une mission à la conversion.

**Critère de sortie** (plan) : *« Saisir un SIREN → fiche pré-remplie ; suivre un
prospect jusqu'à client. »*

```bash
npm run verify:l1        # cluster local : mapper SIREN (pur) + pipeline live
```

- **Auto-remplissage SIREN** : source publique `recherche-entreprises.api.gouv.fr`
  (sans clé). Le *mapper* est une fonction pure (testée hors-ligne) ;
  si la source est injoignable (pare-feu), l'API renvoie **503 mode dégradé** →
  saisie manuelle, jamais de blocage.
- **Pipeline** : `nouveau → qualifie → proposition → gagne` (+ `perdu`, fermé sans
  suppression). La conversion `gagne` bascule `statut = actif` **et ouvre une
  première mission** (pont vers L2/L4).

## Lot L2 — Facturation & e-invoicing ✅

Migration `0004` : colonnes L2 sur `factures`/`facture_lignes` + tables
`reglements` et `numerotation` (+ fonction `next_numero`).

**Critère de sortie** (plan) : *émettre une facture multi-taux conforme
(numéro continu) ; générer le Factur-X ; encaisser et suivre les impayés.*

```bash
npm run verify:l2        # calculs + Factur-X (purs) + émission/encaissement (live)
```

- **Numérotation** : brouillon `BR-AAAA-####` provisoire → à l'émission,
  `FAC-AAAA-####` **continu par entreprise** (`next_numero`, compteurs distincts →
  supprimer un brouillon ne troue pas la suite FAC).
- **TVA ventilée par taux** (jamais un taux moyen) — `computeTotals` pur.
- **Factur-X / CII** (`GET …/facturx`) — profil simplifié EN 16931, *à fiabiliser
  (schéma officiel + PDF/A-3) avant transmission réelle PDP*.
- **Règlements** — partiels/total → `montant_paye` + statut `partielle`/`payee`.

## API

| Méthode | Route                          | Rôle          | Effet |
|--------:|--------------------------------|---------------|-------|
| POST    | `/api/auth/register`           | public        | crée une organisation + son admin, renvoie un JWT |
| POST    | `/api/auth/login`              | public        | authentifie, renvoie un JWT |
| GET     | `/api/auth/me`                 | authentifié   | profil du jeton |
| POST    | `/api/entreprises`             | admin/collab  | crée un dossier / prospect |
| GET     | `/api/entreprises`             | authentifié   | liste les dossiers du tenant |
| GET     | `/api/entreprises/pipeline`    | authentifié   | dossiers regroupés par étape CRM |
| GET     | `/api/entreprises/:id`         | authentifié   | fiche + missions |
| PATCH   | `/api/entreprises/:id`         | admin/collab  | met à jour la fiche (dont champs SIREN) |
| POST    | `/api/entreprises/:id/etape`   | admin/collab  | fait avancer le pipeline (gagne → mission) |
| POST    | `/api/entreprises/:id/tiers`   | admin/collab  | ajoute un interlocuteur |
| GET     | `/api/entreprises/:id/tiers`   | authentifié   | liste les interlocuteurs |
| GET     | `/api/siren/:siren`            | authentifié   | fiche société pré-remplie (503 si source injoignable) |
| POST    | `/api/entreprises/:id/factures`               | admin/collab | crée une facture/devis (brouillon, TVA ventilée) |
| GET     | `/api/entreprises/:id/factures`               | authentifié  | liste des factures |
| GET     | `/api/entreprises/:id/factures/:fid`          | authentifié  | détail + lignes + règlements + ventilation |
| POST    | `/api/entreprises/:id/factures/:fid/emettre`  | admin/collab | émet → numéro FAC continu |
| POST    | `/api/entreprises/:id/factures/:fid/reglements`| admin/collab | encaissement (partiel/total) |
| GET     | `/api/entreprises/:id/factures/:fid/facturx`  | authentifié  | Factur-X (XML CII) |
| GET     | `/api/health`                  | public        | état + ping DB |

## Vérifier tout le socle construit

```bash
npm run verify:l0:local && npm run verify:l1 && npm run verify:l2
```

## Sécurité

- Rôle applicatif `yada_app` **non-superuser** → réellement soumis au RLS.
- Isolation : chaque requête pose `app.org` (transaction-local) ; les policies
  filtrent sur `organisation_id`. Un tenant ne peut pas lire les données d'un autre.
- Amorçage (inscription / login) via fonctions `SECURITY DEFINER` dédiées.
- Mots de passe : bcrypt. Secrets par variables d'environnement — **jamais commités**.

## Suite

L1 CRM · L2 Facturation · L3 GED/OCR · L4 Comptabilité · L5 Fiscalité & pilotage —
chaque lot se greffe sur `entreprises(id)` sans reconstruire le socle.
