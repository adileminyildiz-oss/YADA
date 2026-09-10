# LAST — site vitrine (accompagnement administratif des professions libérales)

Site vitrine **autonome, en un seul fichier** (`index.html`) pour vendre un service
d'**accompagnement administratif** : création de société, modifications statutaires
et gestion administrative, à destination des **métiers libéraux**.

Il embarque un **assistant IA de qualification** (chat client) qui **reçoit, trie,
qualifie** les demandes, **repère les données intéressantes** et **fait confirmer** la
demande au client, plus un **mini-CRM conseiller** pour trier les demandes reçues.

## Ouvrir le site

Ouvrez `site-vitrine/index.html` dans un navigateur — aucun serveur requis, tout
fonctionne **hors-ligne** (démo). Pour l'héberger : n'importe quel hébergeur statique
(GitHub Pages, Netlify, Vercel, S3…).

## Ce qui fonctionne tout de suite (sans backend)

- **Site vitrine complet** : hero, services, cibles (métiers libéraux), méthode,
  section IA, tarifs, formulaire de contact, FAQ, footer — responsive, clair/sombre.
- **Assistant IA (chat)** : conversation guidée qui collecte le type de demande,
  la forme juridique, la profession et les coordonnées, puis **propose un récapitulatif
  que le client confirme**. Comprend aussi le **texte libre** (détection d'intention,
  de forme juridique, de profession, d'urgence).
- **Moteur de qualification** (`Qualif`) : classe la demande, calcule un **score de
  maturité** (🔥 chaud / tiède / à cultiver) et pose des **tags** (profession
  réglementée, urgence, type…) = les « données intéressantes » pour le conseiller.
- **Formulaire de contact** : qualifié automatiquement à l'envoi, avec référence.
- **Mini-CRM conseiller** : `Espace conseiller` en pied de page (ou ancre
  `#conseiller`), protégé par un code (`crmPin`, défaut `0000`). KPI, filtres
  (chaudes/tièdes/type), **export CSV**. Les demandes du chat **et** du formulaire y
  remontent.
- **Stockage** : par défaut `localStorage` du navigateur (démo).

## Passage en production : « maximum d'IA » + « beaucoup de stockage »

Tout est prévu pour se brancher **sans réécrire le front**. La config est centralisée :

```js
window.LAST_CONFIG = {
  llmEndpoint:  '',   // proxy vers un vrai modèle (Claude) — vide = moteur local
  leadsEndpoint:'',   // API de persistance des demandes — vide = localStorage
  crmPin:'0000',
  storageKey:'last-leads'
};
```

### 1. Brancher un vrai modèle (Claude) pour un agent conversationnel avancé

Renseignez `llmEndpoint` avec l'URL d'un **proxy** (jamais la clé API en clair côté
navigateur). Le proxy reçoit :

```
POST { messages:[{role,content}], context:{...brouillon en cours...} }
→    { reply:"texte", context?:{...champs à fusionner...}, tags?, score? }
```

Le repo contient déjà de quoi héberger ce proxy :
- **`server/`** — proxy Node (`@supabase/server`) : ajoutez une route qui appelle
  l'API Claude (`ANTHROPIC_API_KEY` en variable d'environnement) avec un *system
  prompt* décrivant l'agent LAST (rôle : recevoir, qualifier, faire confirmer).
- **`supabase/functions/`** — même logique en Edge Function.

Système recommandé pour l'agent : demander la forme juridique adaptée à la profession,
détecter l'urgence, extraire les entités, et **toujours** finir par un récapitulatif à
confirmer. Le front bascule automatiquement sur ce modèle pour le texte libre et
retombe sur le moteur local en cas d'indisponibilité (aucune coupure de service).

### 2. Beaucoup d'espace de stockage sécurisé (données client)

Renseignez `leadsEndpoint` avec une API qui persiste les demandes. Le repo utilise
déjà **Supabase** (voir `supabase/`) — idéal ici :

- Table `demandes` (colonnes = champs du *lead* : `ref, date, source, nom, profession,
  email, tel, type, forme, detail, message, urgent, score, niveau, statut`).
- **Row Level Security** pour cloisonner les accès conseillers.
- **Supabase Storage** (buckets) pour les **pièces jointes / documents client**
  (Kbis, statuts, justificatifs) — capacité extensible, chiffrée au repos.
- Le mini-CRM peut alors lire cette table au lieu du `localStorage`.

`Store.add()` envoie déjà en `POST` vers `leadsEndpoint` quand il est configuré, tout
en gardant une copie locale en secours (aucune perte si le réseau tombe).

### 3. Agents IA de tri / qualification côté serveur

Le moteur `Qualif` (scoring + tags) tourne côté client pour l'instantanéité. En
production, dupliquez cette logique (ou faites-la faire par Claude) **côté serveur** à
la réception d'une demande pour : router vers le bon conseiller, déclencher une
relance, détecter les opportunités (profession réglementée, volume, urgence), et
alimenter un tableau de bord.

## Confidentialité

Les données saisies servent uniquement à recontacter le prospect. En production,
respecter le RGPD : mention de consentement (présente dans le formulaire), politique
de confidentialité, droit de suppression, et stockage chiffré (Supabase).

## Personnalisation rapide

- **Marque / positionnement** : chercher `LAST` et `--navy` / `--gold` dans
  `index.html`.
- **Services, tarifs, cibles** : sections HTML dédiées (`#services`, `#tarifs`,
  `#pour-qui`).
- **Logique de qualification** : objet `Qualif` (professions, formes, scoring, tags).
- **Scénario de l'assistant** : objet `Chat`.

## Tests

- `node --check` sur le bloc `<script>` : **OK** (0 erreur).
- Rendu Playwright (Chromium) : **0 erreur** console/page ; ouverture du chat,
  navigation par chips, envoi du formulaire → demande qualifiée stockée (profession,
  forme et intention correctement détectées).
