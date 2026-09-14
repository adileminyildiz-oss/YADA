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
- **Factur-X / CII conforme EN 16931** (`GET …/facturx?profil=`) — contexte + URN
  de guideline (minimum/basicwl/basic/en16931/extended), parties avec **adresses
  postales**, immatriculations (SIREN/TVA), **ventilation TVA par taux** (BG-23),
  récapitulatif monétaire (BG-22), échéance de paiement.
- **Conteneur Factur-X PDF/A-3** (`GET …/facturx-pdf`) — PDF embarquant le
  `factur-x.xml` (`/AF` + `/Names/EmbeddedFiles`, `AFRelationship /Data`), XMP
  d'identification **PDF/A-3B** + schéma d'extension Factur-X, OutputIntent +
  profil **ICC sRGB embarqué**. *Dernière validation avant transmission PDP :
  veraPDF (l'embarquement des polices Standard-14 reste à ajouter pour la
  certification PDF/A-3b stricte) + contrôle Schematron EN 16931 / Chorus Pro.*
- **PDF de facture** (`GET …/pdf`) — PDF A4 lisible (writer PDF pur, sans dépendance).
- **Règlements** — partiels/total → `montant_paye` + statut `partielle`/`payee`.

## Lot L3 — GED, OCR & réception fournisseurs ✅

Migration `0005` : colonnes GED sur `documents` (`canal`, `confiance_ocr`) +
tables `receptions` (bannette) et `fiches_tiers` (fournisseur inconnu).

**Critère de sortie** (plan) : *déposer une facture → lue & pré-remplie ;
validation cabinet en 2 temps ; doublon signalé ; fournisseur inconnu → fiche ;
pièce rangée & cherchable.*

```bash
npm run verify:l3        # extraction (pure) + réception/doublon/fiche/coffre-fort (live)
```

- **Lecture** : `extractInvoiceData` (pur) extrait numéro/date/HT/TVA/TTC/taux
  d'une couche texte (PDF/OCR), avec déductions croisées. Texte **indexé**
  (`to_tsvector` français) → coffre-fort cherchable *par contenu*.
- **Réception** : `recue → lue → a_valider → comptabilisee` (validation cabinet
  en 2 temps). Écriture ACH produite au lot **L4**.
- **Doublon** signalé (même n°, sinon même tiers+TTC+date).
- **Fournisseur inconnu** → `fiches_tiers` (regroupe plusieurs pièces) → à la
  validation, crée le tiers (compte auxiliaire `401…`) et rattache ses pièces.

## Lot L4 — Comptabilité, le moteur ✅

Migration `0006` : chaîne `exercices → comptes → journaux → ecritures →
ecriture_lignes → pieces_liees`. **L'invariant Σ débit = Σ crédit est garanti
par la base** (contrainte différée `ecriture_equilibre`) : aucune écriture
déséquilibrée ne peut être validée.

**Critère de sortie** (plan) : *écriture équilibrée (auto + manuelle) ; lettrage ;
éditions ; CA3 ; FEC ; clôture.*

```bash
npm run verify:l4
```

- **Le moteur** (`passerEcriture`) : point d'entrée unique, équilibre imposé au commit.
- **Génération auto** : depuis une facture → **VTE** (client débité TTC, produits + TVA
  collectée ventilée par taux) ; depuis une réception → **ACH** (fournisseur crédité
  TTC, charge + TVA déductible).
- **Lettrage** (facture ↔ règlement), **balance**, **grand-livre**, **CA3**
  (collectée 4457x − déductible 4456x), **FEC** (export normé tabulé),
  **clôture** (OD de résultat 6/7 → 120/129 + à-nouveaux → bilan d'ouverture N+1
  équilibré).

## Lot L5 — Fiscalité, pilotage & assistant IA ✅

Migration `0007` : **2 tables seulement** (`declarations`, `ia_suggestions`) —
le reste (KPI, soldes fiscaux) est **calculé** sur les écritures L4.

