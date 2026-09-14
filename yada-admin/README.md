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

## API (L0)

| Méthode | Route                | Rôle            | Effet |
|--------:|----------------------|-----------------|-------|
| POST    | `/api/auth/register` | public          | crée une organisation + son admin, renvoie un JWT |
| POST    | `/api/auth/login`    | public          | authentifie, renvoie un JWT |
| GET     | `/api/auth/me`       | authentifié     | profil du jeton |
| POST    | `/api/entreprises`   | admin/collab    | crée un dossier (isolé au tenant) |
| GET     | `/api/entreprises`   | authentifié     | liste les dossiers du tenant |
| GET     | `/api/health`        | public          | état + ping DB |

## Sécurité

- Rôle applicatif `yada_app` **non-superuser** → réellement soumis au RLS.
- Isolation : chaque requête pose `app.org` (transaction-local) ; les policies
  filtrent sur `organisation_id`. Un tenant ne peut pas lire les données d'un autre.
- Amorçage (inscription / login) via fonctions `SECURITY DEFINER` dédiées.
- Mots de passe : bcrypt. Secrets par variables d'environnement — **jamais commités**.

## Suite

L1 CRM · L2 Facturation · L3 GED/OCR · L4 Comptabilité · L5 Fiscalité & pilotage —
chaque lot se greffe sur `entreprises(id)` sans reconstruire le socle.
