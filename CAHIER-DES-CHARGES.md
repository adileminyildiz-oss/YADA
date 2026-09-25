# CAHIER DES CHARGES — YADA · demandes du 07/07/2026, triées par session

> **Rien ne se perd** : chaque demande ci‑dessous est affectée à SA session (cf. `ROADMAP.md`).
> Les demandes marquées **[RÈGLE]** sont des règles de gestion/comptabilité : elles doivent être
> **fixées par la session transverse « Règles comptables »** (registre `REGLES-COMPTABLES.md`)
> puis implémentées par la session du module concerné, **avec validation Règles avant merge**.
> Marques : ✅ fait · ⏳ à faire · 🌐 nécessite le réseau/une API.

---

## 0 · Fait immédiatement par la session générale (v409 — non comptable, UI/navigation)

- ✅ **Design — transition de page discrète** : « un balayement invisible qui fait classe » —
  fondu très léger + balayage quasi invisible (fini l'effet voyant).
- ✅ **Barre latérale — libellés** : plus de MAJUSCULES entières (TIERS → Tiers), suppression
  des parenthèses et de leur contenu (Paramétrage (réglages) → Paramétrage, Module TVA (CA3) →
  Module TVA, Éditions (…) → Éditions, Rapprochement (lettrage) → Rapprochement,
  Sociétés (portefeuille) → Sociétés).
- ✅ **Comptabilité — retraits** : sous‑modules **Banque (512)**, **Saisie journal Banque** et
  **Assistant IA** retirés de la barre latérale (le Rapprochement reste).
- ✅ **Import/Export FEC** déplacé de Comptabilité → **Permanent** (sous‑module).
- ✅ **Pilotage** : sous‑module **Suivi des règlements** ajouté.
- ✅ **Permanent — Paramétrage** : renommé (sans « (réglages) ») + carte
  **« Synchronisation multi‑appareils (Pantry) » supprimée** de l'affichage.
- ✅ **Permanent — Société & création** : renommé **« Sociétés »**.

### Complément v410 (revue « éléments non pris en compte »)
- ✅ **Pilotage ÉPURÉ** : onglets Impôts (IS/IR), Actif/Passif et Agenda & RH **supprimés** —
  seul « Pilotage » reste (liens vers Analytique / Suivi des règlements / Tableau de bord ;
  la refonte gestion complète reste au §5, IS/IR renaîtra dans Déclarations §2).
- ✅ **Consultation des comptes** : le module **s'ouvre plein écran** ; le carré ▢/▣
  **agrandit à tout l'écran** ; la **croix ✕** et le bouton **─** sont **retirés** de la barre.
- ✅ **Éditions — aperçu A4** : l'aperçu à l'écran s'affiche au **format A4** (210×297 mm) ;
  l'impression était déjà en A4 (`@page size:A4`). *(La règle R4 reste à consigner au registre.)*
- ✅ **RH / Salarié — brut ↔ net** : saisir le **brut** complète automatiquement le **net**
  (et inversement), dans la fiche (`sf-brut`/`sf-net`) et l'onglet Salaires (ratio indicatif
  net = brut × 0,78 du module).
- ✅ **Barre latérale — majuscules en milieu de libellé** retirées : « Analyse — centre de
  contrôle », « Charges et paie », « Immobilisations & financement(s) ».

---

## 1 · SESSION RÈGLES (transverse) — règles à fixer au registre