**Critère de sortie** (plan) : *fiscalité (calcul + déclarations + échéancier) ;
pilotage (KPI vivants) ; assistant IA (propose → l'humain valide).*

```bash
npm run verify:l5
```

- **Fiscalité** : `calcIS` (15 % PME jusqu'à 42 500 € puis 25 %), `calcIR`
  (barème 2024 par parts) — purs et testés ; déclarations + échéancier.
  *Estimations à valider par un expert-comptable.*
- **Pilotage** : KPI dérivés des écritures (CA, charges, résultat, marge,
  trésorerie, créances, dettes) — jamais ressaisis.
- **Assistant IA** : `proposeCompte` (imputation par mots-clés) → suggestion
  `en_attente` → **l'humain valide** ; contrôle de cohérence (compte d'attente
  471 non soldé → anomalie). Cloisonné par organisation, tracé.

---

## La série est complète — L0 → L5

| Lot | Contenu | Vérif |
|-----|---------|-------|
| L0 | socle CORE (Postgres, RLS multi-tenant, auth) | `verify:l0:local` |
| L1 | CRM & fiche société (SIREN) | `verify:l1` |
| L2 | Facturation & e-invoicing (Factur-X) | `verify:l2` |
| L3 | GED, OCR & réception | `verify:l3` |
| L4 | Comptabilité — le moteur | `verify:l4` |
| L5 | Fiscalité, pilotage & IA | `verify:l5` |

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
| GET     | `/api/entreprises/:id/factures/:fid/facturx?profil=` | authentifié | Factur-X XML CII conforme EN 16931 |
| GET     | `/api/entreprises/:id/factures/:fid/pdf`      | authentifié  | PDF A4 lisible de la facture |
| GET     | `/api/entreprises/:id/factures/:fid/facturx-pdf?profil=` | authentifié | conteneur Factur-X PDF/A-3 (XML embarqué) |
| POST    | `/api/entreprises/:id/receptions`             | admin/collab/client | dépose une pièce (octets réels) → lecture auto |
| GET     | `/api/entreprises/:id/receptions`             | authentifié  | bannette de réception |
| GET     | `/api/entreprises/:id/documents/:docId/contenu` | authentifié | télécharge/consulte la pièce stockée |
| GET     | `/api/entreprises/:id/fiches-tiers`           | authentifié  | fournisseurs inconnus à créer |
| GET     | `/api/entreprises/:id/documents?q=`           | authentifié  | coffre-fort (recherche plein-texte) |
| POST    | `/api/receptions/:rid/recevoir`               | admin/collab | 1er temps de validation |
| POST    | `/api/receptions/:rid/rapprocher`             | admin/collab | rattache un tiers connu |
| POST    | `/api/receptions/:rid/comptabiliser`          | admin/collab | 2e temps (écriture ACH → L4) |
| POST    | `/api/receptions/:rid/refuser`                | admin/collab | écarte la pièce |
| POST    | `/api/fiches-tiers/:fid/valider`              | admin/collab | crée le tiers + rattache les pièces |
| GET     | `/api/entreprises/:id/compta/exercices`       | authentifié  | liste des exercices |
| POST    | `/api/entreprises/:id/compta/exercices`       | admin/collab | ouvre un exercice (+ plan & journaux) |
| POST    | `/api/entreprises/:id/compta/ecritures`       | admin/collab | saisie manuelle (équilibre imposé) |
| POST    | `/api/entreprises/:id/compta/facture/:fid`    | admin/collab | génère l'écriture VTE d'une facture |
| POST    | `/api/entreprises/:id/compta/reception/:rid`  | admin/collab | génère l'écriture ACH d'une pièce reçue |
| POST    | `/api/entreprises/:id/compta/lettrage`        | admin/collab | lettre des lignes d'un compte de tiers |
| GET     | `/api/entreprises/:id/compta/balance/:exId`   | authentifié  | balance générale |
| GET     | `/api/entreprises/:id/compta/grand-livre/:cpt`| authentifié  | grand-livre d'un compte |
| GET     | `/api/entreprises/:id/compta/ca3/:exId`       | authentifié  | déclaration TVA (CA3) |
| GET     | `/api/entreprises/:id/compta/fec/:exId`       | authentifié  | export FEC normé |
| POST    | `/api/entreprises/:id/compta/cloture/:exId`   | admin/collab | clôture + à-nouveaux N+1 |
| GET     | `/api/entreprises/:id/pilotage/kpis/:exId`    | authentifié  | indicateurs (CA, marge, tréso…) |
| GET     | `/api/entreprises/:id/pilotage/fisc/:exId`    | authentifié  | calcul IS/IR sur le résultat |
| POST    | `/api/entreprises/:id/pilotage/declarations`  | admin/collab | planifie une déclaration |
| GET     | `/api/entreprises/:id/pilotage/declarations`  | authentifié  | échéancier fiscal |
| POST    | `/api/entreprises/:id/pilotage/ia/proposer`   | admin/collab | propose une imputation (à valider) |
| POST    | `/api/entreprises/:id/pilotage/ia/controle-attente/:exId` | admin/collab | contrôle des comptes d'attente |
| GET     | `/api/entreprises/:id/pilotage/ia`            | authentifié  | file des suggestions IA |
| PATCH   | `/api/entreprises/:id/pilotage/ia/:sid`       | admin/collab | valider / corriger / refuser |
| GET     | `/api/health`                  | public        | état + ping DB |

## Vérifier tout le socle construit

```bash
npm run verify:all   # L0 → L5, de bout en bout
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