- ⏳ **[RÈGLE R1 — Exercice]** La **période d'exercice du module Analyse** gouverne TOUS les
  outils de saisie. L'année **N+1 (ex. 2026)** n'est traitable **que** si elle est activée via
  les **flèches d'exercice** au‑dessus de la page Analyse. Sinon, aucun module ne peut saisir
  ou traiter des éléments de N+1. (S'applique à tous les dossiers.)
- ⏳ **[RÈGLE R2 — Unicité des tiers]** Chaque facture est unique, chaque client est unique,
  chaque fournisseur est unique. Toute **ressemblance** entre deux fournisseurs ou deux clients
  (dénomination, montants, HT/TVA) → mise **« en attente de fusion »**, à **valider par le
  gestionnaire des comptes** (jamais de fusion/création silencieuse).
- ⏳ **[RÈGLE R3 — Taux de TVA par défaut]** Clients‑particuliers : **10 %** ; clients‑sociétés :
  **20 %** sauf **sous‑traitance** (autoliquidation) ; fournisseurs : **20 %**.
- ⏳ **[RÈGLE R4 — Éditions A4]** Toutes les Éditions s'impriment en **A4** et l'**aperçu avant
  impression** s'affiche en **A4**.
- ⏳ **[RÈGLE R5 — Flux facture OCR → écriture en attente]** Toute facture (vente reçue/créée par
  YADA, achat réceptionné) : **OCR → écriture constatée → EN ATTENTE d'enregistrement →
  enregistrement**. Compte de tiers **réutilisé s'il existe, sinon créé** ; saisie automatique
  dans Analyse ; **montant de TVA transmis** à Analyse + module TVA + module Tiers (base de
  calcul de l'IS).
- ⏳ **[RÈGLE R6 — Structure des écritures]** Écriture type : ligne **tiers** (montant TTC) +
  ligne **TVA** (compte 445x sur la ligne TVA) + ligne **charge** (achat) ou **produit** (vente),
  qui se **soldent**. Écritures **bancaires = 2 lignes** (tiers ↔ 512). Chaque compte à sa
  place ; **libellé = dénomination du tiers** (pas le compte en doublon) ; **toutes les lignes
  d'une écriture portent le même libellé** ; le module TVA génère des écritures **justes**
  (comptes et montants sans erreur). Revue générale de la Consultation à faire sous cette règle.
- ⏳ **[RÈGLE R7 — Suivi des règlements]** Chaque **facture** est suivie d'une **opération
  bancaire** et chaque opération bancaire d'une **facture** — exceptions : services bancaires
  (commissions, assurances), dons, opérations des/vers les **organismes** et **Impôts**.
- ⏳ **[RÈGLE R8 — FEC]** Avant d'écraser par un import FEC : **sauvegarder** les écritures déjà
  établies. Un **export** FEC n'efface rien (les écritures restent) ; après export, **alerte
  Oui/Non** avant toute purge des mouvements.

## 2 · SESSION DÉCLARATIONS (ex‑TVA) — le module devient « Déclarations »

- ⏳ **Régime TVA** : option **CA3 (mensuel) / CA12 (annuel)** notifiée sur le dossier → le
  module affiche l'un ou l'autre.
- ⏳ **Montants à payer** mensuels/annuels + **formulaire officiel N° 3310‑CA3** (et équivalent
  CA12) reproduit et **rempli automatiquement** depuis la comptabilité (tous les comptes de TVA
  utilisés, montants totaux) → on déclare depuis ce tableau sans s'éparpiller.
- ⏳ **Case « mois déclaré »** à cocher pour repérer les mois à jour.
- ⏳ **Tableau « écriture comptable de TVA »** sur le modèle des scans fournis (mêmes rubriques :
  A‑Montant des opérations réalisées, B‑Décompte de la TVA à payer, TVA brute, déductions,
  crédit, taxe à payer…), lignes supplémentaires si nécessaire, présentation claire.
- ⏳ **Module IS / IR** : selon le régime de la société, calcul IS et IR avec **tableau des
  salaires versés** (repris du module Paie, pas de ressaisie), **taux/pourcentages à jour** →
  montants à payer + **écriture générée automatiquement** dans la Consultation des comptes.
- ⏳ **Module FLAT TAX** : calcul du PFU sur **dividendes** (montant donné → flat tax à payer)
  + **écriture comptable à utiliser**.

## 3 · SESSION PERMANENT (Dossier & réglages)

- ⏳ **Informations société** : à la saisie du **SIREN/SIRET**, complétion automatique depuis
  internet (Société.com, Infogreffe, Pappers) 🌐 (l'API recherche‑entreprises existe déjà en
  partie : `lookupSiret`).
- ⏳ **K‑bis & Statuts** : enregistrés au dépôt (création du dossier) → **PDF téléchargeables** +
  **déploiement immédiat** des informations dans l'onglet Informations société.
- ⏳ **Plan comptable** : afficher les comptes de **TVA**, de **Charges**, de **Produits** —
  toutes les classes **1 → 7**.
- ⏳ **Sociétés** : liste **complète des sociétés par utilisateur**.
- ⏳ **Coffre / identifiants** : recueillir les identifiants de connexion du cabinet
  (Impôts, Urssaf, Retraite, Prévoyance, Mutuelle, Assurance maladie).

## 4 · SESSION RH (Salarié + Charges et Paie)

- ⏳ **Agenda** (remplace « Rendez‑vous », entrée dans la barre latérale) : vrai agenda avec
  vues **Jour / Semaine / Mois**, rappels, notifications, **RDV clients**, couleurs ; à
  l'enregistrement d'un RDV → **envoi par e‑mail** et **par SMS si numéro saisi** 🌐.
- ⏳ **Charges** : cases des **mois d'une seule année** ; par mois, **tableau détaillé de tous
  les comptes de charges‑organismes** : 641 / 6451 / 6453 / 6454 / 6333 / 6312 / 6313 / 6455 /
  421 / 431 / 4373 / 4375 / 4372 / 4421 / 648 — détails précis + montants ; puis présentation
  **sous forme d'écriture** → **génération automatique après vérification** dans la
  Consultation des comptes. **[comptable → validation Règles]**
- ⏳ **Salariés** : liste complète ; suppression **justifiée par documents de sortie** (transmis
  par mail au salarié) ; absences avec justificatif ; **congés** notifiés dans l'agenda avec
  légende par salarié + **tableau des congés disponibles/restants, report annuel** ; **salaires
  modifiables** (ligne nom/prénom/poste + **SMIC du métier**, lois 2026 via IA 🌐) → calcul
  **brut + charges patronales** avec montants et **comptes comptables par organisme**.

## 5 · SESSION PILOTAGE

- ⏳ **Épurer** : supprimer Impôts (IS/IR) [→ Déclarations], Actif/Passif, Agenda & RH [→ RH] ;
  garder uniquement Pilotage + sous‑modules **Analytique & rentabilité** et **Suivi des
  règlements** (nav ✅ v409).
- ⏳ **Refonte complète — vraie plateforme de gestion**, alimentée par la **Consultation des
  comptes** (lier les écritures aux indicateurs) : consolidation des ventes ; calcul des coûts ;
  **gestion de trésorerie** (encaissements/décaissements, cash‑flow, **prévisions + scénarios**,
  besoin en financement) ; coût d'acquisition ; **délais de livraison** (pays, ville, adresse,
  heures départ/arrivée, pointage marchandise) ; **stocks** (optimisation, réappros, ruptures/
  surstocks, propositions d'ordres d'achat) ; **planification** (ordonnancement, tournées, sous
  contraintes coûts/délais) ; **maintenance prédictive** (anomalies machines, arrêts) ;
  **CA, marge brute/nette, résultat d'exploitation** ; **rentabilité par client / produit /
  projet** ; **seuil de rentabilité / point mort** ; **budgets + prévisions de ventes + analyse
  des écarts** ; suivi des actifs + **amortissements auto + cessions/sorties** ; **créances
  clients / dettes fournisseurs** ; **ROI** ; **rapports automatiques** ; **graphiques
  interactifs** ; produit le plus vendu / le plus coûteux — une **mine d'informations** pour
  l'entrepreneur. Les informations manquantes sont à compléter avant calcul.

## 6 · SESSION COMPTABILITÉ

- ⏳ **Consultation plein écran** : le bouton carré agrandit à **tout l'écran** ; supprimer la
  **croix de fermeture** en haut à droite ainsi que la barre.
- ⏳ **Chat IA** intégré pour aider les dirigeants depuis la plateforme 🌐.
- ⏳ **Cohésion totale** : le **Journal comptable** reprend exactement les journaux de la
  Consultation ; les **Éditions** reflètent en direct la dernière modification (balance
  **comptes 1 → 8**). **[comptable → validation Règles]**
- ⏳ **Revue générale de la Consultation** selon la **RÈGLE R6** (comptes à leur place, écritures
  arrêtées au solde, libellés). **[comptable → validation Règles]**

## 7 · SESSION TIERS

- ⏳ Chaque **fournisseur** : compte de tiers + compte de **charges** utilisé + **taux de TVA** +
  **HT dépensé** + **TVA déductible**. Chaque **client** : compte de tiers + compte de
  **produit** + taux de TVA + HT + TVA. Le tout **déterminé depuis la Consultation des
  comptes** (comptes utilisés). Enregistrement de nouveaux tiers possible.
- ⏳ **Détection d'assimilés** (montants, dénomination, HT/TVA) → **en attente de fusion**,
  validée par le gestionnaire (**RÈGLE R2**).

## 8 · NOUVELLE SESSION — ARCHITECTURE & ESPACES (Cabinet / Admin / Client)

- ⏳ **Topo des espaces** :
  - **ESPACE CABINET** — tenue comptable, gestion et paie des sociétés, pour tous les
    comptables du cabinet. Structuré en **5 modules** : Permanent · Déclarations · Salariés ·
    Pilotage · Comptabilité.
  - **ESPACE ADMIN** — gestion du cabinet : accès **global** à tous les dossiers, attribution de
    **droits**, de **missions**, **notes internes**, **tableau d'avancement par salarié**,
    **toutes les fonctionnalités du Cabinet**, et une **barre latérale par thèmes** (nombreux
    thèmes) pour **paramétrer l'espace Client et l'espace Cabinet**.
  - **ESPACE CLIENT** — demandes clients, transmission des factures fournisseurs, création des
    factures clients.
- ✅ **Connexion à 3 espaces (v412)** : Cabinet (`aemconseil.sas@gmail.com`), Client
  (`yada.assistance@gmail.com`), Admin (`admin.admin@gmail.com`) — mots de passe **hachés
  SHA‑256 salés** (clair absent du source). Cabinet = interface complète ; Client = achats/
  ventes + Tiers ; Admin = interface Cabinet + carte Administration (superviseur, données
  partagées → impacte le Cabinet).
- ✅ **Admin — Collaborateurs & dossiers attitrés (v414)** : société exploitante (réglages) ;
  **enregistrement des salariés avec identifiants** (mot de passe **haché SHA‑256 salé**, jamais
  en clair, dans `db.cabinet.staff`) ; **dossiers attitrés** par salarié → le salarié se connecte
  via l'**Espace Cabinet** et ne voit/traite que ses dossiers (garde‑fou d'ouverture) ; **Admin =
  accès global** à toutes les sociétés.
- ⏳ **Outils Admin complets (reste)** : attribution de **droits** & **missions**, **notes
  internes** éditables, **tableau d'avancement par salarié**, **barre latérale par thèmes**
  pour paramétrer les espaces Client & Cabinet (chantier lourd — les cartes Administration v412
  et Collaborateurs v414 en sont l'amorce).

---

## Ordre conseillé
1. **Session Règles** : fixer R1→R8 au registre + moteur central (bloquant critique + rapport).
2. **Sessions modules** : implémenter leurs sections avec, pour chaque PR **comptable**,
   la mention « À VALIDER par la session Règles » et attente du verdict avant merge.
3. **Session Architecture & Espaces** en dernier (structure transverse lourde).

---

# CAHIER DES CHARGES — 25/09/2026 · « Sage Expert IA » (chaîne Sage Génération Experts)

> Cahier des charges reçu sous forme de **prompt système** : YADA doit se comporter comme un
> **collaborateur comptable senior** sur Sage Génération Experts — production, révision,
> fiscalité, immobilisations, gestion cabinet, EDI, FEC, automatisation documentaire —
> et **refuser** tout ce qui n'est pas conforme.
>
> **Confrontation au logiciel existant : l'essentiel est déjà construit.** Ce qui suit distingue
> ce qui **est fait** (avec la version qui l'a livré) de ce qui **manque réellement**.

## Ce que le cahier des charges demande, et qui EXISTE DÉJÀ

| Exigence | État | Où |
| --- | --- | --- |
| **Ordre obligatoire 1→10** (collecte → … → archivage) | ✅ | **Parcours comptable guidé** — 22 étapes *mesurées sur le dossier*, verrouillées par leurs prérequis (v651) |
| Création dossier : fiche entreprise, SIREN/SIRET/TVA/APE, cohérence | ✅ | Création de dossier (v194) + complétion par API SIRET + **Constitution de société** (v652) |
| Collecte documentaire : PDF/JPG/PNG/CSV/OFX, index, doublons, illisibles | ✅ | Dépôts client & cabinet (v42/v44), détection de doublon **comptable** avec comparaison côte à côte (v47) |
| OCR comptable (date, HT, TVA, TTC, tiers, échéance) | ✅ | Lecture PDF couche-texte **hors-ligne** (v51) + OCR image quand connecté (v52) |
| Imputation classes 1→7, compte manquant, TVA incohérente, déséquilibre | ✅ | Moteur d'**imputation qui apprend** (v634) + **Contrôles de cohérence** 7 familles (v610/v636) |
| Refus de toute écriture non équilibrée | ✅ | Garde à chaque porte d'écriture + filet CI `equilibre` |
| Import bancaire (CSV, OFX) | ✅ | Import bancaire (v611), relevé **mémorisé** (v635) |
| Lettrage 401/411 + balance âgée | ✅ | Lettrage automatique paire & lot (v633), **balance âgée** depuis l'échéance (v653) |
| Rapprochement bancaire, validation interdite si écart ≠ 0 | ✅ | Pointage automatique (v635) + **verrou de l'étape 6** du parcours (v651) |
| Immobilisations : linéaire, **dégressif**, cession, +/− value, 6811/28x/675/775 | ✅ | Module Immobilisations + **bascule dégressif→linéaire** art. 39 A (v645) |
| TVA : collectée, déductible, autoliquidée, CA3, CA12 | ✅ | Module TVA + **TVA sur les encaissements** (v642) + OD de TVA automatique (v637) |
| Révision : comptes d'attente, soldes anormaux, CCA/PCA/FNP/FAE | ✅ | **Dossier de révision par cycles** (v646) + **Inventaire & cut-off** 8 travaux (v644) |
| Contrôles de clôture bloquants | ✅ | Clôture refusée si exercice en cours, **anomalie critique** ou CA3 manquante (v637) |
| Liasse 2050 → 2059 | ✅ | **Liasse fiscale** 6 formulaires, dérivés des états (v647) |
| Comptes annuels : bilan, compte de résultat, SIG, annexe | ✅ | v643 (bilan/CR/SIG) + **annexe** (v649) + **tableau de flux** (v650) |
| FEC : génération et contrôle | ✅ | Import/Export FEC + contrôle de conformité (v651, motif corrigé pour les comptes auxiliaires) |
| Tableau de bord permanent | ✅ | Tableau de bord + **compteur d'actions en attente** porté jusqu'à la Consultation (v638) |
| Règle absolue « aucune validation sans contrôle » | ✅ | Principe appliqué module par module ; chaque refus **écrit son motif en clair** |

## Ce qui MANQUE réellement — les huit chantiers

- ✅ **[CDC-1 · Journaux] — ARBITRÉ : quatre journaux de base (v656).** Demande de l'utilisateur :
  *« Utilise le plan comptable générale ainsi que les journaux de base (HA, VT, BQ, OD) »*.
  Le dossier ne connaît donc que **HA · VT · BQ · OD** ; les sous-journaux (OD PAIE, OD CHARGES,
  OD TVA) et le journal **CAISSE** ajouté en v655 sont **regroupés dans OD**, et le plan du dossier
  devient le **PCG (970 comptes)** à la place de la surcouche BTP. Les journaux **SIT** et **CHE**
  du cahier des charges Sage ne sont donc **pas retenus**. *(Historique de la demande d'origine
  ci-dessous.)*
- ⏳ ~~**[CDC-1 · Journaux] Journaux CAISSE (CA), SITUATION (SIT), CHEVAUCHEMENT (CHE)** absents.~~
  YADA a HA · VT · BQ · ODP · ODC · ODTVA · OD. Conséquence **documentée et assumée en v653** :
  « le dossier n'ayant qu'un journal de trésorerie, les règlements — **espèces comprises** — y
  sont portés (BQ), la caisse se distinguant par son **compte** (530) et non par son journal ».
  Le cahier des charges corrige ce compromis. *(SIT = situation intermédiaire, à exclure des
  comptes annuels ; CHE = écritures de chevauchement d'exercice.)*
- ⏳ **[CDC-2 · Import bancaire] Formats QIF, MT940, CFONB** — seuls **OFX** et **CSV** sont lus.
- ✅ **[CDC-3 · Liasse] — LA 2065 EST LIVRÉE (v657).** Module **Déclaration 2065 (IS)** :
  cadres A (récapitulation des éléments d'imposition), B (imputations), C (**contribution
  sociale de 3,3 %**, art. 235 ter ZC — abattement de 763 000 € proratisé sur la durée de
  l'exercice, exonération sous double condition), D (renseignements divers), **2065 bis**
  (capital, dirigeants, filiales) et **relevé de solde** (IS + contribution − acomptes versés
  = solde à payer **ou excédent à restituer**, échéancier des acomptes de l'art. 1668, dates
  limites de dépôt et de paiement). La 2065 **LIT** la liasse (2058-A, v647) : elle ne
  recalcule rien, donc elle ne peut pas en diverger. **Le dépôt est REFUSÉ** tant qu'un
  contrôle critique est en défaut — c'est la règle absolue du cahier des charges, appliquée.
- ⏳ **[CDC-3 · reste] Formulaires 2031/2033 (BIC réel simplifié), 2072 (SCI), 2069 (crédits
  d'impôt)** — non traités : ils relèvent de régimes que YADA ne tient pas encore (IR/BIC
  simplifié, revenus fonciers).
- ⏳ **[CDC-4 · Déclarations] DES et DEB** (échanges intracommunautaires de services et de biens)
  — absentes.
- ✅ **[CDC-5 · Révision] — LA CHAÎNE EST LIVRÉE (v658).** Trois niveaux : **RÉVISÉ** et
  **SUPERVISÉ** cycle par cycle, **VALIDÉ** sur le dossier entier (c'est la signature du
  signataire, elle ne se répète pas six fois). Quatre règles en font une chaîne et pas trois
  cases : l'**ordre est un verrou** ; on **ne se supervise pas soi-même** ; un **bouclage en
  défaut ferme la signature** ; et une **signature porte sur un MONTANT** — si le solde bouge
  après coup, le visa est **périmé**. Le visa unique de la v646 est **migré** en révision.
  L'étape 19 du Parcours ne s'achève qu'à la **validation du dossier**.
- ⏳ **[CDC-6 · Gestion cabinet] Temps passé, coût, marge et rentabilité par dossier, encours,
  honoraires, SEPA, relances** — quasi inexistant (l'Analytique v648 mesure la rentabilité des
  **chantiers du client**, pas celle des **dossiers du cabinet**).
- ⏳ **[CDC-7 · Comptes annuels] Plaquette, rapport de gestion, export Excel et Word** — seule
  l'édition **PDF** (impression A4) existe.
- ⏳ **[CDC-8 · FEC] Distinction FEC provisoire / FEC définitif** — un seul FEC aujourd'hui.

## Ordre retenu

1. **CDC-1** — les journaux manquants, en commençant par la **CAISSE** : c'est le seul chantier
   qui **corrige un compromis déjà reconnu** dans le logiciel, et il porte une vraie règle
   comptable (*une caisse ne peut pas être créditrice*).
2. ~~**CDC-3** — la **2065**~~ → **livrée en v657** (dernier maillon de la chaîne fiscale
   construite en v647 + v654 : résultat fiscal → IS → écriture → **déclaration**).
3. ~~**CDC-5** — la supervision à deux étages~~ → **livrée en v658** (« prêt à être
   **supervisé** puis transmis » : la phrase qui clôt le cahier des charges).
4. **CDC-2**, **CDC-8** — les formats et le FEC provisoire (techniques, cernés).
5. **CDC-6**, **CDC-7**, **CDC-4** — gestion cabinet, plaquette, DES/DEB (chantiers larges).
