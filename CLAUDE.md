# CLAUDE.md — YADA / Précompta (passation Claude Code)

> Ce fichier est lu automatiquement par Claude Code au lancement. Il décrit le projet, les **règles de travail**, l'architecture, et **la dernière mise à jour**. La source de vérité reste **`precompta.html`** (un seul fichier).

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

## 🟢 Dernière mise à jour — REPROGRAMMATION (table rase) : suppression de la CONNEXION, de l'ACCUEIL et de TOUS les modules — SEULE « Consultation » reste (non touchée) — v535
**Quoi :** début de la **reprogrammation complète** du logiciel (demande : « supprime tout — page de connexion, page d'accueil — supprime complètement toutes les pages SAUF Consultation, ne pas y toucher »). L'application **s'ouvre désormais DIRECTEMENT sur la Consultation des comptes** : **plus de page de connexion**, **plus de page d'accueil / sélection de dossier**, **plus aucun autre module** — la **barre latérale est réduite à la seule entrée « Consultation »**. **Consultation (module `compta`, `pageCompta` + éditeur/grand-livre/lettrage) n'est PAS modifiée** (aucune ligne touchée) ; c'est l'ancre à partir de laquelle les autres pages seront **recréées à zéro, une par une**. Un **point de sauvegarde v534** a été archivé au préalable (dossier `archive/` + commit dédié) pour revenir en arrière à tout moment.

**Comment — nouvel addon `yada-addon-reset` (injecté en DERNIER, precompta + build V1) :** (1) neutralise le verrou de connexion (`__secLocked=false`, `__tfaPassed=true`, `secVerrouiller`/`secDeconnexion` → no-op) et **retire l'overlay `#sec-lock`** du DOM ; (2) **override `render`** (le plus externe) → force `connecte=true` et `current='compta'` à chaque rendu (aucune autre page ne peut s'afficher ; nettoie `data-noside`/chip de retour orphelins) ; (3) **override `buildNav`** → barre latérale = une seule entrée « Consultation » ; (4) **ouverture directe** au démarrage (charge le dossier actif s'il existe, sinon le 1ᵉʳ dossier, sinon Consultation vide) via `ouvrir()` (immédiat + 60/400 ms). Le **code résiduel des autres pages devient inerte** (inaccessible) et sera **physiquement retiré module par module** au fil de la reprogrammation. **Build V1 :** l'addon de restriction `yada-v1-restrict` (qui BLOQUAIT la comptabilité) est **neutralisé** (`return;` en tête) pour que la V1 s'ouvre aussi sur la seule Consultation. `sw.js` yada-v130, badge v535, `version.json` 535.

**Validé :** `node --check` (precompta 240 / V1 239, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (precompta **et** V1 : **pas de `#sec-lock`**, démarrage direct `current='compta'`, `.sg-app` rendue, barre latérale = **[« Consultation »] uniquement**, tentative de naviguer ailleurs (`current='dash'`) → **ramenée à `compta`**, 0 pageerror). **Sauvegarde préalable : tag/commit + `archive/precompta-v534.html` etc.** Badge → **v535**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : « FACTURATION » (Espace Cabinet) en Structure B « Barre latérale d'actions + zone principale » — v534
**Quoi :** début de la **reconstruction à zéro, module par module** (demande utilisateur : « chaque module, chaque page devra être recréé à zéro »). Après maquettes (A cockpit / B barre latérale / C liste+aperçu), la page **Facturation (Espace Cabinet)** est retenue en **Structure B** : une **barre latérale d'actions à gauche** — **＋ Nouvelle facture** (ouvre la fenêtre A4), **📄 Factures**, **📥 Dépôt**, **🔁 Récurrence** (si présente), **✎ Saisie manuelle** (si présente), **⚙ Paramètres** — + une **carte mini-KPI « Ce mois »** (CA facturé · à encaisser · en retard · nb factures) ; et une **zone principale à droite** qui affiche **une section à la fois**. Palette bleue « Mar'q » conservée. **Toutes les cartes et fonctions existantes sont préservées** (liste des factures, suivi, correspondances, dépôts, fiches, catalogue, paramètres, e-facturation) — elles sont **réparties par section**, aucune logique réécrite.

**Comment — `yada-addon-factu-b` (100% additif ; transformation post-rendu, precompta + build V1) :** `<style id="factu-b-mod">` (grille `230px 1fr`, `.fpc-rail`/`.fpc-abtn`/`.fpc-mini`/`.fpc-main`) + `transform()` greffé sur `render()` : détecte la page par le **titre de l'en-tête** (`.page-head h1` contient « facturation ») **et** `sessionRole!=='client'` (idempotent via classe `.fpc-done`) ; déplace toutes les cartes de `#main .mod-wrap` dans `.fpc-main` en leur posant un `data-fsec` (classées par le texte du `<h2>` : recurrence / depot / params / nouvelle / factures par défaut) ; construit la barre latérale (bouton principal → `factureNouvelleOuvrir()`, boutons de section présents uniquement, mini-KPI calculé sur `db.docs` du mois). `fpcGo(sec)`/`applySec()` basculent la section en **inline `display`** (pas de re-render, focus/scroll préservés). `sw.js` yada-v129, badge v534, `version.json` 534.

**Validé :** `node --check` (precompta 239 / V1 238, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (cabinet, dossier de test : `.fpc-shell` grille `230px 990px`, barre latérale [Nouvelle facture · Factures · Dépôt · Paramètres] + mini-KPI « Ce mois », section **factures** = 7 cartes visibles / non-factures masquées, `fpcGo('depot')` → 1 carte dépôt visible + factures masquées + bouton actif ; 0 pageerror) + capture (Structure B rendue en bleu). Badge → **v534**. *(Prochaines pages à reconstruire une par une sur le même principe.)*

---

## 🟢 MAJ précédente — HUB / Liste : bouton « Déconnexion » en DOUBLE retiré (barre latérale du shell conservée) — v533
**Quoi :** correctif de la v532. Sur le **HUB du dossier** (et l'écran **« Liste des dossiers »**), la disposition PC (`yada-addon-dossiers-pc`) ajoute une **barre latérale de navigation qui contient déjà un bouton « Déconnexion »** (`.dspc-nav.danger`, en bas à gauche) ; or la **barre d'actions en haut à droite affichait AUSSI un « Déconnexion »** (le bouton inline `.ds-logout-btn` du HUB / `#adm-logout-inline` de la Liste) → **doublon**. Le bouton **inline redondant est désormais masqué** à l'intérieur des shells PC : il ne reste **qu'un seul** bouton « Déconnexion » (celui de la barre latérale). La **flèche de retour ←** (haut-droite) est conservée.

**Comment — 2 règles CSS (styles `dossiers-pc-hub-mod` + `dossiers-pc-liste-mod` ; precompta + build V1) :** ajout de `.dspc-main-hub .ds-logout-btn{display:none !important}` (HUB) et `.dspc-main-liste #adm-logout-inline{display:none !important}` (Liste). Le bouton flottant `#yada-logout` (addon206) reste masqué en rôle cabinet (réservé au client) → aucun nouveau doublon. `sw.js` yada-v128, badge v533, `version.json` 533.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : **1 seul** « Déconnexion » visible = `.dspc-nav.danger` (barre latérale) ; flèche ← en haut à droite ; `#yada-logout` flottant masqué ; 0 pageerror). Badge → **v533**.

---

## 🟢 MAJ précédente — Bouton « Retour » : flèche seule en haut à droite AUSSI sur les écrans du parcours (HUB / dossier / rubrique / Rapport) — v532
**Quoi :** suite de la v531 (bouton flèche des modules). Le **bouton de retour des écrans du parcours d'entrée** (HUB du dossier, dossier sélectionné, rubrique, page Rapport) — qui affichait **« ← Retour aux dossiers »** en toutes lettres — devient une **flèche seule ←**, compacte, **en haut à droite** (comme dans les modules). La **Déconnexion** reste à côté (texte). Sur le HUB, le groupe d'actions est déjà en haut à droite (v525) → l'arrondi flèche s'y intègre ; sur les autres écrans (Rapport…), le groupe est **positionné en haut à droite**.

**Comment — 4 sites de markup + CSS `ds-anim-mod` (addon214 ; precompta + build V1) :** dans `ecranSelUnique`/`ecranHub`/`ecranRubrique`/`ecranRapport`, le contenu du `.ds-back-btn` passe de `<span class="ds-back-arrow">←</span> Retour aux dossiers` à `<span class="ds-back-arrow" title="Retour" aria-label="Retour">←</span>` (flèche seule, remplacement global). CSS ajouté : `.ds-back-btn{width:40px;height:40px;padding:0;display:inline-flex;justify-content:center;font-size:20px;border-radius:11px}` (chip carré arrondi) + `.login-wrap{position:relative}` + `.login-wrap:not(.ds-hub-wrap) .login-actions:has(.ds-back-btn){position:absolute;top:16px;right:20px;margin:0;justify-content:flex-end}` (haut-droite hors HUB, le HUB étant déjà géré par `dossiers-pc-hub-mod`). Le dégradé bleu du chip (marq-palette) est conservé. `sw.js` yada-v127, badge v532, `version.json` 532.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : `.ds-back-btn` texte **« ← »**, 40×40, en haut à droite (`top≈50`, cluster droit avec Déconnexion), `dsOuvrirListe()` ; 0 pageerror) + capture (flèche bleue en haut à droite du HUB). Badge → **v532**.

---

## 🟢 MAJ précédente — Bouton « Retour » : TOUJOURS en haut à droite + flèche seule (←) — v531
**Quoi :** à la demande, le **bouton de retour** affiché dans les modules (barre latérale masquée) est **déplacé en HAUT À DROITE** (au lieu du bas à gauche) et **ne montre plus qu'une flèche ←** (fini le libellé « ‹ Retour au dossier »). Un clic ramène toujours au HUB du dossier (`dsRetourModule`). Bouton compact carré arrondi (42×42), coin supérieur droit fixe (`right:14px;top:14px`), title/aria-label « Retour ».

**Comment — `yada-addon190` (`<style id="noside-mod">` + `ensureChip`, precompta + build V1) :** `#ds-back-chip` passe de `position:fixed;left:12px;bottom:118px` (pilule texte) à `right:14px;top:14px;width:42px;height:42px;padding:0;justify-content:center;font-size:22px` (flèche seule) ; `ensureChip()` : `innerHTML='←'` + `title`/`aria-label='Retour'` (au lieu de `'‹ Retour au dossier'`). Le dégradé bleu du chip (marq-palette v529/v530) est conservé (couleurs uniquement). `sw.js` yada-v126, badge v531, `version.json` 531.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (module TVA : `#ds-back-chip` `position:fixed` **top 14 / right 14**, 42×42, texte **« ← »**, title « Retour », `body[data-noside="1"]` `display:flex` ; 0 pageerror) + capture (flèche bleue en haut à droite). Badge → **v531**.

---

## 🟢 MAJ précédente — REFONTE (bleu) : CONTRASTE RENFORCÉ du fond & des cartes — v530
**Quoi :** à la demande, le fond et les cartes du thème bleu sont retravaillés pour un **contraste renforcé** (meilleure séparation) : **fond plus sombre** (`#05070d` → **`#03040a`**, quasi-noir), **cartes plus visibles** (`#0b0f18` → **`#0f1626`**, plus claires → elles ressortent nettement sur le fond) et **filet bleu plus marqué** (`rgba(47,143,255,.16)` → **`.28`**). Le reste du bleu (accents `#2f8fff`/`#5ab0ff`/`#2f74e6`, nuances de bleu pour cre/deb, barres/donuts/courbe) est inchangé. Zones Consultation/éditeur/Éditions non touchées.

**Comment — `marq-palette` (precompta + build V1) :** remplacement global des 3 tokens dans le `<style id="marq-palette">` : base sombre `#03040a` (body/html/layout/main/mod-wrap/dash-wrap), cartes & KPI & champs & dr-card/dr-kpi `#0f1626`, filet des cartes/KPI/tables `rgba(47,143,255,.28)`. `sw.js` yada-v125, badge v530, `version.json` 530.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (dashboard : `body` fond **`rgb(3,4,10)`**, cartes **`rgb(15,22,38)`** filet `rgba(47,143,255,.28)`, nav actif `.28`, 8 KPI, barres/courbe bleues ; 0 pageerror) + capture (fond quasi-noir, cartes bleu plus claires bien détachées). Badge → **v530**.

---

## 🟢 MAJ précédente — REFONTE : TOUTES LES COULEURS EN BLEU (sur la base sombre « Mar'q ») — v529
**Quoi :** à la demande (« remplace toutes les couleurs par le bleu »), la refonte passe **entièrement au BLEU** sur la base sombre issue de la maquette « Mar'q » : **fond bleu nuit profond** (`#05070d`), **cartes à filet bleu discret** (`rgba(47,143,255,.16)`, sans ombre), **accents bleu franc** (`#2f8fff` / clair `#5ab0ff` / profond `#2f74e6`) partout — barre latérale (actif = liseré + fond bleu, icône `#5ab0ff`), en-têtes, cartes, KPI, boutons (primaires bleus), champs, tableaux, liens, chip flottant `#ds-back-chip` (dégradé bleu). Le **vert/rouge comptable devient des NUANCES DE BLEU** (`.cre` clair `#5ab0ff` = crédit, `.deb` profond `#2f74e6` = débit) pour garder la distinction ; les **barres/donuts/légendes du tableau de bord** (CA vs Charges, répartitions, swatches `.dr-sw`, pastilles de journal `.tag t-ven/t-ach`) et la **courbe de trésorerie** passent au bleu. **Nom YADA + vrais modules + police IBM Plex Sans** inchangés. **Zones intactes** : Consultation (`.sg-app`), éditeur (`.ec-*`), Éditions (`.doc-page`/`.inv`). Seul le **point vert de l'icône-logo YADA** (identité de marque, inline `!important`) reste — non recoloré volontairement.

**Comment — `yada-addon-marq-palette` réécrit en BLEU (100% CSS additif, injecté en dernier → prime ; precompta + build V1) :** `<style id="marq-palette">` — base `#05070d` (`html body[data-theme="noir"]:not(#x)` pour battre nuitbleue à spécificité égale) + halos/pseudos neutralisés ; `aside`/`#nav` bleus (`#nav-aurora` masqué, actif `rgba(47,143,255,.16)` + `inset 2px 0 0 #2f8fff`) ; `.card`/`.kpi` filet bleu + `h2::before`/`kpi::before` `#2f8fff`, `kpi-ic` bleu ; `.btn`/`.btn-pri`/`.yada-fill` bleus ; champs `.card input/select` bleus ; tables `.card th/td` bleues ; `.cre`/`.deb` recolorés en bleu avec sélecteurs `html body[data-theme="noir"] .card/.dash-riche td.cre/.deb` (spécificité 0,3,x + `-webkit-text-fill-color` pour battre `td.cre/td.deb` 0,2,2) ; tableau de bord `.dr-*` tout bleu (`.dr-area`/`.dr-linep`/`.dr-dot`/`.dr-bca`/`.dr-bch`/`.dr-kpi.green|red::after`) ; pastilles `.dash-riche .tag.t-ven/t-ach/…` en bleu ; **PAL_CH/PAL_PR** (rampes de donut) + swatches inline `.dr-sw` passés en nuances de bleu. `sw.js` yada-v124, badge v529, `version.json` 529.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (dashboard : `body` fond **`rgb(5,7,13)`**, cartes `#0b0f18` filet `rgba(47,143,255,.16)`, `kpi-ic` bleu `#5ab0ff`, nav actif `rgba(47,143,255,.16)`, barres/courbe bleues, 8 KPI ; **scan couleurs = 0 fuite vert/rouge** hors le point-logo de marque ; 0 pageerror) + captures (tableau de bord & connexion tout en bleu). Badge → **v529**.

---

## 🟢 MAJ précédente — REFONTE : base de couleurs MONOCHROME (maquette « Mar'q ») — noir/blanc, fin du bleu franc + tableau de bord à en-tête compact — v528
**Quoi :** à la demande (maquette « Mar'q · Logiciel interne » fournie), la **refonte prend la base de couleurs de la maquette** : **monochrome noir & blanc** — **fond noir pur** (`#000`, fin des halos bleus), **cartes à filet blanc discret** (`rgba(255,255,255,.09)`, sans ombre), **texte blanc + gris**, **accents BLANCS** (l'ancien **bleu franc `#2f8fff` disparaît** : barre latérale, en-tête, cartes, boutons, champs, tableaux, liens, tableau de bord). Le **vert/rouge comptable est PRÉSERVÉ** (KPI CA/Charges/Résultat, `.cre`/`.deb`). Le **tableau de bord** perd sa grande barre « hero » (nom société) + les 4 grosses tuiles au profit d'un **en-tête compact** (« Tableau de bord » + société · date longue à gauche, 4 pastilles de raccourci monochromes à droite). **Nom YADA + vrais modules conservés** ; police **IBM Plex Sans** inchangée. **Zones intactes** : Consultation (`.sg-app`), éditeur (`.ec-*`), Éditions (`.doc-page`/`.inv`) — non recolorées.

**Comment — `yada-addon-marq-palette` (100% CSS additif, injecté en dernier → prime ; precompta + build V1) :** `<style id="marq-palette">` — fond noir (`html body[data-theme="noir"]:not(#x)` pour battre nuitbleue à spécificité égale) + halos/pseudos neutralisés ; barre latérale `aside`/`#nav` monochrome (actif = liseré blanc, `#nav-aurora` masqué) ; `.card`/`.kpi` à filet + `.card h2::before` blanc ; `.btn` monochrome (primaires blancs sur noir) ; champs `.card input/select` ; tables `.card th/td` (cre/deb gardés) ; tableau de bord `.dr-*` (bleu→blanc, courbe trésorerie blanche, KPI vert/rouge gardés) ; chip flottant `#ds-back-chip` monochrome. En plus : `dashHero()` retiré de l'override `pageDash` + **en-tête compact `.dr-head`** (titre + société·date + pastilles `.dr-qbtn`) ajouté en tête de `richBody()`. `sw.js` yada-v123, badge v528, `version.json` 528.

**Validé :** `node --check` (precompta 238 / V1 237, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (dashboard : `body` fond **`rgb(0,0,0)`** pur, en-tête compact + 4 pastilles, 8 KPI (vert/rouge préservés), courbe blanche, cartes à filet, chip `rgb(20,20,20)` monochrome, **0 fuite de bleu**, 0 pageerror) + captures (tableau de bord monochrome conforme à la base de la maquette). Badge → **v528**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : « TABLEAU DE BORD » RICHE & TRÈS REMPLI (Cockpit analytique — Structure A) — v527
**Quoi :** suite de la reconstruction page par page. Le **Tableau de bord** (Espace cabinet) devient un **cockpit analytique riche et très rempli**, calculé sur **toutes les écritures** (`db.ecritures`) : (1) **bandeau de 8 KPI** — Chiffre d'affaires (vert), Charges (rouge), Résultat bénéfice/perte (vert/rouge), Marge nette %, Trésorerie (solde 512), TVA du mois (à décaisser/crédit), Créances clients, Dettes fournisseurs — chacun avec **icône SVG filaire** teintée par nature ; (2) **graphique CA vs Charges** (barres mensuelles groupées, jusqu'à 12 mois, tooltips) ; (3) **trésorerie cumulée** (courbe SVG + aire, ligne zéro, points) ; (4) **deux donuts** de répartition (charges classe 6 / produits classe 7, top 6 + « Autres », légende %) ; (5) **tables** — dernières écritures, top clients (CA), top fournisseurs (dépenses), factures non réglées (créances + dettes, lignes non lettrées). Le **hero + raccourcis** est conservé ; le **vert/rouge comptable** est préservé. Noir + bleu franc `#2f8fff` + IBM Plex. L'**Espace Client** reste inchangé.

**Comment — nouvel addon `yada-addon-dash-riche` (100% additif ; precompta + build V1) :** override de `window.pageDash` (cabinet uniquement — `sessionRole!=='client'`) : reprend le préfixe existant (`.dash-wrap` + carte Admin + bandeau collaborateur), régénère `dashHero()`, puis injecte `richBody()`. Calculs autonomes depuis `db.ecritures` (collecte mensuelle CA/charges/512 cumulé) + réutilisation de `analytique()` (répartitions, top tiers) et `regOpenGroups()` (factures non réglées) + `tvaDuMois()`. **Graphiques SVG maison** (aucune bibliothèque) : barres groupées, courbe d'aire, donuts (arcs `stroke-dasharray`). Icônes **SVG filaires** (non retirées par le balayage anti-emoji v366). CSS `<style id="dash-riche-mod">` scopé `.dash-riche` (bandeau responsive `repeat(4,1fr)`, cartes vitrées, tables). Défensif (try/catch par section → repli sur l'ancien dashboard en cas d'erreur). `sw.js` yada-v122, badge v527, `version.json` 527.

**Validé :** `node --check` (precompta 237 / V1 236, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (dossier de démo, 30 écritures sur 6 mois : `.dash-riche` présent, **8 KPI**, **2 donuts**, **4 tables**, 6 barres mensuelles, CA 61 500 €, 0 pageerror) + capture (cockpit : bandeau KPI, CA vs Charges, trésorerie cumulée, donuts charges/produits). Badge → **v527**.

---

## 🟢 MAJ précédente — HUB du dossier : 5 rubriques à la même taille (symétriques avec la fiche société, bords sans débordement) — v526
**Quoi :** à la demande, les **5 cartes de rubriques** (Permanent · Déclarations · Ressources Humaines · Pilotages · Comptabilité) sont **toutes réduites à la même taille** et réparties uniformément pour être **symétriques avec le tableau (fiche société) à gauche** : la colonne de rubriques a exactement la **même hauteur** que la fiche société et chaque tuile est **identique** (77 × 448 px). Les **bords ne dépassent plus** (contenu tronqué proprement dans chaque tuile).

**Comment — CSS `<style id="dossiers-pc-hub-mod">` (`yada-addon-dossiers-pc`, precompta + build V1) :** `.ds-hub-side` passe de `justify-content:space-between` (tuiles à hauteur variable selon le contenu) à une **grille de 5 rangées égales** (`display:grid;grid-template-rows:repeat(5,1fr);gap:8px;min-height:0`) → les 5 tuiles remplissent la hauteur de la colonne (elle-même étirée à la hauteur de la fiche société via `align-items:stretch`) en parts égales. `.ds-tile` reçoit `min-height:0;overflow:hidden;box-sizing:border-box` (aucun débordement de bord, y compris pour la description sur 2 lignes de « Permanent »). `sw.js` yada-v121, badge v526, `version.json` 526.

**Validé :** `node --check` (precompta 236 / V1 235, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : société `416×448` = colonne rubriques `416×448` ; **5 tuiles identiques 77×448** — même hauteur & même largeur ; **aucun débordement du bord droit** ; 0 pageerror) + capture (5 rubriques égales, symétriques à la fiche société). Badge → **v526**.

---

## 🟢 MAJ précédente — HUB du dossier : boutons d'action déplacés en HAUT À DROITE + deux cartes alignées — v525
**Quoi :** à la demande, dans le **HUB du dossier**, les **boutons d'action** (« ← Retour aux dossiers » · « Déconnexion ») passent **en haut à droite** de la zone (au niveau du fil d'Ariane / titre) au lieu d'être centrés sous les cartes. Les **deux cartes** (fiche société à gauche · rubriques à droite) restent **parfaitement alignées** — même haut, même hauteur, même largeur (448 × 416 px, grille `1fr 1fr` `align-items:stretch`).

**Comment — CSS `<style id="dossiers-pc-hub-mod">` (`yada-addon-dossiers-pc`, precompta + build V1) :** `.dspc-main-hub{position:relative}` ; `.dspc-main-hub .login-actions{position:absolute;top:22px;right:30px;margin:0;justify-content:flex-end;z-index:3}` (au lieu de centré) ; la règle `margin-top:18px` ne cible plus `.login-actions` ; en `@media(max-width:900px)` les boutons repassent **statiques et centrés** (`position:static`, `margin:16px auto 0`). `sw.js` yada-v120, badge v525, `version.json` 525.

**Validé :** `node --check` (precompta 236 / V1 235, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : `.login-actions` `position:absolute` à `x≈902,y≈50` (haut-droite) avec 2 boutons ; deux colonnes `448×416` — **même top (151), même hauteur (416), même largeur** ; 0 pageerror) + capture (boutons en haut à droite, cartes alignées). Badge → **v525**.

---

## 🟢 MAJ précédente — HUB du dossier : cartes RÉDUITES pour une symétrie complète (rubriques + fiche société compactées, colonnes égales) — v524
**Quoi :** à la demande (« réduire la taille de certaines cartes pour être complètement symétrique »), les **cartes du HUB sont compactées** afin d'égaliser encore la hauteur des deux colonnes : les **tuiles de rubriques** (padding, icône, libellés) et la **fiche société** (en-tête, avatar, nom, grille d'infos) sont réduites. La grille reste **strictement égale** (`1fr 1fr`, `align-items:stretch`) → colonnes de **même largeur ET même hauteur** (448 × 416 px), contenu centré (v523 conservé).

**Comment — CSS `<style id="dossiers-pc-hub-mod">` (`yada-addon-dossiers-pc`, precompta + build V1) :** `.ds-tile` padding `14px 16px→10px 14px`, gap `13→11` ; `.ds-tile-ic` `40→34px`, rayon `11→9`, svg `20→18px` ; `.ds-tile-t{font-size:14px}.ds-tile-d{font-size:11px}` ; fiche société : `.dsc-head{padding:11px 15px;gap:11px}`, `.dsc-av{40px;font-size:18px}`, `.dsc-nom{17px}`, `.dsc-grid{gap:7px;padding:10px 13px 11px}`, `.dsc-item{padding:7px 10px}` (tout scopé `.dspc-main-hub`). `sw.js` yada-v119, badge v524, `version.json` 524.

**Validé :** `node --check` (precompta 236 / V1 235, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : colonnes `448px 448px` — **largeurs égales**, **hauteurs égales 416/416** (compactées), 5 rubriques + 5 icônes SVG, repères masqués, 0 pageerror) + capture (deux colonnes symétriques compactées, contenu centré). Badge → **v524**.

---

## 🟢 MAJ précédente — HUB du dossier : mise en page TRÈS SYMÉTRIQUE (deux colonnes égales, centrées, même hauteur) — v523
**Quoi :** à la demande, le **HUB du dossier** (Structure A) est rendu **parfaitement symétrique** : la grille passe de `1fr minmax(420px,540px)` (colonnes inégales) à **deux colonnes strictement égales** (`1fr 1fr`), l'ensemble est **centré** (`max-width:1160px;margin:auto`), les deux colonnes ont la **même hauteur** (`align-items:stretch`) et les **5 rubriques sont réparties uniformément** (`justify-content:space-between`) pour égaler la hauteur de la fiche société. Le **fil d'Ariane, le titre, le sous-titre et la barre d'actions sont centrés**.

**Comment — édition du CSS `<style id="dossiers-pc-hub-mod">` (`yada-addon-dossiers-pc`, precompta + build V1) :** `.ds-hub-grid` → `grid-template-columns:1fr 1fr;margin:16px auto 0;max-width:1160px;align-items:stretch;justify-items:stretch` ; `.ds-hub-main{max-width:none;width:100%}` (fin du cap 560px) ; `.ds-hub-side{justify-content:space-between}` ; `.login-title/.login-sub/.dspc-crumb/.login-actions` centrés (`text-align:center` / `justify-content:center` + `margin:auto`). `sw.js` yada-v118, badge v523, `version.json` 523.

**Validé :** `node --check` (precompta 236 / V1 235, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : colonnes `448px 448px` — **largeurs égales**, **hauteurs égales 437/437**, 5 rubriques + icônes, 0 pageerror) + capture (deux colonnes symétriques, contenu centré). Badge → **v523**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : « HUB DU DOSSIER » en Structure A « Fiche société à gauche + rubriques en liste » (PC) + repères « YADA · vNNN » / « Enregistré ✓ » masqués — v522
**Quoi :** suite de la reconstruction page par page. Le **HUB du dossier** (l'écran ouvert quand on **sélectionne un dossier**) passe en **disposition PC « Fiche société à gauche + rubriques en liste »** (choix utilisateur — Structure A) : **barre latérale de navigation à gauche** (identique aux autres pages : Dossiers / Modules + Déconnexion), **fil d'Ariane « Dossiers / <nom> »**, **fiche société** (avatar + nom + badge forme + SIREN + grille SIRET/APE/N° TVA/dirigeant/activité/adresse) au centre, et les **5 rubriques en liste à droite** — chacune avec une **icône SVG filaire** (Permanent ⚙ · Déclarations % · Ressources Humaines 👥 · Pilotages 📊 · Comptabilité 📖) + libellé + description + « Ouvrir → ». Noir + bleu franc + IBM Plex. **Navigation préservée** (`dsEntrerRubrique`, `dsOuvrirListe`, `admDoLogout`) — le contenu existant est **enveloppé**, pas réécrit. **En plus (demande) : les repères visuels « YADA · vNNN » (`#yada-ver`) et « Enregistré ✓ … » (`#yada-save-ind`) sont MASQUÉS** partout (ils restent dans le DOM — le badge de version reste lu par le contrôle de mise à jour / le verrou anti-retour).

**Comment — extension de `yada-addon-dossiers-pc` (100% additif ; precompta + build V1) :** icônes rubriques `RIC=[cog,percent,people,chart,book]` ajoutées à `IC` ; `transformHub()` détecte `.login-wrap.ds-hub-wrap`, pose `.ds-pchub` (idempotent), **enveloppe** le contenu (`.ds-hub-grid` + actions) dans `.dspc-main dspc-main-hub` (préfixé d'un fil d'Ariane), **décore** chaque `.ds-hub-side .ds-tile` (icône SVG + texte empilé + « Ouvrir → »), précédé de la barre latérale (`asideHTML()`) → shell `.dspc-shell-hub` (grille `236px 1fr`). CSS `<style id="dossiers-pc-hub-mod">` (fiche à gauche `1fr` / rubriques à droite `minmax(420px,540px)`, tuiles en ligne icône+texte, `.login-head` masqué). `render()` appelle `transform()` + `transformListe()` + `transformHub()`. Nouvel addon `yada-addon-hide-reperes` (`<style id="hide-reperes-mod">` : `#yada-ver,#yada-save-ind{display:none!important}`). `sw.js` yada-v117, badge v522, `version.json` 522.

**Validé :** `node --check` (precompta 236 / V1 235 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (HUB : `.dspc-shell-hub` grille `236px 980px`, barre latérale 6 nav, fiche société « MBC » présente, **5 rubriques + 5 icônes SVG**, fil d'Ariane « Dossiers / MBC » ; repères `#yada-ver` & `#yada-save-ind` `display:none` — texte « YADA · v522 » toujours dans le DOM ; 0 pageerror) + capture conforme à la maquette A. Badge → **v522**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : « LISTE DES DOSSIERS » en Structure A « Barre latérale + liste + infos » (PC) — v521
**Quoi :** suite de la reconstruction page par page. L'écran **« Liste des dossiers »** (après « Espace dossiers ») passe en **disposition PC « Barre latérale + liste + infos »** (choix utilisateur) : **barre latérale de navigation à gauche** (identique à l'Espace dossiers : Dossiers / Modules + Déconnexion), **liste des dossiers au centre** (barre de recherche + lignes avatar/nom/forme·ville·SIREN), et **fiche d'informations à droite au survol** (`#ds-info-panel`). Noir + bleu franc + IBM Plex. **Recherche (`dsFilterListe`), survol → fiche (`#ds-info-panel`) et sélection (`dsSelectionner`) préservés** (le contenu existant est enveloppé, pas réécrit).

**Comment — extension de `yada-addon-dossiers-pc` (100% additif ; precompta + build V1) :** `asideHTML()` extraite (barre latérale réutilisable) ; `transformListe()` détecte l'écran (`.login-wrap` dont `.login-title`==='Liste des dossiers'), pose `.ds-pcl` (idempotent) et **enveloppe** le contenu existant (titre + recherche + `.ds-liste-layout` + actions) dans un `.dspc-main-liste`, précédé de la barre latérale → shell `.dspc-shell-liste` (grille `236px 1fr`). CSS `<style id="dossiers-pc-liste-mod">` : liste au centre / fiche à droite via `order` (`.ds-list-col{order:1}` / `.ds-info-col{order:2}`, colonnes `minmax(420px,1fr) 340px`), `.login-head` masqué. `render()` appelle `transform()` + `transformListe()`. `sw.js` yada-v116, badge v521, `version.json` 521.

**Validé :** `node --check` (addon precompta + V1 OK) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (Liste : `.dspc-shell-liste` grille `236px 1fr`, barre latérale (6 nav), liste au centre (`.ds-list-col` order 1) + fiche à droite (`.ds-info-col` order 2), recherche `#ds-search` présente, 2 lignes rendues ; 0 pageerror) + capture conforme à la maquette A. Badge → **v521**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : « ESPACE DOSSIERS » (accueil après connexion) en Structure B « Double barre latérale » (PC) — v520
**Quoi :** suite de la reconstruction page par page. L'**accueil « Espace dossiers »** (l'écran juste après la connexion) passe en **disposition PC « Double barre latérale »** (choix utilisateur — pas de version mobile centrée) : **barre latérale de navigation à gauche** (logo YADA en haut ; section **Dossiers** : Liste des dossiers / Créer un dossier / Importer (JSON) ; section **Modules** : Facturation / Rapport / Espace Admin (admin) ; pied cabinet + collaborateur + **Déconnexion**), **modules au centre** (grande tuile « Ouvrir un dossier » + Facturation / Créer / Importer / Rapport / Admin), et **panneau à droite** (dernier dossier « Reprendre », **Portefeuille** cliquable, carte « Télécharger YADA sur PC »). Icônes **SVG filaires** (pas d'emoji → non retirées par le balayage anti-emoji v366). Noir + bleu franc + IBM Plex Sans.

**Comment — `yada-addon-dossiers-pc` (`<style id="dossiers-pc-mod">` + transformation DOM, 100% additif, injecté en fin de `<body>` ; precompta + build V1) :** wrap de `render()` → `transform()` détecte l'accueil (`.login-wrap` dont `.login-title`==='Espace dossiers'), pose la classe `.ds-pc` (idempotent) et remplace le contenu par le shell `.dspc-shell` (grille `236px 1fr 300px`, `.dspc-aside`/`.dspc-main`/`.dspc-right`). Réutilise **les globales existantes** (`dsOuvrirListe`, `dsOuvrirFacturation`, `ouvrirCreationDossier`, `dsOuvrirRapport`, `admShowToggle`, `admDoLogout`, `dsSelectionner`, `yadaDownloadFile`, `#imp`), lit `db.cabinet`/`db.activeId` (+ `staffFilterDossiers`) ; who/role calqué sur `loginHead`. Aucune logique modifiée. `sw.js` yada-v115, badge v520, `version.json` 520.

**Validé :** `node --check` (addon-dossiers-pc OK) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (accueil : `.dspc-shell` grille `236px … 300px`, barre latérale + 6 entrées de nav, 5 modules, **11 icônes SVG**, panneau droit Portefeuille + « Télécharger YADA », titre « Espace dossiers » ; 0 pageerror) + capture (double barre latérale conforme à la maquette B). Badge → **v520**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : Page de CONNEXION en Structure C « Immersif » (fond dégradé plein écran + carte vitrée flottante + tagline), accent BLEU FRANC — v519
**Quoi :** suite de la reconstruction page par page. L'**écran de connexion `#sec-lock`** adopte la **Structure C « Immersif »** (choix utilisateur) : **fond dégradé plein écran** (bleu nuit + halo bleu + fines lignes aurora) + **carte vitrée flottante** (verre dépoli `backdrop-filter:blur`) contenant le logo + « Bienvenue » + boutons + formulaire, et une **tagline latérale** (« Votre comptabilité, claire et maîtrisée. »). Accent **BLEU FRANC** `#2f8fff→#2f74e6` (fin du cyan `#2fe6ff` que d'anciens stylers réimposaient). IBM Plex Sans. Fonctionne sur toutes les étapes (choix d'espace, e-mail, mot de passe).

**Comment — `yada-addon-login-c` (`<style id="login-c-mod">` + réagencement DOM, 100% additif, injecté en fin de `<body>` ; precompta + build V1) :** CSS scopé **`html body[data-theme] #sec-lock …`** (spécificité 1,2,2 → bat les anciens stylers `sec-charme`/« Contraste » cyan à `#sec-lock .sec-cta`/`.sec-body`) : `.sec-screen` en fond immersif + `::before` aurora, `.sec-hero` masqué, `.sec-body` en carte vitrée translucide `rgba(13,17,25,.74)` + blur, `.sec-cta` en bleu franc, `.sec-cta-2` fantôme à bord bleu, champs/liens bleus, `.sec-c-tag` latérale. **Réagencement DOM** (MutationObserver sur `#sec-lock`, idempotent, re-appliqué à chaque étape) : déplace `.sec-logo` dans la carte + injecte la tagline. Mobile ≤900px : carte centrée, tagline masquée. `sw.js` yada-v114, badge v519, `version.json` 519.

**Validé :** `node --check` (login-c OK) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (connexion : `.sec-body` fond `rgba(13,17,25,.74)` + `backdrop-filter:blur(18px)`, `.sec-cta` = dégradé **bleu** `rgb(47,143,255)→rgb(47,116,230)` (plus de cyan), tagline présente, logo dans la carte ; étape e-mail rendue dans la carte ; 0 pageerror) + captures (choix d'espace + étape e-mail conformes à la maquette C). Badge → **v519**.

---

## 🟢 MAJ précédente — RECONSTRUCTION (page par page) : fond noir + accent BLEU (#2f8fff) + police IBM Plex Sans + Tableau de bord en Structure A « Colonnes » (compta intacte) — v518
**Quoi :** début de la **reconstruction du design page par page** (méthode validée : présentation + maquettes de structure au choix). L'accent **orange (rejeté) passe au BLEU `#2f8fff`**, la police à **IBM Plex Sans** (embarquée hors-ligne, data-URI), fond **noir** + halos bleus, look spatial UI. Le **Tableau de bord** adopte la **Structure A « Colonnes »** (choix utilisateur) : bandeau d'indicateurs en haut (tuiles KPI icône bleue + libellé + valeur), puis grille de cartes en colonnes. **INTACT (non touché)** : **Consultation** (`.sg-app`), **éditeur d'écritures** (`.ec-*`), **Éditions** (`.doc-page`) + pages « compta » et « editions » — police d'origine + rendu monochrome (grayscale) conservés. Le **vert/rouge comptable** est préservé.

**Comment — `yada-addon-nuitbleue` réécrit (`<style id="yada-nuit-bleue">`, 100% CSS additif, injecté en fin de `<body>` → prime ; precompta + build V1) :** `@font-face` IBM Plex Sans (60 Ko base64) + `html body,html body *{font-family:'IBM Plex Sans'…}` (doc-page/inv restaurées en police d'impression) ; `html{filter:none}` + grayscale ré-appliqué sur Consultation/éditeur/Éditions ; tokens `--blue/--accent/--acc/--ct-acc → #2f8fff` ; fond noir `#050609` + halos `rgba(47,143,255,…)` ; cartes/KPI/boutons/champs/tables/barre latérale/connexion recolorés en bleu ; scopé `html body[data-theme="noir"]` avec exclusion `:not([data-page="compta"]):not([data-page="editions"])`. **Bloc Structure A** scopé `[data-page="dash"]` : `.grid.g4` en rangée, `.kpi` en grille `44px 1fr` (tuile icône + libellé + valeur), cartes en colonnes `.grid.g2` 1.5fr/1fr, hero accordé. `sw.js` yada-v113, badge v518, `version.json` 518.

**Validé :** `node --check` (nuitbleue OK) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (thème noir : IBM Plex chargée **hors-ligne** `document.fonts.check('16px "IBM Plex Sans"')=true`, `filter:none` global, badge v518, KPI en grille + icône bleue `rgba(47,143,255,.14)` ; Consultation **intacte** `main filter grayscale(1)` ; capture Tableau de bord Structure A en bleu). Badge → **v518**.

---

## 🟠 Historique (design rejeté) — REFONTE « Console » : fond noir + accent ORANGE + police Inter + spatial UI (compta intacte) — v517
**Quoi :** refonte visuelle validée par maquettes (référence « console d'administration »). **Fond noir**, **accent orange `#f2681f`** (couleur de l'image de référence), **police Inter** (embarquée hors-ligne), **look spatial UI** : panneaux à filet + halos, boutons travaillés, barre latérale à pastille active, tuiles KPI à icône. La **couleur est rétablie** (annule le monochrome v514/v516). **INTACT (non touché)** : **Consultation** (`.sg-app`), **éditeur d'écritures** (`.ec-*`), **Éditions** (`.doc-page`) — police d'origine + rendu monochrome conservés ; tout le reste reçoit le nouveau design. Le **vert/rouge comptable** est préservé.

**Comment — `yada-addon-nuitbleue` (`<style id="yada-nuit-bleue">`, 100% CSS additif, injecté en fin de `<body>` → prime sur tout ; precompta + build V1) :** `@font-face` Inter (data-URI) + `html body,html body *{font-family:'Inter'…}` (sauf zones compta : police d'origine restaurée) ; `html{filter:none}` + grayscale ré-appliqué sur Consultation/éditeur/Éditions pour les garder intacts ; tokens `--blue/--accent/--acc/--ct-acc → #f2681f` ; fond noir + halos orange ; cartes/KPI/boutons/champs/tables/barre latérale/connexion recolorés ; scopé `html body[data-theme="noir"]` avec exclusion `:not([data-page="compta"]):not([data-page="editions"])` pour le contenu. `sw.js` yada-v112, badge v517, `version.json` 517.

**Validé :** `node --check` (addon OK) + accolades CSS équilibrées + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (thème noir : Inter chargée **hors-ligne**, `filter:none`, badge v517, 0 pageerror ; Consultation **intacte** monochrome + police d'origine ; captures Tableau de bord/Facturation/Tiers/Paramétrage en orange). Badge → **v517**.

---

## 🟢 MAJ précédente — Retour à la version d'"'"'avant (annulation de l'amélioration du blanc) + purge du cache — v516
**Quoi :** à la demande, **retour à la version d'avant** — l'**amélioration du « blanc » du mode clair (v515)** est **annulée** : le bloc `yada-addon-clair` (`<style id="yada-clair-white">`) est **retiré** de `precompta.html` et du build `yada-v1.html` → le mode clair revient à l'état **v514** (blanc d'origine). Le **monochrome total reste en place** (`yada-addon-mono` conservé : deux ambiances « noir sombre » / « noir clair », aucune couleur). Le **cache est purgé** (bump du service worker) pour que le retour prenne effet immédiatement en ligne.

**Comment :** `precompta.html` + `yada-v1.html` restaurés à l'identique de l'état **v514** (`git checkout e4df06f -- …` → suppression nette du bloc `yada-addon-clair`, aucune autre différence). Le **numéro de version est AVANCÉ à v516** (et non redescendu) pour ne pas déclencher le **verrou anti-retour de version** (addon133) sur les appareils ayant déjà vu v515 : c'est une mise à jour **vers l'avant** qui rétablit le blanc d'avant. `sw.js` yada-v111 (l'`activate` purge tous les caches ≠ courant), badge v516, `version.json` 516.

**Validé :** `node --check` (aucun `yada-addon-clair`) + accolades CSS (precompta 14803/14803 = v514) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (filtre `grayscale(1)` actif, badge v516, `yada-clair-white` **absent**, 0 débordement, 0 pageerror). Badge → **v516**.

---

## 🟢 Dernière mise à jour — « Noir clair » raffiné : le blanc amélioré (fond doux + cartes blanches nettes) — v515
**Quoi :** amélioration de la **couleur blanche** du mode clair (« noir clair »). Le blanc était **plat** (fond blanc pur + halos) : les **cartes blanches se fondaient** dans le fond. Désormais **fond gris très clair** (`#eef1f7`) → les **cartes blanches pures (`#fff`) ressortent nettement** avec un **bord propre `#e4e8f1`** + ombre douce ; **titres nets**, **champs** (bord `#dde3ec`, focus doux) et **tables** (séparateurs discrets, survol léger) soignés ; **hero clair** (au lieu d'un bandeau gris foncé) ; scrollbar claire. Valeurs neutres → restent propres après le grayscale (le logiciel reste 100% monochrome).

**Comment — `yada-addon-clair` (`<style id="yada-clair-white">`, 100% additif, scopé `body[data-theme="jour"]`, injecté en dernier ; precompta + build V1).** `sw.js` yada-v110, badge v515, `version.json` 515.

**Validé :** `node --check` (addon-clair OK) + accolades CSS (precompta 14819/14819) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (mode jour : fond `rgb(238,241,247)`, carte `rgb(255,255,255)` bord `rgb(228,232,241)`, filtre grayscale actif, 0 débordement, 0 pageerror, badge v515). Badge → **v515**.

---

## 🟢 Dernière mise à jour — MONOCHROME TOTAL : plus aucune couleur, seulement « noir sombre » et « noir clair » — v514
**Quoi :** à la demande (« je ne veux plus voir aucune couleur »), **tout le logiciel devient monochrome** — **aucune couleur** nulle part : accents cyan/bleu, KPI, logos, graphiques, sparklines, et même le **vert/rouge comptable** sont **neutralisés en niveaux de gris**, sur **toutes les pages** (connexion, tableau de bord, facturation, TVA, consultation, éditeur, modales…) et dans **les deux ambiances**. Seules deux ambiances subsistent, atteintes par le **bouton nuit/jour existant** : **« noir sombre »** (thème `noir`) et **« noir clair »** (thème `jour`). Le contraste (luminance) est préservé → lisibilité intacte.

**Comment — `yada-addon-mono` (`<style id="yada-mono">`, 100% additif, injecté en dernier ; precompta + build V1) :** `html{filter:grayscale(100%) !important}` (bulletproof — désature toute couleur peinte, sur tout le document et dans tous les thèmes, y compris les logos/graphiques/vert-rouge) + sélection en gris. Aucune logique / aucun sélecteur JS modifié ; le bouton nuit/jour reste fonctionnel. `sw.js` yada-v109, badge v514, `version.json` 514.

**Validé :** `node --check` (addon-mono OK) + accolades CSS (precompta 14803/14803 · V1 14759/14759) + filet d'équilibre (`node tests/equilibre-ecritures.mjs` : vente 1200=1200, achat 600=600 ✅) + Playwright (thèmes **noir** & **jour** : `getComputedStyle(html).filter='grayscale(1)'`, **0 débordement**, **0 pageerror**, badge v514 ; l'overlay de connexion fixe reste bien positionné sous le filtre) + captures (connexion en noir sombre & noir clair, 100% monochrome). Badge → **v514**.

---

## 🟢 MAJ précédente — REFONTE « Contraste » (Lot 2) : connexion, toasts, Consultation, éditeur, modales, onglets → cyan — v513
**Quoi :** extension de la DA « Contraste » (presque noir + cyan) à **toutes les surfaces restantes** : **écran de connexion** (panneau marque near-black + halo cyan, logo glow, boutons cyan / fantôme à bord cyan, champs à anneau cyan), **toasts & repères** (Enregistré/Synchro/version/pastille), **segmented control** (régime TVA) + **onglets de mois** (TVA + Charges & Paie) + theme-switch + **pastille « En cours »** → cyan, **Consultation `.sg-app`** (période/journal/onglet actifs, filet du titre, flèches d'exercice + « Éditions »), **éditeur `.ec-sage`** (bord fenêtre, filet titre, en-têtes, focus, bouton « solder », journal/lettre, totaux) et **modales génériques** (`#modal-c`). Le **vert/rouge comptable** est préservé.

**Comment — `yada-addon241` (`<style id="yada-contraste-2">`, 100% CSS additif, injecté après le Lot 1 ; scopé `html body[data-theme="noir"]` + `#sec-lock`, precompta + build V1).** `sw.js` yada-v108, badge v513, `version.json` 513.

**Validé :** `node --check` (precompta 231 / V1 230, 0 erreur) + `sw.js` OK + accolades CSS (2014/2014) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (connexion : CTA cyan `rgb(47,230,255)` ; Consultation : période active cyan ; **0 débordement** ; **0 pageerror**) + captures (connexion & consultation en Contraste). Badge → **v513**.

---

## 🟢 MAJ précédente — Télécharger YADA sur le PC (fichier autonome hors-ligne) + carte Paramétrage — v512
**Quoi :** on peut désormais **télécharger YADA sur son ordinateur** en un clic : un bouton **« ⬇ Télécharger le fichier YADA (hors-ligne) »** enregistre **`YADA.html`** (application autonome, single-file, avec police & logique embarquées) → il s'ouvre par **double-clic** et fonctionne **sans connexion**. Ajouté (1) dans le modal existant **« Télécharger l'application »** (bannière + `telechargerApp`), et (2) dans une nouvelle carte **Paramétrage « 💻 Télécharger YADA sur mon PC »** (Installer l'application **ou** Télécharger le fichier). L'installation **PWA** (icône dédiée, plein écran) reste disponible.

**Comment — `yada-addon-dlpc` (100% additif, precompta + build V1) :** `window.yadaDownloadFile()` = `fetch(location.href)` (repli `document.documentElement.outerHTML`) → `Blob` `text/html` → `<a download="YADA.html">`. Wrap de `telechargerApp` (ajoute le bouton fichier au modal) + wrap de `pageParametrage` (carte dédiée). `sw.js` yada-v107, badge v512, `version.json` 512.

**Validé :** `node --check` (precompta 230 / V1 229, 0 erreur) + `sw.js` OK + accolades CSS (2014/2014) + Playwright (`yadaDownloadFile()` → **événement download déclenché, fichier `YADA.html`** ; carte Paramétrage présente ; **0 pageerror**). Badge → **v512**.

---

## 🟢 MAJ précédente — 2FA : le code est TOUJOURS demandé (y compris appareils mémorisés) — v511
**Quoi :** le code 2FA est désormais **exigé à chaque ouverture** d'un compte 2FA-activé, **y compris sur les appareils de confiance** (connexion automatique « Rester connecté »), et pas seulement lors d'une connexion interactive. Toute ouverture (login ou auto-login au démarrage) sans code valide → **verrouillage**.

**Comment (`yada-addon-2fa`, extension) :** persistance du compte 2FA dans `localStorage 'yada-2fa-acct'` (à la connexion interactive **et** à l'enrôlement) ; **porte de démarrage** `tfaStartup()` (planifiée à 500 ms et 1600 ms après chargement) : si l'app est ouverte (`__secLocked===false`), non encore validée (`!__tfaPassed`) et que le compte mémorisé a la 2FA activée → affiche la modale de code ; échec/annulation → `secVerrouiller`. `sw.js` yada-v106, badge v511, `version.json` 511.

**Validé :** `node --check` (229/228, 0 erreur) + `sw.js` OK + Playwright (appareil **mémorisé** + 2FA activée → **porte de démarrage affichée** ; mauvais code → porte maintenue ; bon code → porte fermée ; 0 pageerror) + filet d'équilibre ✅. Badge → **v511**.

---

## 🟢 MAJ précédente — Authentification à deux facteurs (2FA) par QR code — TOTP hors-ligne, optionnelle — v510
**Quoi :** ajout d'une **authentification à deux facteurs (2FA)** après le mot de passe : **code à 6 chiffres** d'une application d'authentification (Google Authenticator / Authy), configuré via un **QR code**. **Optionnelle & activable par compte** dans **Paramétrage** (« 🔐 Authentification à deux facteurs (2FA) » → « Activer la 2FA (QR code) ») ; à l'enrôlement, un **QR** + une **clé manuelle** de secours + confirmation d'un code. Ensuite, à chaque **connexion interactive** d'un compte 2FA-activé, un **écran de vérification** demande le code ; échec/annulation → verrouillage. Les **appareils de confiance** (case « Rester connecté ») ne sont pas re-challengés (comportement voulu). **100% hors-ligne** : TOTP calculé localement (WebCrypto HMAC-SHA1) et **QR généré côté client** (encodeur maison — aucun secret envoyé à un service tiers).

**Comment — `yada-addon-2fa` (100% additif, precompta + build V1) :**
- **Cœur `YADA2FA`** : base32, **TOTP/HOTP RFC 6238** (HMAC-SHA1 via `crypto.subtle`, fenêtre ±1), et un **encodeur QR hors-ligne** (mode octet, EC niveau M, versions 1→6, RS GF(256), masques 0-7 + score de pénalité, sortie SVG). Validé en Node : **vecteurs RFC 6238** (94287082 / 07081804 / 287082) + **round-trip QR** (URI otpauth 96 car. → v6 → décodage = identique).
- **Stockage** `db.parametres.twofa[email] = {secret, enabled, ts}` (persisté par `save()`, comme `pwdClair`).
- **Porte de connexion** : wrap de `window.secEssayer` — après succès (détecté par `window.__secLocked===false`), si 2FA activée pour l'e-mail saisi → modale `#tfa-ov` de vérification ; OK → poursuite, Annuler/échec → `secVerrouiller`. `secVerrouiller` remet `__tfaPassed=false`.
- **Enrôlement** : carte greffée sur `pageParametrage` (`tfaEnroll`/`tfaDisable`), modale QR + clé + confirmation. `sw.js` yada-v105, badge v510, `version.json` 510.

**Validé :** `node --check` (precompta 229 / V1 228, 0 erreur) + `sw.js` OK + accolades CSS (2014/2014) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + tests Node (TOTP RFC 6238 + round-trip QR) + Playwright (enrôlement : QR SVG rendu + clé 32 car. ; code TOTP calculé **accepté** → 2FA **persistée** `db.parametres.twofa` ; carte Paramétrage « activée/Désactiver » ; hook `secEssayer` installé ; **0 pageerror**) + capture (modale d'activation avec vrai QR). Badge → **v510**.

---

## 🟢 MAJ précédente — NOUVELLE DA « Contraste audacieux » (Lot 1 · fondations) : presque noir + accent CYAN + police IBM Plex Sans — v509
**Quoi :** nouvelle direction artistique **validée par maquette** (« Contraste audacieux ») : **fond presque noir** (`#08080a`) + halos cyan discrets, **accent CYAN unique** (`#2fe6ff`, remplace le bleu vif), **cartes profondes** (dégradé + filet lumineux + ombre), **KPI/boutons/champs/liens en cyan**, **barre latérale** épurée (actif = liseré cyan lumineux), **hero** à halo cyan sans anneau bleu. **Nouvelle police : IBM Plex Sans** (choisie par l'utilisateur), **embarquée hors-ligne** (woff2 latin variable, data-URI). Le **vert/rouge comptable** (CA/Charges/crédit/débit) est **préservé**. Aucune logique/processus touché ; le bouton nuit/jour reste fonctionnel.

**Comment :**
- **`yada-contraste-font`** (`<style>`) : `@font-face` IBM Plex Sans (45 Ko woff2, ~61 Ko base64) + `html body,html body *{font-family:'IBM Plex Sans',… !important}` (surcharge la règle v502 `body,body *{font-family:'Inter' !important}` qui, faute d'Inter embarqué, retombait en system-ui) + `tabular-nums` sur les montants. Éditions (`.doc-page`/`.inv`/`.sg-*`/`.ec-sage`) : police d'impression conservée.
- **`yada-addon240`** (`<style id="yada-contraste-1">`, scopé `html body[data-theme="noir"]`, injecté en dernier) : tokens Contraste + remap `--blue/--accent → #2fe6ff` ; fond, cartes, KPI (tuiles cyan / vert CA / rouge Charges), boutons cyan, champs, tables, titres, **barre latérale** (fond `#070709→#0a0a0d`, actif liseré cyan), **hero**, parcours d'entrée, scrollbar. `sw.js` yada-v104, badge v509, `version.json` 509.

**Validé :** `node --check` (precompta 228 / V1 227, 0 erreur) + `sw.js` OK + accolades CSS (2014/2014) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright **réseau Google Fonts coupé** (`document.fonts.check('16px "IBM Plex Sans"')` = **true**, body & titres = IBM Plex Sans → offline OK) + accent `--ct-acc = #2fe6ff` + **0 débordement horizontal** + **0 pageerror** + capture (tableau de bord Contraste). Badge → **v509**. *(Lots suivants : écran de connexion, toasts, Consultation `.sg-app`, éditeur, data-viz du tableau de bord, réglage de la pastille de statut.)*

---

## 🟢 MAJ précédente — ANNULATION de la refonte du design : retour à la version principale (design v502) — v508
**Quoi :** à la demande, **toute la refonte du design est annulée** — l'application **revient au design de la version principale (v502)**. Les **cinq blocs de refonte** ajoutés en v503→v507 sont **retirés** : `yada-addon235` (coquille « Nextmove »), `yada-addon236` (barre latérale / connexion « Stream » / toasts + hero), `yada-font-inter` (police Inter embarquée), `yada-pc-focus` (masquage des bannières mobile sur PC), `yada-addon239` (harmonisation des accents indigo/violet). Le **thème d'origine** (bleu nuit + bleu vif `#1e90ff`, KPI à icônes filaires néon, hero à anneau bleu, police système) est **intégralement rétabli**. **Aucune fonctionnalité n'est perdue** : toutes les évolutions **fonctionnelles** (facturation v495→v501, bouton « 🧾 Facturation » de l'accueil v502, écritures, automatismes) sont **conservées** telles quelles.

**Comment :** `precompta.html` et le build `yada-v1.html` sont **restaurés à l'identique de l'état v502** (commit `257d7a5`, `git checkout 257d7a5 -- precompta.html yada-v1.html`) → suppression nette des 5 blocs de refonte (aucune autre différence : le diff v502↔v507 ne portait QUE sur ces blocs + le numéro de version). **Le numéro de version est AVANCÉ à v508** (et non redescendu à v502) pour ne pas déclencher le **verrou anti-retour de version** (addon133) sur les appareils ayant déjà vu v503→v507 : c'est donc une mise à jour **vers l'avant** qui rétablit le design d'origine. `sw.js` yada-v103, badge v508, `version.json` 508.

**Validé :** `node --check` (precompta **227** / V1 **226** scripts — retour au compte v502, 0 erreur) + `sw.js` OK + accolades CSS **2010/2010** (= v502) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (aucun `#yada-refonte-1` ni `#yada-font-inter` ; design d'origine rendu — hero à anneau bleu, KPI filaires, accents `#1e90ff` ; **0 débordement horizontal** ; **0 pageerror**) + capture (tableau de bord au design v502). Badge → **v508**.

---

## 🟠 Historique (design annulé) — REFONTE DA (Lot 6 · Harmonisation des accents) : bleu vif → indigo/violet dans tous les modules + Consultation — v507
**Quoi :** **refonte complète des accents** — le thème NUIT pilotait tout son accent par les variables `--blue/--accent = #1e90ff` (bleu vif), en décalage avec la DA « Nextmove » (indigo→violet + magenta). On **remappe ces variables vers l'indigo** et on **recolore les éléments actifs codés en dur** : liseré à gauche des **titres de carte**, **segmented control** (régime TVA), **onglets de mois** (TVA + Charges & Paie), **theme-switch**, **pastille de statut « En cours »**, survols de lignes, justificatifs TVA, liens — et la **Consultation (`.sg-app`)** : **période active**, **journal actif**, **onglet actif**, **filet du bandeau de titre**, **flèches d'exercice ‹ ›** et bouton **« 🖨 Éditions »**. Le **vert/rouge comptable** (CA / Charges / crédit / débit) est **préservé**. Résultat : TVA, Charges & Paie, Journal, Éditions, Analytique, Banque, Suivi des règlements, Tableau de bord, parcours d'entrée **et** Consultation partagent le même accent indigo/violet.

**Comment — `yada-addon239` (`<style id="yada-refonte-3">`, 100% CSS additif, injecté en dernier ; scopé `html body[data-theme="noir"]` — spécificité 0,1,2+ > `body[data-theme="noir"]` !important, precompta + build V1) :** remap `--blue/--accent/--line-strong` → `#5b6cff` ; `.card h2::before`, `.seg button.on`, `.cp-mtab.on`, `.theme-switch button.on`, `.dstat-chip.wip`, `.tva-just`, hovers de ligne, `.rg-link/.linkname` ; `.sg-peritem.on`, `.sg-jrnitem.on`, `.sg-tab.on`, `.sg-app .sg-title`, `.sg-exoarr` (+ `.sg-edlink`) → indigo/violet. Aucune logique / sélecteur JS modifié. `sw.js` yada-v102, badge v507, `version.json` 507.

**Validé :** `node --check` (precompta 230 / V1 229, 0 erreur) + `sw.js` OK + accolades CSS (2017/2017) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (TVA : `.seg button.on` & `.cp-mtab.on` = dégradé `rgb(91,108,255)` ; Consultation : `.sg-peritem.on` = dégradé indigo, `.sg-exoarr` bord `rgba(138,92,255,.7)` ; **0 débordement horizontal** ; **0 pageerror**) + captures (TVA & Consultation en indigo/violet, vert/rouge comptable intacts). Badge → **v507**.

---

## 🟢 MAJ précédente — Focus PC : bannières d'installation MOBILE masquées sur ordinateur (vue PC épurée) — v506
**Quoi :** l'expérience **ordinateur (PC)** est privilégiée. Les **bannières flottantes qui proposent d'installer l'application MOBILE** (« Téléchargez l'application YADA » `#yada-dl-banner` + « Installez aussi YADA sur votre mobile » `#mob-prop`) **ne s'affichent plus sur ordinateur** (elles **chevauchaient le contenu** en bas de page et n'ont pas leur place dans la vue PC). L'**installation reste disponible** (carte « Installer l'application » dans **Paramétrage**, + icône native du navigateur) ; sur **mobile**, la bannière d'ajout à l'écran d'accueil est **conservée**.

**Comment — `yada-pc-focus` (`<style>` additif, precompta + build V1) :** `@media(min-width:821px){#yada-dl-banner,#mob-prop{display:none !important}}`. 100% CSS, **desktop uniquement**, aucune logique / aucun sélecteur JS modifié. `sw.js` yada-v101, badge v506, `version.json` 506.

**Validé :** `node --check` (0 erreur) + `sw.js` OK + accolades CSS (2017/2017) + Playwright PC **1920×1080** (bannière `#yada-dl-banner` → `display:none`, `#mob-prop` absent ; **0 débordement horizontal** ; **0 pageerror**) + capture (tableau de bord PC épuré : hero indigo→noir, KPI, typographie Inter, sans bannière mobile). Badge → **v506**.

---

## 🟢 MAJ précédente — REFONTE DA (Lot 5 · Typographie) : nouvelle police **Inter** embarquée (hors-ligne) + hero harmonisé — v505
**Quoi :** **nouvelle direction typographique** (autorisée) : toute l'interface passe en **police Inter** — un grotesque moderne, net et géométrique, cohérent avec la DA « Nextmove/Stream » (titres resserrés, chiffres alignés). La police est **embarquée dans le fichier** (woff2 variable, sous-ensemble latin — accents FR, «», €, →, Σ) → **100% hors-ligne, aucune requête réseau** (l'app référençait `IBM Plex Sans`/`Inter` sans jamais les charger → repli system-ui ; désormais Inter s'affiche réellement). Les **éditions comptables** (`.doc-page`/`.inv`/`.sg-*`/`.lx-*`/`.rb-*`/`.ec-sage`) **gardent leur police d'impression** (elles déclarent la leur → non impactées). Finition : l'**anneau bleu vif du hero** (Tableau de bord / Espace Client) est remplacé par le **filet discret** de la refonte (dégradé indigo→noir).

**Comment :**
- **`yada-font-inter`** (`<style>` additif, precompta + build V1) : `@font-face{font-family:'Inter';font-weight:100 900;src:url(data:font/woff2;base64,…)}` (48 Ko woff2, ~64 Ko base64) ; `html body{font-family:'Inter','IBM Plex Sans',system-ui,…}` ; `font-variant-numeric:tabular-nums` sur les montants/KPI ; titres `letter-spacing:-.012em;text-wrap:balance` (hors éditions). Aucune logique / sélecteur JS modifié.
- **`yada-addon236`** (extension) : hero `#ec-hero`/`.cab-hero` → dégradé `#141a3a→#0c0d15` + `border:var(--rf-line)` (neutralise l'anneau bleu vif v… ; spécificité `html body[data-theme="noir"]` > règle de thème). `sw.js` yada-v100, badge v505, `version.json` 505.

**Validé :** `node --check` (precompta 229 / V1 228, 0 erreur) + `sw.js` OK + accolades CSS (2015/2015) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright **réseau Google Fonts coupé** (`document.fonts.check('16px Inter')` = **true** → Inter chargé depuis le data-URI, offline) + audit **27 pages** (0 débordement horizontal, 0 pageerror) + hero `border` = filet discret `rgba(255,255,255,.067)` (fin de l'anneau bleu). Capture @2x (tableau de bord en Inter : titres, KPI Σ/%/€, chiffres alignés). Badge → **v505**. *(Reste : repositionner les puces flottantes bas-gauche qui chevauchent le bas de page en mode module.)*

---

## 🟢 MAJ précédente — REFONTE DA (Lot 2-4) : barre latérale finie, écran de connexion « Stream », toasts & repères — v504
**Quoi :** suite de la **refonte visuelle** (design uniquement, aucune logique/processus touché ; le bouton nuit/jour reste fonctionnel). Trois lots enchaînés sur le thème **`noir`** : **Lot 2 — barre latérale** (fond dégradé bleu-nuit `#0a0d16→#070810`, baseline `.brand small` en petites capitales espacées, **sous-modules** à liseré **indigo→violet**, chevrons discrets, chip flottant « ← Retour au dossier » vitré + halo indigo au survol) ; **Lot 3 — écran de connexion « Stream »** recréé d'après la maquette : **panneau marque** (gauche) en dégradé **indigo→noir** + **halo magenta** bas-gauche + logo YADA glow, puces à flèches indigo ; **panneau formulaire** (droite) noir profond, **champs sombres à anneau indigo**, **boutons dégradé indigo→violet + halo** (Espace Cabinet / Suivant) et bouton fantôme à bord indigo (Espace Client), liens & version en accents indigo ; **Lot 4 — toasts & repères** : toast vitré (bord indigo/magenta, flou), indicateurs **Enregistré ✓** (pilule sombre), **Synchro** (dégradé indigo→violet), **version** (pilule discrète), pastille `.nav-badge-new` en dégradé indigo→violet.

**Comment — `yada-addon236` (100% CSS additif, injecté APRÈS le Lot 1 → prime ; scopé `html body[data-theme="noir"]` + `#sec-lock`, precompta + build V1) :** `<style id="yada-refonte-2">` — Lot 2 (`aside`/`.brand small`/`#nav .nav-sub`/`.nav-grp-h.has-active`/`.nav-sub-btn`/`.nav-chev`/`#ds-back-chip`), Lot 3 (`#sec-lock`/`.sec-hero`/`.sec-logo`/`.sec-tagline`/`.sec-points`/`.sec-body`/`input`/`.sec-cta`/`.sec-cta-2`/`.sec-ver`), Lot 4 (`.toast`/`#yada-save-ind`/`#yada-cloud-ind`/`#yada-ver`/`.nav-badge-new`). Aucun sélecteur JS ni layout modifié (recolorisation uniquement — flex/tailles de la disposition scindée du login intacts). `sw.js` yada-v99, badge v504, `version.json` 504.

**Validé :** `node --check` (precompta 229 / V1 228, 0 erreur) + `sw.js` OK + accolades CSS statiques (2010/2010) + filet d'équilibre (`node tests/equilibre-ecritures.mjs` : vente 1200=1200, achat 600=600 ✅) + Playwright (écran de connexion : hero indigo/magenta + CTA dégradé, **0 débordement horizontal** ; module : `aside` en dégradé refonte, toast présent, scrollWidth = clientWidth ; **0 pageerror**) + captures @2x (login « Stream » : choix d'espace + étape e-mail conformes à la maquette). Badge → **v504**. *(Lot suivant : finitions Facturation & Consultation + audit complet des débordements sur toutes les pages.)*

---

## 🟢 MAJ précédente — REFONTE DA (Lot 1 · coquille) : thème NUIT recréé « Nextmove » — noir bleu-nuit, accent indigo→violet, magenta sur l'actif — v503
**Quoi :** début de la **refonte visuelle complète** (design uniquement, aucune logique/processus touché ; le bouton nuit/jour reste fonctionnel). Le thème **`noir`** est recréé d'après la direction artistique de référence (maquette validée) : **fond noir bleu-nuit** (`#080910`) + halos discrets **indigo** (haut-droite) et **magenta** (haut-gauche), **cartes vitrées** (dégradé `#16171f→#101119`, bord `rgba(255,255,255,.065)`, rayon 18, ombre profonde), **KPI** à **tuiles d'icône teintées par nature** (vert CA / rouge Charges / indigo neutre), **boutons** en dégradé **indigo→violet** (`#5b6cff→#8a5cff`) + halo, **champs** sombres à anneau indigo, **tableaux** dans cartes (en-têtes discrets, survol léger), typographie claire, **barre latérale** épurée avec **élément actif = pilule + liseré magenta lumineux à droite**, scrollbar fine. Boutons d'accueil « Facturation »/« Liste Dossier »/Admin harmonisés.

**Comment — `yada-addon235` (100% CSS additif, injecté EN DERNIER → prime sur tous les addons de thème ; scopé `html body[data-theme="noir"]`, precompta + build V1) :** `<style id="yada-refonte-1">` — tokens DA, fond global (remplace le dégradé bleu v304/v308 + neutralise les halos `::before/::after` v601), `.card`/`.kpi` vitrés + neutralisation des sheens, `.kpi-ic` teintées (spécificité > addon v337), `.btn`/`.btn-pri`/`.btn-gold`/`.btn-ghost` (neutralise MAJUSCULES/sweep v477), `input/select/textarea`, `.card th/td`, `aside`/`#nav`/`.nav-btn.active` (magenta), surfaces du parcours d'entrée (`.dossier-card`/`.dsc-card`/`.ds-tile`/`.ds-row`). Aucun sélecteur JS modifié. `sw.js` yada-v98, badge v503, `version.json` 503. **Maquette de référence (validée)** : direction artistique recréée, navigable (Tableau de bord · Facturation · Consultation), contenu réel YADA.

**Validé :** `node --check` (precompta 228 / V1 227, 0 erreur) + accolades CSS (2010/2010) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (tableau de bord & accueil rendus dans la nouvelle DA, **0 débordement horizontal** — scrollWidth = clientWidth —, 0 pageerror). Badge → **v503**. *(Lots suivants : barre latérale complète, écran de connexion « Stream », toasts/alertes, finitions & audit débordements toutes pages.)*

---

## 🟢 MAJ précédente — Accès direct : bouton « 🧾 Facturation » sur l'accueil (juste après l'authentification) — v502
**Quoi :** sur l'écran **« Espace dossiers »** (la page affichée **juste après la connexion**), un **bouton « 🧾 Facturation »** (bleu/or, à gauche de « Liste Dossier ») ouvre **directement le module de facturation** du **dossier actif** (le dernier travaillé), sans passer par Liste → HUB → rubrique. Si aucun dossier n'est actif mais qu'il n'en existe **qu'un seul**, il est utilisé automatiquement ; s'il y en a plusieurs et aucun actif, un message invite à en choisir un et ouvre la **Liste des dossiers**.

**Comment — 2 éditions de l'addon du parcours d'entrée (precompta + build V1) :** nouvelle fonction `window.dsOuvrirFacturation()` (résout le dossier cible = `db.activeId` ou l'unique dossier ; pose `window.dsSel` puis réutilise `dsEntrer('facturation')` → `choisirDossier(id)` + `current='facturation'`) ; injection du bouton `#ds-facturation-btn` avant « Liste Dossier » dans le post-traitement de l'accueil (là où sont déjà greffés Déconnexion / ✎ Rapport). Le module `facturation` (id de `PAGES`) est inchangé. `sw.js` yada-v97, badge v502, `version.json` 502.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (accueil : bouton `#ds-facturation-btn` présent à côté de « Liste Dossier » ; clic → `current='facturation'`, `connecte=true`, page de facturation rendue pour le dossier actif ; 0 pageerror). Badge → **v502**.

---

## 🟢 MAJ précédente — Facturation (compta) : ventilation TVA MULTI-TAUX dans l'écriture de vente — v501
**Quoi :** à la **comptabilisation** d'une facture comportant **plusieurs taux de TVA** (ex. 20 % · 10 % · 5,5 %), l'écriture de vente **ventile désormais la TVA par taux** sur les **bons comptes 4457x** (collectée), au lieu d'une seule ligne à un **taux moyen** (bug B4). Chaque taux crée sa **ligne de TVA** + sa **ligne de produit** (HT net) ; le **compte client** (411) porte le TTC. Une facture **mono-taux** produit **exactement la même écriture qu'avant** (aucune régression). Le module TVA (qui agrège tous les comptes 4457x) reste juste.

**Comment — édition chirurgicale (precompta + build V1) :** paramètre **optionnel** `ventilation` sur `posterFacture` (tableau `[{taux, ht, tva}]`) → quand présent, `f.ht/tva/ttc` = sommes de la ventilation et `genEcriture` construit **une paire TVA + produit par taux** (helpers `tvaCompteVente`/`tvaCompteAchat` : 20 %→44571, 10 %→445712, 5,5 %→445713… ; 20 % conserve le compte par défaut → mono-taux inchangé). `genererEcritureDoc` calcule la ventilation depuis `d.lignes` (groupées par taux, net proportionnel remise/réduction, **ajustement d'arrondi** sur la dernière ligne pour que ΣHT=`d.ht` et ΣTVA=`d.tva`) et ne la passe **que si ≥ 2 taux** non nuls. `sw.js` yada-v96, badge v501, `version.json` 501.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (facture **1000 @20 % + 500 @10 %** → écriture **équilibrée 1750=1750** : 411 débit 1750, **445710000 crédit 200**, **445712000 crédit 50**, 706 crédit 1000 + 500 ; facture mono-taux **identique** à l'existant (3 lignes, 411/44571/706) ; module TVA collectée **450** captée ; 0 pageerror). Badge → **v501**.

---

## 🟢 MAJ précédente — Facturation : numéro définitif à la comptabilisation (suite FAC continue, sans trou) — v500
**Quoi :** le **numéro de facture définitif `FAC-####` n'est plus attribué à la création** mais **à la comptabilisation** (bouton « ⚙️ Générer l'écriture »). Une facture non comptabilisée (brouillon, devis transformé, facture « à générer », récurrence) reçoit un **numéro PROVISOIRE `BR-####`** ; **supprimer un brouillon ne consomme aucun numéro FAC** → la **suite FAC reste continue (aucun trou)**, conforme aux règles françaises de facturation. À la comptabilisation, le `BR-####` est **remplacé par le prochain `FAC-####`** (attribué dans l'ordre de comptabilisation) et l'écriture de vente est postée avec ce numéro définitif. Devis (`DEV`) et Avoirs (`AV`) conservent leur numérotation à la création.

**Comment — édition chirurgicale (precompta + build V1) :** helper `estNumProvisoire(n)` (`/^BR-/`) ; les sites de création de **facture** utilisent `nextNumUnique('BR')` — `nfCreer`, `emettre` (sauf comptabilisation immédiate `valider&&!skipGen` → `FAC`), `transformerDevis`, générateur de **récurrences** ; `genererEcritureDoc` attribue `d.numero=nextNumUnique('FAC')` **si** le numéro est provisoire, avant `posterFacture`, et adapte le message de confirmation. `sw.js` yada-v95, badge v500, `version.json` 500.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (`nfCreer` → **BR-0001** ; 3 brouillons, le 2ᵉ supprimé, puis comptabilisation du 1ᵉ et du 3ᵉ → **FAC-0001** et **FAC-0002** continus, écritures générées ; `estNumProvisoire` OK ; 0 pageerror). Badge → **v500**.

---

## 🟢 MAJ précédente — Facture (Création) : Débours (hors TVA) + Réduction + Remise + Acompte avec n° de facture d'origine — v499
**Quoi :** la fenêtre **« Nouvelle facture »** (`#nf-overlay`) gagne des champs **sélectionnables** (vide = inactif, n'apparaît pas sur la facture) : (1) **Débours** — frais avancés au nom du client, **refacturés au coût, HORS base TVA** (art. 267 II-2°), ajoutés au **total à payer** sans TVA ; (2) **Réduction (rabais / ristourne)** — % ou € **sur le HT** (après la remise) ; (3) **Remise** (déjà présente, sur le HT) ; (4) **Acompte déjà facturé** avec **N° de la facture d'acompte d'origine** (affiché « Acompte facturé n° FAC-xxxx : −montant »). La facture A4 affiche les lignes correspondantes ; **Total TTC** reste la partie **taxée** (HT net + TVA), les débours apparaissant en **« Total à payer »**.

**Comment — édition chirurgicale (precompta + build V1) :** `nfState` (+ `reductionType/reductionVal/debours/acompteFactureNum`), `nfSync` (lecture `nf-redtype/nf-redval/nf-debours/nf-acompte-num`), `nfTotaux` (remise → réduction sur HT → TVA proportionnelle → **débours hors TVA** → net à payer ; helper `nfReductionLabel`), `nfTempDoc`/`nfCreer` (persistance), `nfFormHTML` (champs), et `docHTML` (bloc `.inv-tot` : réduction, débours + « Total à payer », acompte + n°). **Rétrocompatible** : une facture sans ces champs s'affiche à l'identique. Aucune écriture modifiée à ce stade (ventilation multi-taux = lot suivant). `sw.js` yada-v94, badge v499, `version.json` 499.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + accolades CSS (2010/2010) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (1000 HT @20 % · remise 10 % · réduction 5 % · débours 50 · acompte 200 → HT net **855**, TVA **171**, TTC taxé **1 026**, total à payer **1 076**, net à payer **876** ; PDF : lignes Réduction/Débours/« Total à payer »/« Acompte facturé n° FAC-0007 » présentes ; facture ancienne rendue à l'identique ; 0 pageerror). Badge → **v499**.

---

## 🟢 MAJ précédente — Facture (PDF) : logo image + couleur d'en-tête paramétrables — v498
**Quoi :** dans **Paramètres de facturation**, deux réglages : (1) **Logo de la facture** — dépôt d'une **image** (PNG/JPG…, ≤ ~1,5 Mo) qui remplace le nom de la société en haut à droite de la **facture A4** (aperçu + PDF), avec aperçu + bouton « Retirer » ; (2) **Couleur d'en-tête** — un sélecteur de couleur qui teinte le **titre** (Facture / Devis / Avoir) de la facture. Le logo est enregistré **immédiatement** (persistant, dataURL) ; la couleur s'applique en cliquant **« Enregistrer les paramètres »**.

**Comment — extension de l'addon `factParamCard`/`factParamSave` (precompta + build V1) + édition de `docHTML` :** nouvelle section « Logo & couleur d'en-tête » (input `type=file` → `factParamLogo()` FileReader→dataURL dans `db.societe.logo` ; `factParamLogoDel()` ; input `type=color` `#fp-color` → `s.factureCouleur`). Dans `docHTML`, la zone `.inv-logo` affiche `<img src=logo>` si présent (sinon la raison sociale) et `.inv-h1` reçoit `style="color:<couleur>"`. Aucune logique comptable modifiée. `sw.js` yada-v93, badge v498, `version.json` 498.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + accolades CSS (2010/2010) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (société avec logo dataURL + couleur `#c81e1e` : facture → `<img>` du logo présent, titre `.inv-h1` teinté ; contrôles `#fp-color`/`#fp-logo-file` rendus ; 0 pageerror). Badge → **v498**.

---

## 🟢 MAJ précédente — Facture (PDF) : mentions légales FR complètes + exonérations / autoliquidation conditionnelles — v497
**Quoi :** la **facture A4** (aperçu + PDF) affiche désormais un **pied de mentions légales complet** — **Dénomination, Forme, Capital social, RCS + ville, SIRET, Code APE, N° TVA intracommunautaire** — assemblé automatiquement depuis les champs **Informations société** (`is-*`). Une **mention conditionnelle d'exonération / autoliquidation de TVA** s'ajoute au bloc conditions : **« TVA non applicable, art. 293 B du CGI »** (régime **franchise** ou champ `exonerationTVA:'293b'`), **autoliquidation art. 283-2** (`'autoliq'`), ou **exonération intracommunautaire (art. 262 ter I / 283-2)** avec le **n° TVA du preneur** (facture à TVA nulle pour un client disposant d'un n° TVA intracom, ou `'intracom'`). Les pénalités de retard (3× taux légal) + **indemnité forfaitaire 40 €** étaient déjà présentes.

**Comment — édition chirurgicale de `docHTML` (precompta + build V1) + 2 helpers :** `mentionsSocieteFooter(s)` (assemble le pied légal, n'affiche que les champs renseignés, « € » ajouté si capital numérique) remplace l'ancienne ligne `raison, forme — SIREN` ; `mentionsExoTVA(s,d,c)` (mention conditionnelle) insérée dans `.inv-cond` avant les pénalités. Aucune logique comptable modifiée (affichage uniquement). `sw.js` yada-v92, badge v497, `version.json` 497.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (facture d'une SARL au capital de 10 000 € : pied **RCS AMIENS 812345678 · SIRET · APE 4332A · N° TVA FR… · capital 10 000 €** ; régime franchise → **« 293 B du CGI »** affiché ; 0 pageerror). Badge → **v497**.

---

## 🟢 MAJ précédente — Facturation (Création) : correction du champ « Conditions de paiement » en double (id `nf-cond` dupliqué) — v496
**Quoi :** dans la **fenêtre « Nouvelle facture »** (`#nf-overlay`), le champ **« Conditions de paiement » apparaissait DEUX FOIS** : une **liste déroulante** (en haut, sous la date — celle qui pilote l'**échéance automatique** via `nfEcheanceAuto`) **et** un **champ texte redondant** (plus bas, à côté de « Moyen de paiement »). Les deux portaient le **même `id="nf-cond"`** → **id HTML dupliqué** (invalide) et champ inutile prêtant à confusion. Le **champ texte redondant est retiré** ; seule la **liste déroulante** (avec calcul d'échéance) reste. « Moyen de paiement » devient un champ pleine largeur à sa place.

**Comment — édition chirurgicale (2 définitions de `nfFormHTML`, precompta + build V1) :** le bloc `.row g2` « Moyen de paiement + `<input id="nf-cond">` » est remplacé par le seul champ « Moyen de paiement » (`<select id="nf-moyen">`). Le `<select id="nf-cond">` d'origine (options `faCondOptions`, `onchange="nfEcheanceAuto()"`) est conservé ; `nfSync`/`nfUpdate` lisent toujours `nf-cond` (désormais unique). Aucune logique comptable modifiée. `sw.js` yada-v91, badge v496, `version.json` 496.

**Validé :** `node --check` (precompta 227 / V1 226, 0 erreur) + accolades CSS (2010/2010) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (fenêtre facture : **1 seul `#nf-cond`**, « Moyen de paiement » présent, overlay ouvert, 0 pageerror). Badge → **v496**.

---

## 🟢 MAJ précédente — Facturation : liste des factures avec recherche, filtres (statut · année), tri par colonne et export CSV — v495
**Quoi :** dans le **module Facturation** (Espace Cabinet), la **liste des factures** (« Factures ») gagne une **barre d'outils** : (1) **recherche** en direct par **numéro ou client** (insensible aux accents/casse) ; (2) **filtres** par **statut** (Émise / Brouillon / Payé / Partiel / En retard / Devis / Avoir / Transformé) et par **année** ; (3) **tri par colonne** au **clic** sur l'en-tête (Numéro, Client, Date, Échéance, Statut, HT, TVA, TTC, Date d'envoi — flèche ▲/▼) ; (4) **export CSV** du résultat filtré (toutes pages, séparateur `;`, décimales virgule, BOM UTF-8 pour Excel) ; (5) bouton **↺ Réinitialiser** quand un filtre est actif. La **pagination (25/page)** et les actions par ligne (Voir / ⚙️ Générer / → Facture) sont conservées.

**Comment — `yada-addon234` (100% additif, override de `factureListe()`) :** la barre d'outils (`#fa-search` + 2 `<select>` + boutons) reste **hors** du conteneur repeint `#fa-liste-inner` → le champ de recherche **garde le focus** en frappe (repeint ciblé via `faListeRepaint()`, pas de `render()` global). État sur `window` (`faQuery`/`faStatut`/`faAnnee`/`faSortKey`/`faSortDir`, réutilise `faListePage`). `faListeDocs()` filtre+trie (réutilisé par l'affichage ET l'export) ; `faListeInnerHTML()` rend tableau + pagination ; `faListeExportCSV()` construit le CSV en autonome (BOM + `;` + `""` d'échappement). Réutilise `docStatutFac`/`docTauxTVA`/`voirDoc`/`genererEcritureDoc`/`transformerDevis`/`faListeGo`. La chaîne de wrappers de `pageFacturation` (e-facturation, dépôts cabinet, fiches, catalogue) reste intacte (l'override porte sur `factureListe`, appelée en interne). `sw.js` yada-v90, badge v495, `version.json` 495.

**Validé :** `node --check` (227 scripts, 0 erreur) + accolades CSS statiques (2010/2010) + filet d'équilibre (`node tests/equilibre-ecritures.mjs` : vente 1200=1200, achat 600=600 ✅) + Playwright (liste rendue : `#fa-search` + 2 filtres + Export CSV + 9 en-têtes triables + `#fa-liste-inner` 3 lignes ; recherche « ALPHA » → 2 lignes, **focus conservé** ; tri TTC ascendant → 550 en 1er ; filtre statut « Devis » → 1 ligne ; 0 pageerror). Badge → **v495**.

---

## 🟢 MAJ précédente — Facturation (Cabinet) : colonne TAUX TVA dans la liste des factures + V1 rebâtie — v494
**Quoi :** dans le **module Facturation** de l'**Espace Cabinet** (et donc dans la **Version 1** qui le conserve), la **liste des factures** (« Factures ») affiche désormais, en plus du **numéro**, du **client** et des montants (HT / TVA / TTC), une nouvelle colonne **« TAUX TVA »** montrant le(s) **taux de TVA** utilisé(s) sur la facture (ex. « 20 % », ou « 20 % · 10 % » si plusieurs taux). Répond à la demande : générer des factures + liste des factures + numéros + clients + **leur taux de TVA**. La génération de factures (bouton « Nouveau » → fenêtre A4) et le suivi existaient déjà.

**Comment — 1 helper + 2 éditions chirurgicales de `factureListe()` :** `docTauxTVA(d)` = taux distincts des `d.lignes[].taux` (repli sur `|TVA|/|HT|·100` si aucune ligne typée), triés décroissants, format « NN % » joint par « · ». Colonne **`<th>TAUX TVA</th>`** ajoutée après CLIENT ; cellule **`<td>${docTauxTVA(d)}</td>`** ; `colspan` de la ligne vide 10 → 11. Les factures stockent bien le taux par ligne (formulaire `emettre`/faLignes ET fenêtre `nfCreer`/nfState). **V1 rebâtie** (`yada-v1.html`) depuis ce `precompta.html` (retrait addon103/133 + addon de restriction). `sw.js` yada-v89, badge v494, `version.json` 494.

**Validé :** `node --check` (226 scripts, 0 erreur) + `node --check sw.js` OK + filet d'équilibre + Playwright (liste des factures : en-tête « TAUX TVA » présent, factures démo affichent leur taux ; V1 rebâtie sans verrou de version ; 0 pageerror). Badge → **v494**.

---

## 🟢 MAJ précédente — Liste des dossiers : barre de recherche + boutons sans MAJUSCULES forcées — v493
**Quoi :** deux ajustements.
1. **Barre de recherche de dossiers** : sur l'écran **« Liste des dossiers »**, un champ **« Rechercher un dossier (nom, ville, SIREN…) »** est ajouté **juste au-dessus de la liste** → il **filtre les lignes en direct** (par nom, ville, SIREN, activité — insensible à la casse et aux accents). Message « Aucun dossier ne correspond » si rien ne matche.
2. **Boutons sans MAJUSCULES forcées** : tous les boutons (`.btn`) étaient rendus **EN MAJUSCULES** (addon223/v477, `text-transform:uppercase`). C'est retiré → **casse normale** (1ʳᵉ lettre en majuscule seulement, ex. « Créer un dossier », « Espace Admin », « Déconnexion »).

**Comment — `yada-addon233` (100% additif) :** 1 édition de `ecranListe` (colonne droite enveloppée dans `.ds-list-col` avec `<input id="ds-search" oninput="dsFilterListe(...)">` + `#ds-search-empty`) ; `window.dsFilterListe(q)` masque les `.ds-row` non correspondantes (`normalize('NFD')`, re-déclenche le `scroll` pour repeindre l'effet « roue » d'addon192). `<style id="ds-search-btncase-mod">` : `.ds-search`/`.ds-list-col` + **`html body[data-theme] .btn{text-transform:none !important;letter-spacing:.01em !important}`** (injecté après addon223 → prime). `sw.js` yada-v85, badge v493, `version.json` 493.

**Validé :** `node --check` (226 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (achat 600=600 ✅) + Playwright (`.btn` `text-transform:none` ; `dsFilterListe('bruce')` → seule la ligne « BRUCE GOURMET » visible, `dsFilterListe('zzz')` → message « aucun résultat », reset → toutes visibles ; 0 pageerror). Badge → **v493**.

---

## 🟢 MAJ précédente — Barre latérale « Aurora Glass » (Spatial UI + Liquid Glass) — v492
**Quoi :** la **barre latérale de l'Espace Cabinet** adopte le style **Aurora Glass** (choix n°6) : panneau en **verre dépoli translucide** (bleu nuit + outremer + transparence, `backdrop-filter:blur`) avec un **halo bleu MOUVANT** (aurora) qui glisse lentement derrière la navigation, et un **item actif en glass Crystal** (fond translucide `rgba(30,144,255,.22)` + anneau + halo, au lieu du contour néon). Les **icônes filaires Néon** (v484) sont conservées.

**Comment — `yada-addon232` (100% additif, injecté APRÈS le Néon → prime à spécificité égale) :** `<style id="aurora-nav-mod">` — `html body[data-theme] aside{background:linear-gradient(180deg,rgba(16,36,88,.55)…) !important;backdrop-filter:blur(20px) saturate(1.35) !important;overflow:hidden;position:relative}` (prime sur le `#070d18` d'addon226 et le dégradé opaque d'addon160) ; halo `#nav-aurora{position:absolute;radial-gradient(#1e90ff);filter:blur(46px);animation:navAur 13s}` (respecte `prefers-reduced-motion`) ; contenu (`.brand`/`#nav`/`.side-foot`) en `z-index:1` au-dessus du halo ; survol = reflet de verre, actif = glass Crystal + anneau + halo. Un `ensureAurora()` (greffé sur `render` + intervalle 900 ms, idempotent) insère le halo comme 1ᵉʳ enfant de `aside`. `sw.js` yada-v84, badge v492, `version.json` 492.

**Validé :** `node --check` (225 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (achat 600=600 ✅) + Playwright (thème nuit : `#aurora-nav-mod` injecté, `#nav-aurora` présent + animation `navAur`, `aside` `position:relative` + fond dégradé verre + `backdrop-filter:blur(20px) saturate(1.35)` ; 0 pageerror). Badge → **v492**.

---

## 🟢 MAJ précédente — Consultation des comptes : aucun trait sur les cases VIDES (traits seulement sur les lignes remplies) — v491
**Quoi :** dans la **Consultation des comptes**, la grille affichait des **traits horizontaux sur toute la zone**, y compris là où il n'y a **aucune écriture** (en thème nuit, de fins traits bleus). Ces traits venaient d'un **fond « papier réglé »** (`repeating-linear-gradient`) appliqué au conteneur de grille, indépendant des données. Il est **retiré** → **plus aucun trait sur les cases vides** ; seules les **lignes réellement remplies** gardent leurs **bordures de cellule** (`td` border-bottom).

**Comment :** `yada-addon231` (100% CSS additif, `<style id="sg-no-ruled-mod">` injecté en dernier) : `html body[data-theme] .sg-grid,.sgj-grid{background-image:none !important}` (+ variante sans thème) — la spécificité `html body[data-theme]` (0,2,2) prime sur les règles de fond réglé par thème (noir/liquid, 0,2,1) qui posaient `repeating-linear-gradient(... rgba(30,144,255,.18/.12) ...)`. Les bordures `td` des lignes de données (`.sg-tbl`/`.sgj`) sont conservées. Aucune logique modifiée. `sw.js` yada-v83, badge v491, `version.json` 491.

**Validé :** `node --check` (224 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (achat 600=600 ✅) + Playwright (thème nuit : `.sg-grid` et `.sgj-grid` → `background-image:none` ; style `sg-no-ruled-mod` injecté ; 0 pageerror). Badge → **v491**.

---

## 🟢 MAJ précédente — Facture client : aperçu paginé en feuilles A4 STRICTES (cadre respecté, 2ᵉ page si besoin) — v490
**Quoi :** à la génération/aperçu d'une **facture client** (fenêtre « Nouvelle facture » `#nf-overlay` + « Voir » `#modal-c`), la facture est désormais **concentrée sur une page A4 stricte (210 × 297 mm)** ; si le contenu **déborde**, une **2ᵉ (puis 3ᵉ…) page A4** est ajoutée automatiquement. Le **cadre A4 n'est plus déformé** (avant : une seule page qui s'étirait en hauteur quand il y avait beaucoup de lignes). Les **lignes du tableau sont réparties** sur les pages, l'**en-tête de colonnes (Description · Qté · PU · TVA · Total HT) est répété** sur chaque page, et les **totaux + RIB + mentions** restent sur la **dernière page**.

**Comment :** `yada-addon230` (100% additif) — `<style id="inv-a4-paginate-mod">` fixe l'aperçu écran à `.inv .inv-page{height:297mm;overflow:hidden}` (cadre A4 exact, jamais déformé) ; `window.invPaginate(inv)` découpe le `.inv-page` source en **feuilles A4 successives** (`.inv-pages`) — mesure de débordement (`scrollHeight > clientHeight`), split du `<tbody>` ligne à ligne avec `thead` cloné, blocs d'en-tête/totaux repositionnés. Un **MutationObserver** (garde anti-boucle `busy`/rAF) pagine tout aperçu **non encore paginé** (`#nf-prev-inner` / `#modal-c`) à chaque mise à jour — les appels internes `nfUpdate→nfApercu` ne passant pas par `window`. **Desktop uniquement** (mobile inchangé). Impression : la pagination native `@page A4` (addon160) reste en place. `sw.js` yada-v82, badge v490, `version.json` 490.

**Validé :** `node --check` (223 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (facture **2 lignes → 1 feuille** 794×1123 px = A4 ; **40 lignes → 3 feuilles**, toutes 794×1123 px ; `thead` répété par page ; totaux + RIB sur la dernière page ; 0 pageerror). Badge → **v490**.

---

## 🟢 MAJ précédente — Facturation (fenêtre « Nouvelle facture » / module Client) : rien ne bouge à la saisie d'une désignation + montant TOTAL HT dans la carte + « unité » sur la même ligne — v489
**Quoi :** correction d'un **bug d'affichage** de la saisie de facture (module **Client**, qui ouvre la fenêtre « Nouvelle facture » `#nf-overlay`, v323).
1. **La saisie d'une désignation longue ne déplace plus rien** : une désignation **sans espaces** (mot très long) faisait **grandir la colonne Description** de l'aperçu A4 (`.inv-t`) → toute la table/l'aperçu se décalait. Désormais la désignation se **coupe DANS sa colonne** (`overflow-wrap:anywhere`), la table garde une **largeur fixe**, et les **items de la ligne de saisie** (`.nf-li-top`/`.nfl-grid`) sont verrouillés (`min-width:0`) → **plus aucun mouvement**.
2. **Montant TOTAL HT dans la carte** : sur les cartes de ligne (`.nf-li`), le montant **TOTAL HT** (ex. 8 000,00 €) **débordait à droite de la carte**. Les colonnes de la grille (`.nfl-head`/`.nfl-grid`) sont **redimensionnées** (`40px 60px 64px 46px 28px minmax(50px,1fr)`) pour laisser la place au total ; `.nf-li` reçoit `overflow:hidden` (aucun débordement résiduel).
3. **« unité » sur la même ligne que la quantité** : dans l'aperçu A4, la cellule **Qté** (`<td class="q">`) passe en `white-space:nowrap` → le nombre et son unité (« 1 unité ») restent **toujours sur la même ligne**, jamais empilés.

**Comment :** `yada-addon229` (100% **CSS additif**, `<style id="nf-line-fixe-mod">` injecté en dernier) : règles `#nf-overlay .nf-li-top/.nfl-grid{min-width:0}`, `.inv-t th,td{overflow-wrap:anywhere}`, `.inv-t td.q{white-space:nowrap}`, resize `.nfl-grid` + `.nf-li{overflow:hidden}`. 1 édition chirurgicale de `docHTML` (cellule Qté → `class="q"`). Aucune logique comptable modifiée. `sw.js` yada-v81, badge v489, `version.json` 489.

**Validé :** `node --check` (222 scripts, 0 erreur) + `sw.js` OK + filet d'équilibre (vente 1200=1200, achat 600=600 ✅) + Playwright (fenêtre facture, désignation longue 95×« r » : **totSpill −13px** = montant DANS la carte, `lineSpill 0`, aperçu A4 `tableSpill 0`, cellule Description `overflow-wrap:anywhere`, cellule Qté `white-space:nowrap` = « 1 unité » sur une ligne ; 0 pageerror). Badge → **v489**.

---

## 🟢 MAJ précédente — Consultation « Comptes Généraux » : comptes de tiers (Fournisseurs/Clients) retirés + titres de classe supprimés (liste à plat) — v488
**Quoi :** deux ajustements de l'onglet **« Comptes Généraux »** de la Consultation des comptes.
1. **Comptes de TIERS retirés** : les comptes **Fournisseurs (401…)** et **Clients (411…)** individuels **n'apparaissent plus** dans « Comptes Généraux » — ils figurent déjà dans les onglets **Fournisseurs divers** et **Clients divers**. Le **compte collectif** (401000000 / 411000000) et les autres comptes de classe 4 (TVA 445…, personnel 42…, 408…) **restent** affichés.
2. **Titres de classe supprimés** : la liste ne montre plus les **en-têtes de classe** (« 1. Comptes de capitaux », « 4. Comptes de tiers »…) ni les **sous-totaux « Total X »** → **liste à plat** (Compte · Libellé · Solde), triée par numéro de compte.

**Comment (2 éditions chirurgicales de `pageCompta`, branche `sgTab==='generaux'`) :** (1) filtre `list=list.filter(a=>!_tiersC9.has(c9(a.code9)))` où `_tiersC9` = ensemble des `c9(sageCode(t))`/`c9(t.compteAux)` des tiers fournisseurs/clients ; (2) remplacement de la boucle `byClass` (en-tête `${cl}. …` + `Total ${cl}`) par un simple `list.forEach` émettant les lignes de compte. Aucune autre vue impactée (`sgGeneraux`, export, onglets Fournisseur/Client, résultat inchangés). `sw.js` yada-v80, badge v488, `version.json` 488.

**Validé :** `node --check` (221 scripts, 0 erreur) + Playwright couche données (`sgGeneraux` brut **contient** 401ALRC00/411HABI00 → après filtre **exclus** ; onglets `sgComptes('fourn'/'clients')` **les conservent** ; collectif/TVA non filtrés) + `.sg-app` rendu (navTab) + filet d'équilibre (achat 600=600 ✅). Badge → **v488**.

---

## 🟢 MAJ précédente — Consultation : menu clic droit allégé + éditeur (icônes non-cliquables retirées, lignes d'écriture teintées) + grand-livre plein écran verrouillé — v487
**Quoi :** quatre finitions de la Consultation des comptes.
1. **Menu clic droit du grand-livre (`#cl-ctx`) allégé** : au lieu d'un bloc plein à bord épais, un menu **translucide** (fond `rgba(13,26,45,.86)` + flou), **bord fin**, **bouton léger** avec **petite icône crayon** (SVG) → « Modifier l'écriture ».
2. **Éditeur d'écritures (`.ec-sage`) — icônes non-cliquables retirées** : dans la barre de titre, les glyphes décoratifs **`─` (réduire)** et **`▢` (agrandir)**, sans action, sont **supprimés** ; seule la **croix ✕** (fonctionnelle, `ecFermer()`) reste.
3. **Lignes d'écriture teintées** : dans l'éditeur, la **ligne du compte consulté** (`.ec-r.ec-mine`) reçoit une **teinte bleue** (`rgba(30,144,255,.10)`), la contrepartie (`.ec-other`) une teinte très discrète, + survol accentué → meilleure lisibilité.
4. **Grand-livre : plein écran VERROUILLÉ** : après avoir **lettré** puis **passé à un autre compte** (▲▼), la page ne **rétrécit plus**. Le gestionnaire de fenêtres (addon89) réappliquait une géométrie flottante réduite ; `#cl-overlay .cl-neon` est désormais forcé en **plein écran** (`position/width/height/left/top` en `!important`, poignée de redimensionnement masquée) → prime sur les styles inline du WM.

**Comment :** `clMenu` (HTML du menu : `.cl-mi` + SVG crayon + « Modifier l'écriture ») ; `.ec-titlebar .ec-winbtn` (ligne 9230) → retrait de `<i>─</i><i>▢</i>` ; `yada-addon227` (`cl-neon-mod`) += teinte `.ec-r.ec-mine/.ec-other/:hover`, menu `#cl-ctx` allégé, et **verrou plein écran** `#cl-overlay .cl-neon{…!important}` + `.wm-resize` masquée. `sw.js` yada-v79, badge v487, `version.json` 487.

**Validé :** `node --check` (221 scripts, 0 erreur) + Playwright (éditeur : `ec-winbtn` = 1 seule `<i class="x">✕`, plus de `─ ▢` ; ligne `.ec-mine` fond `rgba(30,144,255,.1)` ; menu clic droit : `.cl-mi` + SVG, fond translucide, « Modifier l'écriture » ; **plein écran verrouillé** : après `wmToggle('cl')` + `clRender` + `clNav`, `.cl-neon` reste **1300×800** (= viewport) ; 0 pageerror) + filet d'équilibre (achat 600=600 ✅). Badge → **v487**.

---

## 🟢 MAJ précédente — Consultation des comptes : refonte NÉON (grand-livre + éditeur) + barre latérale (« Consultation » + défilement des titres longs) — v486
**Quoi :** deux volets.
1. **Grand-livre du tiers (lecture seule, `#cl-overlay`) refondu en NÉON** avec **nouvelles fonctions** : barre de titre (compte + solde en évidence), barre d'outils groupée (navigation ▲▼ entre tiers · « Saisir une opération » · **recherche instantanée** · **filtres Tous / Non lettrés / Lettrés** · **Export CSV**), barre de lettrage avec **contrôle en direct** (bouton actif seulement si Débit = Crédit), tableau à **en-tête collant + tri par colonne** (clic sur l'en-tête), journal en pastille, lettres en badge, solde progressif (conservé même en tri/filtre), **totaux ancrés en bas**. L'**éditeur d'écritures (`.ec-sage`)** reçoit une **coherence Néon** (fond bleu nuit, en-têtes/accents Crystal). Fonctions conservées : lettrage (`clLettrerSel`/`clDelettrerSel`), navigation `clNav`, clic droit → journal (`clMenu`), saisie.
2. **Barre latérale** : le module **« Analyse — centre de contrôle » devient « Consultation »** (libellé raccourci) ; les **titres trop longs défilent au survol** pour révéler l'intégralité (marquee).

**Comment :** `clRender` réécrit en place (Néon + `window.clView` {q,f,sort,dir} + `clSetQ`/`clSetFilter`/`clSort`/`clExportCSV`, solde sécurisé `+l.debit||0`) ; `yada-addon227` (`<style id="cl-neon-mod">` : `#cl-overlay .cl-neon` complet + coherence `#ec-overlay .ec-sage`) ; `LBL.compta` (addon164) → « Consultation » ; `yada-addon228` (`markMarquee()` enveloppe chaque `.nl` dans `.nl-in`, marque `.nl-ov` si dépassement > 12px, défilement au survol via `--sc`/`--dur` ; wrap `buildNav`/`render`). `sw.js` yada-v78, badge v486, `version.json` 486.

**Validé :** `node --check` (221 scripts, 0 erreur) + Playwright (grand-livre : rendu `.cl-neon`, recherche → filtre les lignes, filtre « Non lettrés », **tri par colonne** actif, sélection/lettrage OK, solde **non-NaN** (0,00 S), export/tri exposés, 0 pageerror ; barre latérale : libellé **« Consultation »** présent, plus de « centre de contrôle », 23 libellés enveloppés `.nl-in`, marquee sur titres réellement longs, seuil 12px évitant les faux positifs) + filet d'équilibre (achat 600=600 ✅). Badge → **v486**.

---

## 🟢 MAJ précédente — Admin (Collaborateurs & accès) : carte « Utilisateurs du cabinet » retirée + actions mot de passe / désactivation dans « Salariés — liste & informations » — v485
**Quoi :** dans l'**Espace Admin → Collaborateurs & accès**, la carte **« 🛡 ADMIN Utilisateurs du cabinet (salariés) »** (liste + recherche + boutons « Mot de passe »/« Désactiver » par salarié) est **supprimée**. Ses actions sont désormais **intégrées à la carte « Salariés — liste & informations »** : au survol d'un salarié, le **panneau de droite** (infos du compte) affiche en bas deux boutons — **« Modifier le mot de passe »** et **« Activer/Désactiver le compte »** (libellé selon l'état actif/inactif). La carte « Enregistrer un utilisateur » et le tableau des dossiers restent inchangés.

**Comment (2 éditions chirurgicales + CSS) :** `admCollabPanel` — `return collab+add+…` → `return add+…` (la carte `collab`/`#adm-sec-users` n'est plus rendue). `infoHTML` (addon219) — après « Dossiers en responsabilité », ajout d'un bloc `.usr-info-act` avec `<button onclick="admStaffResetPwd(id)">Modifier le mot de passe</button>` + `<button onclick="admStaffActif(id)">Activer/Désactiver le compte</button>` (handlers existants, inchangés). `<style id="usr-mod">` += `.usr-info-act` (flex, liseré supérieur bleu). `sw.js` yada-v77, badge v485, `version.json` 485.

**Validé :** `node --check` (219 scripts, 0 erreur) + Playwright (`admCollabPanel` : plus de « Utilisateurs du cabinet (salariés) », carte « Salariés — liste & informations » présente, « Enregistrer un utilisateur » conservé ; panneau d'infos : boutons « Modifier le mot de passe » + « Désactiver le compte » ; survol d'un compte inactif → bouton « Activer le compte » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v485**.

---

## 🟢 MAJ précédente — Barre latérale du Cabinet : design « NÉON » + nouvelles icônes filaires par module — v484
**Quoi :** la **barre latérale de l'Espace Cabinet** adopte un design **« Néon »** : fond bleu nuit profond (`#070d18`), entrées au repos en bleu-gris, **contour néon Crystal + halo** sur l'entrée active (et le groupe contenant la page active), **icône qui s'illumine au survol** (drop-shadow bleu). Chaque module reçoit une **nouvelle icône filaire adaptée** (SVG `stroke:currentColor`) : Tableau de bord = tuiles · Sociétés = immeubles · Espace Client = personne · **Comptabilité = calculatrice** · Journal = livre ouvert · Éditions = imprimante · Suivi des règlements = € · Analytique = graphique · Plan comptable = liste · Pilotage = cible · Salarié = fiche+€ · **Fournisseurs = colis** · **Clients = facture** · **Tiers = réseau** · Immobilisations = fronton à colonnes · Charges & Paie = fiche+€ · **TVA = pourcentage** · **Banque = établissement** · Import/Export FEC = flèches · Assistant IA = étincelle · Rapprochement = maillon · Coffre = coffre · Paramétrage = engrenage.

**Comment — `yada-addon226` (100% additif) :** jeu de symboles SVG `SYM{}` ; `keyFor(label)` mappe le libellé de chaque `.nav-btn` vers une icône (liste de règles ordonnées, insensible aux accents) ; **wrap de `buildNav` + de `render`** → `decorate()` remplace le glyphe de chaque `.ico` par le SVG correspondant (idempotent, `data-neon`, cabinet uniquement — la nav client/mobile n'est pas touchée). `<style id="neon-nav-mod">` injecté en dernier, scopé **`#nav`** (spécificité id → prime sur les règles de thème `body[data-theme="noir"] .nav-btn`) : entrées/hover/actif néon, sous-groupe à liseré Crystal, sections en bleu discret ; fond `aside` forcé `#070d18` via `html body[data-theme] aside` (spécificité supérieure aux dégradés de verre). `sw.js` yada-v76, badge v484, `version.json` 484.

**Validé :** `node --check` (219 scripts, 0 erreur) + Playwright (barre Cabinet : **23/23 entrées avec icône SVG** filaire, mapping correct par libellé ; `aside` fond `rgb(7,13,24)` ; entrée active = halo néon `0 0 22px rgba(30,144,255,.85)` ; 0 pageerror) + capture (barre néon : fond bleu nuit, icônes filaires par module, liseré Crystal des sous-modules) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v484**.

---

## 🟢 MAJ précédente — Module TIERS : colonne Actions → bouton unique « ⋮ » (menu Modifier / Supprimer) — v483
**Quoi :** dans le **module TIERS** (Fournisseurs · Clients — Sociétés · Clients — Particuliers), la colonne **Actions** n'affiche plus deux boutons **« ✎ Modifier »** + **« 🗑 »** : elle affiche un **unique bouton « ⋮ » (trois points)** qui **déroule un petit menu** avec **« Modifier »** (✎) et **« Supprimer »** (🗑, en rouge danger). Le libellé d'aide de la carte devient « ⋮ pour les actions (modifier / supprimer), ou cliquez sur un nom. ».

**Comment — `yada-addon225` (100% additif) :** wrap de `window.sectionTiers` → la cellule Actions (regex sur les 2 boutons) est remplacée par `<button class="btn btn-ghost btn-sm tiers-dots" onclick="tiersMenu(event,'<id>')">⋮</button>`. `window.tiersMenu(ev,id)` crée un **menu flottant** `#tiers-menu` (position `fixed`, recadré à l'écran sous le bouton, aligné à droite) avec 2 items → `tiersEditer(id)` / `tiersSupprimer(id)` (fonctions existantes, inchangées) ; **fermeture** au clic extérieur / Échap / défilement / re-clic. `<style id="tiers-menu-mod">` (bouton ⋮ compact + menu bleu nuit, item danger rouge). `sw.js` yada-v75, badge v483, `version.json` 483.

**Validé :** `node --check` (218 scripts, 0 erreur) + Playwright (`pageTiers()` : plus de « ✎ Modifier »/« 🗑 » — 1 bouton `tiers-dots` par tiers ; clic ⋮ → menu `position:fixed` à 2 items « Modifier »/« Supprimer » (danger) ; clic « Modifier » → fiche d'édition ouverte + menu refermé ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v483**.

---

## 🟢 MAJ précédente — Liste des dossiers : effet au survol des lignes (soulèvement + halo, avatar reflet, flèche qui glisse) — v482
**Quoi :** dans la **Liste des dossiers**, chaque **ligne** (`.ds-row`) reçoit un **effet au survol** : la ligne se **soulève** (`translateY(-2px)`) avec un **halo bleu** (ombre), l'**avatar s'agrandit** légèrement et un **reflet le balaie** (light-sweep), et la flèche **« Sélectionner → » glisse** vers la droite.

**Comment — `yada-addon224` (100% CSS additif, `<style id="ds-row-fx-mod">`) :** `.ds-row` transition ; `html body .ds-row:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(30,144,255,.28)}` ; `.ds-av{position:relative;overflow:hidden}` + `::after` reflet (skew, `left:-70%→130%`) ; `.ds-row:hover .ds-av{transform:scale(1.08);box-shadow halo}` ; `.ds-open` (flèche) `translateX(4px)` au survol. Sélecteur préfixé `html body` pour primer sur les surcharges de thème. `sw.js` yada-v74, badge v482, `version.json` 482.

**Validé :** `node --check` (217 scripts, 0 erreur) + Playwright (style `ds-row-fx-mod` présent ; `.ds-av` `overflow:hidden` (reflet) ; survol d'une ligne → soulèvement + halo visibles ; 0 pageerror) + capture (ligne survolée soulevée avec halo, avatar mis en avant) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v482**.

---

## 🟢 MAJ précédente — Espace Admin : nouveaux pictogrammes des modules + tuiles bleu Crystal dégradé + effet au survol — v481
**Quoi :** la liste des 5 modules de l'**Espace Admin** (hub) reçoit de **nouveaux pictogrammes** (icônes SVG filaires) et une **couleur bleu Crystal dégradé** avec un **effet au survol**. Icônes : **Collaborateurs & accès** = deux personnes · **Paie** = symbole **€** seul (taille réduite) · **Paramétrage** = **engrenage** (réglages) · **Documentation** = livre ouvert · **Pilotages** = **flèche montante**. Tuiles d'icône en **dégradé bleu Crystal** (`#5ab0ff → #1e90ff → #0a64d6`). **Effet au survol** : la tuile se soulève + halo bleu, l'icône s'agrandit légèrement et un **reflet balaie** l'icône (light-sweep).

**Comment — édition de `admHubHTML` (addon210) :** nouvelle fonction `admHubIcon(key)` (SVG `stroke:currentColor` par module ; `<span class="adm-euro">€</span>` pour Paie) ; la tuile utilise `admHubIcon(m[0])` au lieu du glyphe. CSS : `.adm-hub-ic` → `background:linear-gradient(135deg,#5ab0ff,#1e90ff 55%,#0a64d6)`, `position:relative;overflow:hidden`, `.adm-hub-ic svg{26px}`, `.adm-euro{font:800 18px}` ; `::after` reflet (skew + `left:-70%→130%`) ; `.adm-hub-tile:hover .adm-hub-ic{transform:scale(1.07);box-shadow halo}` + tuile `translateY(-2px)` + ombre bleue. `sw.js` yada-v73, badge v481, `version.json` 481.

**Validé :** `node --check` (216 scripts, 0 erreur) + Playwright (5 tuiles : 4 SVG + 1 € ; `.adm-hub-ic` fond = dégradé Crystal `#5ab0ff…` ; euro 18px ; 0 pageerror) + capture (Espace Admin : icônes personnes/€/engrenage/livre/flèche montante, tuiles bleu Crystal, effet de survol sur Pilotages) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v481**.

---

## 🟢 MAJ précédente — Accueil : effet de clic bord→centre AUSSI sur ESPACE ADMIN & LISTE DOSSIER (boutons bleus) — v480
**Quoi :** les deux boutons bleus **ESPACE ADMIN** et **LISTE DOSSIER** reçoivent enfin l'**effet de clic « couleur du bord vers le centre »** (comme les autres boutons). Auparavant invisible car ils étaient déjà remplis par l'ombre interne : ils sont désormais **bleus via le FOND** (dégradé), ce qui **libère l'ombre interne** pour l'animation ; au **clic**, la **couleur claire du bord (`#86c5ff`)** converge du **bord vers le centre** (ombre interne 0 → 240px), puis se rétracte au relâchement. Soulignement blanc animé au survol conservé (v479).

**Comment — `yada-addon223` (édition des règles ciblées) :** ces 2 boutons passent de `box-shadow:inset 0 0 0 240px #1e90ff` (remplissage permanent) à `background:linear-gradient(#1e90ff,#0a64d6) padding-box, …border-box` (bleu via le fond) + `box-shadow:inset 0 0 0 0 #86c5ff` (spread 0 au repos) ; règle `.yada-fill` dédiée → `inset 0 0 0 240px #86c5ff` (sweep bord→centre au clic, via l'écouteur `pointerdown` global). `sw.js` yada-v72, badge v480, `version.json` 480.

**Validé :** `node --check` (216 scripts, 0 erreur) + Playwright (repos : `box-shadow` inset spread **0** + fond dégradé bleu ; `pointerdown` → inset **240px** bleu clair (sweep bord→centre) ; `pointerup` → inset revenu à 0 ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v480**.

---

## 🟢 MAJ précédente — Accueil : soulignement blanc (ESPACE ADMIN & LISTE DOSSIER) animé au survol comme les autres boutons — v479
**Quoi :** sur les deux boutons **ESPACE ADMIN** et **LISTE DOSSIER** (bleus pleins, v478), le **soulignement blanc** n'est plus figé (affiché en permanence) : il **apparaît/grandit au survol** (puis se rétracte), **comme sur les autres boutons**. Les boutons restent bleus pleins ; seule la barre blanche s'anime désormais.

**Comment — `yada-addon223` (1 retrait) :** dans le `::after` ciblé de ces deux boutons, suppression du `transform:scaleX(1)!important` (affichage permanent) → il ne reste que `background:#fff` (ligne blanche). Le soulignement suit alors la règle générale (`.btn:hover::after{transform:scaleX(1)}`) : masqué au repos (`scaleX(0)`), révélé au survol. `sw.js` yada-v71, badge v479, `version.json` 479.

**Validé :** `node --check` (216 scripts, 0 erreur) + Playwright (au repos : `::after` `scaleX(0)` blanc, bouton toujours rempli bleu ; au survol : `::after` `scaleX(1)` blanc ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v479**.

---

## 🟢 MAJ précédente — Accueil : ESPACE ADMIN & LISTE DOSSIER en bleu plein + soulignement BLANC — v478
**Quoi :** sur la page d'accueil « Espace dossiers », les deux boutons **ESPACE ADMIN** et **LISTE DOSSIER** sont désormais **bleus (remplis)** avec un **soulignement blanc** permanent sous le libellé, pour les distinguer comme actions principales. Les autres boutons gardent le style contour bleu (v477).

**Comment — `yada-addon223` (ajout au `<style id="btn-unify-mod">`) :** règles ciblées `#adm-enter-btn`, `#adm-enter-inline` (Espace Admin) et `.btn[onclick="dsOuvrirListe()"]` (Liste Dossier) → `color:#fff` + `box-shadow:inset 0 0 0 240px #1e90ff` (remplissage bleu) ; leur `::after` (soulignement) forcé à `transform:scaleX(1)` + `background:#fff` (ligne blanche permanente). `sw.js` yada-v70, badge v478, `version.json` 478.

**Validé :** `node --check` (216 scripts, 0 erreur) + Playwright (les 2 boutons : `box-shadow` inset bleu (rempli), texte blanc, `::after` blanc affiché ; 0 pageerror) + capture (accueil : ESPACE ADMIN & LISTE DOSSIER bleus + ligne blanche, autres en contour) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v478**.

---

## 🟢 MAJ précédente — Tous les boutons unifiés : contour bleu + MAJUSCULES + remplissage bleu extérieur→intérieur au clic — v477
**Quoi :** **tous les boutons du logiciel** (`.btn`) adoptent un **style unique** : pilule sombre à **CONTOUR BLEU** (dégradé `#5ab0ff→#1e90ff`), **libellé en MAJUSCULES**, **soulignement bleu** au survol, et — au **clic** — un **remplissage bleu de l'EXTÉRIEUR vers l'INTÉRIEUR** (les bords se colorent d'abord, la couleur converge vers le centre) puis retour au relâchement. Modèle issu du mélange n°15 (contour dégradé) + n°18 (souligné), contour passé en bleu, sans icône, actif sans soulignement.

**Comment — `yada-addon223` (100% additif) :** `<style id="btn-unify-mod">` (injecté en dernier, sélecteur `html body[data-theme] .btn` pour primer sur les variantes de thème `.btn-pri`/`.btn-gold`) : `.btn` = `background:linear-gradient(#0c1f39,#0c1f39) padding-box, linear-gradient(120deg,#5ab0ff,#1e90ff) border-box`, `text-transform:uppercase`, `box-shadow:inset 0 0 0 0 #1e90ff` (transition .45s), `::after` soulignement bleu au survol ; classe **`.yada-fill`** = `box-shadow:inset 0 0 0 240px #1e90ff` (remplissage extérieur→intérieur). Écouteur **`pointerdown`** délégué au `document` → ajoute `.yada-fill` au press, la retire au relâchement (vaut pour tous les `.btn`, même ajoutés dynamiquement). **Non touchés** : boutons « danger » des confirmations (`.ya-btn.ya-danger`, restent rouges), navigation (`.nav-btn`), onglets, barres d'outils (autres classes) ; `display` jamais forcé (bouton masqué reste masqué). `sw.js` yada-v69, badge v477, `version.json` 477.

**Validé :** `node --check` (216 scripts, 0 erreur) + Playwright (`.btn` = `text-transform:uppercase` + contour/dégradé bleu + rayon 12px ; `pointerdown` → `.yada-fill` + ombre interne (remplissage), `pointerup` → retirée ; **bouton danger de confirmation reste rouge** et n'est pas un `.btn` ; 0 pageerror) + capture (page d'accueil : boutons pilule contour bleu, libellés en majuscules) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v477**.

---

## 🟢 MAJ précédente — Liste du personnel : tableau des salariés remonté (sous le texte, pied toujours en bas) — v476
**Quoi :** dans le document **« LISTE DU PERSONNEL »** (onglet Équipe), le **tableau des salariés est remonté** : au lieu d'être centré au milieu de la page, il est désormais **juste sous le texte d'attestation** (haut de page), le **pied « Fait à … » + signataire + cachet restant ancré en bas de page**.

**Comment :** `addon222` (`<style id="lp-doc-mod">`) — `.lp-mid{justify-content:center → flex-start;padding:26px 0 → 26px 0 0}` (le tableau s'aligne en haut de la zone médiane ; `.lp-foot{margin-top:auto}` garde le pied en bas). `sw.js` yada-v68, badge v476, `version.json` 476.

**Validé :** `node --check` (215 scripts, 0 erreur) + Playwright/mesures (espace texte→tableau **26px** (au lieu de ~283), tableau à **231px** du haut — remonté sous le texte, **pied ancré en bas** à 68px du bas) + capture (tableau en haut, pied en bas) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v476**.

---

## 🟢 MAJ précédente — Équipe : document « Liste du personnel » épuré (sans cadrage, tableau centré, pied en bas de page) + boutons en bas, taille normale — v475
**Quoi :** deux ajustements de l'onglet **Équipe** (module Salarié).
1. **Document plus frais** — le document « LISTE DU PERSONNEL » est **rendu épuré, SANS cadrage** (bord/ombre du `.doc-page` retirés), en **pleine hauteur A4** : **en-tête en haut** (titre + attestation), **tableau des salariés centré au milieu de la page**, **pied « Fait à …, le … » + signataire + cachet ancré en bas de page**. **Espace** ajouté **entre le titre et le texte** (34px) et **entre le texte et le tableau** (tableau centré dans la zone médiane). Tableau **plus léger** (bords `#d3dae4`, en-tête bleu clair `#f4f7fb`) ; colonnes en **auto-layout** (dates/n° intacts sur une ligne, en-têtes multi-mots repliés proprement, valeurs longues repliées ; l'ensemble tient dans la page).
2. **Boutons en bas, taille normale** — les boutons **💾 Enregistrer** / **🖨 Imprimer / PDF** ne sont plus **étirés en pleine largeur** en haut du formulaire : ils passent dans une **barre compacte centrée sous le document** (boutons `btn-sm`, ~120-140px au lieu de ~700px).

**Comment :** `addon183` — `salEquipeDoc()` restructuré (`.lp-head` / `.lp-mid` (table) / `.lp-foot`) ; `salEquipe()` (boutons sortis de `.pil-grid5` → `.lp-actions` sous l'aperçu). `addon222` (`<style id="lp-doc-mod">`) — `.lp-doc{display:flex;flex-direction:column;border:none!important;box-shadow:none!important}`, `.lp-mid{flex:1;justify-content:center}`, `.lp-foot{margin-top:auto}`, `.lp-title{margin-bottom:34px}`, table `table-layout:auto` + en-têtes `white-space:normal`, `@media print{.lp-doc{min-height:262mm}}`, `.lp-actions{display:flex;justify-content:center}`. `sw.js` yada-v67, badge v475, `version.json` 475.

**Validé :** `node --check` (215 scripts, 0 erreur) + Playwright/mesures (page A4 1123px, `border/box-shadow:none`, en-tête en haut (68px), **pied ancré en bas** (68px du bas), **espace titre→texte 34px**, **espace texte→tableau ~283px** (tableau au milieu) ; en-têtes sans chevauchement ; tableau dans la page (aucun débordement) ; boutons **~120/142px** (non étirés) sous le document) + captures (document conforme, 1 & 2 salariés) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v475**.

---

## 🟢 MAJ précédente — Équipe (Salarié) : document « LISTE DU PERSONNEL » (attestation officielle) + bouton Enregistrer → visible dans l'Espace Admin — v474
**Quoi :** deux évolutions de l'onglet **Équipe** (module **Salarié**, Ressources Humaines).
1. **Nouveau document « LISTE DU PERSONNEL »** (d'après le modèle PDF fourni) remplaçant l'ancienne « LISTE SALARIÉS » : **titre souligné**, **attestation** « Je soussigné(e) \<signataire\>, agissant en qualité de \<qualité\>, de la société \<dénomination\>, située \<adresse\>, immatriculée au R.C.S. de \<ville\> sous le numéro \<SIREN\>, certifie que les personnes ci-dessous mentionnées font partie du personnel de l'entreprise : », **tableau à 8 colonnes** (Nom · Prénom · N° DPAE · Date DUE · Date Embauche · Nature Pièce Identité · Date de validité · Numéro de Pièce d'Identité), pied **« Fait à …, le … »** + bloc signature **« Nom du signataire (P.D.G., Gérant ou personne mandatée) »** + **« (Cachet de la société) »**. Champs salarié ajoutés à la fiche (**N° DPAE**, **Date DUE**, **Nature de la pièce d'identité**, **Date de validité de la pièce**) + champs du formulaire Équipe (**Qualité du signataire**, **Fait à**).
2. **Bouton « 💾 Enregistrer »** : mémorise un **instantané** du document dans `db.parametres.listesPersonnel[]` → l'**Espace Admin** (Pilotages / bouton Rapport admin) affiche une carte **« 📋 Listes du personnel enregistrées »** (Dossier · Signataire · Qualité · nb Salariés · Enregistré le) avec **👁 Voir** (rouvre le document, imprimable) et 🗑.

**Comment :** `addon183` — `salEquipeDoc()` réécrit (doc `.lp-doc` : attestation + table `.lp-t` 8 colonnes + pied signature), `salEquipe()` (champs Qualité/Fait à + bouton Enregistrer), fiche `salFiche`/`salSave` (+ `dpaeNum`/`dueDate`/`pieceNature`/`pieceValidite`), `window.salEquipeDoc` exposé. `addon222` — `salEquipeEnregistrer()` (snapshot → store), `listePersonnelVoir/Imprimer/Suppr`, `listesPersonnelAdminCard()` greffée sur `rapportsPilotageCard` (Admin), `<style id="lp-doc-mod">`. `sw.js` yada-v66, badge v474, `version.json` 474.

**Validé :** `node --check` (215 scripts, 0 erreur) + Playwright (doc : titre « LISTE DU PERSONNEL », attestation R.C.S./qualité, société+SIREN, **8 colonnes**, salarié DPAE/Passeport/n° pièce, pied « Fait à » + signataire + cachet, plus d'ancien « LISTE SALARIÉS » ; Enregistrer → **1** entrée `{dossier,signataire,nb,html,ts}` ; Admin : carte « Listes du personnel enregistrées » + entrée + 👁 Voir, greffée sur `rapportsPilotageCard` ; Voir → modale avec le doc ; 0 pageerror) + capture (document conforme au modèle) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v474**.

---

## 🟢 MAJ précédente — État d'avancement : barre d'actions recentrée (boutons groupés au centre, plus collés aux bords) — v473
**Quoi :** dans la **modale de l'État d'avancement** (Cabinet & Admin), les boutons **← Fermer · ⤢ Agrandir · 🖨 Imprimer** étaient **collés aux bords** de la fenêtre (Fermer tout à gauche, Imprimer tout à droite via `justify-content:space-between`). Ils sont désormais **groupés et centrés** au milieu de la barre, avec des **espaces équilibrés** de chaque côté (plus aucun bouton collé à la bordure).

**Comment :** `addon217` — `.ra-etat-actions{justify-content:center;align-items:center;gap:12px;margin:0 0 14px;padding:14px 18px 0;flex-wrap:wrap}` (au lieu de `space-between`) + `.ra-etat-actions>div{display:flex;gap:12px;align-items:center}` (groupe Agrandir+Imprimer). `sw.js` yada-v65, badge v473, `version.json` 473.

**Validé :** `node --check` (214 scripts, 0 erreur) + Playwright (barre `justify-content:center` ; écart gauche = écart droit = **189px** (symétrique, au lieu de ~0) ; capture : [← Fermer · ⤢ Agrandir · 🖨 Imprimer] groupés & centrés ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v473**.

---

## 🟢 MAJ précédente — Boutons recentrés partout (libellé centré, espaces équilibrés) + Rapport mensuel = 1 objet + travaux par mois (fin de la liste des vendredis) — v472
**Quoi :** deux évolutions.
1. **Recentrage universel des boutons** — **chaque bouton du système** (`.btn`) a désormais son **libellé parfaitement centré** (horizontalement **et** verticalement), avec des **espaces équilibrés** en haut, en bas, à gauche et à droite. Le centrage flex n'était appliqué qu'en mobile (≤820px) ; il est étendu à **tout le système (desktop compris)** — les libellés (ex. « ← Fermer ») ne sont plus collés en haut du bouton.
2. **Rapport mensuel simplifié** — la carte **« 📅 Rapport mensuel »** ne génère **plus une liste de tous les vendredis** du mois : elle présente **un seul rapport par mois** — **Objet du rapport du mois** (liste éditable des 11 propositions ou saisie libre) + **Travaux effectués** + **Avancement**. Navigation par mois (‹ / ›) conservée ; consolidation Admin alignée (colonne **Objet**, un rapport par utilisateur/mois).

**Comment :** `addon221` — `<style id="btn-center-mod">` : `.btn{display:inline-flex;align-items:center!important;justify-content:center!important;gap:6px;line-height:1.1;box-sizing:border-box;text-align:center;vertical-align:middle}` (+ `.btn>*` centré). `display` **sans** `!important` → un bouton masqué (`display:none`) reste masqué. `addon218` — rapport mensuel réécrit : `db.parametres.rapportsMensuels[]` = `{authorKey,authorNom,mois,objet,travaux,statut,ts}` (clé **mois**, plus `vendredi`) ; `getM(key,mois)`, `rmSet(mois,field,val)` ; `rapportMensuelCard()` = formulaire `.rm-form` (Objet `<input list=rm-objet-list>` + `<datalist>` 11 propositions, Travaux `<textarea>`, Avancement `<select>`) ; `rapportMensuelAdminCard()` = table Utilisateur/Objet/Travaux/Avancement/Saisi le. `sw.js` yada-v64, badge v472, `version.json` 472.

**Validé :** `node --check` (214 scripts, 0 erreur) + Playwright (boutons : `.btn` = `inline-flex` + align/justify `center`, bouton `display:none` reste masqué ; rapport mensuel : formulaire Objet+Travaux+Avancement, **aucune** table de vendredis (0 ligne `.rm-vd`), datalist **11** propositions, saisie → **1** entrée `{mois,objet,travaux,statut}` sans `vendredi` ; Admin : colonne **Objet**, entrée visible, plus d'en-tête « Vendredi » ; 0 pageerror) + capture (barre [← Fermer · ⤢ Agrandir · 🖨 Imprimer] libellés centrés) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v472**.

---

## 🟢 MAJ précédente — Rapport (Cabinet) : Objet en liste éditable (11 propositions ou libre) + Travaux à plusieurs lignes (chaque travail = un rapport) + report AUTO dans l'État d'avancement — v471
**Quoi :** trois évolutions de la carte **« ➕ Nouveau rapport journalier »** (Espace Cabinet).
1. **Objet en liste éditable** — le champ **Objet** propose désormais une **liste déroulante de propositions** *et* reste **saisissable librement** : **Déclaration TVA mensuel · Déclaration TVA annuel · Déclaration Impôt sur les Sociétés · Déclaration de Revenu · Relances Client · Rapprochement bancaire · Saisie Facture Fournisseur · Saisie Facture Client · Saisie OD de Charges · Saisie OD de Paie · Analyse** (on choisit dans la liste **ou** on écrit son propre objet).
2. **Travaux à plusieurs lignes** — le champ **Travaux effectués** devient une **liste** : on **énumère plusieurs travaux** (bouton **« ➕ Ajouter un travail »**, ✕ pour retirer) **ou un seul** ; à l'enregistrement, **chaque travail non vide devient un rapport distinct** (même date/dossier/objet/avancement) → **chaque rapport est considéré** (listé & compté dans Pilotages).
3. **Report AUTOMATIQUE dans l'État d'avancement** — à chaque **rapport journalier** enregistré avec un **dossier concerné** + un **objet**, la **tâche correspondante de l'État d'avancement** de ce dossier est **cochée automatiquement** pour le **mois du rapport** (TVA→TVA, Rapprochement→Rappro. BQ, Saisie Facture Fournisseur→Saisie HA, Saisie Facture Client→Saisie VT, OD de Charges/Paie→OD paie/charges, Analyse→inventaire). L'État d'avancement **reste modifiable** (cases toujours cochables/décochables).

**Comment :** `addon217` — `OBJETS[]` (11 propositions) → `<input list="ra-objet-list">`+`<datalist>` (éditable) ; `window.raTwRow()`/`raTwAdd()`/`raTwDel()` (lignes `.ra-tw-row` de Travaux) ; `raEnregistrer()` réécrit (collecte `#ra-travaux-list .ra-tw`, **un rapport par travail non vide**, puis coche l'État d'avancement). `addon216` — `window.eaSetCell(id,taskKey,monthIdx,val)` (coche une case, reste modifiable) + `window.eaObjetTask(objet)` (Objet→tâche via mots-clés, `null` si aucune : IS/Revenu/Relances). `sw.js` yada-v63, badge v471, `version.json` 471.

**Validé :** `node --check` (213 scripts, 0 erreur) + Playwright (Objet = liste éditable de **11** propositions ; Travaux : 1 ligne → +2 = 3 lignes ; 2 travaux remplis + 1 vide → **2 rapports** distincts (travaux différents, même objet/dossier), ligne vide ignorée ; État d'avancement de d2 : tâche **`ha` mois mars cochée** automatiquement (seule `ha`) ; mapping tva/rap/vt/od/inv + IS→null ; tableau **toujours éditable**, case cochée présente ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v471**.

---

## 🟢 MAJ précédente — État d'avancement : bouton unique « 🖨 Imprimer » (nouvelle page + dialogue d'impression) + bouton « ⤢ Agrandir » (Cabinet & Admin) — v470
**Quoi :** deux évolutions de la **modale de l'État d'avancement** (partagée par l'Espace **Cabinet** — depuis le Rapport — et l'Espace **Admin** — depuis la carte « État d'avancement des dossiers »).
1. **Impression repensée** — les **deux boutons d'impression** (« 🖨 Imprimer A4 » / « 🖨 Imprimer A3 (analyse) ») sont **remplacés par un SEUL bouton « 🖨 Imprimer »**. Au clic, une **nouvelle page (fenêtre)** s'ouvre avec le **dialogue d'impression natif** (où l'utilisateur choisit **tous les paramètres** : format A4/A3, orientation, marges, échelle…).
2. **Agrandir** — un bouton **« ⤢ Agrandir »** agrandit le tableau d'état d'avancement (modale à **96vw**, tableau en plus grande police/espacement) pour analyser sur tout l'espace disponible → **« ⤡ Réduire »** revient à la taille normale. Disponible dans **l'Espace Admin ET l'Espace Cabinet**.

**Comment :** `addon217` — `raOuvrirEtat(id, editable)` (barre d'actions ← Fermer · ⤢ Agrandir · 🖨 Imprimer ; retire `ra-etat-full` à l'ouverture) ; `raEtatAgrandir()` (bascule la classe `ra-etat-full` sur `#modal` + libellé du bouton) ; `raImprimerEtat()` réécrit → `window.open('','_blank')` + `document.write` (HTML du tableau `eaDossierTableHTML(id,false)` + CSS d'impression inline + auto `window.print()`). CSS `ra-mod` : `#modal.ra-etat-full #modal-c{max-width:96vw}` + `.ra-etat-full .eap-tbl` (police 15px, padding 10/8). `sw.js` yada-v62, badge v470, `version.json` 470.

**Validé :** `node --check` (213 scripts, 0 erreur) + Playwright (Cabinet éditable & Admin lecture : barre = [← Fermer, ⤢ Agrandir, 🖨 Imprimer], **aucun bouton A3/A4**, un seul bouton Imprimer ; ⤢ Agrandir → `#modal.ra-etat-full` + `#modal-c` à 96vw (1344px/1400) + libellé « ⤡ Réduire », re-clic → réduit ; `ra-etat-full` retiré à la réouverture ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v470**.

---

## 🟢 MAJ précédente — État d'avancement : ÉDITABLE + impression A3 (Cabinet) ; Admin = carte fermée « liste complète des dossiers » + bouton VERT de vérification — v469
**Quoi :** deux évolutions de l'**État d'avancement**.
1. **Espace Cabinet** — le tableau ouvert depuis le **Rapport** (clic sur un dossier) devient **ÉDITABLE** : on **coche/décoche** chaque case directement (mois × tâche), le statut se recalcule en direct, et on peut **imprimer en A3** (« 🖨 Imprimer A3 (analyse) » — pleine largeur pour analyser) **ou A4**.
2. **Espace Admin (Pilotages)** — nouvelle **carte FERMÉE « 📋 État d'avancement des dossiers »** listant **TOUS les dossiers** (liste complète). Chaque dossier ouvre son **tableau** (lecture) ; un **BOUTON VERT « ● Vérifier l'enregistrement »** apparaît quand l'état d'avancement a été **enregistré/modifié depuis la dernière vérification** (badge « N à vérifier ») → clic = **« ✓ Vérifié »** ; « Non renseigné » si aucune donnée.

**Comment :** `addon216` — `eaDossierTableHTML(id, editable)` (cases `data-d/data-t/data-m`, classe `.eap-doc.editable`) + **délégation** `click` sur `.eap-doc.editable .eap-c` (bascule + `save` + maj du statut) ; `window.eaSignature(id)` (signature des cases cochées). `addon217` — `raOuvrirEtat(id, editable=true)` (modale éditable), `raImprimerEtat('A4'|'A3')` (injecte `@page{size:A3 landscape}` puis `window.print`). `addon220` — `eaAdminList()` (carte `<details>` fermée, tous dossiers, statut + `eaVerif`), `window.eaVerif(id)` (mémorise `db.parametres.etatAvancementVerif[id]=eaSignature`), greffé au module **Pilotages** admin. `sw.js` yada-v61, badge v469, `version.json` 469.

**Validé :** `node --check` (213 scripts, 0 erreur) + Playwright (Cabinet : modale **éditable** — clic case tva/mois → coché & **persisté**, boutons A4+A3, `@page A3` injecté ; Admin : carte **fermée**, **liste complète** (3 dossiers), **bouton vert** sur dossier modifié + badge « 1 à vérifier », « ✓ Vérifié » après `eaVerif`, « Non renseigné » sinon ; captures conformes ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v469**.

---

## 🟢 MAJ précédente — Page Rapport (Cabinet) : disposition réajustée (Formulaire + État d'avancement en haut, Rapports saisis pleine largeur dessous) — v468
**Quoi :** réagencement des cartes de la **page Rapport** (Espace Cabinet). En **haut**, deux colonnes à hauteur égale : **« Nouveau rapport journalier »** (gauche) et **« État d'avancement des dossiers »** (droite) ; **en dessous**, **« Rapports saisis »** sur **toute la largeur**. Auparavant, le formulaire et la liste des rapports étaient empilés dans la colonne de gauche (colonne droite courte, espace vide).

**Comment — 1 édition de `raBuild()` (addon217) :** le `listCard` (« Rapports saisis ») sort de la colonne gauche `.ra-2col-l` et est renvoyé **après** le bloc `.ra-2col` (pleine largeur). La grille `.ra-2col` ne contient plus que le formulaire (gauche) + l'état d'avancement (droite). `sw.js` yada-v60, badge v468, `version.json` 468.

**Validé :** `node --check` (212 scripts, 0 erreur) + Playwright/capture (haut : Nouveau rapport + État d'avancement côte à côte ; « Rapports saisis » pleine largeur dessous ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v468**.

---

## 🟢 MAJ précédente — Rapport (Cabinet) : sans choix d'utilisateur ni temps, champ « Objet », + colonne DROITE « État d'avancement des dossiers » (clic → tableau imprimable/PDF) — v467
**Quoi :** refonte du **rapport journalier (Espace Cabinet)**.
1. **Pas de choix d'utilisateur** : le rapport est celui du **compte connecté** (un seul par connexion) — le sélecteur « Collaborateur » est retiré.
2. **« Temps passé » supprimé** ; ajout d'un champ **« Objet »** (avant « Travaux effectués »).
3. **Deux colonnes** : à gauche le formulaire + la liste des rapports saisis ; à **droite** une **liste des dossiers attribués** avec leur **statut d'avancement** (À jour / Jusqu'à \<mois\> / Non commencé).
4. **Clic sur un dossier** → **nouvelle page (modale)** affichant son **tableau d'avancement** (8 tâches × 12 mois), **imprimable & enregistrable en PDF** (bouton « 🖨 Imprimer / Enregistrer (PDF) »).

**Comment :** `addon216` expose `window.eaProgress(id)` + `window.eaDossierTableHTML(id)` (tableau `.doc-page` noir/blanc imprimable) ; `addon217` : `raBuild()` réécrit (form sans `ra-collab`/`ra-temps`, `ra-objet` ajouté ; layout `.ra-2col` ; liste `.ra-doss-row` → `raOuvrirEtat(id)`), `raEnregistrer()` (auteur = `staffId`/`meNom`, `objet`, plus de `temps`), `raOuvrirEtat`/`raImprimerEtat` (modale `#modal` + `#print-area`+`window.print`). Consolidation Admin `rapportsPilotageCard` alignée (colonne **Objet** au lieu de Temps, KPI **Terminés** au lieu de Heures). `sw.js` yada-v59, badge v467, `version.json` 467.

**Validé :** `node --check` (212 scripts, 0 erreur) + Playwright (form : pas de `ra-collab` ni `ra-temps`, `ra-objet` présent, deux colonnes ; liste droite = dossiers **attribués** (ALR CONSEIL, ACTION BTP) ; saisie → `objet='TVA novembre'`, auteur auto 'Sarah Durand', sans champ temps ; clic dossier → modale avec tableau `.eap-tbl` (✓ TVA 5 mois + HA 2 mois), bouton Imprimer/PDF, titre « État d'avancement — ALR CONSEIL » ; captures conformes ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v467**.

---

## 🟢 MAJ précédente — Espace Admin « Collaborateurs & accès » : vue deux colonnes (liste des salariés à gauche + fiche du compte au survol à droite) — v466
**Quoi :** dans l'Espace **Admin → Collaborateurs & accès**, une carte **« Salariés — liste & informations »** présente **deux colonnes** : à **gauche**, la **liste de tous les salariés/utilisateurs** (avatar + nom + e-mail + voyant actif/inactif, avec recherche) ; à **droite**, au **survol** d'un salarié, les **informations de son compte** (identifiant e-mail, mot de passe masqué + « Afficher », statut Actif/Inactif, poste, salaire, nombre de dossiers + **dossiers attribués** en tags). Le premier salarié est affiché par défaut ; la fiche se met à jour au survol (et au focus clavier).

**Comment — `yada-addon219` (100% additif, Espace Admin) :** `usrTwoColCard()` (grille `.usr-2col` = liste `#usr-list` + fiche `#usr-info`) greffée **en tête** de `admCollabPanel()` ; survol via **délégation** `mouseover`/`focusin` sur `.usr-row[data-id]` → `infoHTML(s)` (réutilise `admPwToggle` pour révéler le mot de passe) ; `usrSearch()` (filtre live). `<style id="usr-mod">` (responsive : 1 colonne < 820px). Le panneau de gestion existant (Mot de passe / Désactiver, dossiers & attribution) reste en dessous. `sw.js` yada-v58, badge v466, `version.json` 466.

**Validé :** `node --check` (212 scripts, 0 erreur) + Playwright (2 salariés : liste à gauche, fiche par défaut = 1ᵉʳ ; **survol de Marc → fiche « Marc Leroy · Inactif · marc@cab.fr · mot de passe masqué + Afficher · poste Assistant · 2 dossiers (ACTION BTP, ALR CONSEIL) »**, ligne active surlignée ; capture conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v466**.

---

## 🟢 MAJ précédente — Module Rapport : page défilable (fin du contenu coupé) — v465
**Quoi :** la **page « Rapport »** (bouton « ✎ Rapport » de la page d'ouverture → saisie/visualisation) est désormais **défilable** : quand le contenu dépasse la hauteur de l'écran (formulaire + liste des rapports + rapport mensuel, ou consolidations Admin), on peut **défiler** pour tout atteindre. Auparavant, `html,body{overflow:hidden}` (app-shell) coupait le bas de la page dans le parcours d'entrée (écran non défilable).

**Comment — 1 édition d'`ecranRapport` (addon189) :** le conteneur `.ds-rapport-wrap` reçoit `height:100dvh;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch` (conteneur de défilement propre, indépendant du `overflow:hidden` global). `sw.js` yada-v57, badge v465, `version.json` 465.

**Validé :** `node --check` (211 scripts, 0 erreur) + Playwright (30 rapports : `.ds-rapport-wrap` `overflow-y:auto`, `scrollHeight 1469 > clientHeight 700`, `scrollTop=300` appliqué → défile ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v465**.

---

## 🟢 MAJ précédente — Rapports : SEUL l'Espace Cabinet rend des rapports ; l'Espace Client n'a AUCUN rapport ; l'Admin (contrôle) visualise — v464
**Quoi :** recentrage des rôles de reporting. **Seul l'Espace CABINET rend des rapports** (rapport journalier d'activité + rapport mensuel, via le bouton « Rapport » de la page d'ouverture). L'**Espace CLIENT n'a plus AUCUN rapport** : le rapport mensuel et le tableau « État d'avancement » ajoutés précédemment côté client (v462/v463) sont **retirés de l'Espace Client**. L'**Espace ADMIN** reste un **compte de contrôle** (plus d'autorité) qui **visualise uniquement** les rapports émis par les collaborateurs du cabinet (consolidation journalière + mensuelle).

**Comment — `yada-addon218` (édition) :** suppression de la **greffe sur `pageEspaceClient`** (qui ajoutait `rapportMensuelCard()` + `eaCard()` au client) → l'Espace Client ne rend plus aucune carte de rapport. Le côté Cabinet (`rapportCards` = saisie journalière + mensuelle) et la visualisation Admin (`rapportsPilotageCard` + consolidation mensuelle, aucun formulaire) sont **inchangés**. L'`eaCard` (État d'avancement) reste dans le module **Pilotages** du Cabinet. `sw.js` yada-v56, badge v464, `version.json` 464.

**Validé :** `node --check` (211 scripts, 0 erreur) + Playwright (Espace Client : **aucun** « Rapport mensuel » ni « État d'avancement » ; Cabinet : rapport journalier + mensuel présents ; Admin : aucun formulaire de saisie, consolidation présente ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v464**.

---

## 🟢 MAJ précédente — Rapport : Admin = VISUALISATION seule (rapports émis) + Espace Client = éditer son rapport + remplir l'État d'avancement (son dossier) — v463
**Quoi :** deux ajustements du module Rapport.
1. **Espace Admin** — le bouton **« Rapport »** ne sert **plus à saisir** un rapport : il **visualise UNIQUEMENT** les rapports **émis par les autres utilisateurs** (consolidation **journalière** + **mensuelle**), sans aucun formulaire de saisie.
2. **Espace Client** — le module Rapport permet d'**éditer son rapport** (carte « 📅 Rapport mensuel », éditable) **et** de **remplir le tableau « État d'avancement »** — restreint au **dossier du client** (son dossier actif uniquement, jamais les autres).

**Comment — `yada-addon218` (éditions) :** `rapportCards()` sensible au rôle → `sessionRole==='admin'` renvoie **seulement** `rapportsPilotageCard()` (consolidation journalière + mensuelle, aucune saisie) ; sinon saisie journalière + `rapportMensuelCard()`. **`pageEspaceClient`** += `rapportMensuelCard()` **+ `eaCard()`** (État d'avancement). **`dossiersAttribues()` (addon216)** rendu client-aware : pour `sessionRole==='client'`, ne liste que le **dossier actif** (`db.activeId`) ; sinon `staffFilterDossiers`. `sw.js` yada-v55, badge v463, `version.json` 463.

**Validé :** `node --check` (211 scripts, 0 erreur) + Playwright (admin : **aucun** formulaire de saisie, consolidations journalière + mensuelle présentes ; collaborateur : saisie journalière + mensuelle ; client : « Rapport mensuel » éditable (persisté) + « État d'avancement » **limité au dossier actif** (1 ligne), case cochée persistée ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v463**.

---

## 🟢 MAJ précédente — Espace Client : carte fermée « Rapport mensuel » (à compléter chaque vendredi) + accès Admin à tous les rapports — v462
**Quoi :** l'**Espace Client** reçoit une **carte FERMÉE « 📅 Rapport mensuel »** à **compléter chaque vendredi de la semaine** : une **ligne par vendredi du mois** (date), avec **travaux effectués** (texte) + **avancement**, enregistrés directement. Navigation par mois (‹ / ›), badge « N/M vendredis », le vendredi du jour est marqué **« aujourd'hui »**, les vendredis passés non remplis sont surlignés (à compléter). L'**Espace Admin accède aux rapports mensuels de TOUS les utilisateurs** (carte de consolidation en lecture) — via le **bouton « Rapport »** (page d'ouverture) **et** dans le module **Pilotages** de l'Espace Admin.

**Comment — `yada-addon218` (100% additif) :** `rapportMensuelCard()` (carte `<details>` fermée : `fridays(mois)` = vendredis du mois, saisie par **délégation** `change` sur `.rm-in` → `rmSet(vendredi,champ,val)` dans **`db.parametres.rapportsMensuels[]`** `{authorKey,authorNom,vendredi,travaux,statut,ts}`, `save()`, sans re-render ; navigation `rmNav(±1)` avec état d'ouverture `rmOpen` conservé) ; `rapportMensuelAdminCard()` (consolidation lecture, tous utilisateurs, par mois) ; greffes : **`pageEspaceClient`** += carte (client), **`rapportCards`** += carte mensuelle (+ consolidation si `sessionRole==='admin'`), **`rapportsPilotageCard`** += consolidation. `<style id="rm-mod">`. `sw.js` yada-v54, badge v462, `version.json` 462.

**Validé :** `node --check` (211 scripts, 0 erreur) + Playwright (Espace Client : carte fermée « Rapport mensuel » ; juillet 2026 → 5 vendredis (03/10/17/24/31), tag « aujourd'hui » sur le 10 ; saisie d'un vendredi → persistée (2026-07-10 · « Clôture des ventes » · Terminé · ts) ; Admin : consolidation `<details>` affiche la saisie ; bouton Rapport (admin) → carte mensuelle + consolidation de tous les utilisateurs ; capture conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v462**.

---

## 🟢 MAJ précédente — Rapport : bouton sur la page d'ouverture Cabinet (hors dossier) + dossiers ATTRIBUÉS seulement + Admin (carte fermée + jour/heure de saisie) — v461
**Quoi :** trois ajustements du module **Rapport**.
1. **Bouton sur la page d'ouverture** — le bouton **« ✎ Rapport »** n'est plus dans la barre latérale d'un dossier : il est sur l'écran **« Espace dossiers »** (juste après « Déconnexion »). Il ouvre la page Rapport **hors dossier** (bouton « ← Retour aux dossiers »).
2. **Dossiers attribués uniquement** — dans le rapport, la liste **« Dossier concerné »** ne propose que les **dossiers attribués à l'utilisateur connecté** (`staffFilterDossiers`) : un utilisateur ne voit jamais un dossier qui ne lui a pas été attribué (l'admin / compte principal conserve l'accès global).
3. **Espace Admin — Pilotages** : le **tableau des rapports** passe dans une **carte FERMÉE** ; **au-dessus**, une carte **« 🕒 Suivi des saisies des rapports »** indique **quel jour et à quelle heure** chaque collaborateur a complété son rapport (dernière saisie) ; le détail (carte fermée) gagne une colonne **« Saisi le »** (jour + heure par rapport).

**Comment :** `dsRapport` + `dsOuvrirRapport()` + `ecranRapport()` (routé dans `dsScreen`, addon189) ; bouton injecté après Déconnexion sur l'accueil (addon210) ; module `m-rapport` **retiré** de `MODULES` (addon164) ; `window.rapportCards()` exposé (addon217) ; `dossL()` = `staffFilterDossiers(db.cabinet.dossiers)` ; `rapportsPilotageCard()` réécrit (carte `🕒` visible + `<details.ra-details>` fermé + `frDT(ts)` jour/heure + colonne « Saisi le »). `sw.js` yada-v53, badge v461, `version.json` 461.

**Validé :** `node --check` (210 scripts, 0 erreur) + Playwright (barre latérale sans Rapport ; accueil : bouton « ✎ Rapport » après Déconnexion ; page Rapport hors dossier ; **filtrage** : Sarah (attrib. d2) → seul ALR CONSEIL, Marc (d1) → seul ACTION BTP, admin → tous ; Admin Pilotages : carte « Suivi des saisies » visible (Sarah · 10/07/2026 à 17:42), tableau en carte fermée + colonne « Saisi le » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v461**.

---

## 🟢 MAJ précédente — Rapport déplacé dans l'Espace CABINET (barre latérale) ; consolidation conservée dans Pilotages (Admin) — v460
**Quoi :** le module **« ✎ Rapport »** (rapports journaliers des travaux effectués) passe de l'Espace **Admin** à l'Espace **CABINET** : il apparaît désormais comme **bouton dans la barre latérale** (section « Modules », 1ᵉʳ module), là où travaillent les collaborateurs. La **tuile « Rapport » est retirée du hub Admin**. La **consolidation reste dans le module Pilotages de l'Espace Admin** (carte « 📝 Rapports journaliers des collaborateurs » : KPI + synthèses par collaborateur / par dossier + détail) → l'admin garde la vue d'ensemble & le suivi.

**Comment :** tuile `'rapport'` retirée de `MODS` (`admHubHTML`) ; `admRapportModule()` → **`raBuild()`** (builder partagé) + **`window.pageRapport()`** (page Cabinet `head('Rapport',…) + raBuild()`) ; entrée `rapport:(pageRapport…)` ajoutée au **dispatch `render()`** ; **module Cabinet** `{key:'m-rapport', nom:'Rapport', ico:'✎', page:'rapport'}` ajouté à `MODULES` (`yada-addon164`) ; le wrap `admModuleContent` ne dispatche plus `rapport` (garde l'injection `pilotages`). Données `db.parametres.rapports[]` et `rapportsPilotageCard()` inchangées. `sw.js` yada-v52, badge v460, `version.json` 460.

**Validé :** `node --check` (210 scripts, 0 erreur) + Playwright (barre latérale Cabinet : bouton « ✎ Rapport » présent ; page Rapport rendue (`head` « Rapport » + formulaire) ; saisie → rapport persisté (Sarah Durand · ALR CONSEIL · 3 h) ; **hub Admin : 5 tuiles, plus de tuile Rapport** ; **Pilotages Admin : carte de consolidation + rapport transmis** ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v460**.

---

## 🟢 MAJ précédente — Espace Admin : module « RAPPORT » (rapports journaliers) transmis au module Pilotages — v459
**Quoi :** l'**Espace Admin** gagne, sur sa page principale (liste de modules), un module **« ▦ Rapport »** où l'utilisateur **complète des rapports journaliers sur les travaux effectués** (Date · Collaborateur · Dossier concerné · Temps passé · Avancement · Travaux effectués · Remarques). Chaque **rapport rendu est transmis automatiquement au module « Pilotages » de l'Espace Admin** : une carte **« 📝 Rapports journaliers des collaborateurs »** y donne une **vue d'ensemble & suivi** (KPI Rapports / Heures déclarées / Collaborateurs / Dossiers suivis + synthèses **par collaborateur** et **par dossier** + détail des rapports). Permet à l'admin de suivre l'avancement des dossiers et le travail des collaborateurs.

**Comment :**
- **Tuile hub Admin** : ajout de `['rapport','▦','Rapport',…]` dans `MODS` d'`admHubHTML` (6 tuiles).
- **`yada-addon217`** (100% additif, Espace Admin) : `admRapportModule()` (formulaire `.ra-form` + tableau « Rapports saisis ») ; `raEnregistrer()` pousse dans **`db.parametres.rapports[]`** (`{date,collabId,collabNom,dossierId,dossierNom,travaux,temps,statut,remarques,ts}`, persisté par `save()`), `raSupprimer()` ; `rapportsPilotageCard()` (KPI + synthèses `byColl`/`byDoss` + détail) ; **wrap de `admModuleContent`** → `rapport` = `admRapportModule()`, `pilotages` = original **+** `rapportsPilotageCard()`. Collaborateur par défaut = utilisateur connecté (`window.staffId`/`yadaCurrentUserName`). `<style id="ra-mod">`. `sw.js` yada-v51, badge v459, `version.json` 459.

**Validé :** `node --check` (210 scripts, 0 erreur) + Playwright (hub Admin : 6 tuiles dont « Rapport » ; module Rapport : formulaire + 2 collaborateurs + 3 dossiers ; saisie d'un rapport → persisté (Sarah Durand · ALR CONSEIL · 2,5 h · Terminé), visible dans la liste ; **Pilotages : carte « Rapports journaliers » présente, rapport + collaborateur + dossier transmis** ; captures conformes ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v459**. *(Le tableau détaillé fourni par l'utilisateur sera aligné sur ces colonnes dès réception.)*

---

## 🟢 MAJ précédente — Module Pilotages : carte fermée « ÉTAT D'AVANCEMENT » (dossiers attribués × 8 tâches × 12 mois à cocher) — v458
**Quoi :** dans le module **Pilotages** (Espace cabinet), une **carte fermée « 📋 ÉTAT D'AVANCEMENT »** reproduit le tableau Excel « Affectation dossiers » fourni : **une ligne par dossier ATTRIBUÉ** (dénominations reprises du logiciel — `db.cabinet.dossiers` filtrées par salarié via `staffFilterDossiers`), des **colonnes d'attributs** (COL. · Activité · Bilan N-1 · AGO N-1 · Régime TVA · DEXT · SAGE) puis **8 tâches × 12 mois (J→D) à COCHER directement dans le logiciel** — TVA (CA3/CA12), Relevés OFX/Regate, Saisie HA, Saisie VT, Saisie BQ, Rappro. BQ, OD paie/charges soc., Analyse-inventaire. **Toutes les cases sont vides au départ** (reprise à zéro). Une colonne **« À jour »** indique, par dossier, **jusqu'où il est à jour** = plus petit nombre de mois consécutifs cochés (depuis janvier) parmi les 8 tâches → **« À jour ✓ »** (≥ mois courant, vert), **« Jusqu'à \<mois\> »** (retard, ambre) ou **« Non commencé »** (gris) ; badge « N/M à jour ». Bouton **« ↺ Tout décocher »**.

**Comment — `yada-addon216` (100% additif, cabinet uniquement) :** `eaCard()` (carte `<details>` fermée + table `.ea-tbl` défilable, en-têtes de groupe colspan 12 + sous-en-têtes de mois) greffée en tête de `pagePilotage` ; données `db.parametres.etatAvancement[dossierId]={tasks:{tâche:{mois:true}},attrs:{col,activite,bilanN1,agoN1,regime,dext,sage}}` (persistées par `save()`) ; cases interactives via **délégation d'événements** sur `document` (`click` sur `.ea-c` → bascule + `save` + maj du statut/badge **sans re-render** ; `change` sur `.ea-attr`) ; `progress(id)` (mois consécutifs) ; `eaReset()` (décoche tout sans replier la carte). `<style id="ea-mod">`. `sw.js` yada-v50, badge v458, `version.json` 458.

**Validé :** `node --check` (209 scripts, 0 erreur) + Playwright (carte fermée par défaut ; 3 dossiers → 288 cases (3×96), 8 groupes, 96 colonnes de mois ; cocher 5 mois × 8 tâches → « Jusqu'à mai » ; 2 mois d'une seule tâche → « Non commencé » ; 12×8 → « À jour ✓ (année) » ; badge « 1/3 à jour » ; persistance des cases + attribut COL ; capture conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v458**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : barres d'en-tête compactées + en-tête de colonnes collé en haut (plus d'espace entre les lignes) — v457
**Quoi :** dans la **Consultation des comptes → édition d'un journal** (éditeur `.ec-sage`, tous dossiers), les **barres d'en-tête** (Traitements, Filtre, Lettrage) sont **compactées** (moins de hauteur) et l'**en-tête des colonnes** (Date, Jnl, Pièce, Compte, Libellé, Débit, Crédit, Solde, L) est **collé en haut, sans espace** : le filet noir sous l'en-tête ne **dépasse plus** (contour désormais *inset*, plus de `box-shadow` projeté) → **plus de bande vide entre l'en-tête et les écritures**, l'en-tête reste directement au contact de la 1ʳᵉ ligne. Opacité / absence de transparence de la v456 conservée (z-index + fond noir plein).

**Comment — `yada-addon215` (édition) :** `.ec-sage .ec-trtbar`/`.ec-filtbar`/`.ec-letbar` → `padding:3px 12px` (compactes) ; `.ec-letbar box-shadow:none` ; `.ec-sage .ec-table thead th` → `border-top:none`, `border-bottom:1px #000`, `box-shadow:inset 0 0 0 1px rgba(0,0,0,.6)` (contour qui ne dépasse pas), `z-index:6`/`position:sticky;top:0` conservés. `sw.js` yada-v49, badge v457, `version.json` 457.

**Validé :** `node --check` (208 scripts, 0 erreur) + Playwright (barres compactes, en-tête collé en haut au défilement, aucune bande vide sous l'en-tête, toujours opaque) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v457**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : en-tête de colonnes plein NOIR + contours noirs (aucune transparence, on ne voit plus l'arrière) — v456
**Quoi :** dans la **Consultation des comptes → édition d'un journal** (éditeur `.ec-sage`, tous dossiers), la **ligne d'en-tête** (barre de lettrage `.ec-letbar` + libellés de colonnes Date, Jnl, Pièce, Compte, Libellé, Débit, Crédit, Solde, L) reçoit un **fond plein quasi-noir** + des **contours noirs** → **aucune transparence** : on ne voit plus l'arrière (fenêtre en lecture seule / écritures) à travers l'en-tête. Complète la v455 (l'en-tête restait déjà opaque au défilement via `z-index`).

**Comment — `yada-addon215` (édition) :** `.ec-sage .ec-letbar` fond `#080b10` + `border-top/bottom:1px #000` + `box-shadow:0 1px 0 #000` ; `.ec-sage .ec-table thead th` fond `#0a0f16` + bords noirs (`border-top/right:1px #000`, `border-bottom:2px #000`) + `box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),0 2px 0 #000` (contours) + `z-index:6` conservé ; fond noir plein sur `thead`/`thead tr` (aucun interstice ne laisse voir l'arrière). Libellés clairs `#dceaff` conservés. `sw.js` yada-v48, badge v456, `version.json` 456.

**Validé :** `node --check` (208 scripts, 0 erreur) + Playwright (fenêtre éditeur au-dessus de la lecture seule, défilement → en-tête plein quasi-noir avec bord noir, plus aucune écriture ni fenêtre arrière visible à travers) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v456**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : en-tête de colonnes OPAQUE au défilement (fin de la transparence pendant le balayage) — v455
**Quoi :** dans la **Consultation des comptes → édition d'un journal** (éditeur `.ec-sage`, tous dossiers), la **ligne d'en-tête des colonnes** (Date, Jnl, Pièce, Compte, Libellé, Débit, Crédit, Solde, L) — collante en haut du tableau — apparaissait **transparente pendant le défilement** (« balayage ») : les **écritures qui défilent passaient PAR-DESSUS l'en-tête** (l'en-tête `thead th` était collant mais en `z-index:auto`, donc les lignes du tableau, postérieures dans le DOM, se peignaient au-dessus). Désormais l'en-tête reste **opaque** et les écritures passent **derrière**.

**Comment — `yada-addon215` (édition) :** ajout de `position:sticky !important;top:0 !important;**z-index:6 !important**` sur `.ec-sage .ec-table thead th` (le fond bleu nuit `#10243a` + libellés clairs de la v454 sont conservés). `sw.js` yada-v47, badge v455, `version.json` 455.

**Validé :** `node --check` (208 scripts, 0 erreur) + Playwright (25 écritures dans l'éditeur, défilement `scrollTop=220` → en-tête `z-index=6`, plus aucune écriture visible par-dessus la ligne d'en-tête — capture avant/après) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v455**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : bande claire (barre de lettrage) corrigée + en-têtes de colonnes rendus visibles — v454
**Quoi :** dans la **Consultation des comptes → édition d'un journal** (éditeur `.ec-sage`), correctif de couleurs (valable pour **tous les dossiers**) : (1) la **barre de lettrage** (`.ec-letbar`) n'apparaît plus en **bleu très clair/blanc** — elle passe en **bleu nuit** (comme la barre de filtre) ; (2) les **libellés des colonnes** (Date, Jnl, Pièce, Compte, Libellé, Débit, Crédit, Solde, L) étaient **peu/pas visibles** → rendus **bien visibles** (texte clair `#dceaff` sur fond bleu nuit, gras, liseré bleu).

**Comment — `yada-addon215` (CSS, injecté en dernier) :** `.ec-sage .ec-letbar` (fond `#0c1a2a` + libellé/boutons/hint clairs) ; `.ec-sage .ec-table thead th` (fond `#10243a`, `color`/`-webkit-text-fill-color:#dceaff`, `font-weight:700`, bord bleu). `sw.js` yada-v46, badge v454, `version.json` 454.

**Validé :** `node --check` (208 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (`.ec-letbar` = `rgb(12,26,42)` bleu nuit ; en-tête th `color=rgb(220,234,255)` clair, fond `rgb(16,36,58)` ; bouton lettrage sombre) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v454**.

---

## 🟢 MAJ précédente — « Retour aux dossiers » depuis un dossier → Liste des dossiers — v453
**Quoi :** après avoir **sélectionné un dossier** (HUB / rubrique / dossier sélectionné), le bouton **« ← Retour aux dossiers »** ramène désormais à la **Liste des dossiers** (au lieu de la page d'accueil « Espace dossiers », comportement de la v448). On revient donc à la liste depuis laquelle on a choisi le dossier.

**Comment :** les 3 boutons `ds-back-btn` (`ecranHub`/`ecranRubrique`/`ecranSelUnique`) appellent `dsOuvrirListe()` (au lieu de `dsAccueil()`) → `dsScreen()` affiche `ecranListe`. `sw.js` yada-v45, badge v453, `version.json` 453.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (HUB → clic « Retour aux dossiers » → `dsListe=true`, écran « Liste des dossiers » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v453**.

---

## 🟢 MAJ précédente — Message de déconnexion « Fin de session » redessiné (soigné) — v452
**Quoi :** le **message de déconnexion** (« Fin de session ») est **redessiné** : modale centrée avec **icône ronde à dégradé bleu**, titre net, message clair (« enregistrer vos modifications avant de vous déconnecter ? »), note discrète (données conservées + heure), et **deux boutons soignés** — **Annuler** (contour) et **💾 Enregistrer & quitter** (bouton bleu à dégradé + halo). Design cohérent avec l'identité YADA (bleu nuit / bleu Crystal).

**Comment :** `secDeconnexion` (fin de session) réécrit avec une structure `.seclo` (`.seclo-ic`/`.seclo-t`/`.seclo-sub`/`.seclo-note`/`.seclo-actions`) + `<style id="sec-logout-mod">` (icône ronde dégradée + anneau, boutons arrondis, bouton principal dégradé bleu). `sw.js` yada-v44, badge v452, `version.json` 452.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright + **capture** (modale « Fin de session » : icône dégradée, titre, message, boutons Annuler + « Enregistrer & quitter » bleu ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v452**.

---

## 🟢 MAJ précédente — Puce « Connecté : … » retirée de partout + (v450) boutons Modifier/Supprimer & Déconnexion des modules retirés — v451
**Quoi :** la petite note flottante **« Connecté : \<nom\> »** (haut-droite) est **retirée de partout**. (Inclut aussi les changements v450 ci-dessous : boutons « Modifier »/« Supprimer » des utilisateurs Admin retirés, et Déconnexion retirée de l'intérieur des modules — visible uniquement sur les pages de navigation des dossiers + Espace Client.)

**Comment :** `yada-addon209` : `updChip()` masque et **supprime** l'élément `#yada-user` (plus jamais affiché). `sw.js` yada-v43, badge v451, `version.json` 451.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (aucune puce `#yada-user`, aucun texte « Connecté : » ; boutons utilisateur = [Mot de passe, Désactiver] ; Déconnexion modules = 0, accueil/Liste/HUB/Client = 1 ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v451**.

---

## 🟢 MAJ précédente — Admin : boutons « Modifier » & « Supprimer » retirés des utilisateurs + Déconnexion retirée des modules (uniquement sur les pages de dossiers) — v450
**Quoi :**
1. **Espace Admin — Collaborateurs & accès** : les boutons **« Modifier »** et **« Supprimer »** sont retirés de chaque utilisateur (il reste **Mot de passe** et **Activer/Désactiver**).
2. **Déconnexion retirée des modules** : le bouton **Déconnexion** n'apparaît plus **à l'intérieur des modules** (barre latérale Cabinet, modules Espace Admin). Il reste visible sur les **pages de navigation des dossiers** — **accueil (« Espace dossiers »), Liste des dossiers, et page d'un dossier (HUB)** — et sur l'**Espace Client** (bouton flottant, car le client n'a pas d'écran accueil/liste).

**Comment :** retrait des boutons `admStaffEdit`/`admStaffDel` dans la liste des utilisateurs (`admCollabPanel`) ; `yada-addon206` : bouton flottant `#yada-logout` réservé à `sessionRole==='client'` ; `yada-addon213` : `place()` ne pose plus le bouton latéral (`#yada-logout-below`) ni la classe `has-side-logout` (retirés) ; les boutons en ligne restent sur accueil (`#adm-logout-btn`), Liste (`#adm-logout-inline`) et HUB/rubrique/sélection (`.ds-logout-btn`). `sw.js` yada-v42, badge v450, `version.json` 450.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Collaborateurs : boutons utilisateur = [Mot de passe, Désactiver] ; Déconnexion visible = accueil 1 / Liste 1 / HUB 1 / Client 1, et **modules = 0** : panneau Admin 0, module Cabinet 0 ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v450**.

---

## 🟢 MAJ précédente — Déconnexion : bouton déplacé à côté de « ← Retour aux dossiers » (plus flottant) sur les pages de dossier — v449
**Quoi :** sur les pages du parcours dossier (HUB, rubrique, dossier sélectionné), le bouton **« Déconnexion »** n'est plus **flottant** (haut-droite) : il est placé **à côté du bouton « ← Retour aux dossiers »** (dans la barre d'actions). Le bouton flottant se masque automatiquement sur ces écrans (un seul bouton visible).

**Comment :** ajout de `<button class="btn btn-ghost ds-logout-btn" onclick="admDoLogout()">Déconnexion</button>` après « Retour aux dossiers » dans `ecranHub`/`ecranRubrique`/`ecranSelUnique` ; `yada-addon206` `autreLogout()` détecte aussi `.ds-logout-btn` visible → le bouton flottant `#yada-logout` est masqué sur ces pages (pas de doublon). `sw.js` yada-v41, badge v449, `version.json` 449.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (HUB : barre d'actions = [« ← Retour aux dossiers », « Déconnexion »], Déconnexion à côté du bouton retour, bouton flottant masqué ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v449**.

---

## 🟢 MAJ précédente — Déconnexion garantie dans CHAQUE espace + « Retour » du dossier ramène à la page principale (après authentification) — v448
**Quoi :**
1. **Un bouton Déconnexion dans chaque espace** — correction : le bouton flottant était masqué à tort sur les écrans où la barre latérale existe dans le DOM mais **n'est pas visible** (accueil, Liste, HUB, Espace Admin, Client) → aucun bouton visible. Désormais chaque espace affiche **exactement un** bouton Déconnexion : barre latérale (Cabinet, sous « Outils »), en ligne (accueil / Liste des dossiers), ou **flottant** (Espace Admin, HUB/rubrique, Espace Client).
2. **« Retour » du dossier → page principale** — depuis la page d'un dossier (HUB / rubrique / dossier sélectionné), le bouton **« ← Retour aux dossiers »** ramène désormais à la **page principale** (l'écran juste après l'authentification : « Espace dossiers »), au lieu de la liste des dossiers.

**Comment :**
- `yada-addon213` : `place()` ne pose le bouton latéral (`#yada-logout-below`) et la classe `has-side-logout` **que si la barre latérale est réellement visible** (`sideVisible()` : `offsetParent!==null` + rect > 0) → sur les écrans sans barre latérale visible, la classe est retirée et le flottant réapparaît.
- `yada-addon206` : `loggedIn()` robuste (`window.sessionRole` **ou** `sessionStorage 'yada-role'`) ; `autreLogout()` masque le flottant quand un autre bouton Déconnexion visible existe (barre latérale / accueil / liste) → jamais de doublon ; `doLogout` privilégie `admDoLogout`.
- `dsAccueil()` réinitialise aussi `dsSel`/`dsRub`/`dsActiveRub` (retour à « Espace dossiers ») ; les 3 boutons « Retour aux dossiers » (`ecranHub`/`ecranRubrique`/`ecranSelUnique`) appellent `dsAccueil()`.
- `sw.js` yada-v40, badge v448, `version.json` 448.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Déconnexion visible = **1** dans chaque espace : Admin / accueil / HUB / Cabinet / Client ; « Retour » du HUB → `dsSel=null`, écran « Espace dossiers » (Liste Dossier/Créer/Importer) ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v448**.

---

## 🟢 MAJ précédente — Parcours d'entrée : « Changer de dossier » → « ← Retour aux dossiers » (flèche animée) + animation au clic d'un dossier + Déconnexion sur la Liste des dossiers — v447
**Quoi :**
1. **Bouton renommé + animé** — dans le HUB (et les vues rubrique / dossier sélectionné), le bouton **« Changer de dossier »** devient **« ← Retour aux dossiers »** avec une **flèche animée** (glisse au survol, appui `scale`).
2. **Animation au clic d'un dossier** — cliquer une ligne de dossier (Liste des dossiers) joue une **animation de sélection** (léger zoom + halo bleu) avant de naviguer vers le HUB.
3. **Déconnexion sur la Liste des dossiers** — un bouton **« Déconnexion »** est ajouté dans la barre d'actions de l'écran **« Liste des dossiers »** (à côté d'« Espace Admin » / « Importer »), en plus de l'écran d'accueil.

**Comment :** libellés `ds-back-btn` + `<span class="ds-back-arrow">←</span>` dans `ecranHub`/`ecranRubrique`/`ecranSelUnique` ; **`yada-addon214`** (`<style id="ds-anim-mod">` : `.ds-back-btn` flèche animée, `@keyframes dsPick` + `.ds-row-picked` ; écouteur `click` capture sur `.ds-row[data-id]` → classe d'animation puis `dsSelectionner(id)` après 240 ms). Injection Déconnexion (`#adm-logout-inline` → `admDoLogout`) dans la branche « Liste des dossiers » de l'override `ecranSelectionDossier` (addon210). `sw.js` yada-v39, badge v447, `version.json` 447.

**Validé :** `node --check` (207 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Liste : Espace Admin + **Déconnexion** présents ; clic d'un dossier → `.ds-row-picked` appliqué puis navigation HUB (`dsHub=true`) ; HUB : bouton **« Retour aux dossiers »** + `.ds-back-btn` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v447**.

---

## 🟢 MAJ précédente — Onglet Contrat repensé : plus d'aperçu en direct → formulaire seul (grille) + bouton « 👁 Aperçu du contrat » (fenêtre) — v446
**Quoi :** refonte de l'onglet **Contrat** (module Paie). L'**aperçu A4 en direct** (colonne de droite) est **supprimé** : l'onglet n'affiche plus que les **éléments à remplir** (formulaire, présenté en **grille** centrée, plus lisible). Un bouton **« 👁 Aperçu du contrat »** (à côté de Générer / Enregistrer) ouvre le **contrat dans une fenêtre (modale)** à la demande (contrat A4 complet, défilable, + bouton Imprimer / PDF). Résout aussi le problème d'aperçu (page A4 coupée / blanche) en le remplaçant par une vue à la demande.

**Comment — `yada-addon211` :** `tabContrat` réécrit (retrait de `.adm-ctr-wrap`/`.adm-ctr-prev`/`#adm-ctr-preview`/`#adm-ctr-pager` ; formulaire `.adm-ctr-side.ctr-grid` en 2 colonnes, en-têtes & actions & dépôt en `ctr-full` pleine largeur, `.adm-ctr-formwrap` centré `max-width:980px`) ; bouton **Aperçu** ajouté dans `ctrGenBlockHTML` ; `admCtrApercu()` (modale `#modal`/`#modal-c` = `contratHTML(s)` dans `.ctr-apercu-scroll` + Imprimer). `admCtrRenderPreview`/`admCtrTick` deviennent inertes (garde sur `#adm-ctr-preview` absent → no-op). `sw.js` yada-v38, badge v446, `version.json` 446.

**Validé :** `node --check` (206 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (onglet Contrat : `#adm-ctr-preview` & `.adm-ctr-wrap` **absents**, formulaire en grille, boutons « Aperçu du contrat » + « Générer le contrat » présents ; clic Aperçu → modale ouverte avec le contrat A4 (« CONTRAT DE TRAVAIL … », 5231 car.) + Imprimer ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v446**.

---

## 🟢 MAJ précédente — Admin : dossiers alphabétiques + barres de recherche (dossiers & salariés) + « Société exploitante » déplacée dans Paramétrage ; Déconnexion sous « Outils » (bouton flottant retiré) — v445
**Quoi :**
1. **Collaborateurs & accès** — la **liste des dossiers** (Dossiers & attribution) est en **ordre alphabétique** (français, accents/casse ignorés) ; **barre de recherche des dossiers** (filtre live) ; **barre de recherche des salariés** (nom / e-mail, filtre live). Les cartes restent repliables (v444).
2. **« Société exploitante » déplacée dans le module Paramétrage** — la carte (23 champs + « Enregistrer la société ») est **retirée de Collaborateurs & accès** et rendue dans **Paramétrage** (via `admSocCardHTML()`).
3. **Déconnexion sous « Outils »** — un bouton **« Déconnexion »** (rouge) est placé **juste sous le bouton « Outils »** de la barre latérale ; l'ancien **bouton de déconnexion flottant** (haut-droite `#yada-logout`) est **masqué** là où la barre latérale (avec Outils) est présente (l'accès Déconnexion reste garanti : latéral en Cabinet, flottant ailleurs).

**Comment :** `admDossiersPanel` (tri `localeCompare('fr')` + `data-nom` + `<input class="adm-search" oninput="admDossSearch">`) ; carte salariés (`data-q` + `admStaffSearch`) ; `admSocCardHTML()` (extraite, appelée dans `modParametrage`, retirée d'`admCollabPanel`). **`yada-addon213`** : `place()` insère `#yada-logout-below` juste après `.sf-toggle` (greffé `render` + intervalle 700 ms, jamais happé dans le menu Outils), classe `has-side-logout` sur `<body>` → CSS masque `#yada-logout`. `sw.js` yada-v37, badge v445, `version.json` 445.

**Validé :** `node --check` (206 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (collab : carte Société absente, barres de recherche salariés+dossiers présentes, dossiers triés alpha [alpha, mango, zebre], filtres OK ; Paramétrage : carte Société + « Enregistrer la société » ; Cabinet : « Déconnexion » juste après le bouton Outils, bouton flottant masqué ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v445**.

---

## 🟢 MAJ précédente — Cartes repliables (Admin « Collaborateurs & accès » + Espace Client) + Tiers client + Contrat : aperçu corrigé & boutons — v444
**Quoi :** lot d'améliorations UI Admin + Espace Client + Paie.
1. **Aperçu du contrat CORRIGÉ (page blanche)** — sur les fenêtres larges, l'aperçu A4 du contrat restait **blanc**. `admCtrRenderPreview()` réécrit : échelle **ajustée à la largeur, jamais agrandie (≤ 1)**, conteneur **défilable**, filet anti-page-vide (`pageBlocks`) + `try/catch` sur `contratBlocks`. L'A4 (794×1123) s'affiche désormais avec son texte.
2. **Onglet Contrat — boutons** : bouton **« Enregistrer »** ajouté à droite de **« Générer le contrat (PDF) »** ; bouton de dépôt en **bleu** renommé **« Contrat signé »** ; boutons **centrés** (`.ctr-gen-actions`).
3. **Onglet « Salariés & paie » → « Salariés »** : au clic sur un salarié, **plus de lien fiche de paie** (fiches gérées uniquement dans l'onglet Fiches de paie) ; affiche **informations salarié + montants (Salaire brut, Net à payer, Coût total employeur)** ; bouton **« Générer la fiche de paie » remplacé par « Enregistrer »**.
4. **Espace Admin — Collaborateurs & accès : cartes repliables** (fermées par défaut, clic pour ouvrir) + **liste des dossiers compacte / minimaliste**.
5. **Espace Admin — entrée** : bouton **« 🛡 Espace Admin » placé AVANT « Liste Dossier »**, même dimension (`btn btn-gold`).
6. **Espace Client — cartes repliables** : toutes les cartes **fermées** par défaut (clic pour ouvrir), sauf **« Déposer une facture »** qui reste ouverte/accessible ; module **Fournisseurs** : **« Suivi & détail » au-dessus du « Dépôt »**.
7. **Espace Client — module Tiers** rendu accessible (ajout à `CLIENT_PAGES` + onglet « 👥 Tiers » dans la barre mobile) + **design/cadrage/effets** client (cadres arrondis, survol léger, en-têtes de colonnes discrets).

**Comment :** `yada-addon212` (100% additif) — `admFoldAll`/`admFoldOne` (wrap `admCollabPanel` en `<details>`, état via `admFoldToggle`) + CSS dossiers compacts ; `cliFoldPass` (client : chaque `.card` à `<h2>` repliée sauf dépôt, état `__cliOpen`) greffé sur `render`. Éditions : `admCtrRenderPreview` (robuste), `ctrGenBlockHTML` + `admCtrEnregistrer`, `contratSection` (bouton bleu « Contrat signé », centré), `tabSalaries` (renommage, KPIs, `admPaieEnregistrer`, retrait des liens fiche), `admPaieModule` (`tb('sal','Salariés')`), `pageAchatsClient` (colonnes inversées), `CLIENT_PAGES`+`rebuildTabbar` (Tiers), override du bouton d'entrée Admin. `sw.js` yada-v36, badge v444, `version.json` 444.

**Validé :** `node --check` (205 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (aperçu contrat : A4 794×1123 visible + titre ; boutons Générer+Enregistrer centrés, dépôt bleu « Contrat signé » ; Salariés : renommé, KPIs Brut/Net/Coût, Enregistrer, plus de lien fiche ; entrée Admin avant Liste Dossier même classe ; Admin collab : 4 `<details>` fermées + dossiers compacts ; client : 3 cartes repliées, dépôt ouvert, autres fermées, « Suivi & détail » au-dessus de « Dépôt », onglet Tiers ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v444**.

---

## 🟢 MAJ précédente — Dépôt du contrat signé déplacé dans l'onglet Contrat (retiré de Salariés & paie) — v443
**Quoi :** dans le module Paie (Espace Admin), le **dépôt du contrat signé & tamponné** (section « Déposer le contrat signé & tamponné » → statut Non déposé / Déposé — à vérifier / « Vérifier & admettre ») n'apparaît plus dans l'onglet **Salariés & paie** : il est désormais **uniquement dans l'onglet Contrat** (sous le formulaire, après le bloc de génération PDF). L'onglet Salariés & paie ne conserve donc que les informations de paie et le bouton « Générer la fiche de paie ».

**Comment — `yada-addon211` :** `contratSection(s)` retiré de `tabSalaries` ; ajouté dans `tabContrat` (bandeau « Dépôt du contrat signé & tamponné » après `#adm-ctr-gen`). `sw.js` `yada-v36`, badge v443, `version.json` 443.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Salariés & paie : « Déposer/Dépôt du contrat signé » **absent** ; Contrat : section de dépôt **présente** + `input[type=file]` `admContratDepose` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v443**.

---

## 🟢 MAJ précédente — Salariés & paie : aperçu de la fiche de paie (en direct) retiré — v442
**Quoi :** dans l'onglet **Salariés & paie** (module Paie, Espace Admin), l'**aperçu de la fiche de paie en direct** (bloc « Aperçu de la fiche de paie (mis à jour en direct) » sous les champs de rémunération) est **retiré**. Le bouton **« Générer la fiche de paie »** reste et ouvre toujours le bulletin dans une page (modale).

**Comment — `yada-addon211` :** suppression du libellé `.adm-soc-gh` « Aperçu de la fiche de paie » et du conteneur `#adm-paie-live-wrap`/`#adm-paie-live` dans `tabSalaries`. `admPaieLiveRender()` (et son hook de rendu) restent définis mais **sans effet** (garde `#adm-paie-live` absent → no-op). `sw.js` `yada-v35`, badge v442, `version.json` 442.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (onglet Salariés & paie : `#adm-paie-live-wrap`/`#adm-paie-live` absents, libellé « Aperçu de la fiche de paie » retiré, bouton « Générer la fiche de paie » présent → ouvre la modale « Fiche de paie — … » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v442**.

---

## 🟢 MAJ précédente — Contrat : aperçu en direct + génération PDF conditionnée (toutes les conditions remplies) + visible dans la liste ; fiche de paie = même bulletin (bouton = aperçu du bas), affichée une fois le mois saisi — v441
**Quoi :** module Paie (Espace Admin).
1. **Aperçu du contrat en direct + mise à jour en direct** — l'onglet **Contrat** affiche le contrat A4 à droite et le **met à jour en direct** à chaque modification du formulaire (déjà en place, fiabilisé v440).
2. **Génération du contrat uniquement en PDF, sous conditions** — le bouton **« Générer le contrat (PDF) »** n'est actif que lorsque **toutes les conditions du contrat sont remplies** (salarié : nom, prénom, adresse, CP, ville, date & lieu & pays de naissance, nationalité, **N° de sécurité sociale** ; contrat : type, date de début, poste, statut, coefficient, période d'essai, convention, durée hebdo, **salaire brut** ; CDD : date de fin + motif ; société employeur : dénomination, adresse, CP, ville, SIRET). Tant qu'il manque un élément, un **bandeau rouge liste les manques** et le bouton est **désactivé** ; une fois tout rempli, bandeau vert + bouton actif. Le **téléchargement .doc est retiré** (PDF uniquement). Champ **N° de sécurité sociale** ajouté au formulaire du contrat.
3. **Contrat visible dans la liste des salariés** — une fois généré, le salarié affiche **« 📄 Contrat PDF »** (+ date de génération) dans la liste (onglet Salariés & paie), cliquable pour rouvrir/imprimer le contrat.
4. **Fiche de paie = même bulletin + affichée une fois le mois saisi** — le bouton **« Générer la fiche de paie »** ouvre **exactement le bulletin de l'aperçu du bas** (même période `periode()`), dans une **page (modale)**. La fiche n'apparaît dans l'onglet **Fiches de paie** qu'**une fois le mois saisi** (brut > 0 pour la période).

**Comment — `yada-addon211` :** `ctrManques(s)` (conditions requises) + `ctrGenBlockHTML(s)` (bandeau + bouton, mis à jour en direct dans `admCtrField` sans perte de focus via `#adm-ctr-gen`) ; `admCtrGenerer()` (valide puis PDF, pose `s.contratGenere`/`s.contratGenereDate`) ; `admCtrImprimer(id)` accepte un id ; bouton `.doc` supprimé ; lien « 📄 Contrat PDF » dans `tabSalaries`. `admPaieBulletin(id,per)` : `perFiche=per||periode()`, bulletin ouvert = `bulletinHTML(s,perFiche)` (= aperçu du bas), modale montrée via `#modal`/`#modal-c`, enregistrement `s.fiches[perFiche]` **seulement si brut>0**. `sw.js` `yada-v34`, badge v441, `version.json` 441.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (contrat DOUNIA/BAHRI : incomplet → bandeau rouge + bouton désactivé, aperçu en direct maj « Chef de Cuisine » ; complet → bandeau vert + bouton actif → **généré** (flag + date) → **« 📄 Contrat PDF » dans la liste** ; fiche : bouton ouvre la modale « Fiche de paie » = aperçu du bas ; brut>0 → enregistrée (déc. 2020), brut=0 → **non enregistrée** ; onglet Fiches de paie = « décembre 2020 » seul ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v441**.

---

## 🟢 MAJ précédente — Aperçu du contrat toujours visible (cache purgé + rendu robuste) + fiche de paie générée visible dans l'onglet « Fiches de paie » — v440
**Quoi :** deux correctifs du module Paie (Espace Admin).
1. **Aperçu du contrat blanc → toujours affiché.** Sur certains appareils, l'aperçu A4 du contrat (onglet **Contrat**) apparaissait **entièrement blanc**. (a) **Cache purgé** (service worker `yada-v32 → yada-v33`) pour supprimer tout ancien contrat en cache et servir la dernière version. (b) **Rendu robuste** : `admCtrRenderPreview()` ne s'effondre plus quand la mise en page n'est pas encore prête (garde-fous `sideH>120`, `availW>60`, `scale>0.15` sinon repli `0.6`) et le rendu est **re-déclenché après mise en page** (rAF + `setTimeout` 60 ms / 220 ms) → l'A4 s'affiche même au 1er rendu / changement d'onglet.
2. **Fiche de paie générée dans « Salariés & paie » → visible dans « Fiches de paie ».** Générer une fiche via **« Générer la fiche de paie »** enregistre désormais la **période** sur le salarié (`s.fiches[période]`), et l'onglet **Fiches de paie** liste **toutes** les périodes ayant un salaire **OU** une fiche générée → le bulletin apparaît immédiatement (bouton mois/année, PDF téléchargeable).

**Comment — `yada-addon211` :** `perAvecSalaire(s)` = union des périodes `brut>0` **et** de `s.fiches` ; `admPaieBulletin(id,per)` marque `s.fiches[per||periode()]=true` + `save()` ; hooks de rendu du contrat renforcés (double `setTimeout` post-`render`) ; minima de mesure dans `admCtrRenderPreview`. `sw.js` `CACHE='yada-v33'` ; badge `#yada-ver` → v440 ; `version.json` → 440.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (aperçu contrat : `#adm-ctr-preview` rempli — A4 + texte « CONTRAT DE TRAVAIL A DUREE INDETERMINEE » ; génération d'une fiche en oct. 2024 → `s.fiches['2024-10']` → onglet Fiches de paie affiche le bouton « octobre 2024 » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v440**.

---

## 🟢 MAJ précédente — Contrat CDI/CDD : reproduction FIDÈLE du modèle Word (texte mot-à-mot, champs de fusion, mise en page document) — v439
**Quoi :** le **contrat de travail (CDI et CDD)** reproduit désormais **exactement le modèle Word de publipostage** : **texte mot-à-mot** et **emplacements des champs de fusion** repris tels quels (société : dénomination, adresse, RCS Cedex, SIRET, code APE, URSSAF région + n°, représentant « – Gérant(e) » ; salarié : « Titre Prénom NOM », adresse, « Né le … à … en … », nationalité, N° SS ; article 1 « en qualité de <métier> <statut/coeff> à compter du … [jusqu'au …] », article 2 « convention collective - <nom> », article 3 période d'essai en **semaines** (CDI) / **jours** (CDD) « et peut être prolongée », article 6 durée + **horaires**, article 7 « salaire mensuel brut de … payable le 1er jour du mois », article 8 congés « - <convention> -, 30 jours ouvrables … », article 10 « soit 2 mois », article 11 « Clause de non concurrence », « Fait à … le … », **note (1) motif CDD**, bloc « Tampon + signature »). **Mise en page type document** (police serif Times, texte **justifié**, titre centré souligné, en-têtes d'articles en gras). Aperçu A4 en direct + pagination + téléchargement (.doc) & impression conservés.

**Comment — `yada-addon211` :** `contratBlocks(s)` réécrit d'après le publipostage Word (`Titre Prénom Nom`, `Statut/Coeff`, `URSSAF_Région`/`N_Urssaf`, `Horaires`, `Motif_CDD`…) ; nouveaux champs du formulaire (Position/Coefficient `coeff`, Horaires `horaires`) ; `.ctr-a4` restylé en document (`font:Times`, `text-align:justify`, titre souligné). CDD → titre « A DUREE DETERMINEE (1) » + article 1 « jusqu'au » + note motif.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + **capture Playwright du contrat CDD** (AZR BAT/YIGIT : titre, RCS Cedex + URSSAF + Gérant(e), salarié Né le … en TURQUIE, 11 articles conformes, période d'essai 14 jours, horaires, « payable le 1er jour du mois », « soit 2 mois », Clause de non concurrence, note (1) motif, Tampon + signature ; justifié serif ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v439**.

---

## 🟢 MAJ précédente — Fiche de paie : reproduction AU POINT PRÈS du modèle (mise en page, cadres, colonnes, couleurs) + aperçu PDF en direct pendant la saisie — v438
**Quoi :** la fiche de paie est désormais **reproduite exactement comme le modèle PDF** (pas seulement le contenu) : **mise en page, cadres, colonnes, en-têtes gris, positions** identiques. Le bulletin est rendu en **A4 absolu positionné au point PDF** (page 595×842 pt → 210×297 mm) : cadre complet, ligne d'en-tête grise « Rubriques · Base · Taux salarial · Montant salarial · Mt patronal », séparateurs de colonnes, **boîte CP N-1/CP N**, **encarts HEURES & CUMULS à droite** (SMIC, Plafond Sécu, Brut, Net imposable, Net payé, Allègement, Cotis. employeur), bandeau **MONTANT NET SOCIAL / NET À PAYER AVANT IMPÔT / NET À PAYER AU SALARIÉ**, pied service-public.fr. **Aperçu PDF en direct pendant la saisie** (onglet Salariés & paie : le bulletin se met à jour sous les champs). Valable à l'écran (modale), en aperçu direct **et** à l'impression / PDF (A4 exact).

**Comment — `yada-addon211` :** `bulletinHTML(s,per)` réécrit en **positionnement absolu** (helpers `T`/`TR`/`HL`/`VL`/`GR`, `BPK=0.352778 mm/pt`, coordonnées extraites du PDF modèle) rendu dans `.bp-a4` (classes namespacées `bpx-t/bpx-b/bpx-r/bpx-l/bpx-g` pour éviter les collisions CSS) ; taux patronaux **calibrés sur le modèle** (retraite déplafonnée 2,11 %, chômage 4,00 %, autres 0,965 %) → net imposable **837,22 €**, net à payer **808,13 €** identiques ; `admPaieLiveRender()` (aperçu direct, greffé sur `render`), modale et `#print-area` mis à l'échelle.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + **capture Playwright du bulletin** (cadre + colonnes + en-tête gris + CP + HEURES/CUMULS + nets, net imposable 837,22 · net à payer 808,13, service-public.fr) + aperçu direct présent + 0 pageerror + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v438**.

---

## 🟢 MAJ précédente — Fiche de paie : reproduction fidèle du bulletin de salaire (modèle ALR CONSEIL) à chaque génération — v437
**Quoi :** la **génération d'une fiche de paie** produit désormais un **bulletin de salaire reproduisant fidèlement le modèle fourni** (bulletin clarifié) : en-tête **société** (dénomination, adresse, Siret, Code NAF) + **période** (Période, Paiement le, Du/Au) ; bloc **salarié** (M./Mme NOM Prénom, adresse, matricule, N° Sécu, entrée, emploi, statut, convention) + **congés CP N-1/CP N** ; **tableau des rubriques** (Rubriques · Base · Taux salarial · Montant salarial · Mt patronal) groupé **Q100 SANTÉ · Q200 AT · Q300 RETRAITE · Q400 FAMILLE · Q500 CHÔMAGE · Q600 AUTRES · Q800 CSG déductible · allègement · Q801 CSG non déductible** ; **TOTAL DES RETENUES**, **NET IMPOSABLE**, **NET À PAYER AVANT IMPÔT**, **impôt (PAS)**, **NET À PAYER AU SALARIÉ**, **MONTANT NET SOCIAL**, **coût employeur** ; **cumuls annuels** + **pied** (SMIC horaire, mode de paiement, convention, mentions légales service-public.fr). Valable pour l'aperçu (modale) **et** l'impression / PDF.

**Comment — `yada-addon211` :** `paieDetail(s,per)` (taux **calibrés sur le modèle** : retraite 6,90 % + 0,40 % + 4,01 % salariales, CSG déductible 6,80 % sur 98,25 %, CSG/CRDS non déd. 2,90 %, patronales santé/AT/retraite/famille/chômage/AGS/autres + **allègement général type Fillon**) → net imposable & net à payer **identiques au modèle** (brut 1020,88 → net imposable **837,22 €**, net à payer **808,13 €**) ; `paieCalcOf` délègue à `paieDetail` (KPI/DSN cohérents) ; `bulletinHTML(s,per)` réécrit (`.bp-head/.bp-head2/.bp-t/.bp-net/.bp-cum/.bp-foot`). `<style>` mis à jour.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (bulletin ALR CONSEIL : titre, société+Siret+NAF, salarié+N°Sécu+emploi, rubriques SANTÉ/RETRAITE 6.9000·4.0100/CHÔMAGE+AGS/CSG 6.8000/allègement, **net imposable 837,22 · net à payer 808,13**, net social, pied service-public.fr ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v437**.

---

## 🟢 MAJ précédente — Contrat : aperçu A4 fidèle & paginé (hauteur = barre latérale, bouton page suivante) + listes de salariés ouvertes & défilables — v436
**Quoi :** refonte de l'aperçu du contrat dans le module Paie.
1. **Reproduction fidèle du modèle** — le contrat reprend la **disposition et le texte** du modèle (11 articles complets) ; les **informations variables** (société, salarié, poste, dates, salaire, convention, lieu, jours de paiement…) sont **retirées** puis **remplacées via la barre latérale** (formulaire à gauche).
2. **Aperçu A4 paginé** — l'aperçu est **toujours au format A4 (210×297 mm)** ; si le contrat dépasse une page, un **bouton « Page suivante ›/‹ Page précédente »** (avec « Page X / N ») permet de naviguer.
3. **Hauteur = barre latérale** — la zone d'aperçu prend **exactement la hauteur du formulaire** (barre latérale), l'A4 étant **mis à l'échelle** (transform) pour tenir sans jamais perdre le ratio A4.
4. **Listes de salariés ouvertes & défilables** — la sélection d'un salarié (onglet Contrat et onglet Fiches de paie, avant le bilan) se fait via une **liste ouverte défilable** (avatars + nom + contrat) au lieu d'un menu déroulant.

**Comment — `yada-addon211` (éditions) :** `contratBlocks(s)` (blocs insécables, texte fidèle au modèle) ; `contratHTML(s)` = doc complet (impression/.doc) ; `admCtrRenderPreview()` mesure les blocs (page hors-écran `.ctr-a4` à `794×1123`), les **répartit en pages A4** (`contentH`), affiche la page active (`window.__admCtrPage`) mise à l'échelle `min(sideH/A4H, availW/A4W)` dans `.adm-ctr-prev` (hauteur = `.adm-ctr-side`), et remplit `#adm-ctr-pager` (‹/›) ; re-render via hook `render` (rAF) + `resize`. `salOpenList(sel,fn)` (`.adm-sal-list` défilable → `admCtrSelect`/`admFicheSel`). `<style>` `.ctr-a4`, `.adm-ctr-prev`, `.adm-sal-list/.adm-sal-row`.

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (liste ouverte 2 salariés ; aperçu A4 présent `794×1123` ; **hauteur aperçu = barre latérale (1516=1516)** ; pager « Page 1 / 3 » → page 2 OK ; onglet Fiches : liste ouverte ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v436**.

---

## 🟢 MAJ précédente — Module Paie : contrat CDD + dépôt du contrat signé → admission → fiches de paie par mois (liste salariés · PDF · coût complet) — v435
**Quoi :** flux complet contrat → paie dans le module Paie.
1. **Contrat CDD** — l'onglet Contrat propose aussi le **CDD** (d'après le modèle fourni) : champs **Date de fin** et **Motif du CDD** (affichés quand le type = CDD) ; l'article 1 devient « à compter du … **jusqu'au** … pour une durée déterminée » + **note de bas de page (1) motif**. Le CDI reste inchangé.
2. **Salariés & paie — dépôt & admission du contrat** — sur la fiche d'un salarié : **dépôt du contrat signé & tamponné** (fichier PDF/image, consultable), statut **Non déposé → Déposé (à vérifier) → Admis ✓**. Le bouton **« Vérifier & admettre »** valide le contrat et **crée automatiquement une fiche de paie** pour le mois de début (rémunération reprise). Colonne « Contrat signé » dans la liste.
3. **Fiches de paie — liste des salariés → mois/années** — l'onglet devient une **liste de salariés** ; au clic sur un salarié : **boutons des mois/années** où un salaire a été perçu (fiche de paie **PDF** téléchargeable par mois), plus un **aperçu du coût** : **brut versé**, **net versé**, **cotisations salariales & patronales**, **coût total employeur** (cumuls).

**Comment — `yada-addon211` (éditions) :** `salPerOf(s,per)`/`paieCalcOf(s,per)` + `bulletinHTML(s,per)` (fiche par période) ; `perAvecSalaire(s)` (périodes brut>0) ; `contratSection(s)` + `admContratDepose` (FileReader→dataURL sur `s.contratSigne`), `admContratVoir`, `admContratAdmettre` (statut `admis` + `salPerOf(débutMois)` amorcé) ; `tabBulletins` réécrit (liste → `admFicheSel` → boutons `.adm-fiche-mois` = `admPaieBulletin(id,per)` + KPI coût) ; `contratHTML` gère CDD (dateSortie/motifCDD) ; champs CDD dans le formulaire Contrat (rendu conditionnel, `admCtrField` full-render sur changement de type).

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (CDD : champs date fin/motif + « durée déterminée » + note motif ; dépôt → « Vérifier & admettre » → statut admis + fiche du mois de début créée (brut 1846,77 en oct. 2024) ; Fiches : liste → « Voir les fiches » → boutons mois (octobre 2024) + « Charges complètes » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v435**.

---

## 🟢 MAJ précédente — Module Paie : onglet CONTRAT (formulaire à gauche + contrat A4 à droite en direct, téléchargeable .doc & imprimable) — v434
**Quoi :** nouvel **onglet « Contrat »** dans le module Paie (Espace Admin). On y **compose le contrat de travail d'un salarié** : **barre latérale (formulaire) à gauche**, **aperçu A4 du contrat à droite mis à jour en direct**. Champs demandés : **type de contrat**, **date de commencement**, **métier/poste**, **Cadre / Non cadre**, **période d'essai (jours)**, **convention collective**, informations **salarié** (Nom, Prénom, Adresse + CP + Ville, Date de naissance, Ville de naissance, Pays de naissance, Nationalité, NIR), **salaire brut** → **net calculé automatiquement** (case juste après), **durée hebdomadaire**, **jours de paiement** (du … au … du mois), **lieu de travail**. Le contrat reprend la trame d'un **CDI** (11 articles) avec l'employeur (société exploitante). Une fois composé : **Télécharger (.doc)** et **Imprimer / PDF**.

**Comment — `yada-addon211` (éditions) :** onglet `contrat` (`tabContrat`) = layout `.adm-ctr-wrap` (form `.adm-ctr-side` + aperçu `#adm-ctr-preview`) ; `contratHTML(s)` (doc-page reprenant la trame CDI, employeur = `db.cabinet.societe`, salarié = `db.cabinet.staff[]` + rémunération `s.paie[période]`) ; `admCtrField` (saisie → sauvegarde + `admCtrRefreshHTML` du seul aperçu → pas de perte de focus, net recalculé `brut×0,78`) ; `admCtrTelecharger` (Blob `application/msword` → `.doc`) + `admCtrImprimer` (`#print-area` → `window.print`). Nouveaux champs salarié : `poste`, `essaiJours`, `conventionNom`, `paysNaissance`, `dureeHebdo`, `payDe`/`payA`, `lieuTravail`. `<style>` `.adm-ctr-wrap/.adm-ctr-prev/.ctr-page` (responsive 1 colonne < 900px).

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (onglet Contrat ; sélection salarié → split form+aperçu ; saisie poste/convention/brut → aperçu à jour, net auto 1539,45 → 1200,77 ; titre « CONTRAT DE TRAVAIL », nom, brut, convention repris ; boutons Télécharger/Imprimer présents ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v434**.

---

## 🟢 MAJ précédente — Espace Admin : nouveau module PAIE complet (infos de paie de tous les salariés · critères DSN · transmission DSN aux organismes · fiches de paie) — v433
**Quoi :** ajout d'un **module « Paie »** dans l'Espace Admin (5ᵉ tuile de la liste de modules) pour la **responsable de paie** :
1. **Salariés & paie** — remplir les **informations de paie de TOUS les salariés** : identité (NIR, date/lieu de naissance, sexe, nationalité, adresse), contrat (matricule, dates entrée/sortie, nature du contrat, code **PCS-ESE**, statut cadre/non-cadre, temps de travail, quotité, IDCC) et **rémunération par période** (brut, primes, heures, taux PAS). KPI brut / net imposable / net à payer / coût employeur par salarié.
2. **DSN** — **tous les critères d'une DSN valide** contrôlés (société : SIREN/SIRET/APE/adresse ; point de dépôt Net-Entreprises ; par salarié : nom/prénom/NIR/naissance/entrée/contrat/PCS-ESE/rémunération). **Checklist ✓/✗** avec le détail des champs manquants ; **génération du fichier DSN** (représentatif de la norme **NEODeS**, blocs S10/S20/S21, téléchargeable `.dsn`) ; **transmission aux organismes** (dépôt → contrôle de conformité → transmise → accusé de réception (ARL) → traitée, + branche refusée) ; identifiants **organismes** (URSSAF, AGIRC-ARRCO, prévoyance).
3. **Fiches de paie** — **génération de bulletins complets** (employeur, salarié, brut, cotisations salariales & patronales, net imposable, PAS, net à payer, coût employeur), à l'écran (modale) **et à l'impression / PDF** (`.doc-page`).

**Comment :**
- **`yada-addon208` (édition)** : tuile/dispatch `paie` (version simple, supplantée par la complète) ; `<style>` `.adm-paie-in`.
- **`yada-addon210`** : 5ᵉ tuile `['paie','▥','Paie',…]` dans le hub + stagger d'animation étendu au 5ᵉ élément (timeout retour 1020 ms).
- **`yada-addon211` (100% additif)** : override de `window.admModuleContent` pour `paie` → `admPaieModule()` (onglets Salariés & paie / Fiches de paie / DSN) ; données `db.cabinet.paie` (organismes, dépôt, envois DSN par période) + champs par salarié sur `db.cabinet.staff` (identité/contrat) et `s.paie[période]` (rémunération) ; `paieCalc` (cotisations ~22 % sal. / 42 % pat., net imposable, PAS, net à payer, coût) ; `dsnValide()` (checklist), `dsnText()` (fichier NEODeS représentatif), cycle `admDsnDeposer/Avancer/Refuser/Reset`, `bulletinHTML()` + `admPaieBulletin/Imprimer`. `<style id="adm-paie-full-mod">`.

**Limites :** taux de cotisations **indicatifs** (modèle simplifié) ; fichier DSN **représentatif** de NEODeS (à fiabiliser via DSN-val avant transmission réelle) ; la transmission est un **workflow** interne (dépôt réel via Net-Entreprises / API DSN à brancher).

**Validé :** `node --check` (204 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (module Paie : 3 onglets ; saisie des critères DSN d'un salarié ; **DSN valide ✓** après complétion société+dépôt ; dépôt → « Déposée » → « Contrôle de conformité » ; bulletin = Net à payer + coût employeur + nom ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v433**.

---

## 🟢 MAJ précédente — Cache vidé (service worker `yada-v31 → yada-v32`) pour purger les anciens designs — v432
**Quoi :** **aucun changement fonctionnel** — **invalidation du cache** pour supprimer tout **ancien design en cache** (appareils / PWA qui gardaient une version antérieure et affichaient d'anciens écrans). Bump du cache du service worker (`yada-v31 → yada-v32`) → au prochain chargement, l'`activate` du SW **purge tous les caches ≠ CACHE** et le service worker « réseau d'abord » sert **la dernière version** ; l'auto-mise à jour (addon103) détecte `version.json` (432) et recharge. Badge → **v432**.

**Comment :** `sw.js` `CACHE 'yada-v31' → 'yada-v32'` (l'`activate` supprime les caches ≠ CACHE) ; badge `#yada-ver` → v432 ; `version.json` → 432. Aucune logique/écriture/UI modifiée.

**Validé :** `node --check` (203 scripts, 0 erreur ; `sw.js` OK) + brace CSS (2010/2010) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v432**.

---

## 🟢 MAJ précédente — Animations Admin plus fluides + écran de connexion : textes sous le logo retirés + logo YADA agrandi — v431
**Quoi :** deux finitions.
1. **Animations de l'Espace Admin plus fluides** — la liste de modules (entrée blur→net et sortie inverse) utilise des **courbes d'accélération plus douces** (entrée `cubic-bezier(.16,1,.3,1)`, sortie `cubic-bezier(.7,0,.84,0)`), un **enchaînement resserré** (stagger .11/.22/.33 s en entrée, .09/.18/.27 s en sortie), des **hints GPU** (`will-change`, `translate3d`, `backface-visibility`) pour éviter les à-coups, et un léger **relèvement au survol** des tuiles. Durées ajustées (entrée .78s, sortie .6s).
2. **Écran de connexion épuré + logo agrandi** — les **textes sous le logo** (« La pré-comptabilité, simplifiée. » + les 3 puces Facturation / Écritures / Espace client) sont **supprimés** ; le **logo YADA est agrandi** (lockup `yadaLockHTML` px 42 → 72 : icône 72 px, « YADA » ~43 px, baseline PAIE · COMPTA · DSN).

**Comment :** `yada-addon210` (`<style id="adm-entry-mod">` : keyframes `admHubIn`/`admHubOut` easing + `will-change` + `translate3d`, stagger resserré ; `admHubBack` timeout 920 ms) ; `secHero()` ne rend plus `.sec-tagline`/`.sec-points` ; `yada-addon195` (sweep) : lockup de `#sec-lock .sec-logo` en **72 px** (au lieu de 42).

**Validé :** `node --check` (203 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (connexion : plus de `.sec-tagline`/`.sec-points`, lockup présent, icône 72 px + « YADA » 43 px ; anim CSS `cubic-bezier(.16,1,.3,1)` + `will-change` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v431**.

---

## 🟢 MAJ précédente — Espace Admin : ancien bouton flottant « Espace Admin » (barre supérieure) retiré aussi de l'écran « Liste des dossiers » — v430
**Quoi :** sur l'écran **« Liste des dossiers »** (Admin), l'**ancien bouton flottant « Espace Admin »** (barre supérieure haut-droite, `.adm-topbar` d'addon202) est **retiré** — il était en doublon du bouton dédié (à côté d'« Importer des données (JSON) »). En v428/v429 il n'était retiré que sur l'accueil.

**Comment — `yada-addon210` (1 édition) :** le retrait de `.adm-topbar` (`h.replace(/<div class="adm-topbar">[\s\S]*?<\/div>/,'')`) est désormais fait **avant** les branches, pour **tous les écrans admin** (accueil ET liste). Le bouton dédié reste : sous « Liste Dossier » (accueil, `#adm-enter-row`) et à côté d'« Importer » (liste, `#adm-enter-inline`).

**Validé :** `node --check` (203 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (liste : plus de `.adm-topbar`, bouton `#adm-enter-inline` conservé ; accueil : plus de `.adm-topbar`, `#adm-enter-row` conservé ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v430**.

---

## 🟢 MAJ précédente — Espace Admin : flou haut→bas (plus lent) + animation inverse au retour + module en pleine largeur (sans barre latérale) + bouton Espace Admin près d'Importer sur la Liste — v429
**Quoi :** quatre ajustements de l'Espace Admin (parcours d'entrée).
1. **Flou de haut en bas, légèrement plus lent** — la liste de modules apparaît « du flou en net » **de haut en bas** (les tuiles descendent depuis le haut, `translateY(-14px)`), avec un **enchaînement plus marqué** (délais 0 / .16 / .32 / .48 s) et une **durée un peu ralentie** (`.5s → .72s`).
2. **Animation INVERSE au « ← Retour aux dossiers »** (depuis la liste de modules) — les tuiles repartent **du net vers le flou, de bas en haut** (keyframe `admHubOut`, stagger inversé), puis retour à l'accueil.
3. **Module Admin en PLEINE LARGEUR (sans barre latérale)** — cliquer une tuile n'affiche plus la barre latérale des modules : le contenu occupe toute la largeur (`.adm-solo`), avec un unique bouton **« ← Retour aux modules »** en haut (retour à la liste de modules) ; depuis la liste de modules, **« ← Retour aux dossiers »** ramène aux dossiers (navigation à deux niveaux).
4. **Bouton « 🛡 Espace Admin » à côté d'« Importer des données (JSON) » sur l'écran « Liste des dossiers »** (en plus de sa présence sous « Liste Dossier » sur l'accueil).

**Comment — `yada-addon210` (éditions) :** keyframe `admHubIn` (blur 14px→0, translateY −14px→0) `.72s` + stagger 0/.16/.32/.48 ; `admHubBack()` ajoute `.adm-hub-out` (keyframe `admHubOut`, stagger inversé) puis `admShowToggle(false)` après 1250 ms ; interception `admShow && admModule` → rendu `.adm-solo` (barre `← Retour aux modules` = `admSetModule(null)` + `#adm-content` = `admModuleContent()`), **sans** la `.adm-shell`/`.adm-side` d'addon202 ; le hub garde `← Retour aux dossiers` ; branche « Liste des dossiers » (Importer présent, pas de bouton Liste Dossier) → injection `#adm-enter-inline` après Importer. `prefers-reduced-motion` respecté.

**Validé :** `node --check` (203 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (liste : bouton Espace Admin après Importer ; module choisi : `.adm-solo` **sans** `.adm-side`/`.adm-shell` + `‹ Modules` ; hub : 4 tuiles + `admHubBack` ; CSS `admHubOut` + durée `.72s` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v429**.

---

## 🟢 MAJ précédente — Bandeau d'entrée au nom du collaborateur connecté + Espace Admin en liste de modules (blur→net) + Déconnexion près d'Importer — v428
**Quoi :** trois ajustements du parcours d'entrée.
1. **Bandeau d'accueil au nom du collaborateur CONNECTÉ** — le bandeau haut-droite de l'écran « Espace dossiers » (`.login-cab`) affiche désormais le **nom lié à l'identifiant de connexion** (au lieu du nom fixe du cabinet) : un **salarié** → son nom complet + « Collaborateur » ; l'**Admin** → « Admin (superviseur) » ; sinon le collaborateur/rôle du cabinet.
2. **Bouton « 🛡 Espace Admin » déplacé SOUS « Liste Dossier »** (rangée dédiée, au lieu de la barre supérieure). Un clic ouvre d'abord une **LISTE DE MODULES** (tuiles Collaborateurs & accès · Paramétrage · Documentation · Pilotages) qui **apparaissent du flou en net** (blur→net), façon liste des modules d'un dossier ; choisir une tuile entre dans le module (barre latérale Admin + contenu, inchangés).
3. **Bouton « Déconnexion » ajouté à DROITE de « Importer des données (JSON) »** sur l'écran d'accueil (le bouton flottant `#yada-logout` est masqué sur cet écran, via `body:has(#adm-logout-btn)`).

**Comment :**
- **`loginHead()` (addon189, édition)** : calcule le nom/rôle connecté (`window.staffId` → salarié dans `db.cabinet.staff` ; `window.sessionRole==='admin'` → Admin (superviseur) ; sinon `c.collaborateur · c.role`).
- **`yada-addon210` (100% additif, override le plus externe de `ecranSelectionDossier`)** : si `sessionRole==='admin' && admShow && !admModule` → `admHubHTML()` (tuiles `.adm-hub-tile` + `.adm-hub-in` = keyframe `admHubIn` blur(14px)→0) ; sinon post-traite l'accueil (retrait de l'ancien `.adm-topbar`, injection Déconnexion après Importer, injection `#adm-enter-row` avec le bouton Espace Admin sous la rangée). `admShowToggle(v)` remet `admModule=null` à l'ouverture (liste de modules à chaque entrée). `admDoLogout` = `secDeconnexion`/`secVerrouiller`. `<style id="adm-entry-mod">`.

**Validé :** `node --check` (203 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (bandeau : cabinet « Adil-emin Yildiz · Collaborateur », salarié « Sarah Durand · Collaborateur », admin « Adil-emin Yildiz · Admin (superviseur) » ; accueil admin : bouton Espace Admin sous les actions (plus de topbar) + Déconnexion après Importer ; clic → hub 4 tuiles `.adm-hub-in` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v428**.

---

## 🟢 MAJ précédente — Nom du collaborateur connecté affiché + signature des éditions avec ce nom — v427
**Quoi :** deux ajouts liés aux accès des salariés.
1. **Nom du collaborateur connecté** — une puce **« Connecté : <nom> »** s'affiche **sous le bouton Déconnexion** (haut-droite) et **change à chaque connexion** : pour un salarié, son **nom complet** ; sinon le compte (Compte cabinet / Admin (superviseur) / nom du Client). Chaque salarié a bien son propre espace (identifiant + mot de passe attribués dans l'Admin, dossiers filtrés).
2. **Signature des éditions** — **toutes les éditions** (documents `.doc-page` : balance, grand-livre, journaux, bilan, compte de résultat…) reçoivent automatiquement une **signature « Établi par : \<nom du collaborateur\> — le \<date\> »**, à l'écran **et à l'impression**. Le nom est celui du collaborateur connecté.

**Comment — `yada-addon209` (100% additif) :** `yadaCurrentUserName()` (salarié via `staffId` → nom, sinon rôle) ; puce `#yada-user` (greffée sur `render` + intervalle 800 ms, visible si session ouverte) ; `signDocPages(root)` ajoute un bloc `.doc-sign` à chaque `.doc-page:not([data-yadasign])` (idempotent) ; **wrap `window.print`** (signe avant impression) + **MutationObserver** (signe les éditions ajoutées dynamiquement dans `#print-area`/modales) + greffe `render`. `<style id="collab-sign-mod">` (puce + `.doc-sign` en noir sur blanc pour l'impression).

**Validé :** `node --check` (202 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (puce « Connecté : Admin (superviseur) » puis « Connecté : Sarah Durand » après bascule salarié ; `.doc-page` inséré → signé « Établi par : Sarah Durand — le … » ; après renommage → nouvelle édition signée « Marc Leroy » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v427**.

---

## 🟢 MAJ précédente — Espace Admin : liste de MODULES (Collaborateurs & accès · Paramétrage · Documentation · Pilotages) — v426
**Quoi :** l'Espace Admin devient une **application à modules** avec sa propre **barre latérale de modules** (même style que l'espace Cabinet). La barre latérale liste : **← Retour aux dossiers** (en haut), le titre **Espace Admin**, puis une section **« Modules »** avec 4 modules — **Collaborateurs & accès** (l'ancien panneau : société exploitante + utilisateurs + dossiers), **Paramétrage** (verrouillage auto, renvois société/synchro), **Documentation** (guide : utilisateurs, dossiers attitrés, occupation, alertes), **Pilotages** (supervision : KPI collaborateurs actifs / dossiers / attribués / occupés + charge par collaborateur). Cliquer un module l'affiche dans le contenu (défilable, page immobile pour les actions internes ; un changement de module remonte en haut).

**Comment :**
- **`yada-addon202` (édition)** : la vue `admShow` de `ecranSelectionDossier` rend une **barre latérale de modules** (`.adm-mod-btn` avec icône + libellé, actif en surbrillance) + un contenu `#adm-content` alimenté par `window.admModuleContent()`. Bouton d'entrée renommé « 🛡 Espace Admin ».
- **`yada-addon208` (100% additif)** : `admSetModule(m)` (change `window.admModule` + `render`) ; `admModuleContent()` (dispatch collab/parametrage/documentation/pilotages) ; `modParametrage`/`modDocumentation`/`modPilotages` ; `<style id="adm-modules-mod">` (boutons de module façon nav cabinet).
- **`yada-addon207` (édition)** : sur un **changement de module** (`__admModuleSwitch`), le contenu **remonte en haut** ; sinon le défilement est **préservé** (page immobile pour les actions).

**Validé :** `node --check` (201 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (barre latérale = [Collaborateurs & accès, Paramétrage, Documentation, Pilotages] ; défaut collab avec société ; Pilotages → « Vue d'ensemble » + « Charge par collaborateur » ; Paramétrage → « Sécurité & connexion » ; Documentation → guide ; capture @2x conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v426**.

---

## 🟢 MAJ précédente — Admin : « Retour aux dossiers » en haut de la barre latérale + tableau Dossiers redessiné + page immobile après action — v425
**Quoi :** trois améliorations de l'Espace Admin.
1. **« ← Retour aux dossiers » en haut** de la barre latérale (avant le titre et les sections), au lieu du bas.
2. **Tableau « Dossiers & attribution » redessiné (plus esthétique)** : chaque dossier est une **carte** (en-tête à dégradé bleu→turquoise avec **avatar** initiale + nom + forme + **badge « N responsable(s) »** vert), des **chips cliquables** par salarié (pastille + nom ; **bleu plein quand sélectionné**, contour sinon) pour ajouter/retirer, et des **pastilles vertes « Tracé par »**. Remplace la table + cases à cocher.
3. **Page immobile après une action** : dans l'Espace Admin, toute action (attribution, enregistrement, édition, mot de passe…) **ne fait plus remonter la page en haut** — le défilement du conteneur `#adm-content` est mémorisé avant `render()` puis **restauré à l'identique** après (instantané).

**Comment :**
- **`yada-addon202` (éditions)** : ordre de la barre latérale (bouton retour en 1er) ; `admDossiersPanel` rend une **liste de cartes** `.adm-doss-card` (en-tête `.adm-doss-head`, chips `.adm-uchip` avec `.on`, traces `.adm-trace`) au lieu d'une table ; styles `.adm-doss-list/card/head/av/badge/uchip…` ; `.adm-side-back` restylé.
- **`yada-addon205` (édition)** : retrait de `scroll-behavior:smooth` sur `.adm-content` (la restauration devient **instantanée** ; `admGoto` garde son `scrollTo({behavior:'smooth'})` explicite).
- **`yada-addon207` (100% additif, wrap de `render` le plus externe)** : mémorise `#adm-content.scrollTop` avant rendu, le restaure après (`+ setTimeout 0/40`).

**Validé :** `node --check` (200 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (barre latérale = [Retour, Titre, Société, Utilisateurs, Enregistrer, Dossiers] ; 3 cartes redessinées + chips bleus ; **défilement 1500 → action (toggle) → 1500 préservé** ; capture @2x conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v425**.

---

## 🟢 MAJ précédente — Admin : toutes les données de la société exploitante + bouton Déconnexion universel — v424
**Quoi :** deux ajouts.
1. **Société exploitante — toutes les données** : la carte « Société exploitante (le cabinet) » de l'Espace Admin passe de 5 champs à une **fiche complète groupée** (23 champs) — **Identité** (Dénomination, Forme, Capital social, SIREN, SIRET, N° TVA intracom, Code APE/NAF, RCS, Date de création, Activité), **Adresse & contacts** (Adresse, CP, Ville, Pays, Téléphone, E-mail, Site web), **Dirigeant** (Nom + qualité, e-mail, téléphone), **Coordonnées bancaires** (Banque, IBAN, BIC). « Enregistrer la société » persiste **tout** dans `db.cabinet.societe`.
2. **Bouton Déconnexion universel** : un bouton **« Déconnexion »** (flottant, haut-droite) est affiché **dans tous les espaces** (Cabinet, Client, Admin) dès qu'une session est ouverte ; masqué sur la page de connexion. Un clic lance la déconnexion (`secDeconnexion` → « Fin de session » avec enregistrement, sinon `secVerrouiller`).

**Comment :**
- **`yada-addon202` (éditions)** : `SOC_FIELDS` (groupes → [id,libellé,clé,type,large]) ; `socCard` construit la fiche groupée (pré-remplissage `nom←cabinetNom`, `dirigeant←collaborateur`, `pays←France`) ; `admSocSave` itère `SOC_FIELDS` et enregistre chaque clé. Styles `.adm-soc-group/.adm-soc-gh`.
- **`yada-addon206` (100% additif)** : `#yada-logout` créé une fois, `loggedIn()` = `sessionStorage 'yada-role'` && `!__secLocked` ; `upd()` greffé sur `render` (+ `setTimeout(0)`) + intervalle 600 ms ; `doLogout()` → `secDeconnexion`/`secVerrouiller`. Le voile de connexion (`#sec-lock`, z-index 100000) recouvre le bouton (z-index 99980) → invisible sur la page de connexion. `<style id="logout-btn-mod">`.

**Validé :** `node --check` (199 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (société : 23 champs, enregistrement de nom/siren/siret/tva/ape/capital/iban/email vérifié dans `db.cabinet.societe` ; Déconnexion : masqué sur la porte, visible en admin **et** client, clic → déconnexion ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v424**.

---

## 🟢 MAJ précédente — Espace Admin : barre latérale (sections) + page défilable — v423
**Quoi :** l'Espace Admin s'affiche désormais en **barre latérale + contenu défilant**. La barre latérale (à gauche, collante) liste **toutes les sections** — **Société exploitante**, **Utilisateurs du cabinet**, **Enregistrer un utilisateur**, **Dossiers & attribution** — + un bouton **« ← Retour aux dossiers »**. Cliquer une section **fait défiler la page** jusqu'à elle (surbrillance brève) ; le contenu est un **conteneur défilant propre** → la page défile toujours (fini le contenu coupé). Le bouton de section actif est mis en surbrillance selon la position de défilement. Responsive : sur mobile, la barre passe au-dessus en ligne et tout défile normalement.

**Comment :**
- **`yada-addon202` (édition)** : la vue `admShow` de `ecranSelectionDossier` rend `<div class="adm-shell"><aside class="adm-side">…nav `admGoto`…</aside><div class="adm-content" id="adm-content">…admCollabPanel()…</div></div>` ; **ids d'ancrage** ajoutés aux 4 cartes (`adm-sec-soc/users/add/doss`).
- **`yada-addon205` (100% additif)** : `admGoto(id)` (défilement `#adm-content` vers la section + `.adm-flash`), `highlight()` (bouton actif selon `scrollTop`, greffé sur `render` + écouteur `scroll` capture), `<style id="adm-shell-mod">` (grille `236px 1fr`, `.adm-side` collante `100dvh`, `.adm-content{height:100dvh;overflow-y:auto}`, media ≤820px).

**Validé :** `node --check` (198 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (barre latérale = [Société exploitante, Utilisateurs du cabinet, Enregistrer un utilisateur, Dossiers & attribution, Retour] ; `#adm-content` défilable `scrollHeight 1410 > 820` ; `admGoto('adm-sec-doss')` → `scrollTop 590` ; capture @2x conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v423**.

---

## 🟢 MAJ précédente — Admin : utilisateurs (identifiants + mot de passe affichés) + multi-attribution + alerte de connexion + voyant d'occupation rouge/vert — v422
**Quoi :** l'Espace Admin gère finement les dossiers et les utilisateurs :
1. **Liste des utilisateurs avec leurs droits** — chaque salarié affiche son **identifiant (e-mail)** ET son **mot de passe de connexion** (bouton **Afficher/Masquer**), le **nombre de dossiers** et la **liste de ses dossiers** (tags). *(Le mot de passe est conservé en clair **uniquement dans les données locales de l'appareil** `db.cabinet.staff.pwdClair`, jamais dans la source publique ; l'empreinte SHA-256 salée reste utilisée pour la connexion.)*
2. **Multi-attribution** — un dossier peut être attribué à **plusieurs utilisateurs** (cases à cocher par dossier). L'Admin **ajoute/retire** un dossier d'un salarié ; « Tracé par » liste toutes les adresses responsables.
3. **Alerte de connexion** — à la connexion d'un salarié, un message indique **« Vous avez N nouveau(x) dossier(s) en votre responsabilité »** et/ou **« N dossier(s) retiré(s) de votre responsabilité »** (comparé au dernier état vu `dossiersSeen`).
4. **Voyant d'occupation rouge/vert** — plusieurs responsables peuvent accéder à un dossier, mais **un seul y travaille à la fois** : ouvrir un dossier le marque **occupé** (`d.occupe = {id,nom,ts}`). Les autres voient un **voyant ROUGE luminant** (occupé) dans la liste des dossiers + un **bandeau « Dossier occupé par X — consultation (vérification) »** ; **VERT** quand il est libre. Verrou relâché en quittant/déconnexion (+ auto-relâche après 20 min d'inactivité). Occupation partagée via la synchro cloud.

**Comment :**
- **`yada-addon202` (éditions)** : ligne utilisateur → identifiant + mot de passe (`pwdClair` + bouton `admPwToggle`) + « N dossiers » + tags ; `pwdClair` enregistré à la création (`admStaffAdd`) et à la réinitialisation (`admStaffResetPwd`).
- **`yada-addon203` (éditions)** : `admDossiersPanel` → **cases à cocher multi** par dossier ; `admDossierToggleUser(dossierId,email,on)` (ajout/retrait) + `syncResp` (`d.responsables=[e-mails]`) ; `normalize` multi ; `admStaffSaveEdit` enregistre `pwdClair` + resync des responsables si l'e-mail change.
- **`yada-addon204` (100% additif)** : `me()`/`occState`/`occSet`/`occClear` (verrou d'occupation), wrap `choisirDossier` (prise du verrou / mode vérification) + `retourSelectionDossier`/`quitterEspaceClient`/`dsRetourModule`/`secVerrouiller` (relâche) ; `notify(s)` (alerte connexion via `yadaAlert`, met à jour `dossiersSeen`) greffée sur `render` (1×/login) ; `paintLights()` (voyant `.ds-occ` rouge/vert sur `.ds-row`) + `paintBanner()` ; battement 45 s (auto-relâche + rafraîchissement). `<style id="occ-mod">` (pastilles + `@keyframes occPulse`).

**Validé :** `node --check` (197 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (`pwdClair` stocké & affichable ; **multi-attribution** d-a→[sarah,marc] ; **alerte** « 1 nouveau » puis « 1 retiré » ; **occupation** : Sarah ouvre d-b → `occupe` posé, état `self` (vert) ; vue Marc → `autre` (rouge) ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v422**.

---

## 🟢 MAJ précédente — Espace Admin : interface DOSSIERS (attribution par adresse e-mail, tracé) + édition des utilisateurs — v421
**Quoi :** l'Espace Admin gagne une **interface dédiée aux dossiers** et un **bouton pour modifier les paramètres des utilisateurs** :
1. **Utilisateurs du cabinet (salariés)** — chaque salarié a un **identifiant** (e-mail + mot de passe, empreinte SHA-256 salée, jamais en clair). Bouton **« Modifier »** par utilisateur → édite prénom, nom, **e-mail** et mot de passe (changer l'e-mail exige un nouveau mot de passe → empreintes recalculées ; la trace des dossiers suit le nouvel e-mail). + Mot de passe / Désactiver / Supprimer.
2. **Dossiers & attribution (tableau)** — chaque dossier est **attribué à UN SEUL salarié** via un menu déroulant d'adresses e-mail et **tracé par cette adresse** (colonne « Tracé par », pastille verte). **Exclusivité** : réassigner un dossier le **retire automatiquement** du salarié précédent (un dossier = une seule adresse e-mail responsable). Le salarié se connecte via l'Espace Cabinet et ne traite que ses dossiers attribués (filtrage `staffAllowedIds`/`staffFilterDossiers`) ; l'Admin garde l'accès global.

**Comment :**
- **`yada-addon202` (éditions)** : la carte collaborateurs affiche un bouton **Modifier** (au lieu des cases « Dossiers attitrés »), libellés « … tracé(s) » ; l'ajout d'utilisateur ne demande plus les dossiers (attribués ensuite dans le tableau) ; `admCollabPanel` appelle `admDossiersPanel()`.
- **`yada-addon203` (100% additif)** : `admDossiersPanel()` (tableau dossier → sélecteur d'e-mail → trace), `admDossierAssign(dossierId,email)` (attribution **exclusive** + `dossier.responsableEmail`), `admStaffEdit`/`admStaffEditBox`/`admStaffSaveEdit` (édition des paramètres, recalcul d'empreintes si e-mail/mot de passe changent, report de la trace), `__admNormalizeAssignments` (1 responsable/dossier + trace des attributions héritées au démarrage). `<style id="adm-doss-mod">`.

**Validé :** `node --check` (196 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (panneau Dossiers + tableau ; attribution `d-a`→Sarah puis réassignation →Marc **exclusive** (retirée de Sarah), trace `responsableEmail` mise à jour ; filtrage salarié conforme ; **édition d'e-mail** → empreintes recalculées, connexion au nouvel e-mail vérifiée, trace des dossiers reportée ; capture @2x conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v421**.

---

## 🟢 MAJ précédente — Cache vidé pour afficher le design principal (2 gros boutons) partout — v420
**Quoi :** aucun changement fonctionnel — **invalidation du cache** pour que le **design principal restauré en v419** (écran d'accueil « Choisissez votre espace » avec les **deux gros boutons Espace Cabinet / Espace Client**) s'affiche **immédiatement en ligne**, y compris sur les appareils/PWA qui gardaient une ancienne version en cache. Bump du cache du service worker (`yada-v30 → yada-v31`) → au prochain chargement, l'ancien cache est purgé et le service worker « réseau d'abord » sert la dernière version. Badge → **v420**.

**Comment :** `sw.js` `CACHE 'yada-v30' → 'yada-v31'` (l'`activate` supprime les caches ≠ CACHE) ; badge `#yada-ver` → v420 ; `version.json` → 420 (l'auto-mise à jour addon103 détecte la nouvelle version et recharge). Aucune logique/écriture/UI modifiée.

**Validé :** `node --check` (195 scripts, 0 erreur ; `sw.js` OK) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v420**.

---

## 🟢 MAJ précédente — Restauration du DESIGN PRINCIPAL : écran d'accueil « Choisissez votre espace » d'abord, puis le formulaire — v419
**Quoi :** restauration du **design principal** de la page de connexion demandé : à l'ouverture, on revoit d'abord l'**écran d'accueil « Bienvenue — Choisissez votre espace »** avec les **deux gros boutons Espace Cabinet / Espace Client** (design d'origine `sec-cta`/`sec-cta-2`) + la note « Admin via l'Espace Cabinet » ; **après avoir choisi un espace**, on arrive sur le **formulaire e-mail → mot de passe**. Annule l'ouverture directe sur le formulaire (v417) et le sélecteur en tête de formulaire (v418). Les comportements v416 sont conservés (Cabinet/Admin ne se connectent jamais directement ; « Rester connecté » réservé au Client).

**Comment — `yada-addon38` (2 éditions, retour à l'état v416) :** `secAfficher` — rétablissement de la branche `if(!CHOICE){ écran de choix (2 boutons secChoisir) }` (au lieu du défaut direct) ; étape 1 du formulaire — retrait du sélecteur d'espace en tête, retour du lien « ← Changer d'espace » (`secRetour`). `secBascule` et la CSS `.sec-space-choice` deviennent inutilisés (laissés, sans effet).

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (à l'ouverture : écran « Choisissez votre espace » avec 2 boutons, **pas** de champ e-mail, note Admin ; clic « Espace Cabinet » → étape e-mail + lien « Changer d'espace » ; **connexion Admin via ce parcours** → `role=admin` ; capture @2x conforme ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v419**.

---

## 🟢 MAJ précédente — Sélecteur d'espace au design d'origine (boutons Espace Cabinet / Espace Client) sur le formulaire de connexion — v418
**Quoi :** sur la page de connexion (qui s'ouvre directement sur le formulaire, v417), le **sélecteur d'espace** reprend le **même design qu'avant** : les deux boutons **« Espace Cabinet »** et **« Espace Client »** au style d'origine (`sec-cta` bleu dégradé pour l'espace actif, `sec-cta-2` contour bleu pour l'autre), au lieu des petits onglets improvisés (styles en ligne). Les boutons sont côte à côte en tête du formulaire ; cliquer bascule l'espace (`secBascule`). Reste inchangé : ouverture directe sur le formulaire, note « Admin via l'Espace Cabinet », étapes e-mail → mot de passe, empreintes SHA-256 salées.

**Comment — `yada-addon38` + `sec-charme` (2 éditions) :** l'étape 1 rend `spBtn(sp,lbl)` = `<button class="sec-cta[ sec-cta-2]">` (actif = `sec-cta`, inactif = `sec-cta sec-cta-2`) au lieu des `.sec-stab` en ligne ; ajout au style `sec-charme` de `.sec-space-choice` (flex, 2 colonnes), `.sec-space-choice .sec-cta` (compact) et `.sec-adm-note` (petit). Aucune logique modifiée.

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (sélecteur = boutons `sec-cta`/`sec-cta sec-cta-2`, plus de `.sec-stab` ; capture @2x conforme au design d'origine ; connexion Admin via le formulaire → `role=admin` ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v418**.

---

## 🟢 MAJ précédente — Ouverture DIRECTE sur la page des identifiants (formulaire de connexion), sans écran « Choisissez votre espace » — v417
**Quoi :** dès l'ouverture du logiciel, on arrive **directement sur la page de saisie des identifiants** (e-mail + mot de passe) — l'écran intermédiaire **« Choisissez votre espace »** (Cabinet / Client) est **supprimé**. Le choix de l'espace se fait par un **petit sélecteur en onglets « Espace Cabinet / Espace Client »** en haut du formulaire (défaut : **Cabinet** sur ordinateur ; **Client** sur mobile). Une note rappelle que l'**Admin (superviseur) se connecte via l'Espace Cabinet**. Vaut aussi après **déconnexion / verrouillage** : on revient directement sur le formulaire.

**Comment — `yada-addon38` (3 éditions chirurgicales) :** `secAfficher` — la branche `if(!CHOICE){ écran de choix }` est remplacée par `if(!CHOICE) CHOICE = mob?'client':'cabinet'` → le formulaire s'affiche immédiatement (l'écran de choix n'existe plus) ; l'étape 1 reçoit un sélecteur d'onglets d'espace (`secBascule('cabinet'|'client')`) + la note Admin (desktop) ; le lien « ← Changer d'espace » est remplacé par les onglets. Nouvelle fonction `secBascule(sp)` (bascule Cabinet/Client, reset étape/e-mail). Le reste (empreintes SHA-256 salées, étape mot de passe, connexion directe réservée au Client v416, mobile = Client uniquement) est inchangé.

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (à l'ouverture : **champ e-mail présent, pas d'écran « Choisissez votre espace »**, onglets [Cabinet, Client], onglet actif Cabinet, note Admin ; bascule vers Client OK ; **connexion Admin via le formulaire** → `role=admin` ; après déconnexion → formulaire affiché directement ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v417**.

---

## 🟢 MAJ précédente — L'Espace Cabinet (et l'Admin) ne se connecte JAMAIS directement : toujours par la page de connexion — v416
**Quoi :** l'**Espace Cabinet** (et l'**Admin**, qui passe par le Cabinet) **ne s'ouvre plus jamais directement** : à chaque ouverture du logiciel, on **passe toujours par la page de connexion** (choix de l'espace + identifiant + mot de passe). La **connexion automatique « appareil de confiance »** (case « Rester connecté sur cet appareil ») reste **réservée à l'Espace Client**. Sur un appareil qui avait mémorisé le Cabinet/Admin, la mémorisation est **effacée** au démarrage → la page de connexion réapparaît.

**Comment — `yada-addon38` (3 éditions chirurgicales) :** `boot()` — si `yada-remember` vaut `cabinet` ou `admin`, on l'**efface** et on **n'auto-connecte pas** (la page de connexion s'affiche) ; seule la valeur `client` déclenche encore la connexion directe. `secEssayer` — les connexions de l'Espace Cabinet (compte principal **et** Admin) ouvrent avec **`remember=false`** (jamais mémorisées) ; le Client garde le choix de la case. `secAfficher` (étape 2) — la case **« Rester connecté sur cet appareil »** n'est affichée **que pour le Client** (retirée pour Cabinet/Admin). Le verrouillage automatique par inactivité s'applique donc de nouveau au Cabinet/Admin.

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (appareil « mémorisé cabinet » → **page de connexion affichée**, mémorisation effacée ; « mémorisé admin » → idem ; « mémorisé client » → connexion directe conservée ; aucun appareil mémorisé → page de connexion ; étape 2 Cabinet **sans** case « Rester connecté », Client **avec** ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v416**.

---

## 🟢 MAJ précédente — Connexion à DEUX espaces (Cabinet / Client) + Admin accessible via l'Espace Cabinet — v415
**Quoi :** la page de connexion propose désormais **deux choix seulement** — **Espace Cabinet** et **Espace Client** (le 3ᵉ bouton « Espace Admin » est retiré). L'**Espace Admin (superviseur) se connecte via l'Espace Cabinet** : en choisissant **Espace Cabinet** puis en saisissant l'**identifiant + mot de passe Admin** (`admin.admin@gmail.com`), on ouvre le **mode administration** (`role=admin`, interface Cabinet complète + carte/panneau Administration). L'Espace Cabinet accepte donc, sur le même bouton : le **compte principal Cabinet** (`aemconseil.sas@gmail.com` → `role=cabinet`), l'**Admin** (→ `role=admin`) et les **collaborateurs/salariés** (→ `role=cabinet` + `staffId`, dossiers filtrés). Le formulaire garde **identifiant + mot de passe** (empreintes SHA-256 salées, clair absent du source). Une note sous les boutons rappelle « L'Espace Admin (superviseur) se connecte via l'Espace Cabinet. »

**Comment — `yada-addon38` (éditions chirurgicales) :** `secAfficher` retire le bouton `sec-cta-3` et ajoute la note ; `secEtape1` (Espace Cabinet) accepte l'identifiant s'il correspond à `CAB`, `ADM` **ou** un collaborateur ; `secEssayer` (Espace Cabinet) : après échec du compte principal, teste l'empreinte **Admin** (`sha(ADM.salt+email+'##'+mdp)` → `secOuvrir('admin', …)`) puis les collaborateurs. Texte « Connexion & sécurité » du Paramétrage mis à jour (deux espaces, Admin via Cabinet). Mobile inchangé (Client uniquement).

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (écran de connexion : **2 boutons** Cabinet/Client, plus de bouton Admin, note présente ; **Admin via Cabinet** → `role=admin`/`isAdmin` ; **compte principal** → `role=cabinet` ; **salarié via Cabinet** → `role=cabinet`+`staffId` ; **mauvais mot de passe Admin refusé** ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v415**.

---

## 🟢 MAJ précédente — Espace Admin : enregistrer les salariés (identifiants) + dossiers attitrés + accès global — v414
**Quoi :** l'**Espace Admin** devient un vrai espace de supervision de la **société qui occupe le logiciel** (le cabinet) :
1. **Société exploitante** — carte de réglages (Dénomination, Forme, SIRET, Dirigeant, Adresse) enregistrés dans `db.cabinet.societe`.
2. **Collaborateurs (salariés) & accès** — l'Admin **enregistre chaque salarié avec ses identifiants** (e-mail + mot de passe). Le **mot de passe est stocké en empreinte SHA-256 salée, JAMAIS en clair** (généré à la volée dans le navigateur via WebCrypto, schéma identique à la porte d'entrée `sha(sel+email+'##'+mdp)` + `sha(sel+email)`), dans `db.cabinet.staff` (données locales de l'appareil, jamais dans la source publique).
3. **Dossiers attitrés** — chaque salarié reçoit une **liste de dossiers attribués** (cases à cocher du portefeuille). **Lui seul les traite** : il se **connecte via l'Espace Cabinet** avec son identifiant, et le **portefeuille + la liste des dossiers sont filtrés à ses dossiers attitrés** (garde-fou : impossible d'ouvrir un dossier non attribué). Un **bandeau** rappelle son nom + le nombre de dossiers attitrés.
4. **Accès global de l'Admin** — l'Admin voit **toutes les sociétés** du portefeuille (aucun filtre). Le compte principal Cabinet aussi.
5. **Accès au panneau Admin** — bouton **« 🛡 Espace Admin — Collaborateurs & accès »** sur l'écran « Espace dossiers » (parcours d'entrée, avant d'ouvrir un dossier) + carte sur le Tableau de bord de l'Admin.

**Comment :**
- **`yada-addon38` (porte, éditions chirurgicales)** : `secStaffMatch(email, mdp)` cherche un collaborateur actif de `db.cabinet.staff` par empreinte ; `secEtape1` (l'identifiant d'un salarié est accepté pour l'Espace **Cabinet**) et `secEssayer` (si le compte principal échoue, on tente les collaborateurs → pose `window.staffId`, ouverture Cabinet) ; `window.staffId` remis à `null` dans `secEssayer`/`secVerrouiller`/`boot`.
- **`yada-addon202` (100% additif)** : `yadaHashCreds` (empreintes salées WebCrypto) ; `staffAllowedIds()` (null = accès global admin/principal, sinon dossiers du salarié) + `staffFilterDossiers(list)` ; **wrap `choisirDossier`** (blocage des dossiers non attribués) ; `admCollabPanel()` (société + CRUD salariés + affectation de dossiers) ; handlers `admStaffAdd/Del/Actif/ResetPwd/Doss`, `admSocSave`, `admAssignToggle`, `admShowToggle` ; **wrap `ecranSelectionDossier`** (bouton d'accès + vue panneau) ; bandeau collaborateur sur `pageDash`.
- **Filtrage du portefeuille** : `cabinetApercu`/`rafraichirCabinet` et les deux `dossiers()` du parcours d'entrée (addon188/189) passent par `staffFilterDossiers`.

**Validé :** `node --check` (195 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Admin : bouton d'entrée + panneau société/collaborateurs/ajout ; création d'un salarié → **hash présent, aucun mot de passe en clair** dans l'objet stocké ; empreintes vérifiées avec le schéma de la porte ; **connexion réelle du salarié via la porte Cabinet** → `role=cabinet`, `staffId` posé, dossiers filtrés à `[d-b]` ; garde-fou bloque un dossier non attribué ; mauvais mot de passe refusé ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v414**.

---

## 🟢 MAJ précédente — Page de connexion : correctif du bouton « Espace Admin » (flèche cassée) — v413
**Quoi :** sur la page de connexion, le 3ᵉ bouton affichait **« Espace Admin▯92 »** (glyphe parasite) au lieu de **« Espace Admin → »**. Cause : dans `yada-addon201`, la CSS du bouton est injectée via une **chaîne JS** (`style.textContent`) et contenait `content:"\2192"` → l'échappement `\2192` était **interprété par JavaScript** (octal + « 92 ») **avant** d'atteindre la CSS. Corrigé en utilisant le **caractère flèche littéral `→`** (convention UTF-8 du projet). Bonus : le bouton Admin passe en **flex** (libellé à gauche, flèche à droite) pour s'aligner exactement sur « Espace Cabinet » / « Espace Client ».

**Comment — 1 édition de `yada-addon201` :** `content:"\2192"` → `content:"→"` ; `.sec-cta-3` reçoit `display:flex;align-items:center` (+ fond/bordure en `!important` pour un rendu cohérent). Aucune logique modifiée.

**Validé :** `node --check` (194 scripts, 0 erreur) + brace CSS (2010/2010) + capture Playwright (les 3 boutons « Espace Cabinet / Client / Admin » s'affichent proprement, flèche `→` alignée à droite, plus de glyphe parasite). Badge → **v413**.

---

## 🟢 MAJ précédente — Connexion à 3 espaces (Cabinet / Client / Admin) + identifiants dédiés + Espace Admin superviseur — v412
**Quoi :** la page de connexion propose désormais **exactement 3 accès** : **Espace Cabinet**, **Espace Client**, **Espace Admin**. Identifiants dédiés (mots de passe **hachés SHA-256 salés**, **clair absent du source** — app publique) :
- **Cabinet** : `aemconseil.sas@gmail.com` — gestion + comptabilité + pilotage (interface complète).
- **Client** : `yada.assistance@gmail.com` — uniquement factures achat/vente + Tiers (nav restreinte existante).
- **Admin** (superviseur) : `admin.admin@gmail.com` — **interface Cabinet complète + carte « Administration »** ; données partagées → les enregistrements/changements de l'Admin **impactent le Cabinet**.

**Comment :** empreintes régénérées (schéma existant `sha(salt+email+'##'+pwd)` + `sha(salt+email)` ; e-mail insensible à la casse) → `CAB`/`CLI`/`ADM` ; helpers `secRec(c)`/`secLabel(c)` ; 3ᵉ bouton `secChoisir('admin')` ; `secEtape1`/`secEssayer`/`secOuvrir`/`boot` étendus au rôle `admin` (traité comme cabinet pour l'accès : `role()`/`applyRole` → `data-role=cabinet`, nav complète ; `window.isAdmin`). **`yada-addon201`** : style du 3ᵉ bouton + **badge « 🛡 ADMIN · Superviseur »** + **carte Administration** greffée en tête du Tableau de bord (accès global aux dossiers, tenue du Cabinet, + droits/missions/notes/suivi par salarié **à venir** — chantier §Architecture & Espaces). Texte Paramétrage « Connexion & sécurité » → « Trois espaces ». Mobile : Cabinet/Admin restent bloqués (Client uniquement), inchangé.

**Sécurité :** identifiant vérifié **avant** l'accès au champ mot de passe ; empreintes salées uniquement (aucun mot de passe en clair). **Validé :** `node --check` (194 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (3 boutons ; **cabinet/client/admin** se connectent avec les bons identifiants ; **mauvais mot de passe → refusé** ; **e-mail inconnu → pas d'accès au mot de passe** ; Admin → `data-role=cabinet` + nav 15 items + carte/badge admin ; Cabinet → carte admin absente ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v412**.

---

## 🟢 MAJ précédente — Consultation : « propager une deuxième page » = fenêtre VIVANTE (déplaçable & 100% utilisable) — v411
**Quoi :** dans la **Consultation des comptes** (et toutes ses sous-pages : grand-livre, éditeur, lx/rb/cp/im, modales), **propager une deuxième page** (bouton **⧉**) ne produit plus un **clone statique** dans une fenêtre navigateur (page morte, rien de modifiable) : **⧉ détache désormais la VRAIE page en fenêtre flottante dans l'application** — **déplaçable** (glisser la barre de titre), **redimensionnable** (poignée du coin bas-droit) et **entièrement utilisable** (DOM vivant : saisie, clics, filtres, lettrage — toutes les caractéristiques de la page restent modifiables).

**Comment — `yada-addon200` (100% additif) :** **override de `wmPop`** (addon89) → si la fenêtre n'est pas déjà flottante, délègue à `wmToggle(k)` (sg → `sgToggleReduit()` ; autres → `float:true` + géométrie + `wmApplyGeom`) au lieu du `window.open` + clone HTML ; détection d'état par les classes vivantes (`.sg-reduit` / `.wm-float`) — le `WM.st` d'addon89 étant privé. Toast d'explication + info-bulle du bouton ⧉ mise à jour (« Propager en fenêtre déplaçable et utilisable », balayage idempotent post-render). La mécanique déplacement/redimensionnement/snap-haut d'addon89 est réutilisée telle quelle.

**Validé :** `node --check` (193 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (`wmPop('sg')` → `.sg-app.sg-reduit` flottante 1040px ; **drag réel** de la barre de titre (230,36)→(370,148) ; **clic réel** dans la fenêtre propagée OK ; `wmPop('ec')` → `.ec-win.wm-float` `position:fixed` + **saisie réelle** dans le filtre ; **1 seule page navigateur** (plus de clone) ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v411**.

---

## 🟢 MAJ précédente — Revue du cahier des charges : 5 demandes de plus implémentées (Pilotage épuré, Consultation plein écran, Éditions A4, brut↔net, libellés) — v410
**Quoi :** revue complète des éléments du cahier des charges (« tu n'as pas pris en compte toutes les modifications ») → **5 demandes non comptables supplémentaires implémentées** :
1. **Pilotage ÉPURÉ** : onglets **Impôts (IS/IR)**, **Actif/Passif** et **Agenda & RH** supprimés — seul « Pilotage » reste (liens Analytique / Suivi des règlements / Tableau de bord ; refonte gestion à venir §5 du cahier, IS/IR renaîtra dans Déclarations).
2. **Consultation des comptes** : le module **s'ouvre PLEIN ÉCRAN** (reset `sgReduit` à chaque entrée) ; le carré **▢/▣ agrandit à tout l'écran** ; la **croix ✕** (fermer) et le bouton **─** (réduire) sont **retirés** de la barre (édition de la `.sg-win`, seule le toggle ▢ reste).
3. **Éditions — aperçu A4** : à l'écran, `.doc-page` s'affiche au **format A4** (210 mm ≈ 794 px, `min-height:297mm`, `@media screen`) — l'impression était déjà A4 (`@page`).
4. **RH / Salarié — brut ↔ net auto-complétés** : saisir le **brut** remplit le **net** et inversement — fiche (`sf-brut`/`sf-net`, écouteur `input` délégué) **et** onglet Salaires (`salSetSalaire` réécrit : `net = brut × 0,78`, `brut = net ÷ 0,78` — ratio indicatif du module).
5. **Barre latérale** : majuscules en milieu de libellé retirées (« Analyse — centre de contrôle », « Charges et paie », « Immobilisations & financement(s) »).

**Comment :** `yada-addon199` (1-4, 100% additif : override `pagePilotage`, wrap `render` pour le plein écran, `<style id="doc-a4-screen">`, écouteur `input` + override `salSetSalaire`) + éditions chirurgicales (`.sg-win` de `pageCompta` : ✕ et ─ retirés ; libellés LBL/MODULES/PAGES).

**Validé :** `node --check` (192 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (pilotage 0 onglet + liens ; compta `sgReduit=false` malgré un état « réduit » persisté + `.sg-win` = [▢] seul ; `.doc-page` écran = 794 px ; brut 1000→net 780 & net 780→brut 1000, fiche live 2000→1560 ; libellés ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v410**.

---

## 🟢 MAJ précédente — Cahier des charges trié par session + réorganisation de la navigation + transition discrète — v409
**Quoi :** réception d'un **cahier des charges complet** (dizaines de demandes tous modules) → (1) **tout est consigné et trié par session** dans **`CAHIER-DES-CHARGES.md`** (règles R1→R8 pour la session Règles, sections Déclarations/Permanent/RH/Pilotage/Comptabilité/Tiers/Espaces) ; (2) la part **non comptable (UI/navigation)** est **implémentée immédiatement** :
- **Transition de page DISCRÈTE** (« un balayement invisible qui fait classe ») : simple fondu léger (~0,2 s) + balayage quasi invisible (opacités ≤ .05) — fini l'effet voyant (addon194 édité).
- **Barre latérale — libellés propres** : `TIERS`→`Tiers`, suppression des parenthèses et de leur contenu (`Paramétrage (réglages)`→`Paramétrage`, `Module TVA (CA3)`→`Module TVA`, `Éditions (Balance…)`→`Éditions`, `Rapprochement (lettrage)`→`Rapprochement`, `Banque (512)`→`Banque`, `Sociétés (portefeuille)`→`Sociétés`, `Assistant IA (écritures)`→`Assistant IA`) ; `Société & création du dossier`→**`Sociétés`** (PAGES + LBL addon164).
- **Navigation réorganisée** : sous-modules **Banque (512)**, **Saisie journal Banque** et **Assistant IA** **retirés** de la barre latérale Comptabilité (RUBRIQUES + MODULES ; le Rapprochement reste) ; **Import/Export FEC déplacé** de Comptabilité → **Permanent** ; **Suivi des règlements ajouté** en sous-module de **Pilotages**.
- **Paramétrage** : carte **« ☁ Synchronisation multi-appareils (Pantry) » masquée** (`yada-addon198`, CSS `.cloud-card{display:none}` — moteur de synchro intact).

**Validé :** `node --check` (191 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (rubrique Comptabilité sans banque/saisiebq/ia/fec ; Permanent avec fec ; Pilotages avec reglements ; libellés renommés ; carte Pantry masquée ; transition CSS discrète ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v409**. *(Le reste du cahier des charges est routé vers les sessions par module — les parties comptables passeront par la validation de la session Règles avant merge.)*

---

## 🟢 MAJ précédente — Règles de comptabilité de MBC appliquées à TOUTES les sociétés (actuelles & futures) — v408
**Quoi :** la **base comptable de MBC** (plan comptable **BTP + PCG complet**, TVA automatique, comptes de tiers auxiliaires) est désormais appliquée à **chaque dossier du portefeuille** et à **tout nouveau dossier**. Ainsi toutes les sociétés partagent les mêmes règles comptables que MBC. **100% additif & idempotent** : `chargerPlanBTP` n'ajoute que les comptes **absents** (aucun compte/écriture supprimé), `migrerAuxTiers` **préserve** les numéros de compte saisis à la main, et les journaux standard (OD/ODP/ODC/ODTVA) étaient déjà garantis pour tous (addon247). Le plan de saisie reste global (`COMPTES ∪ db.plan`).

**Comment — `yada-addon197` (100% additif) :** `appliquerReglesMBC()` applique `baseMBC()` (= `chargerPlanBTP()`) au **dossier actif** puis, via `withDataset(ds, baseMBC)`, à **tous les datasets** de `db.dossiersData`. Lancé **au démarrage** (toutes les sociétés existantes) + **second passage à 2 s** (filet pour la restauration asynchrone IndexedDB des gros dossiers) ; **wrap de `chargerDossier`** garantit la base MBC à chaque ouverture (les nouveaux dossiers chargent déjà le plan BTP via `creerDossierComplet`/`choisirDossier`).

**Validé :** `node --check` (190 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (2 dossiers dont un à plan VIDE → après boot, chaque `db.dossiersData[*].plan` contient le plan BTP/PCG (>900 comptes), comptes clés présents 606/706/445710000, écritures existantes intactes ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v408**.

---

## 🟢 MAJ précédente — Correctif LOGO : icône correcte partout (dégradé + Y blanc) dans la barre latérale des modules — v407
**Quoi :** correction du **bug d'affichage du nouveau logo** dans la **barre latérale** (tous les modules du dossier) : l'icône apparaissait **aplatie en bleu uni** avec un **Y foncé** au lieu du **dégradé bleu→turquoise + Y blanc**. Cause : d'anciennes règles de thème écrites pour l'**ancien** logo — `.brand svg rect{fill:#1e90ff !important}` et `.brand svg path/line{stroke:#04121f !important}` — **surchargeaient** les couleurs du nouvel SVG (le point vert, un `<circle>`, n'était pas touché).

**Comment — 1 édition de `yada-addon195` (`icon()`) :** les couleurs sont désormais posées en **style INLINE `!important`** sur chaque élément (`rect{fill:url(#id)!important}`, `path`/`line{stroke:#fff!important;fill:none!important}`, `circle{fill:#24d17a!important}`). Le **style inline `!important` l'emporte sur les `!important` de feuille de style** → l'icône (dégradé + Y blanc + point vert) s'affiche correctement **partout** (barre latérale, parcours d'entrée, connexion, mobile), quel que soit le thème.

**Validé :** `node --check` (189 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (barre latérale d'un module : `.yada-ic rect` = `fill:url(#…)` — dégradé conservé, `path`/`line` stroke `rgb(255,255,255)` — Y blanc, `circle` vert ; plus de bleu uni / Y foncé ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v407**.

---

## 🟢 MAJ précédente — Éditeur d'écritures VIDE : Entrée / Flèche bas crée la 1ʳᵉ écriture — v406
**Quoi :** dans l'**éditeur d'écritures façon Sage** (`#ec-win`), quand **aucune écriture n'apparaît** (journal/compte vide, « Aucune écriture… »), appuyer sur **Entrée** ou **Flèche bas** **crée la première écriture** à saisir (curseur placé sur la date). Ces touches **gardent leurs rôles habituels** (champ suivant / descendre / nouvelle écriture) **dès qu'il y a des écritures** — elles ne créent la 1ʳᵉ ligne **qu'à l'état vide** (« au début »).

**Comment — `yada-addon196` (100% additif) :** écouteur `keydown` **capture** sur `document` → si l'overlay `#ec-overlay.show` est ouvert, la liste de comptes (`#ec-sugg`) n'est pas ouverte, et `ecEcritures()` est **vide**, alors `Entrée`/`ArrowDown` → `ecAjouterEcriture()` (+ `preventDefault`). Ne se déclenche **qu'à l'état vide** (aucun conflit avec addon114/140/146, qui exigent le focus sur un champ `.ec-i` inexistant quand c'est vide). `ecEcritures()` **ignore le filtre de recherche** → « vide » = réellement aucune écriture (pas un simple filtrage).

**Validé :** `node --check` (189 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (éditeur ACH vide : Entrée → 1 écriture créée, curseur sur `ec-datetxt` ; éditeur VTE vide : ArrowDown → 1 écriture ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v406**.

---

## 🟢 MAJ précédente — Liste des dossiers : tri par ordre ALPHABÉTIQUE — v405
**Quoi :** la **« Liste des dossiers »** (et les listes dérivées) est désormais **classée par ordre alphabétique** du nom du dossier, au lieu du tri « favoris d'abord ». Comparaison **française, insensible à la casse et aux accents**, avec ordre **numérique naturel** (ex. « Dossier 2 » avant « Dossier 10 »).

**Comment — 1 édition (les 2 définitions identiques de `dossiers()`) :** `sort((a,b)=>(b.favori?1:0)-(a.favori?1:0))` → **`sort((a,b)=>String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base',numeric:true}))`**. `ecranListe` (et l'accueil/HUB qui lisent `dossiers()`) en héritent.

**Validé :** `node --check` (188 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (portefeuille désordonné [Zéphyr, alpha, Béta, Dossier 10, Dossier 2] → liste rendue **[alpha, Béta, Dossier 2, Dossier 10, Zéphyr]** ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v405**.

---

## 🟢 MAJ précédente — Nouvelle identité YADA (logo icône + verbal + baseline) partout + transition de page plus RAPIDE — v404
**Quoi :** (1) **Nouveaux logos officiels** utilisés dans tout le logiciel : **icône dégradée bleu→turquoise** (Y blanc + point vert) + **verbal « YADA »** + **baseline « PAIE · COMPTA · DSN »**. **Écriture BLANCHE sur fond sombre**, **écriture MARINE sur fond clair**. Remplace les anciens logos de la **barre latérale**, du **parcours d'entrée** (Espace dossiers / Liste / HUB), de l'**écran de connexion** et de la **barre mobile** — « logo principal » compris. (2) **Transition entre les pages plus RAPIDE** (demande) : matérialisation ~0,5 s → **~0,24 s** et balayage lumineux ~0,72 s → **~0,4 s**.

**Comment :**
- **`yada-addon195` (logos, 100% additif) :** `yadaIconSVG(px)` (icône SVG : `<rect rx=24>` dégradé `#2f6fe8→#1cc39b`, Y blanc `stroke-linecap:round`, point vert `#24d17a`) ; `yadaLockHTML(mode, px, withTag)` (icône + « YADA » + baseline ; `mode:'dark'`→blanc / `'light'`→marine `#0e1c3d`). **Balayage post-render `sweep()`** (greffé sur `render` + MutationObserver débouncé pour l'écran de connexion/mobile rendus hors `render`) remplace le `<svg>` (et l'ancien `<small>`) dans `aside .brand` (sans baseline, barre étroite) / `.login-brand` / `.sec-logo` (connexion) / `.m-title` (mobile compact). Idempotent (skip si `.yada-lock` présent), `id` de dégradé unique par instance.
- **`yada-addon194` (vitesse) :** `.yada-spatial-in` `.5s→.24s` (translate/scale/blur réduits) ; `.yada-sheen` `.72s→.4s` ; nettoyage sheen 950→600 ms.

**Validé :** `node --check` (188 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (barre latérale/entrée/connexion : `.yada-lock` injecté — icône dégradée + « YADA » blanc + baseline ; ancien `<svg>`/`<small>` retirés ; navigation → logo présent partout ; transition ~0,24 s ; clic OK ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v404**.

---

## 🟢 MAJ précédente — Spatial UI + Liquid Glass HAUTE QUALITÉ + transition d'ouverture sur l'écran (toutes les pages de présentation → modules) — v403
**Quoi :** (1) **La transition suit l'ÉCRAN, pas la souris** : l'onde-souris (v402) est **masquée** et remplacée par une **transition d'ouverture haut de gamme** — à chaque changement d'écran, le contenu se **matérialise** (fondu + profondeur + flou qui se dissipe, ~0,5 s, easing soigné) **+ un balayage lumineux** (light-sweep bleu, `mix-blend-mode:screen`) traverse l'écran. (2) **Liquid Glass** : les surfaces passent en **verre dépoli translucide** (`backdrop-filter: blur + saturate`, dégradés translucides, bord lumineux, reflets `inset`, ombres profondes) — cartes, KPI, barre latérale, modales. (3) **Spatial UI** : profondeur par superposition (verre flottant + ombres douces), sans transform 3D persistant (pas de casse clic/scroll — leçon v397). (4) **Toutes les pages de présentation couvertes** : l'effet se déclenche sur **chaque écran du parcours d'entrée** (Espace dossiers → Liste des dossiers → HUB) **jusqu'à l'ouverture des modules** — la carte société, les tuiles de rubriques, le cadre d'infos et la liste des dossiers sont **en verre**. (5) **Qualité renforcée** : priorité de cascade garantie (préfixe `html` → bat les surcharges de thème, dont addon169), blur/saturate `!important`, sheen premium.

**Comment — `yada-addon194` (100% additif, injecté en dernier → prioritaire) :**
- `<style id="spatial-glass-mod">` : `.yada-ripple,.yada-ripple-dot{display:none}` (onde-souris masquée) ; keyframe `yadaSpatialIn` (matérialisation) ; keyframe `yadaSheen` + `.yada-sheen` (balayage lumineux plein écran, `pointer-events:none`, `z-index:70`) ; verre dépoli scopé **`html body[data-theme="noir"]`** (spécificité > surcharges) sur `.card`(+`.mod-wrap .card`/`.dash-wrap .card`/`.cli-col>.card`)/`.kpi`/`aside`/`#modal-c`/`.dsc-card`/`.dsc-head`/`.dsc-item`/`.ds-tile`(+hover)/`#ds-info-panel`/`.ds-list-right`/`.ds-row`(+hover).
- **Wrap de `render`** : la **clé de changement d'écran** inclut `current|connecte|dsListe|dsHub|dsSel|dsActiveRub` → l'effet se déclenche sur **toutes les pages de présentation** (pas seulement les modules), une fois par navigation (fenêtre 90 ms → gère le double-rendu `choisirDossier`+`dsEntrer`). Ré-applique `.yada-spatial-in` sur `.mod-wrap`/`.dash-wrap`/`.login-wrap` + `spawnSheen()`. `animation-fill-mode` par défaut (**none**) → **aucun transform/filter résiduel** (clic & overlays fixes préservés). **Respecte `prefers-reduced-motion: reduce`** (transition désactivée, le verre reste).

**Validé :** `node --check` (187 scripts, 0 erreur) + brace CSS (2010/2010 — CSS de l'addon injectée en JS) + Playwright (`spatial-glass-mod` présent ; **carte de module** en verre `backdrop-filter:blur(20px) saturate(1.5)` + dégradé bleu + bord `rgba(130,185,255,.2)` ; entrée : `.dsc-card` blur(22), tuiles blur(16) ; onde-souris `display:none` ; navigation entre écrans de présentation (accueil→liste→hub) et vers un module → `.yada-spatial-in` ré-appliqué + `.yada-sheen` créé puis retiré ; conteneur revient sans transform résiduel ; clic fonctionnel ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v403**.

---

## 🟢 MAJ précédente — Effet de clic (onde bleu Crystal) à chaque clic / toucher, partout — v402
**Quoi :** un **effet visuel jaillit à CHAQUE clic / toucher**, à l'**endroit exact du pointeur**, dans **tout le logiciel** (écran de connexion, modules, mobile). Une **onde lumineuse bleu Crystal** (anneau qui s'agrandit + point central lumineux) apparaît puis s'estompe (~0,5 s) — retour visuel « flashy blue » cohérent avec la DA.

**Comment — `yada-addon193` (100% additif) :** écouteur `pointerdown` (capture, passif) sur `document` → `burst(clientX, clientY)` crée deux `<span>` en `position:fixed` (anneau `.yada-ripple` + point `.yada-ripple-dot`, `pointer-events:none`, `z-index` très élevé) à la position du pointeur, animés par keyframes (`yadaRippleFx`/`yadaRippleDot`), **auto-retirés** à la fin de l'animation (+ filet `setTimeout 700 ms`). `<style id="click-fx-mod">`. **Respecte** `prefers-reduced-motion: reduce` (désactivé) et la règle « interface fixe » v235 (overlay éphémère, aucune carte déplacée) ; ignore les clics programmatiques (0,0). `pointerdown` = réactif au **toucher ET à la souris**, coordonnées viewport (compatibles `position:fixed`).

**Validé :** `node --check` (186 scripts, 0 erreur) + brace CSS (2010/2010 — CSS de l'addon injectée en JS) + Playwright (clic réel → apparition de `.yada-ripple` + `.yada-ripple-dot` à la position cliquée, puis retrait automatique ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v402**.

---

## 🟢 MAJ précédente — HUB : même disposition que la page « Liste des dossiers » (carte société à gauche + rubriques à droite) — v401
**Quoi :** la page du dossier (HUB) reprend **exactement la disposition de la page « Liste des dossiers »** : la **carte société est alignée à GAUCHE** (au niveau du titre, largeur ≤ 560 px comme le cadre d'infos de la liste) et les **rubriques sont à DROITE** (colonne 440–600 px, comme la liste des dossiers). Avant, le bloc HUB était **centré / décalé au milieu** (`max-width:1160px;margin:…auto`, colonnes `.95fr 1.05fr`) → il ne s'alignait pas sur la page de présentation des dossiers.

**Comment — 2 éditions CSS (`ecranHub`, `<style id="ds-flow-mod">`) :**
- `.ds-hub-grid` : `max-width:1160px;margin:10px 0 0 auto;grid-template-columns:.95fr 1.05fr;gap:16px;align-items:stretch` → **`grid-template-columns:1fr minmax(440px,600px);gap:28px;align-items:start;margin-top:6px`** (identique à `.ds-liste-layout`).
- `.ds-hub-main` : `display:flex` → **`display:flex;max-width:560px`** (carte société capée comme `#ds-info-panel` de la liste).

**Validé :** `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (HUB : `.ds-hub-grid` = grille 2 colonnes `1fr minmax(440,600)`, carte société alignée à gauche `x≈145` = titre, rubriques à droite ; même disposition que « Liste des dossiers » ; 0 pageerror) + filet d'équilibre (vente 1200=1200, achat 600=600 ✅). Badge → **v401**.

---

## 🟢 MAJ précédente — Sélectionner un dossier → HUB directement (page « Dossier sélectionné » supprimée) + ancienne page de cartes définitivement retirée + cache vidé — v400
**Quoi :** deux demandes. (1) **Plus aucune page intermédiaire après avoir sélectionné un dossier** : cliquer un dossier dans la « Liste des dossiers » **atterrit directement dans le HUB** (carte société + choix des rubriques/modules) — l'écran **« Dossier sélectionné »** (une seule carte) est **supprimé**. (2) **L'ancienne page « Sélectionnez un dossier »** (barre de recherche + grille de cartes `.dossier-card` + « Réinitialiser (démo) ») est **définitivement supprimée** du code de base (elle réapparaissait via un **cache** périmé) — la fonction de base ne rend **plus jamais** de barre de recherche ni de grille de cartes ; le **cache du service worker est vidé** (bump `yada-v29 → yada-v30`) pour que la suppression prenne effet immédiatement en ligne.

**Comment — 4 éditions :**
- `dsSelectionner(id)` : `window.dsHub=false` → **`window.dsHub=true`** (sélection → HUB direct).
- `dsScreen()` : suppression de la branche `if(window.dsSel && dossierEntry(...)) return ecranSelUnique(...)` → tout `dsSel` sans état liste route vers **`ecranHub`**.
- **`ecranSelectionDossier()` (fonction de base, ligne ~4191)** : vidée de sa barre de recherche (`.login-search`), de sa grille (`.dossier-grid`/`.dossier-card`) et du bouton « Réinitialiser (démo) » → rend désormais l'**accueil « Espace dossiers »** (boutons seuls : Liste Dossier / Créer / Importer). Belt-and-suspenders : même en dernier recours (catch-de-catch de l'override addon189), **aucune carte ne peut réapparaître**.
- `sw.js` : `CACHE 'yada-v29' → 'yada-v30'` (invalide l'ancien cache → dernière version servie).

**Validé :** `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (accueil par défaut : **0** barre de recherche, **0** grille de cartes, bouton « Liste Dossier » présent ; ouvrir liste → `dsListe=true` ; **sélectionner d-1 → `dsHub=true`, `dsListe=false`, HUB rendu (5 rubriques), aucun `ds-grid-solo`** ; accueil de base : 0 `.dossier-card` / 0 `.login-search` ; 0 pageerror) + filet d'équilibre (d-test : vente 1200=1200, achat 600=600 ✅). Badge → **v400**.

---

## 🟢 MAJ précédente — L'ancienne page « Sélectionnez un dossier » (recherche + grille) ne peut plus réapparaître — v399
**Quoi :** l'override d'`ecranSelectionDossier` (`yada-addon189`) retombait sur l'**ancienne page « Sélectionnez un dossier »** (barre de recherche + grille de cartes + Réinitialiser démo) en cas d'erreur de `dsScreen()`. Désormais, en cas d'erreur, il affiche l'**accueil « Espace dossiers »** (boutons seuls : Liste Dossier / Créer / Importer) — l'ancienne page ne s'affiche **jamais**. (La carte « Dossier sélectionné » utilise déjà le même composant `.dossier-card` que les cartes de l'ancienne page → même taille.)

**Comment — 1 édition d'`yada-addon189` :** `catch(e){ return _e.apply(...) }` → `catch(e){ try{ return ecranAccueil(); }catch(e2){ return _e.apply(...) } }`. Note : dans tous les états testés (`accueil/liste/selUnique/hub`) `dsScreen()` ne lève pas d'erreur ; l'apparition de l'ancienne page côté utilisateur venait d'un **cache** d'une version antérieure — le bump v399 force la mise à jour. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (état par défaut → « Espace dossiers » boutons, **sans** barre de recherche ni grille de cartes ; 0 pageerror) + filet d'équilibre ✅. Badge → **v399**.

---

## 🟢 MAJ précédente — Liste des dossiers : lignes NETTES (flou par ligne retiré), flou seulement sur les bords + défilement trackpad — v398
**Quoi :** la liste paraissait **floue** (chaque ligne recevait un `blur`/opacité selon sa position). Ce **flou par ligne est retiré** : les lignes sont **nettes**. Le **flou est conservé uniquement sur les bords haut/bas** (fondu du masque CSS `mask-image`). Le **défilement au trackpad/molette** fonctionne.

**Comment — `yada-addon192` :** `paint()` ne calcule plus d'opacité/`blur` par ligne — il se contente d'effacer tout `opacity`/`filter` résiduel (lignes nettes) ; le fondu de bord vient du `mask-image` (inchangé) ; défilement natif (`overflow-y:auto` + `overscroll-behavior:contain` + `-webkit-overflow-scrolling:touch`, sans transform 3D depuis v397). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (session ouverte : 6 lignes `opacity:1`/`filter:none` — nettes ; masque de bord présent ; molette réelle → scrollTop 240 ; survol OK ; 0 pageerror) + filet d'équilibre ✅. Badge → **v398**.

---

## 🟢 MAJ précédente — Liste des dossiers : défilement RÉTABLI (retrait des transforms 3D qui bloquaient molette & survol) — v397
**Quoi :** la liste des dossiers **ne défilait pas** (molette/trackpad) et le **survol ne marchait plus sur certaines lignes** : les **transforms 3D** de l'effet roue (`perspective` + `rotateX` + `translateZ`) sortaient les lignes du plan de la souris → clics/molette/survol la manquaient (surtout Safari). L'effet « flou » est conservé mais **en 2D uniquement** (opacité + `blur` + masque de fondu haut/bas) → **le défilement natif et le survol fonctionnent**. Ajout d'une **barre de défilement fine bleue** visible.

**Comment — `yada-addon192` :** `paint()` ne pose plus de `transform` 3D (retrait `translateZ`/`rotateX`), garde `opacity`+`blur` ; `.ds-list-right` sans `perspective`, `overscroll-behavior:contain`, `scrollbar-width:thin` + `::-webkit-scrollbar` bleu 9px ; `.ds-row` sans `transform-style:preserve-3d`. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (avec session ouverte : survol ligne → panneau « DOSSIER 4 » ; **molette réelle → scrollTop 220→440** ; auparavant bloqué à 0 ; 0 pageerror) + filet d'équilibre ✅. Badge → **v397**.
*(Note : les tests précédents étaient faussés par l'overlay `#sec-lock` qui recouvrait la liste ; test refait avec appareil de confiance `yada-remember`.)*

---

## 🟢 MAJ précédente — Liste des dossiers : liste alignée sur le cadre d'infos (même haut + même hauteur), boutons visibles — v396
**Quoi :** sur l'écran « Liste des dossiers », la **liste défilante (droite) a exactement le même haut et la même hauteur que le cadre d'informations (gauche)** ; les **boutons du bas restent visibles**. Avant, la liste (60vh + padding 16vh) débordait plus bas et flottait ; désormais sa hauteur est **synchronisée** sur celle du cadre d'infos (bornée à 60vh pour garder les boutons visibles).

**Comment — `yada-addon192` :** `.ds-liste-layout{align-items:start}` (tops alignés) ; `.ds-list-right` sans `max-height` fixe, `padding:16vh→22px` ; `sync()` mesure la hauteur du `#ds-info-panel` et pose `box.style.height/maxHeight = clamp(300, hauteur, 60vh)` puis repeint la roue ; appelé dans `wire()`, après `renderInfo()` (survol → le cadre change) et sur `resize`. Le panneau vide reçoit `min-height:360px` (proche de la carte pleine) pour éviter les sauts. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (H=900 & 1229 : cadre et liste — top 254, hauteur 423/423, écart 0 ; boutons visibles bas 763 ; survol → carte + sync ; 0 pageerror) + filet d'équilibre ✅. Badge → **v396**.

---

## 🟢 MAJ précédente — Rubriques : page intermédiaire supprimée → entrée directe + barre latérale RÉDUITE (modules de la rubrique) — v395
**Quoi :** la **page intermédiaire de rubrique** (liste de cartes « Informations société / Paramétrage / … ») est **supprimée**. Cliquer sur une rubrique du HUB (Permanent, Déclarations, RH, Pilotages, Comptabilité) **entre directement dans son 1er module**, avec une **barre latérale RÉDUITE** affichant **uniquement les modules de cette rubrique** (pas la barre latérale complète, pas les outils du bas). Un bouton **« ‹ Retour au dossier »** en haut de cette barre ramène au HUB.

**Comment :** `yada-addon189` : `dsEntrerRubrique(key)` (pose `window.dsActiveRub`, entre dans `RUBRIQUES[key].mods[0]`) remplace `dsOuvrirRubrique` sur les tuiles du HUB ; `ecranRubrique` n'est plus routé (branche retirée de `dsScreen`) ; `window.RUBRIQUES`/`window.modLabel` exposés. `yada-addon190` : `buildRubNav(R)` remplace le contenu de `#nav` par les seuls modules de la rubrique (bouton retour + section + boutons `dsNavModule(mod)`), `apply()` pose `data-rubnav="1"` (aside visible, `data-noside` retiré) et **masque `.side-foot`** (inline `display:none!important`) ; `dsNavModule` navigue dans la rubrique ; `dsRetourModule` efface `dsActiveRub`. Hors rubrique (autre entrée) : comportement v383 conservé (aside masquée + bouton flottant). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (clic « Permanent » → entrée directe `current=infosociete`, `data-rubnav=1`, aside visible, nav = [Retour + 5 modules Permanent], `.side-foot` masquée ; nav interne → `plancomptable` actif ; « Comptabilité » → 13 modules ; retour → HUB, `dsActiveRub=null` ; 0 pageerror) + filet d'équilibre ✅. Badge → **v395**.

---

## 🟢 MAJ précédente — Liste des dossiers : panneau d'infos à gauche (survol) + liste à droite, lignes plus grandes — v394
**Quoi :** sur l'écran « Liste des dossiers », la liste est **rangée à droite** (défilable, effet roue conservé) avec des **barres de dossier plus grandes**, et un **panneau d'informations s'affiche à gauche au survol** d'un dossier (nom, forme, SIREN, SIRET, Code APE, N° TVA, Dirigeant, Activité, Adresse). Au repos, le panneau invite « Survolez un dossier… ».

**Comment :** `ecranListe` (populé) passe en grille `.ds-liste-layout` (col. gauche `#ds-info-panel` + col. droite `#ds-liste-scroll`) ; `dossierRow` reçoit `data-id`. `yada-addon192` : CSS `.ds-liste-layout{grid-template-columns:1fr minmax(440px,600px)}`, `.ds-info-col{position:sticky}`, lignes agrandies (`.ds-row{padding:16px 20px}`, avatar 44, nom 16px) ; `dossierInfo(id)` (lit `db.cabinet.dossiers` + `db.dossiersData[id].societe`), `renderInfo(id)` (carte `.dsc-*` réutilisée), écouteurs `mouseover`/`focusin` délégués sur le conteneur → remplit le panneau. Mobile : 1 colonne, panneau masqué. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (grille 980px/600px : info à gauche `x146`, liste à droite `x1154` ; lignes 74 px ; survol ligne 2 → panneau « DOSSIER 2 » + 8 infos ; boutons visibles ; 0 pageerror) + filet d'équilibre ✅. Badge → **v394**.

---

## 🟢 MAJ précédente — HUB : cartes réduites (société + rubriques) → bouton « Changer de dossier » visible — v393
**Quoi :** sur la page du dossier (HUB), la carte société et les 5 rubriques remplissaient tout l'écran et le bouton **« Changer de dossier »** était coupé en bas. Les **cartes sont réduites** (paddings/tailles de police plus compacts, avatar plus petit) → la grille passe de ~640 px à ~437 px de haut et le bouton redevient **bien visible**.

**Comment — surcharges compactes ajoutées à `ds-flow-mod` (`yada-addon189`) :** `.ds-tile{padding:10px 15px}` + libellés réduits ; `.dsc-head{padding:13px 18px}`, `.dsc-av{44×44}`, `.dsc-nom{18px}`, `.dsc-grid{padding:11px 15px 12px;gap:8px}`, `.dsc-item{padding:8px 11px}`, `.dsc-l{9.5px}/.dsc-v{12.5px}` ; `.ds-hub-side{gap:8px}` ; `.ds-hub-wrap .login-actions{margin-top:14px}`. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (H=1000 & 1150 : grille 437 px, bouton « Changer de dossier » bas 747 px → **visible** ; 0 pageerror) + filet d'équilibre ✅. Badge → **v393**.

---

## 🟢 MAJ précédente — Liste des dossiers : compacte, remontée, lignes plus larges, boutons visibles — v392
**Quoi :** l'écran « Liste des dossiers » ne laisse plus un grand vide au-dessus de la liste : la liste est **remontée** (juste sous le sous-titre), **compacte** (moins haute), les **lignes de dossier sont plus larges**, et les **boutons du bas** (← Retour · Créer un dossier · Importer) restent **bien visibles** (plus coupés). L'effet roue/flou est conservé (zone nette élargie, effet plus doux).

**Comment — 1 édition CSS + paint d'`yada-addon192` :** `.ds-list-right` : `width:min(520px,44vw)→min(680px,52vw)` (lignes plus larges), `margin:8px…→2px…auto` (remontée), `max-height:62vh→48vh` (compacte → boutons visibles), `padding:31vh→13vh` (moins de vide, liste plus haute), masque de fondu resserré ; `paint()` : `half=clientHeight/2→*0.58` (zone nette plus large) + intensités réduites (rot 46→40, tz 70→58, op .82→.72, blur 6.5→5.5). Mobile : `width:92vw;max-height:56vh;padding:16vh`. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (H=950 & 1229 : liste top 250 px — remontée ; lignes 656 px — plus larges ; boutons « ← Retour / Créer / Importer » **visibles** dans le viewport ; 0 pageerror) + filet d'équilibre ✅. Badge → **v392**.

---

## 🟢 MAJ précédente — HUB : bloc (carte société + rubriques) décalé à droite, place pour le bouton — v391
**Quoi :** sur la page du dossier (HUB), le bloc **carte société + 5 rubriques** est **décalé vers la droite** de l'écran (aligné à droite), rapprochant la carte des rubriques. La zone de **gauche** (titre du dossier + bouton **« Changer de dossier »**) est ainsi dégagée et le bouton reste bien visible à gauche.

**Comment — 1 édition CSS d'`yada-addon189` :** `.ds-hub-grid{max-width:1000px;margin:10px auto 0;grid-template-columns:1.05fr .95fr;gap:18px}` → `max-width:1160px;margin:10px 0 0 auto` (aligné à droite) `;grid-template-columns:.95fr 1.05fr;gap:16px` ; ajout `.ds-hub-wrap .login-actions{margin-top:20px;justify-content:flex-start}`. Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (viewport 1900 : grille alignée à droite — écart droit 114 px vs gauche 562 px ; bouton « Changer de dossier » visible à gauche `left:146` ; 0 pageerror) + filet d'équilibre ✅. Badge → **v391**.

---

## 🟢 MAJ précédente — Création de dossier : K-bis ET Statuts facultatifs — v390
**Quoi :** on peut désormais **créer un dossier sans joindre le K-bis ni les Statuts** (les deux deviennent facultatifs ; en v194 seuls les Statuts l'étaient). La création n'est plus bloquée par l'absence de pièces légales — on peut les ajouter plus tard.

**Comment — `creerDossierComplet()` :** suppression du blocage `if(!cdDocs.kbis) return toast('Veuillez joindre le K-bis')` ; `kbisRecu/kbisNom/kbisPdf` renseignés seulement si un fichier est joint (`!!cdDocs.kbis`, comme les Statuts) ; libellés du formulaire (« Extrait K-bis (facultatif) », sous-titre « K-bis et Statuts facultatifs ») et toast adaptés (liste des pièces réellement jointes, ou « à joindre plus tard »). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (création avec `cdDocs={}` → dossier créé, `kbisRecu=false`, `statutsRecu=false`, entrée dans le dossier `connecte=true`/`dash` ; 0 pageerror) + filet d'équilibre ✅. Badge → **v390**.

---

## 🟢 MAJ précédente — Liste des dossiers VIDE : bouton « Créer un dossier » à sa place (fin du grand cadre vide) — v389
**Quoi :** en cliquant « Liste des dossiers » **sans aucun dossier**, l'écran n'affiche plus le grand conteneur « roue » vide (padding `31vh` → énorme espace vide qui décalait le bouton). L'écran vide reprend **exactement la disposition de la première page** : titre + sous-titre + barre d'actions (← Retour · **Créer un dossier** · Importer) — le bouton « Créer un dossier » reste **à sa place** (même position que sur l'accueil). Dès qu'au moins un dossier existe, la liste « roue/cylindre » à droite réapparaît.

**Comment — 1 édition d'`ecranListe` (`yada-addon189`) :** si `dossiers().length===0` → rendu sans `#ds-liste-scroll` (pas de cadre roue), juste `loginHead + titre + sous-titre + actions('← Retour')`. Sinon, rendu inchangé (liste roue). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (liste vide : **aucun** `#ds-liste-scroll`, bouton « Créer un dossier » à **top:278 = identique à l'accueil**, écart 0 px ; liste peuplée : roue présente, 5 lignes ; 0 pageerror) + filet d'équilibre ✅. Badge → **v389**.

---

## 🟢 MAJ précédente — Liste des dossiers : défilement libre (chaque dossier atteint le centre net) — v388
**Quoi :** dans la liste « roue/cylindre » (v387), les **premier et dernier dossiers restaient bloqués dans le flou** (padding fixe 96px insuffisant) → impossible de les amener au centre net. Le **rembourrage haut/bas passe à ~½ hauteur du conteneur** (`padding:31vh`) : la liste **monte et descend sans limite**, chaque dossier peut être défilé jusqu'au **centre net** (haut comme bas).

**Comment — 1 édition CSS d'`yada-addon192` :** `.ds-list-right{padding:96px 10px}` → `padding:31vh 10px` (moitié de `max-height:62vh`). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (12 dossiers : 1ᵉʳ centré opacité **1**, dernier centré opacité **1** — auparavant le dernier restait à .18 ; 0 pageerror) + filet d'équilibre ✅. Badge → **v388**.

---

## 🟢 MAJ précédente — Liste des dossiers : rangée à droite + effet « roue / cylindre » (flou circulaire au défilement) — v387
**Quoi :** l'écran **« Liste des dossiers »** (après clic sur « Liste Dossier ») affiche la liste **rangée à droite** de l'écran, avec un **effet de roue/cylindre** au défilement : les lignes **montent en tournant dans le flou** (haut) et **descendent dans le flou** (bas), comme un sélecteur circulaire (rotation `rotateX` + éloignement `translateZ` + opacité décroissante + `blur` progressif, fondus haut/bas via `mask-image`).

**Comment — `yada-addon192` (100% additif) + 1 édition d'`ecranListe` :** le conteneur devient `<div id="ds-liste-scroll" class="ds-list ds-list-right">` ; CSS `.ds-list-right` (placé à droite `margin:… auto`, `width:min(520px,44vw)`, `max-height:62vh`, `overflow-y:auto`, `perspective:1000px`, `mask-image` fondu haut/bas, scrollbar masquée) ; `paint(box)` calcule pour chaque `.ds-row` `rotateX`/`translateZ`/opacité/`blur` selon sa distance au centre ; `wire()` (écouteur `scroll` throttlé rAF + repaint après chaque `render`). Validé : `node --check` (185 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (liste à droite : box 680→1200 sur 1400 ; effet : haut op .55/blur 2.4, bas op .18/blur 6.5 ; après défilement le flou se déplace — haut op .18/blur 6.5 ; 0 pageerror) + filet d'équilibre ✅. Badge → **v387**.

---

## 🟢 MAJ précédente — Application VIDE : suppression des dossiers de démonstration (+ purge unique de l'appareil) — v386
**Quoi :** l'application **ne contient plus aucun dossier de démonstration** (ALR CONSEIL/d-ama, MBC/d-mbc, BY HOLDING/d-sci42). Au démarrage, le **portefeuille est vide** (`db.cabinet.dossiers=[]`, `activeId=null`) — l'utilisateur **crée ou importe** ses propres dossiers depuis « Espace dossiers ». Une **purge unique** efface aussi les dossiers **déjà enregistrés sur l'appareil** (localStorage + IndexedDB) pour que la suppression prenne effet immédiatement.

**Comment :** `cabinetDefaut().dossiers=[]` (`total:0`) ; `seed()` initialise les champs de travail à `datasetVide()` (aucun `construireAMA/MBC/SCI42`), `activeId=null` ; `ensureMBC()` (addon163) neutralisé (`return false`) ; **`yada-addon191`** (purge unique, drapeau `localStorage 'yada-empty-386'`) : si des données existent (`yada-db`/`yada-db-ts`), efface localStorage + `indexedDB.deleteDatabase('yada-store')` puis recharge une fois (installation neuve : aucun effet). **Test CI réécrit** (`tests/equilibre-ecritures.mjs`) : construit un dossier de travail éphémère `d-test` + 2 tiers, exerce `posterFacture` vente/achat (le seed n'a plus de démo). Validé : `node --check` (184 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (démarrage vide : 0 dossier, `activeId=null`, `db.societe` présent, liste « Aucun dossier », 0 pageerror) + filet d'équilibre (d-test : vente 1200=1200, achat 600=600 ✅). Badge → **v386**.

---

## 🟢 MAJ précédente — Modules : bouton « Retour » + repères rangés en bas à gauche (plus de chevauchement du titre) — v385
**Quoi :** dans les modules (sans barre latérale), le bouton **« ‹ Retour au dossier »** chevauchait le titre (haut-gauche) et les repères **YADA · vNNN** / **Enregistré ✓** flottaient sur le contenu. Ces éléments sont désormais **rangés en un petit bandeau vertical en bas à gauche** — toujours accessibles, sans recouvrir le titre ni le contenu du module. Ordre (de bas en haut) : Enregistré ✓ · (Synchro) · YADA · vNNN · ‹ Retour au dossier.

**Comment — `yada-addon190` (CSS) :** `#ds-back-chip` repositionné `left:12px;bottom:118px` (au-dessus des repères, z-index 10000) au lieu de `top:14px` ; alignement des repères en `noside` : `#yada-save-ind{bottom:12px}`, `#yada-cloud-ind{bottom:48px}`, `#yada-ver{bottom:84px}` (tous `left:12px`) ; retrait de l'ancien `padding-top:60px` sur `.mod-wrap`/`.dash-wrap` (le bouton ne monopolise plus le haut). Validé : `node --check` (183 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (module FEC : Retour en bas-gauche 12/747, version 12/793, save 12/864 ; titre en haut (top 18) **non chevauché** ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v385**.

---

## 🟢 MAJ précédente — HUB : carte société réajustée (fin de l'espace vide en haut), colonnes équilibrées — v384
**Quoi :** correction du **grand vide en haut de la carte société** du HUB (introduit en v382 par `min-height:100vh` + contenu centré). La carte **ne flotte plus au milieu** : l'en-tête (avatar + nom) revient **tout en haut**, la grille d'informations s'affiche dessous, et la carte s'ajuste à la **même hauteur que la colonne des 5 rubriques** (colonnes équilibrées). Présentation du parcours d'entrée (ouverture YADA → Espace dossiers → Liste → Dossier sélectionné → HUB) rendue cohérente.

**Comment — `yada-addon189` (CSS) :** `.ds-hub-grid{align-items:stretch}` (colonnes de hauteur égale) ; `.dsc-card{flex:1;display:flex;flex-direction:column}` (sans `justify-content:center` ni `min-height:calc(100vh - 250px)`) ; `.dsc-grid{flex:1;align-content:start}` (l'en-tête reste en haut, la grille remplit la carte). Validé : `node --check` (183 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte et rubriques même haut (258 px), en-tête à 16 px du haut de la carte = plus d'espace vide, hauteurs 506/520 px ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v384**.

---

## 🟢 MAJ précédente — Modules SANS barre latérale (navigation par le HUB) + bouton « ← Retour au dossier » — v383
**Quoi :** la **barre latérale de navigation (`aside`/`#nav`) est masquée dans TOUS les modules** (espace cabinet) → chaque module s'affiche en **pleine largeur**. La navigation entre modules se fait par le **HUB** (rubriques) : un **bouton flottant « ‹ Retour au dossier »** (haut-gauche) ramène au HUB du dossier courant pour changer de rubrique / module. L'espace **Client** (et mobile) n'est pas touché (garde sa navigation propre).

**Comment — `yada-addon190` (100% additif) :** `<style id="noside-mod">` — `body[data-noside="1"] aside{display:none}` + `.layout:not(.solo){grid-template-columns:1fr}` + bouton `#ds-back-chip` (fixed, visible seulement en module) + `padding-top:60px` sur `.mod-wrap`/`.dash-wrap` pour dégager le bouton. Un **wrap de `render`** pose `data-noside="1"` sur `<body>` quand `connecte && sessionRole!=='client'` (sinon retire l'attribut) et crée le bouton une fois. `dsRetourModule()` revient au HUB (`dsSel` = `db.activeId`, `dsHub=true`, `connecte=false`) via le **drapeau `_dsSuppressHomeReset`** ajouté au garde v380 (pour revenir au HUB et non à « Espace dossiers »). Validé : `node --check` (183 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (module tva/compta → `aside` masqué, `#nav` masqué, layout 1 colonne, bouton « ‹ Retour au dossier » 172×35 visible en haut-gauche ; clic → HUB avec carte société + 5 rubriques ; écran d'accueil → bouton `display:none`, pas de `data-noside` ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v383**.

---

## 🟢 MAJ précédente — HUB : carte société allongée (pleine hauteur), plus d'infos, contenu centré — v382
**Quoi :** dans la page HUB (`yada-addon189`), la **carte principale de la société** (celle de gauche) est **allongée sur toute la hauteur de la page** (du haut vers le bas de la zone) et son **contenu est cadré au milieu** (centré verticalement). Elle affiche désormais **plusieurs informations** : SIREN · SIRET · Code APE · N° TVA · Forme juridique · Dirigeant · Activité · Adresse (un champ vide s'affiche « — » au lieu d'être masqué). La colonne des 5 rubriques à droite reste alignée en haut (inchangée).

**Comment — `yada-addon189` :** `socItem` rend toujours l'item (`val||'—'`) ; `ecranHub` liste 8 champs. CSS : `.dsc-card{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:calc(100vh - 250px)}` (pleine hauteur + contenu centré), `.ds-hub-main{display:flex;align-self:stretch}`, grille `align-items:start` conservée (la colonne rubriques n'est pas étirée). Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte **650 px** de haut jusqu'en bas de page, `justify-content:center`, 8 items affichés, colonne rubriques en haut ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v382**.

---

## 🟢 MAJ précédente — Écran « Dossier sélectionné » : carte aérée des boutons d'action — v381
**Quoi :** sur l'écran « Dossier sélectionné », la carte était collée aux boutons du dessous (Changer de dossier / Créer / Importer). Un **espacement vertical** est ajouté sous la carte (34 px) pour aérer la mise en page.

**Comment — 1 édition CSS d'`yada-addon189` :** `.ds-grid-solo{…margin:14px 0 34px!important}` + `.ds-grid-solo + .login-actions{margin-top:8px}`. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (écart carte↔actions = 34 px ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v381**.

---

## 🟢 MAJ précédente — Connexion : on atterrit toujours sur « Espace dossiers » — v380
**Quoi :** à la **connexion** (login, ou re-connexion après verrouillage / déconnexion dans la même session), l'utilisateur **atterrit toujours sur la page « Espace dossiers »** (accueil avec Liste Dossier / Créer / Importer), au lieu de retomber sur le dernier écran de sélection (dossier sélectionné / hub / rubrique) laissé en mémoire. Un rechargement complet atterrissait déjà sur l'accueil (états `window` frais) ; le cas corrigé est la **re-connexion sans rechargement** (les états `window.dsSel/dsHub/dsRub` persistaient).

**Comment — `yada-addon189` (1 ajout) :** un **garde sur `render`** mémorise l'état `connecte` ; à chaque transition **connecté→déconnecté** (verrouillage / déconnexion, détectée au 1er rendu de re-login où `connecte` est déjà `false` mais l'état précédent était `true`), il **réinitialise le parcours** (`dsSel=null; dsListe=false; dsHub=false; dsRub=null`) → `dsScreen()` renvoie `ecranAccueil()`. Installé une seule fois (`window.__dsHomeGuard`), lit le `let connecte` global. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (entrée module → `connecte=true`+barre latérale ; puis `connecte=false`+rendu → états remis à zéro, titre « Espace dossiers », bouton « Liste Dossier » présent ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v380**.

---

## 🟢 MAJ précédente — Écran « Dossier sélectionné » : carte remise à la taille d'origine (compacte) + cadre conservé — v379
**Quoi :** la carte « Dossier sélectionné » reprend sa **taille d'origine (compacte)** : colonne `440px` → **`280px`** (rendu ~263 px), plus de `min-height:320px` ni de padding agrandi (hauteur naturelle ~224 px). Le **cadre bleu** (bordure 2px + anneau `box-shadow`) est **conservé**.

**Comment — 1 édition CSS d'`yada-addon189` :** `.ds-grid-solo{grid-template-columns:280px…justify-items:start}` (retour v376) ; `body[data-theme] .ds-grid-solo .dossier-card` ne garde que le cadre (`border:2px` + anneau), sans `min-height`/`flex`/`padding` agrandi ; ligne `.dc-foot{margin-top:auto}` retirée. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte **263×224 px**, bord 2px ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v379**.

---

## 🟢 MAJ précédente — HUB : carte principale de la société redessinée (plus esthétique) — v378
**Quoi :** dans la page HUB (`yada-addon189`), la **carte principale de la société** (à gauche : nom, SAS, adresse…) est **remplacée par une carte plus esthétique** : **en-tête à dégradé bleu** avec **avatar arrondi** (initiale de la société), **nom en gros**, **badge de forme juridique** + **SIREN** en sous-titre, puis une **grille d'informations** (SIRET, Code APE, N° TVA, Dirigeant en 2 colonnes ; Activité & Adresse en pleine largeur) — chaque info dans un **pavé translucide bleu** avec libellé en petites capitales. S'adapte aux champs renseignés (les vides sont masqués ; message si société à compléter).

**Comment — `yada-addon189` :** `socItem(lbl,val,full)` (pavé label/valeur, option pleine largeur) ; `ecranHub` construit `.dsc-card` (`.dsc-head` avatar+nom+tags, `.dsc-grid` items). CSS `<style id="ds-flow-mod">` : `.dsc-card/.dsc-head/.dsc-av/.dsc-nom/.dsc-badge/.dsc-siren/.dsc-grid/.dsc-item(.full)/.dsc-l/.dsc-v` (responsive 1 colonne < 520px). L'ancien rendu `.ds-soc-row` (lignes label/valeur) n'est plus utilisé. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte `.dsc-card` : avatar « M », nom « MBC », badge « SAS », en-tête dégradé, 0 ancienne `.ds-soc-row` ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v378**.

---

## 🟢 MAJ précédente — HUB : rubriques sans barre latérale + carte « Dossier sélectionné » cadrée/agrandie — v377
**Quoi :** deux changements dans le parcours d'entrée (`yada-addon189`).
1. **Rubriques sans barre latérale + regroupement par nature** : les 5 cartes du HUB (Permanent, Déclarations, Ressources Humaines, Pilotages, Comptabilité) n'entrent plus directement dans un module unique (avec barre latérale) — chaque carte ouvre désormais une **page de rubrique SANS barre latérale** listant **uniquement les modules de sa nature** :
   - **Permanent** → paramétrages principaux : Informations société · Paramétrage · Plan comptable · Coffre-fort · Société & création du dossier.
   - **Déclarations** → tous les modules de déclarations : Module TVA (CA3).
   - **Ressources Humaines** → uniquement RH : Salarié · Charges et Paie.
   - **Pilotages** → pilotage analytique & comptable : Tableau de bord · Pilotage · Analytique & rentabilité · Sociétés (portefeuille).
   - **Comptabilité** → tous les modules de comptabilité : Consultation · Journal · Éditions · FEC · Suivi des règlements · TIERS · Fournisseurs · Client · Banque · Saisie journal Banque · Rapprochement · Immobilisations · Assistant IA.
   Un clic sur un module de la rubrique **entre réellement dans le module** (`dsEntrer` → `choisirDossier` + `current=mod`, app complète avec barre latérale).
2. **Carte « Dossier sélectionné » cadrée + allongée + élargie** : colonne `280px` → **`440px`** (plus large), carte en **flex colonne `min-height:320px`** (plus haute, pied ancré en bas via `.dc-foot{margin-top:auto}`), **cadre bleu** (`border:2px` + anneau `box-shadow 0 0 0 4px`).

**Comment — `yada-addon189` :** `RUBRIQUES` (map clé→{titre,desc,mods}) + `modLabel(id)` (via `PAGES`) ; état `window.dsRub` ; `dsOuvrirRubrique(key)` / `dsRetourHub()` ; `ecranRubrique(key)` (page login-wrap sans barre latérale, tuiles `dsEntrer(mod)`) ; les tuiles du HUB appellent `dsOuvrirRubrique(...)` au lieu de `dsEntrer(...)`. CSS `.ds-grid-solo` (440px), `body[data-theme] .ds-grid-solo .dossier-card` (cadre/hauteur), `.ds-rub-grid`. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (HUB → `dsOuvrirRubrique`, rubriques sans `#nav` visible, listes de modules correctes par nature, entrée réelle d'un module → barre latérale présente ; carte 440×320 avec bord 2px + anneau ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v377**.

---

## 🟢 MAJ précédente — Écran « Dossier sélectionné » : carte à la taille standard (compacte) — v376
**Quoi :** la carte du dossier sélectionné reprend les **dimensions d'une carte de dossier standard** (compacte) au lieu de s'élargir : largeur de colonne fixée à **280 px** (`grid-template-columns:280px`), rendu compact ~261 px, toujours aligné à gauche.

**Comment — 1 édition CSS d'`yada-addon189` (`.ds-grid-solo`) :** `minmax(260px,360px)` → **`280px`** (+ `justify-content/items:start` conservés). Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte largeur **261 px**, `left=116px` ; 0 pageerror). Badge → **v376**.

---

## 🟢 MAJ précédente — Écran « Dossier sélectionné » : carte alignée à GAUCHE — v375
**Quoi :** sur l'écran **« Dossier sélectionné »**, la carte du dossier (centrée jusqu'ici) est **décalée à gauche**, alignée avec le titre et les boutons.

**Comment — 1 édition CSS d'`yada-addon189` (`.ds-grid-solo`) :** `justify-content:center` → **`justify-content:start!important;justify-items:start!important`**. Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (carte `left=116px` = titre 116 = actions 116, viewport 1400 ; 0 pageerror). Badge → **v375**.

---

## 🟢 MAJ précédente — Bouton « Liste Dossier » à gauche, taille standard (avant « Créer un dossier ») — v374
**Quoi :** sur la page d'accueil des dossiers, le gros bouton centré « Liste Dossier » (btn-lg) est remplacé par un **bouton de taille standard** (`btn btn-gold`, **même taille que « Créer un dossier »**) placé **en premier** dans la barre d'actions, **à gauche, avant « Créer un dossier »** → ordre : **Liste Dossier · Créer un dossier · Importer**.

**Comment — 1 édition d'`yada-addon189` (`ecranAccueil`) :** suppression du bloc `.ds-cta`/`.btn-lg` ; le bouton « Liste Dossier » est passé en 1ᵉʳ argument de `actions(extra)` (rendu avant Créer/Importer). Validé : `node --check` (182 scripts, 0 erreur) + Playwright (ordre `[Liste Dossier, Créer un dossier, Importer]`, plus de `.btn-lg`, 0 pageerror). Badge → **v374**.

---

## 🟢 MAJ précédente — Parcours d'entrée repensé : page dossiers → liste → dossier → HUB (5 rubriques) — v373
**Quoi :** refonte de la page des dossiers (après connexion, espace cabinet) :
1. **Page dossiers** : **aucune carte** de dossier, un bouton **« Liste Dossier »** (l'ancienne liste inline v371 et le libellé « (fenêtre) » sont retirés).
2. **Liste** : clic sur « Liste Dossier » → **liste des dossiers** (lignes cliquables) → **sélectionner** un dossier.
3. **Dossier sélectionné** : la page n'affiche plus que **le dossier sélectionné** (une seule carte).
4. **HUB (page fixe, non déplaçable/modifiable)** : clic sur la carte → carte **principale de la société** à gauche (dénomination, SIREN, SIRET, APE, TVA, activité, adresse, dirigeant) + à droite **5 cartes ouvrables** : **Permanent** (→ Informations société), **Déclarations** (→ TVA), **Ressources Humaines** (→ Salarié), **Pilotages** (→ Pilotage), **Comptabilité** (→ Analyse).
5. Chaque carte du hub **entre dans le module** correspondant → **page fixe avec la barre latérale** (l'app complète).

**Comment — `yada-addon189` (override `ecranSelectionDossier` tant que non connecté, 100% additif) :** états `window.dsSel/dsListe/dsHub` ; `dsOuvrirListe`/`dsSelectionner(id)`/`dsOuvrirHub`/`dsEntrer(mod)` (=`choisirDossier(id)` puis `current=mod;render()`) ; écrans `ecranAccueil`/`ecranListe`/`ecranSelUnique`/`ecranHub` ; réutilise `.login-wrap`/`.dossier-card` (thème). `TILES` mappe les 5 rubriques. `<style id="ds-flow-mod">`. Le libellé du bouton flottant v372 passe aussi à « Liste Dossier ». `choisirDossier` (entrée réelle) inchangé — appelé seulement au clic d'une carte du hub.

**Limites :** `choisirDossier` charge le dataset au clic d'une rubrique (la carte société du hub lit `db.cabinet.dossiers` + `db.dossiersData[id].societe` si présent). Validé : `node --check` (182 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (accueil : 0 carte, bouton « Liste Dossier », pas d'inline/« (fenêtre) » ; liste 3 dossiers ; sélection → 1 seule carte ; hub → carte société + 5 rubriques ; `dsEntrer` → app ouverte avec barre latérale `#nav` 18 items, pour compta/salarie/pilotage/tva/infosociete ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v373**.

---

## 🟢 MAJ précédente — « Liste Dossier » en fenêtre FLOTTANTE (déplaçable & modulable) — v372
**Quoi :** sur la page de sélection, un bouton **« Liste Dossier (fenêtre) »** ouvre un **panneau flottant** contenant la liste des dossiers :
- **barre de titre à glisser** pour déplacer la fenêtre (souris + tactile) ;
- **coin bas-droit** pour **redimensionner** (resize natif `resize:both`, min 300×220) ;
- **✕** pour fermer ;
- chaque ligne est **cliquable = entrer dans le dossier** ; le dossier **actif** porte un badge « Actif ». La fenêtre se rafraîchit après chaque rendu (changement de dossier/données).

**Comment — `yada-addon188` (100% additif) :** `dossierFloatOpen()` crée/affiche `#dossier-float` (position `fixed`, `resize:both`) une seule fois (persiste hors `#main`) ; `dragSetup()` (glisser la `#df-bar`) ; `dossierFloatRender()` (lignes `.df-row` depuis `db.cabinet.dossiers`, tri favoris, badge actif) ; `dossierFloatChoisir(id)`→`choisirDossier` ; bouton injecté dans `.login-actions` (wrap `ecranSelectionDossier`) ; refresh via wrap `render`. `<style id="dossier-float-mod">`.

**Limites :** la fenêtre reste sur `body` (peut flotter au-dessus de l'app après ouverture d'un dossier) ; réouverture via le bouton de la page de sélection. Validé : `node --check` (181 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (bouton présent ; ouverture visible `resize:both` ; 3 dossiers + badge actif « ALR CONSEIL » ; **déplacement** 370→570 ; **redimensionnement** 620×560 ; fermeture ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v372**.

---

## 🟢 MAJ précédente — Page de sélection : « Liste Dossier » (dossiers ouverts, actif protégé, fermeture des autres) — v371
**Quoi :** sur la **page de sélection des dossiers**, une section **« Liste Dossier »** apparaît **juste après le bouton Réinitialiser** (sous les cartes du portefeuille). Elle liste les **dossiers ouverts** (façon onglets) :
- **cliquer sur une ligne = entrer dans le dossier** (il devient actif) ;
- le **dossier ACTIF** (dernier ouvert, `db.activeId`) reste affiché avec un **badge « Actif »** et **n'est pas fermable** ;
- les **autres** dossiers ont un bouton **« ✕ Fermer »** → retirés de la liste (le dossier reste dans le portefeuille au-dessus, ré-ouvrable via sa carte).

**Comment — `yada-addon187` (100% additif) :** `db.cabinet.ouverts` (ids des dossiers ouverts, initialisé à tous ; purge des ids disparus ; l'actif y est toujours) ; wrap `choisirDossier` (ajoute l'id aux ouverts) ; `fermerDossierOuvert(id)` (retire des ouverts, refuse l'actif) ; wrap `ecranSelectionDossier` insère `listeBlock()` après `.login-actions` (via `replace`). `<style id="dossier-liste-mod">` (lignes cliquables, badge Actif bleu, bouton Fermer rouge).

**Limites :** « fermer » retire le dossier de la liste des ouverts (session persistée) sans supprimer le dossier ni ses données. Validé : `node --check` (180 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Liste Dossier après Réinitialiser ; actif « ALR CONSEIL » badge + **sans** bouton fermer ; MBC/BY HOLDING fermables ; fermer d-mbc → retiré des ouverts ; fermer l'actif → refusé ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v371**.

---

## 🟢 MAJ précédente — FEC → fiches d'immobilisation automatiques (avec plan d'amortissement) — v370
**Quoi :** à l'**import FEC** (et au chargement), chaque **acquisition d'immobilisation** détectée dans les écritures (ligne **classe 2 amortissable au DÉBIT**) crée automatiquement une **fiche `db.immos` complète** → le module Immobilisations calcule alors le **plan d'amortissement** (`immoPlan`) et les dotations.
- **Durée par défaut selon le compte** : logiciels 205 → 3 ans, constructions 213 → 25 ans, matériel/outillage 215 → 7 ans, véhicules 2182 → 5 ans, matériel info 2183 → 3 ans, mobilier 2184 → 10 ans, agencements 2181 → 10 ans, autres corporelles 5 ans, incorporelles 5 ans.
- **Comptes dérivés** : `compteAmort` via `compteAmortDe` (28x), `compteDot` (681110000 incorporel / 681120000 corporel) ; `montantHT` = débit de la ligne, `miseEnService` = date de l'écriture, `fournisseur` = libellé de la ligne 404.
- **Exclusions** : à-nouveaux, cessions/sorties, OD de dotation, et **immobilisations NON amortissables** (terrains 211, fonds 206/207, financières 26/27).

**Comment — `yada-addon186` (100% additif) :** `creerImmosDepuisEcritures()` parcourt `db.ecritures`, crée une fiche par ligne classe 2 amortissable au débit ; **idempotent** (skip si `im.ecritureId===e.id` déjà lié, ou doublon même compte + même montant qu'une fiche existante — y compris manuelle) ; `dureeParCompte()` ; hooks : wrapper `integrerFEC` (dépôt), `chargerDossier`, et une fois au démarrage.

**Limites :** durées **par défaut** (modifiables dans la fiche) ; type linéaire ; valeur résiduelle 0 ; les immobilisations non amortissables ne créent pas de fiche (pas de plan). Validé : `node --check` (179 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (import véhicule 2182 20 000 € → fiche `IMMO-002`, amort `281820000`, durée 60, plan calculé — 1ʳᵉ dotation prorata **2 222,22 €** ; matériel info 2183 → durée 36 ; terrain 211 → **non créé** ; idempotent ; démos inchangées ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v370**.

---

## 🟢 MAJ précédente — Tous les modules exploitent le FEC : Immobilisations & Charges/Paie dérivés des écritures — v369
**Quoi :** garantir que **lorsqu'un FEC est déposé, toutes ses écritures servent de base de données à traiter dans tous les modules**. La plupart des modules lisaient déjà `db.ecritures` (Analyse, Journal, Éditions, TVA, Tiers, Analytique, Banque, Suivi des règlements, Pilotage, Tableau de bord). Les **deux derniers modules qui n'avaient que leur propre registre** — **Immobilisations** et **Charges & Paie** — reçoivent désormais une **carte dérivée (lecture seule) calculée sur toutes les écritures** (FEC + saisie) :
- **Immobilisations & Financements** → « Immobilisations, amortissements & dotations — écritures (FEC inclus) » : KPI (immobilisations brutes 20-27, amortissements 28x, VNC, dotations 6811) + tables par compte.
- **Charges & Paie** → « Charges & paie — écritures (FEC inclus) » : KPI (rémunérations 641, cotisations 645, net à payer 421, organismes 431+437) + détail par famille (641/644/645/647/648/421/427/431/437/442).

**Comment — `yada-addon185` (100% additif, cabinet uniquement) :** greffe sur `pageImmos`/`pageChargesPaie` ; `soldes(pred)` agrège débit/crédit par compte `c9` filtré par préfixe sur `db.ecritures` ; `immoCard()`/`paieCard()` (réutilisent `.pil-t`/`.pil-kpis`). Aucune écriture modifiée (affichage/calcul).

**Limites :** cartes en lecture seule (le registre d'immobilisations `db.immos` et les bulletins restent la saisie détaillée) ; côté client, pas de carte. Validé : `node --check` (178 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Immo : carte dérivée + dotations 6811 ; Paie : 641/645 + masse salariale ; client sans carte ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v369**.

---

## 🟢 MAJ précédente — Nav : Pilotage & Salarié harmonisés aux autres sous-modules de Comptabilité (icônes) — v368
**Quoi :** les sous-modules **Pilotage** et **Salarié** sont désormais **présentés comme les autres sous-modules** de Comptabilité : leurs icônes emoji (🎯/🧑, retirées par le balayage anti-emoji v366 → icône vide) sont remplacées par des **glyphes géométriques** de la même famille que les autres subs (▦ ≣ ⇅ ⇄ ◭) → **Pilotage `◉`**, **Salarié `▥`**. `sec` passé à « Comptabilité » (cohérence palette de commandes).

**Comment — 1 édition de `PAGES` :** `{id:'pilotage',ico:'◉',sec:'Comptabilité',…}` et `{id:'salarie',ico:'▥',sec:'Comptabilité',…}` (glyphes **non** pictographiques, vérifiés côté navigateur → non supprimés par le balayage v366).

**Limites :** navigation/affichage uniquement. Validé : `node --check` (177 scripts, 0 erreur) + Playwright (glyphes `◉`/`▥` **non** Extended_Pictographic ; sous-modules Comptabilité : Pilotage `◉` et Salarié `▥` affichés `display:block` comme les autres ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v368**.

---

## 🟢 MAJ précédente — Nav : Pilotage & Salarié déplacés en sous-modules de Comptabilité — v367
**Quoi :** les modules **Pilotage** et **Salarié** deviennent des **sous-modules du module Comptabilité** (barre latérale cabinet), au lieu d'être dans la section « Pilotage » du haut. Ils apparaissent désormais en dépliant **Comptabilité** (après Analyse, Journal, Éditions, FEC, Suivi des règlements, Analytique, Plan comptable, Assistant IA).

**Comment — 1 édition d'`yada-addon164` :** `PILOTAGE=['dash','societe','client']` (retrait de `pilotage`/`salarie`) ; `m-compta.subs` complété par `'pilotage','salarie'`. Le dispatch `render()` et les entrées `PAGES` restent inchangés (les pages fonctionnent à l'identique).

**Limites :** réorganisation de navigation uniquement. Validé : `node --check` (177 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (sous-modules de Comptabilité = [… , Pilotage, Salarié], plus dans la section Pilotage du haut ; navigation vers `pilotage`/`salarie` OK ; 0 pageerror). Badge → **v367**.

---

## 🟢 MAJ précédente — Mise en page : suppression des EMOJIS + polish qualité — v366
**Quoi :** amélioration de la qualité de la mise en page et **suppression des emojis** dans toute l'interface (titres de cartes, onglets, boutons, navigation, tableaux…). Les **glyphes fonctionnels** sont conservés (‹ › ✕ ✎ ✓ ▾ ▸ ─ ▢ flèches, %, Σ, ▮ des KPI) pour ne pas casser les contrôles (fenêtres Sage, chevrons de nav, éditeur).

**Comment — `yada-addon184` (100% additif) :**
- **Balayage post-rendu** : `sweep()` parcourt les nœuds texte (hors `SCRIPT`/`STYLE`/`TEXTAREA`) et retire les **emojis pictographiques** via `\p{Extended_Pictographic}` (+ VS16 `\u{FE0F}`, ZWJ `\u{200D}`, teintes de peau) sans toucher les glyphes de contrôle ; idempotent (ne re-modifie pas un texte déjà nettoyé). Déclenché après chaque `render()` (rAF) et via un **MutationObserver** pour les overlays/modales ajoutés hors rendu (garde anti-boucle : `busy` + `disconnect` pendant le balayage). Aucune donnée du modèle modifiée (affichage uniquement).
- **Polish CSS** `<style id="mep-quality-mod">` (injecté en dernier) : `.ico:empty{display:none}` (icônes vidées masquées), titres/sous-titres plus nets, onglets `.pil-tab` sobres, tableaux internes lisibles (hors `.sg-app`/`.doc-page`), rayons de boutons homogènes, champs de formulaire cohérents.

**Limites :** affichage uniquement (les emojis restent dans le code source des libellés, mais ne s'affichent plus) ; les glyphes de contrôle non-emoji sont volontairement conservés. Validé : `node --check` (177 scripts, 0 erreur) + brace CSS (2010/2010) + regex (`« 🎯 Pilotage »`→`« Pilotage »`, `« ✎ Fiche »`/`« ✕ »`/`« ✓ »` conservés) + Playwright (11 pages visitées : **0 emoji pictographique** restant dans `#nav`/`#main`/`.side-foot` ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v366**.

---

## 🟢 MAJ précédente — Nouveau module SALARIÉ (fiches, documents, paie/charges, absences, RDV colorés, Équipe imprimable) — v365
**Quoi :** ajout d'un **module « Salarié »** (section Pilotage, cabinet) à **5 onglets** :
1. **👥 Salariés** — liste + **fiche complète** : Nom, Prénom, date de naissance, adresse (n° rue, adresse, CP, ville), e-mail, téléphone, **salaire brut & net**, poste, **n° sécurité sociale**, **Cadre / Non cadre**, date d'embauche, type de contrat, **n° CNI/passeport**. Par salarié : **connexion YADA** (identifiant e-mail généré + envoi par `mailto:`), **documents** joignables & téléchargeables (**DPAE**, **contrat**, **carte d'identité**, **carte vitale**, **domiciliation**, **fiches de paie** multiples), **charges patronales détaillées**, **congés déposés** (dates).
2. **🚫 Absences** — déclaration par salarié, **justifiées / non justifiées**, justificatif joignable & téléchargeable.
3. **💰 Salaire & charges** — fixer le brut/net par salarié, **charges patronales** (11 cotisations, ~38 %) + **coût employeur**.
4. **📅 Rendez-vous** — une **couleur attribuée par salarié** (nom+prénom) ; RDV colorés + légende.
5. **📋 Équipe** (sous-module) — **liste imprimable** : en-tête société (Dénomination, SIRET, adresse complète, Code APE, date) + **titre « LISTE SALARIÉS »** + table (Date d'embauche · Nom Prénom · N° CNI/Passeport · Type de contrat) + **tampon/signature** (nom du président + image de signature).

**Comment :** `PAGES` (+ dispatch `salarie:pageSalarie` sûr) ; `yada-addon164` `PILOTAGE` inclut `salarie` ; **`yada-addon183`** (100% additif) : `pageSalarie()` + onglets, CRUD (`salSave`/`salDel`/`salAbs*`/`salConge*`/`salRdv*`), documents & justificatifs (`fileToData`→dataURL, `dl()` ancre), `chargesPat(brut)`, couleurs `PALETTE`, `genLogin()`, impression (`salEquipeImprimer` → `#print-area`). Données `db.parametres.rh` (persistées par `save()`, IndexedDB v325). `<style id="sal-mod">`.

**Limites :** charges patronales & net = estimations indicatives ; l'accès YADA crée l'identifiant et l'e-mail d'invitation (l'authentification réelle reste la gate simple existante). Validé : `node --check` (176 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (5 onglets rendus ; fiche complète + docs + login YADA + charges + congés ; absence non justifiée ; salaire éditable + coût employeur ; RDV colorés + légende ; Équipe : « LISTE SALARIÉS » + SIRET + président + type de contrat + tampon ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v365**.

---

## 🟢 MAJ précédente — Nouveau module PILOTAGE (Impôts IS/IR · Actif/Passif · Agenda & RH) — v364
**Quoi :** ajout d'un **module « Pilotage »** (section Pilotage de la barre latérale, espace cabinet) à **3 onglets** :
1. **📊 Impôts (IS / IR)** — **Impôt sur les sociétés** : base = résultat fiscal (résultat comptable proposé, modifiable), **taux réduit PME 15 % ≤ 42 500 €** puis **25 %** ; **Impôt sur le revenu** : **barème progressif 2024 par parts** (quotient familial), taux moyen affiché.
2. **🏦 Actif / Passif** — consultation de **tous les comptes de bilan** à la clôture (actif = soldes débiteurs classes 1-5, passif = soldes créditeurs + résultat), totaux + contrôle d'équilibre.
3. **📅 Agenda & RH** — **salariés** (nom, poste, entrée, contrat, e-mail, tél.), **congés** (planification par salarié + durée), **absences justifiées / non justifiées** avec **justificatif joignable (pièce jointe) & téléchargeable**, **agenda chronologique** (congés + absences + événements planifiés) + saisie d'événements.

**Comment :**
- **PAGES** : entrée `{id:'pilotage',ico:'🎯',sec:'Pilotage',lbl:'Pilotage'}` ; dispatch `render()` : `pilotage:pagePilotage` (référence sûre) ; `yada-addon164` : `PILOTAGE=['dash','societe','pilotage','client']` (nav cabinet).
- **`yada-addon182`** (100% additif) : `pagePilotage()` + onglets ; calculs `pilResultat`/`pilBilan`/`calcIS`/`calcIR` (locaux, sur `db.ecritures`) ; RH CRUD (`pilSalAdd/Del`, `pilCongeAdd/Del`, `pilAbsAdd/Del`, `pilEvAdd/Del`) ; justificatif `pilJustifUpload` (FileReader → dataURL sur l'absence, `justifie=true`) / `pilJustifDl` (ancre `download`) / `pilJustifDel`. Données dans `db.parametres.pilotage` (persistées par `save()`, IndexedDB grande capacité v325). `<style id="pil-mod">`.

**Limites :** l'IR/IS sont des estimations indicatives (hors décote, plafonnement du quotient, réductions/crédits) ; base IS pré-remplie par le résultat comptable (modifiable). Validé : `node --check` (175 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (3 onglets rendus ; IS PME base 100 000 → **20 750 €**, IS normal → **25 000 €**, IR 40 000/1 part → **5 286,23 €** ; Actif/Passif avec totaux ; RH : salarié listé, absence + justificatif téléchargeable, congé, agenda chronologique ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v364**.

---

## 🟢 MAJ précédente — Module Analyse = CENTRE DE CONTRÔLE (source) + Éditions reliées — v363
**Quoi :** le module **Analyse** (Consultation des comptes) devient le **Centre de Contrôle**, la **source unique** de toute la comptabilité, et les **Éditions** y sont explicitement **reliées** (elles se calculent à partir de ses écritures).
- **Nav** : « Analyse » → **« Analyse — Centre de Contrôle »**.
- **Barre de titre de l'Analyse** : mention « — Analyse · Centre de Contrôle » + bouton **« 🖨 Éditions »** (ouvre le module Éditions).
- **Page Éditions** : carte-source en tête **« 🎛 Analyse — Centre de Contrôle (source) »** rappelant que toutes les éditions (Balance, Grand livre, Journaux, Bilan, Compte de résultat, balance âgée…) sont dérivées des écritures du Centre de Contrôle + bouton **« Ouvrir le Centre de Contrôle (Analyse) »**.

**Comment :**
- Édition chirurgicale de `pageCompta` (barre `.sg-title`) : bouton `.sg-edlink` → `current='editions';render()` + libellé « Centre de Contrôle ».
- `yada-addon164` : `LBL.compta` = « Analyse — Centre de Contrôle ».
- `yada-addon181` (additif) : `ccCard()` greffée en tête de `pageEditions` ; `ccOuvrirAnalyse()` / `ccOuvrirEditions()` (navigation croisée) ; `<style id="cc-src-mod">`.

**Limites :** navigation/affichage (les éditions lisaient déjà `db.ecritures` — même source ; le lien est désormais explicite et cliquable). Validé : `node --check` (174 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (Éditions : carte-source + bouton vers Analyse ; Analyse : titre « Centre de Contrôle » + bouton « 🖨 Éditions » ; nav « Analyse — Centre de Contrôle » ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v363**.

---

## 🟢 MAJ précédente — Chaque module relié à SON journal (carte « Journal comptable lié ») — v362
**Quoi :** chaque module reçoit une carte **« 📓 Journal comptable lié »** (bas de page, espace cabinet) qui ouvre l'**éditeur du journal correspondant** (voir & éditer directement les écritures) :
- **TVA → OD de TVA (ODTVA)** · **Charges & Paie → OD de Paie (ODP) + OD de Charges (ODC)** ·
- **Fournisseurs → Achats (ACH)** · **Clients → Ventes (VTE)** · **Banque → Banque (BQ)** ·
- **Immobilisations & Frais km → OD** + **liste des écritures d'immobilisation / dotation** avec un bouton **✎ Éditer** par écriture (ouvre l'éditeur positionné dessus, tous journaux : acquisition ACH, dotation OD).

**Comment — `yada-addon180` (100% additif) :** greffe sur `pageTVA`/`pageChargesPaie`/`pageAchats`/`pageFacturation`/`pageBanque`/`pageImmos`/`pageFraisKm` (cabinet uniquement) → ajoute `jcard(id)` ; `jlOuvrir(code)` = `ouvrirJournalEditable(code,'')` (journal complet) ; `jlEditerEcr(id)` = `ouvrirJournalEditable(e.journal, ym(e.date), e.id)` (écriture précise) ; `immoEcritures()` repère les écritures immo/dotation (libellé IMMO/DOTATION/AMORTISS/ACQUISITION/CESSION ou lignes 6811/28x). `<style id="jl-mod">`.

**Limites :** carte réservée au cabinet (outil d'édition) ; la liste immo/dotation est plafonnée à 60 écritures récentes. Validé : `node --check` (173 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (tva→ODTVA, chargespaie→ODP+ODC, achats→ACH, facturation→VTE, banque→BQ, immos/fraiskm→OD + bloc immo ; `jlOuvrir('ODTVA')` → éditeur affiché, `ecJournalFiltre` positionné ; côté client : pas de carte ; équilibre 34 écritures ✅, 0 pageerror). Badge → **v362**.

---

## 🟢 MAJ précédente — Facture enregistrée → compte du tiers TOUJOURS sur l'écriture (module Analyse) — v361
**Quoi :** confirmation + fiabilisation des deux règles demandées.
1. **Dépôt FEC** : les comptes de tiers (fournisseurs/clients) sont **repérés et créés automatiquement**, puis **affectés aux écritures des journaux** visibles dans le module **Analyse** (déjà en place via `integrerFEC` + wrapper `attribuerComptesTiersFEC`, v356→v360).
2. **Facture enregistrée** : dès qu'une facture fournisseur ou client est enregistrée, **le compte du tiers (401XXXX / 411XXXX) apparaît automatiquement sur l'écriture** (module Analyse) — même si le tiers **n'avait pas encore de compte auxiliaire** : il est alors **généré** (`genAux`) à la volée. Plus aucun compte **collectif** résiduel sur une facture.

**Comment — 2 éditions chirurgicales :**
- `posterFacture` : si le tiers n'a pas de compte auxiliaire valide (401/411), il est **généré** (`genAux(type, nom)`) ; la ligne collective 401/411 de l'écriture prend `c9(tiers.compteAux)` ; `ecr.tiersId` est posé.
- `posterFactureMontants` (comptabilisation d'un dépôt) : même garantie (génération du compteAux si absent + `ecr.tiersId`).

**Limites :** un tiers sans nom exploitable reçoit un compte `genAux` par défaut (lettres du nom). Validé : `node --check` (172 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (facture fournisseur nouveau **sans** compteAux → écriture sur `401MENU00` ; facture client → `411CABI00` ; `ecr.tiersId` posé ; équilibrées ; comptes présents dans la liste des tiers de l'Analyse ; filet d'équilibre 34 écritures ✅, 0 pageerror). Badge → **v361**.

---

## 🟢 MAJ précédente — Règle DÉFINITIVE : un seul compte par client/fournisseur, sur TOUS les comptes, à chaque dépôt FEC — v360
**Quoi :** généralisation de la v359. La règle « un seul compte par dénomination, toutes les factures regroupées » devient **définitive et universelle** : (1) elle s'applique à **TOUS les comptes fournisseurs et clients** (plus seulement les fiches auto-créées à l'import) ; (2) elle est **ré-appliquée automatiquement à CHAQUE dépôt / import FEC** (en plus du chargement de dossier et du démarrage). Seule exception conservée : des **SIRET renseignés et différents** (entités juridiques distinctes) ne sont jamais fusionnés.

**Comment — 2 éditions dans `yada-addon179` :**
- `fusionnerMemeNom()` : retrait de la restriction « fiches auto seulement » → **tous** les tiers fournisseurs/clients de même dénomination de base (`nomBaseTiers`) sont regroupés en un seul compte (`_fusionGroupeTiers`, écritures re-pointées) ; garde SIRET divergents.
- **Wrapper `integrerFEC`** : après chaque intégration FEC, `attribuerComptesTiersFEC()` (attribution des comptes de tiers + fusion des doublons de dénomination) est exécuté automatiquement → règle appliquée à chaque dépôt.

**Limites :** deux entités réellement homonymes sans SIRET distinct sont considérées comme un seul tiers (choix assumé de la règle) ; un nom finissant par un nombre est ramené à sa base. Validé : `node --check` (172 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (import HABITAT sans appel manuel → 1 compte via wrapper ; 2 fiches MANUELLES « PLOMBERIE MARTIN » → fusionnées en 1, écritures sur `401PLOM00` ; 2 « DUPLICATA SA » à SIRET différents → **non** fusionnées ; démos : 9/7 tiers distincts préservés ; équilibre ✅, 0 pageerror). Badge → **v360**.

---

## 🟢 MAJ précédente — FEC : UN SEUL compte par client/fournisseur (le numéro qui varie = le n° de facture, pas le tiers) — v359
**Quoi :** correctif du cas **« HABITAT CONCEPT »**. À l'import FEC, un client ayant **plusieurs factures** était éclaté en **plusieurs comptes** (un par facture) parce que le champ qui varie ligne à ligne est le **numéro de facture** (`CompAuxNum`) et non l'identité du tiers. Désormais **l'identité du tiers = sa DÉNOMINATION** (nettoyée du n° de facture) et **le compte est dérivé du NOM** (`genAux`) — le `CompAuxNum` n'est utilisé comme compte **que s'il est déjà un vrai compte 401/411**. Résultat : **un seul compte client/fournisseur regroupant TOUTES ses factures**.

**Comment — 3 volets :**
- `nomBaseTiers(nom)` (nouveau, global) : retire les références de facture (mot-clé + n°, codes collés `F2024001`, dates, n° isolés en fin) tout en gardant les nombres internes (« Garage des 3 Vallées ») → « HABITAT CONCEPT 123 » / « HABITAT CONCEPT FACT 2024-001 » → **« HABITAT CONCEPT »**.
- `trouverOuCreerTiers` (import FEC) : identité par **dénomination** (exacte puis **ressemblante** via `tiersSimilaireNoms`) ; compte = `c9(CompAuxNum)` **seulement s'il commence par 401/411**, sinon `genAux(nom)` → jamais un compte par n° de facture.
- `yada-addon179` : `resoudre()` nettoie aussi les noms ; **fusion de rattrapage** `fusionnerMemeNom()` regroupe les fiches AUTO (import FEC / écriture) de **même dénomination de base** en **un seul compte** (via `_fusionGroupeTiers`, écritures re-pointées), en épargnant les fiches à **SIRET divergents**.

**Limites :** un vrai nom se terminant par un nombre (« Station 24 ») est ramené à sa base pour le regroupement ; les entités à SIRET différents ne sont jamais fusionnées d'office. Validé : `node --check` (172 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (import 4 factures HABITAT `CompAuxNum` F001…F004 → **1 client** `411HABI00`, écritures toutes sur ce compte ; nettoyage des noms OK ; fusion de rattrapage 4 fragments → 1 ; démos : tiers distincts préservés — « Bureau Vallée », « SAS Commerce 42 » intacts —, équilibre ✅, 0 pageerror). Badge → **v359**.

---

## 🟢 MAJ précédente — Compte de tiers auxiliaire attribué sur TOUTES les écritures (banque incluse), pas seulement le FEC — v358
**Quoi :** suite de la v356/v357. L'attribution ne visait que les écritures **rattachées à un tiers (`e.tiersId`)** → les **écritures de banque** (règlements) et diverses écritures au **compte collectif** `401000000`/`411000000` **sans `tiersId`** restaient au collectif. Désormais **chaque écriture touchant un fournisseur/client porte le compte AUXILIAIRE du tiers** : la migration résout le tiers depuis le **nom porté par la ligne** (`l.lib`, ex. « EDF Pro ») puis, en repli (journaux BQ/ACH/VTE), depuis le **libellé de l'écriture** — en **créant le tiers** s'il n'existe pas (compte via `genAux`) et en ignorant les libellés génériques (« Fournisseurs », à-nouveaux, TVA, paie…). Les lignes de **charges/produits** (627, 616, 431…) ne sont pas touchées.

**Comment — 3 éditions :**
- `posterBanque` : si un `tiersId` est fourni et que le compte passé est le collectif, la ligne prend `c9(tiers.compteAux)` ; l'écriture reçoit `tiersId` → les **nouveaux** règlements sont attribués.
- `yada-addon179` (`attribuerComptesTiersFEC`) généralisé : parcourt **toute ligne** au collectif `401000000`/`411000000` ou **orpheline** (mal formée) ; résout le tiers (`e.tiersId` → `l.lib` → libellé BQ/ACH/VTE), garantit un compte auxiliaire valide, relabelle la ligne et pose `e.tiersId`. Idempotent, garde anti-libellés génériques.
- `statsTiers` : **TTC = HT + TVA** (côté facture) → le total « dépensé / perçu » reste stable même quand les règlements bancaires portent aussi le compte auxiliaire (sinon la ligne de tiers se solderait à 0).

**Limites :** un tiers sans nom exploitable (libellé générique) n'est pas résolu ; les lignes déjà sur un aux valide sont laissées telles quelles. Validé : `node --check` (172 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (démos : toutes les lignes de banque tiers → aux `401EDFP00`/`411SARL00`/`401SYND00`…, charges 627/616/431 intactes, 0 collectif/orphelin restant, idempotent, équilibre ✅ ; statsTiers TTC=HT+TVA cohérent, EDF 600/120/720 malgré règlement ; régression v357 : import court + migration collectif/orphelin OK ; 0 pageerror). Badge → **v358**.

---

## 🟢 MAJ précédente — FEC : compte de tiers auxiliaire VALIDE aussi pour les CLIENTS (CompAuxNum court/absent) — v357
**Quoi :** correctif de la v356. L'attribution du compte auxiliaire échouait dès que le **CompAuxNum du FEC** était un **code court** (ex. `PIC`, `DUPONT`) ou **absent** — le cas fréquent, notamment pour les **clients** : le compte auxiliaire était stocké **tel quel** → `c9('PIC')='PIC000000'`, un **compte mal formé** ne commençant pas par 401/411 → la ventilation par tiers restait **à 0** (module TIERS), et la migration v356 (qui ne relabellait que le collectif pur) ne corrigeait rien. Désormais le CompAuxNum est **toujours normalisé en compte auxiliaire valide** : déjà `401…`/`411…` → conservé ; code court → **préfixé du collectif** (`PIC` → `411PIC000`) ; absent → **généré depuis le nom** (`genAux`). Vaut pour **fournisseurs ET clients**.

**Comment — 2 éditions chirurgicales :**
- `trouverOuCreerTiers` (dans `integrerFEC`) : calcul d'un `auxFinal` **valide** (préfixe collectif ajouté si nécessaire, sinon `genAux`) affecté à la création **et** aux tiers existants sans aux valide → la ligne 401/411 de l'écriture prend ce compte valide.
- `yada-addon179` (`attribuerComptesTiersFEC`) élargi : régénère un `compteAux` mal formé/vide (`genAux`, indépendant de `migrerAuxTiers`) puis relabelle la **ligne de tiers** vers l'aux valide — qu'elle soit au **collectif** (`401000000`/`411000000`), sur un **autre aux 401/411**, ou **orpheline mal formée** (`PIC000000`, préfixe non numérique) — sans toucher une écriture déjà correctement ventilée ; idempotent.

**Limites :** multi-tiers au collectif (rare) tous rattachés au `e.tiersId` de l'écriture. Validé : `node --check` (172 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (import court : client `PIC`→`411PIC000`, sans compaux→`411MAIR00`, fourn. `GAS`→`401GAS000`, 0 ligne mal formée ; statsTiers client HT 1000/TVA 200/TTC 1200 ; migration : collectif + orphelin `PIC000000`→`411RESI00`, compteAux vide régénéré, idempotent, client HT 1500/TVA 300/TTC 1800 ; équilibre ✅, 0 pageerror). Badge → **v357**.

---

## 🟢 MAJ précédente — FEC : attribution automatique du compte de tiers (auxiliaire) sur les écritures — v356
**Quoi :** à l'**import FEC**, la ligne de tiers (401/411) prend désormais **automatiquement le compte AUXILIAIRE du tiers** (ex. `401GASO00`) au lieu du compte collectif `401000000`/`411000000`. Une **migration** relabelle aussi les écritures **déjà importées** : toute ligne au compte collectif pur d'une écriture rattachée à un tiers (`e.tiersId`) est remplacée par l'auxiliaire du tiers → **ventilation par tiers correcte** (grand-livre, totaux HT/TVA/TTC du module TIERS).

**Comment — 2 éditions :**
- `integrerFEC` : la ligne 401/411 utilise `c9(tiers.compteAux)` (via `trouverOuCreerTiers`) au lieu de `l.compte` collectif.
- `yada-addon179` : `attribuerComptesTiersFEC()` remplace, dans `db.ecritures`, une ligne `401000000`/`411000000` par `c9(tiers.compteAux)` quand `e.tiersId` pointe un tiers ayant un compte auxiliaire ; idempotent ; lancé au démarrage et à chaque `chargerDossier`.

**Limites :** un tiers sans compte auxiliaire n'est pas relabellé ; les écritures multi-tiers au collectif (rare) sont toutes rattachées au `e.tiersId` de l'écriture. Validé : `node --check` (172 scripts, 0 erreur) + Playwright (import FEC : ligne 401 → `401GASO00` ; migration : `401000000` → `401FEC000`, idempotent ; équilibre ✅, 0 pageerror). Badge → **v356**.

---

## 🟢 MAJ précédente — Module TIERS : montants FEC/collectif pris en compte (attribution par `tiersId`) — v355
**Quoi :** correctif de la v354. Les totaux HT/TVA/TTC par tiers n'étaient calculés que sur les écritures utilisant le **compte auxiliaire** du tiers (401XXXX/411XXXX). Or les écritures **importées du FEC** (et certaines saisies) utilisent le **compte collectif** `401000000`/`411000000`, le tiers étant identifié par **`e.tiersId`** → ces montants n'étaient **pas attribués** (lignes à 0). Désormais une écriture est rattachée au tiers si **une ligne porte son compte auxiliaire OU si `e.tiersId === tiers.id`** ; le TTC est lu sur la ligne auxiliaire si présente, sinon sur la ligne collective 401/411.

**Comment — 1 édition de `statsTiers` :** garde élargie (`if(t)` au lieu de `if(t && t.compteAux)`), `auxLine` (ligne au compte aux) **ou** `byId` (`e.tiersId===id`) ; `tLine` = aux sinon collectif `401/411` pour le TTC ; HT = classe 6 (fourn.) / 7 (client), TVA = 4456x hors 44567 / 4457x, sur les autres lignes. Logique HT/TVA inchangée.

**Limites :** un tiers sans compte auxiliaire **et** sans `e.tiersId` sur ses écritures reste non ventilable. Validé : `node --check` (171 scripts, 0 erreur) + Playwright (2 écritures FEC sur 401000000 collectif rattachées par `tiersId` → HT 1500 / TVA 300 / TTC 1800 ; équilibre ✅, 0 pageerror). Badge → **v355**.

---

## 🟢 MAJ précédente — Module TIERS : totaux HT + TVA par tiers depuis TOUTES les écritures (fournisseurs & clients) — v354
**Quoi :** dans le module **TIERS**, chaque ligne affiche désormais le **HT** et la **TVA** par tiers, calculés sur **toutes les écritures** (saisie manuelle, scan/OCR, import FEC) — plus seulement `db.factures`. **Fournisseurs** : **HT dépensé** + **TVA déductible** ; **Clients** : **HT perçu** + **TVA collectée** ; colonne **TTC** conservée ; **ligne de total** (HT / TVA / TTC) ajoutée en pied de chaque liste.

**Comment — 2 éditions chirurgicales :**
- `statsTiers(id)` : pour chaque écriture touchant le compte auxiliaire du tiers, ventile — Fournisseur (401) : HT = lignes classe 6 (débit−crédit), TVA = 4456x hors 44567 (débit−crédit) ; Client (411) : HT = lignes classe 7 (crédit−débit), TVA = 4457x (crédit−débit) ; TTC = mouvement du compte de tiers. Renvoie `ht`/`tva`/`ttc` issus des écritures (repli factures si aucune écriture). Les KPIs de la fiche tiers en héritent.
- `sectionTiers` (override addon152) : colonnes **HT** + **TVA** + **TTC** (au lieu de TTC+TVA), libellés adaptés (perçu/collectée vs dépensé/déductible), **ligne de total**.

**Limites :** la ventilation par tiers nécessite un **compte auxiliaire** (401/411 par tiers) ; un dossier en comptes collectifs sans auxiliaires n'est pas ventilable par tiers. Validé : `node --check` (171 scripts, 0 erreur) + Playwright (fournisseur HT 1000 / TVA 200 / TTC 1200, client HT 500 / TVA 100 / TTC 600 depuis écritures ; liste : colonne HT + total ; équilibre ✅, 0 pageerror). Badge → **v354**.

---

## 🟢 MAJ précédente — Module TVA : onglets d'ANNÉE de déclaration (accéder à 2026 en traitant 2025) — v353
**Quoi :** dans le **Module TVA**, une barre d'**onglets d'année** (« Année de déclaration ») permet d'**accéder aux mois d'une autre année** (ex. 2026) pour **préparer ses déclarations**, même si l'**exercice traité** est 2025 — **sans changer l'exercice**. Les années proposées = années présentes dans les **écritures de TVA (445…)** ∪ années de l'**exercice** ; l'onglet de l'année d'exercice est repéré (« exercice »). La barre n'apparaît que s'il y a **plus d'une année**.

**Comment — `yada-addon178` (100% additif) + 1 édition de `pageTVA` :** `pageTVA` calcule désormais `mois = tvaAnneeSel ? tvaMoisAnnee(tvaAnneeSel) : moisExoListe()` ; `tvaAnneesDispo()` (années des écritures 445… + exercice), `tvaAnneeActive()` (défaut = année d'exercice), `tvaSetAnnee(y)` (fixe `window.tvaAnneeSel`, reset mois, re-render), `tvaAnneeBar()` greffée **avant** la carte « Régime de TVA ». `tvaMoisDispo()` (override) suit l'année active (mois ≤ mois courant) → la déclaration séquentielle et la restriction « à aujourd'hui » s'appliquent à l'année choisie. Le calcul `tvaDuMois` (tous comptes 445x, v352) est inchangé.

**Limites :** sélection d'affichage (l'exercice comptable, lui, ne change pas ; pour basculer l'exercice, utiliser les flèches ⟲⟳ de la Consultation). Validé : `node --check` (171 scripts, 0 erreur) + Playwright (exercice 2025 + écriture TVA 2026 → onglets [2025, 2026], défaut 2025, bascule 2026 : TVA collectée 60 captée ; équilibre ✅, 0 pageerror). Badge → **v353**.

---

## 🟢 MAJ précédente — Module TVA : prise en compte de TOUS les comptes de TVA (vente & achat) — v352
**Quoi :** le calcul de TVA (`tvaDuMois`) ne capturait que **certains comptes** (collectée 445710000 exact, déductible 445660000/445620000 exacts dans l'override `addon22`) → les comptes de TVA **par taux ou variantes** utilisés dans les factures de **vente** (ex. 445716 10 %, 445717 20 %, autoliq) et d'**achat** (ex. 445662/445667, immo 44562, autoliq) étaient **ignorés**. Désormais : **collectée = crédits sur TOUS les comptes `4457x`** ; **déductible = débits sur TOUS les comptes `4456x` SAUF `44567`** (crédit de TVA à reporter, non déductible).

**Comment — 2 éditions chirurgicales (même logique aux 2 endroits) :** `tvaDuMois` (déf. d'origine **et** override `addon22` qui la masquait) → préfixes `4457` (collectée, crédit) et `4456` hors `44567` (déductible, débit), comparés en `c9`. Logique **une face** conservée (la génération OD TVA reste stable). Tout le module en hérite (CA3, CA12, OD TVA, suivi, carte « Écriture & déclaration », « Détail par compte »). Textes mis à jour.

**Limites :** capture par familles `4457`/`4456` (hors `44567`) ; les comptes `4455x` (à décaisser) restent des comptes de résultat, non comptés en base. Validé : `node --check` (170 scripts, 0 erreur) + Playwright (collectée 20 %+10 % = 210, déductible services+immo = 300, `44567` exclu ; équilibre ✅, 0 pageerror). Badge → **v352**.

---

## 🟢 MAJ précédente — Module TVA : déclaration séquentielle (mois suivant après déclaration) + mois restreints à aujourd'hui — v351
**Quoi :** la carte **« Écriture & déclaration de TVA »** devient un **parcours guidé** : une fois un mois **déclaré**, on **passe automatiquement au mois suivant** à déclarer, jusqu'à **finaliser tous les mois disponibles**. Les **mois disponibles sont restreints à la date du jour** : un mois **postérieur au mois en cours** n'est **pas déclarable** (message « déclaration non disponible »). Un **indicateur d'avancement** « N/M mois disponibles déclarés » est affiché (✓ quand tous finalisés).

**Comment — `yada-addon177` (éditions) :** `tvaMoisDispo()` = mois de l'exercice ≤ mois courant ; `tvaProchainADeclarer()` = 1ᵉʳ mois disponible, non Néant, non encore déclaré ; `tvaDeclarer(m)` enregistre la déclaration puis **avance `tvaMoisSel` vers le mois suivant** (re-render) ; `tvaEcritureCard()` bloque les mois futurs (`m>aujourd'hui`) et ajoute le pied d'avancement. Néant ignorés dans le parcours (gérés par « Valider Néant »).

**Limites :** affichage/workflow (la télétransmission reste sur impots.gouv.fr). Validé : `node --check` (170 scripts, 0 erreur) + Playwright (today 2026-06 → 2 mois dispo ; déclaration de 2026-04 → avance à 2026-05 ; mois futur restreint ; avancement affiché ; équilibre ✅, 0 pageerror). Badge → **v351**.

---

## 🟢 MAJ précédente — Module TVA : carte « Écriture & déclaration de TVA » (mois du CA3) → Générer l'OD puis Déclarer — v350
**Quoi :** sous le **Tableau CA3** (mois & année affichés), une carte **« 🧾 Écriture & déclaration de TVA »** présente, **comme une écriture comptable**, les **comptes de TVA concernés par les montants** (collectée 445710000, déductible 445660000, à décaisser 445510000 / crédit 445670000) avec **libellé + Débit/Crédit** et le total équilibré. Cycle :
1. **Générer l'OD TVA** (bouton) → crée l'écriture OD TVA (journal OD TVA, dernier jour du mois, pièce MM/AAAA) — lignes identiques à `posterODTVA`.
2. Une fois l'OD générée → **Déclarer la TVA (CA3)** (bouton) : marque le mois **déclaré** (persistant, `db.societe.tvaDeclaree[mois]`).
3. Une fois déclarée → **🖨 Imprimer la déclaration** (récap CA3 + écriture, format A4) + lien **Espace impots.gouv.fr**.

**Comment — `yada-addon177` (100% additif) :** `tvaODLignes(m)` (preview = `posterODTVA`), `tvaEcritureCard()` (mois = `tvaMoisSel`, états non posté / posté-non déclaré / déclaré), `tvaDeclarer(m)` (enregistre la déclaration), `tvaImprimerDeclaration(m)` (doc-page CA3 dans `#print-area`). Greffe `pageTVA` : carte insérée **juste avant « Suivi annuel de la TVA »** (donc après le tableau CA3) ; régime franchise exclu. Réutilise `tvaGenererOD`/`tvaSupprimerOD` existants.

**Limites :** « Déclarer » = marquage interne + édition/impression de la déclaration (la télétransmission se fait sur impots.gouv.fr). Validé : `node --check` (170 scripts, 0 erreur) + Playwright (carte après CA3 ; cycle Générer→Déclarer→déclaré persistant ; OD équilibrée ; impression remplit `#print-area` ; équilibre ✅, 0 pageerror). Badge → **v350**.

---

## 🟢 MAJ précédente — Module TVA : « Détail par compte de TVA » (toute écriture à compte 445…, CA3/CA12) — v349
**Quoi :** le **module TVA** récolte et **retranscrit toutes les écritures touchant un compte de TVA (445…)**, **quel que soit le compte utilisé** — issues des **factures clients & fournisseurs**, de l'**import FEC** et des **saisies (Analyse)**. Une carte **« Détail par compte de TVA »** est ajoutée (sous le tableau CA3 / la vue CA12) listant, pour la période (mois en CA3, exercice en CA12) : Compte · Libellé · Nature (Collectée / Déductible / À décaisser / Crédit à reporter) · Débit · Crédit · Solde · Journal(x), avec total des comptes 445. Ces montants alimentent le calcul CA3/CA12 et la **proposition de déclaration** (génération de l'OD TVA CA3 / vue CA12 déjà en place).

**Comment — `yada-addon176` (100% additif) :** `tvaDetailParCompte()` scanne `db.ecritures` filtrées par mois (`tvaMoisSel`) ou par année d'exercice (CA12), agrège débit/crédit par `c9(compte)` commençant par `445`, classe par nature (préfixes 4457 / 4456-44562 / 44551 / 44567) ; libellés via `COMPTES` (repli `db.plan`) ; greffe sur `pageTVA` (sauf régime franchise). Le calcul `tvaDuMois`/`tvaDetailMois` et la génération OD TVA restent inchangés.

**Limites :** carte d'affichage/représentation (le calcul net collectée/déductible reste basé sur 44571 / 44566-44562, comme avant). Validé : `node --check` (169 scripts, 0 erreur) + Playwright (carte présente dans `pageTVA`, comptes 445 retranscrits sur le mois, équilibre ✅, 0 pageerror). Badge → **v349**.

---

## 🟢 MAJ précédente — Module Client : tableau de correspondances rétractable + dépôt de facture client (copie du module Fournisseur) — v348
**Quoi :** deux changements dans le **module Client** (cabinet).
1. **Tableau « Correspondances — factures » rétractable** : le détail (table N°/Tiers/Date/Jnl/HT/TVA/TTC/Correspondance) est désormais dans un **`<details>`** repliable (KPIs toujours visibles), **fermé par défaut**, cliquer pour afficher/masquer.
2. **Dépôt de facture client** (copie du module Fournisseur) : une carte **« Déposer une facture client »** (sélecteur client + zone glisser-déposer PDF/photo) est ajoutée → permet de déposer des **factures client établies ultérieurement** ou **transmises par le client lui-même**. La carte de réception/validation cabinet (`depotsCabinetCard('vente')`) était déjà présente.

**Comment :**
- `correspondancesCard` : la `<table>` est enveloppée dans `<details class="corr-details"><summary>…</summary>…</table></details>` (details/summary natifs → triangle d'ouverture, indépendant des styles `.doc-page`).
- `yada-addon175` : greffe sur `pageFacturation` (cabinet uniquement) insérant `depotFacturesCard('vente','Déposer une facture client',…)` avant la première carte (garde anti-doublon `fdep-vente`).

**Limites :** affichage/dépôt (la comptabilisation reste validée par le cabinet). Validé : `node --check` (168 scripts, 0 erreur) + Playwright (correspondances `<details class="corr-details">` présent ; page Client cabinet contient `fdep-vente` ; équilibre ✅, 0 pageerror). Badge → **v348**.

---

## 🟢 MAJ précédente — Règle banque : sens fiable depuis la ligne 512 (Entrant=vert / Sortant=rouge), corrige l'inversion FEC — v347
**Quoi :** règle comptable demandée pour la **saisie bancaire** (différente des Fournisseurs/Clients). Dans la liste **« Montants sans facture »**, le **sens d'un mouvement bancaire** est désormais déterminé par la **ligne 512 de l'écriture** (autorité) et non par le champ `b.sens` (qui était **inversé pour les imports FEC**) :
- **512 au DÉBIT** = argent **entré** sur le compte → **« Entrant » + vert** ;
- **512 au CRÉDIT** = argent **sorti** du compte (dépensé par la société) → **« Sortant » + rouge**.

**Règle Fournisseurs/Clients (confirmée, déjà en place dans `genEcriture`)** : une **facture fournisseur** porte le **TTC au CRÉDIT** (401), une **facture client** le **TTC au DÉBIT** (411) → soldées par les écritures de banque (paiement = 401 débit ; encaissement = 411 crédit). Aucune modification nécessaire.

**Comment — 1 édition de `montantsSansFacture` :** pour chaque mouvement, on retrouve l'écriture (`b.ecritureId`), on lit sa ligne `512…` et on pose `sens='C'` (Entrant) si `512.debit>0`, sinon `'D'` (Sortant). Repli sur `b.sens` si l'écriture est introuvable. La liste/impression/mail (mapping `C→Entrant/vert`, `D→Sortant/rouge`) restent inchangés. 

**Limites :** affichage de la liste (le module Banque et le rapprochement ne sont pas modifiés). Validé : `node --check` (167 scripts, 0 erreur) + Playwright (encaissement client 512-débit → 'C'/Entrant/vert ; paiement fournisseur 512-crédit → 'D'/Sortant/rouge, **même quand `b.sens` est inversé** ; équilibre ✅, 0 pageerror). Badge → **v347**.

---

## 🟢 MAJ précédente — « Montants sans facture » : montants colorés (débit/Sortant rouge, crédit/Entrant vert) à l'impression aussi — v346
**Quoi :** dans la carte **« Montants sans facture »** (Éditions), les **montants au débit (Sortant)** s'affichent en **rouge** et les **montants au crédit (Entrant)** en **vert**. C'était déjà le cas à l'écran (classes `deb`/`cre`) ; c'est désormais **aussi appliqué à la liste imprimée** (`sfImprimer`), où le style d'impression `.doc-page` forçait auparavant tout en noir.

**Comment — 1 édition de `sfImprimer` :** les cellules **Sens** et **Montant** de chaque ligne imprimée reçoivent une couleur **en ligne avec `!important`** (`#c62828` pour Sortant/débit, `#1b8a4b` pour Entrant/crédit) → l'`!important` en ligne prime sur la règle d'impression `body[data-theme] .doc-page *{color:#111418 !important}`. L'affichage écran reste inchangé (`cre`/`deb`).

**Limites :** affichage/impression uniquement. Validé : `node --check` (167 scripts, 0 erreur) + Playwright (écran `cre`/`deb` présents ; impression : vert `#1b8a4b !important` sur les lignes Entrant ; équilibre ✅, 0 pageerror). Badge → **v346**.

---

## 🟢 MAJ précédente — « Montants sans facture » : Entrant/Sortant + mot-clé Fournisseur/Client + e-mail tiers requis pour la demande (mail auto) — v345
**Quoi :** 3 changements liés à la carte **« Montants sans facture »** (Éditions) et au module **Tiers**.
1. **Sens** : « Encaissement / Décaissement » → **« Entrant / Sortant »** (liste affichée + impression).
2. **Libellé → mot-clé** : la colonne libellé affiche désormais **« Fournisseur »** ou **« Client »** : si le **nom d'un tiers** (fournisseur/client) est repéré dans le libellé, on génère le mot-clé ; sinon repli sur le type du tiers de la ligne (`sfMotCle`).
3. **Demande de facture par e-mail** : « Demander la facture » exige désormais un **e-mail** sur le tiers — s'il manque, YADA propose d'**ouvrir la fiche** pour le saisir ; s'il est présent, YADA ouvre un **e-mail pré-rempli** (`mailto:` sujet + corps) pour un **envoi automatique**. Dans la **fiche Tiers** (Fournisseur / Client–Société / Client–Particulier, fiche commune), le champ **E-mail est marqué requis** (astérisque rouge + bordure si vide + note « utilisé pour les e-mails automatiques »).

**Comment — éditions chirurgicales :** `sfMotCle(x)` (recherche du nom de tiers dans le libellé, longueur ≥ 3) ; lignes de `cardSansFacture` + `sfImprimer` (Entrant/Sortant + `sfMotCle`) ; `sfDemander` (garde e-mail obligatoire + `mailto:` pré-rempli) ; `tiersEditer` (label « E-mail * », `type=email`, bordure rouge si vide, hint). `tiersEnregistrer` enregistrait déjà `t.email`.

**Limites :** l'envoi passe par la messagerie par défaut (`mailto:`) ; détection du mot-clé par inclusion du nom (heuristique). Validé : `node --check` (167 scripts, 0 erreur) + Playwright (Entrant/Sortant présents, 0 « Encaissement/Décaissement », `sfMotCle` ok, fiche e-mail requise, équilibre ✅, 0 pageerror). Badge → **v345**.

---

## 🟢 MAJ précédente — Éditions : carte « Montants sans facture » → bouton Afficher + bouton Imprimer (au lieu d'une liste générée) — v344
**Quoi :** dans le module **Éditions**, la carte **« Montants sans facture — à vérifier & demander au tiers »** ne génère plus la liste directement. Elle affiche un **bouton « 📋 Afficher la liste »** ; au clic, la liste (3 blocs : Grand livre général / Fournisseurs / Clients) s'affiche, accompagnée d'un **bouton « 🖨 Imprimer la liste »** (édition au format A4, fond blanc).

**Comment — éditions chirurgicales de `cardSansFacture` + 2 fonctions :** la carte teste `window._sfShow` ; si faux → bouton « Afficher » + invite ; si vrai → bouton « Masquer » + bouton « Imprimer » + `${blocs}${histo}`. `sfAfficherToggle()` bascule `_sfShow` puis `render()`. `sfImprimer()` construit une `.doc-page` (tables Date/Tiers/Libellé/Sens/Montant/E-mail + total par bloc) dans `#print-area` puis `window.print()`. Aucune logique comptable modifiée (cases « Vérifié » / « Demander la facture » inchangées dans la liste affichée).

**Limites :** affichage/impression. Validé : `node --check` (167 scripts, 0 erreur) + Playwright (replié : 0 `<table>`, bouton « Afficher » présent ; affiché : `<table>` + bouton « Imprimer » ; `sfImprimer` remplit `#print-area` en `doc-page` ; équilibre ✅, 0 pageerror). Badge → **v344**.

---

## 🟢 MAJ précédente — Import FEC : intégration UNIQUEMENT dans le dossier déjà créé (création de dossier retirée) — v343
**Quoi :** dans **Import / Export FEC**, la fonction **« Créer un nouveau dossier pour ce FEC ? »** (formulaire Nom/Début/Fin + bouton « Créer le dossier & intégrer le FEC ») est **retirée**. Désormais le FEC est **toujours intégré dans le dossier courant (déjà créé)**. Si les dates du fichier débordent de l'exercice courant, **l'exercice du dossier est élargi automatiquement** (union) pour couvrir toutes les écritures (sinon elles seraient rejetées hors période) — **aucun nouveau dossier n'est créé**.

**Comment — 3 éditions chirurgicales :**
- `afficherPropositionFEC` (branche hors-exercice) : le formulaire de création est remplacé par un panneau **« Intégrer le FEC dans le dossier courant »** (bouton → `confirmerImportFEC(false)`).
- `confirmerImportFEC` : la branche `nouveauDossier` (nouveau dataset + référencement portefeuille + `chargerDossier`) est supprimée ; intégration directe dans `db` courant avec `exoD=min(exoDebut,dMin)` / `exoF=max(exoFin,dMax)` (mise à jour `db.societe.exoDebut/exoFin`).
- Textes (`pageFEC` head + sous-titre de la carte) mis à jour.

**Limites :** l'exercice courant peut être élargi (union) pour accueillir le FEC. Validé : `node --check` (167 scripts, 0 erreur) + Playwright (FEC daté hors exercice → intégré dans le dossier courant « ALR CONSEIL », `nEcr` 19→20, exercice élargi à 2099, **0 nouveau dossier**, équilibre ✅, 0 pageerror). Badge → **v343**.

---

## 🟢 MAJ précédente — Accent « bleu flashy » (électrique + halo) sur certains éléments — v342
**Quoi :** à la demande, un **bleu flashy électrique avec halo lumineux** est appliqué (Mode Nuit) sur les éléments choisis : **boutons principaux (CTA `.btn-pri`)**, **entrée de nav active + bouton « Outils »**, **valeurs KPI + icônes/barres d'accent**, **titres de cartes (h2) + liens + anneau de focus**. Le **vert / rouge comptable des KPI** (`.val.cre` / `.val.deb`) est **préservé**.

**Comment — `yada-addon174` (100% CSS additif, scopé `body[data-theme="noir"]`, injecté en dernier) :** `<style id="flashy-blue-mod">` — CTA en dégradé `#37a4ff→#0a64d6` + `box-shadow` halo bleu ; `.nav-btn.active` dégradé bleu + glow `rgba(30,144,255,.75)` ; `.sf-toggle` (Outils) bord/halo renforcés + icône lumineuse ; `.kpi .val` bleu `#3aa8ff` + `text-shadow` (sauf `cre`/`deb` conservés), `.kpi-ic` bleu + glow ; `.card h2` `#5ab0ff` + glow, liens `#3aa8ff`, focus `outline #37a4ff` + halo. Aucune logique modifiée.

**Limites :** habillage (Mode Nuit). Validé : `node --check` (167 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (CTA dégradé+halo, h2 `rgb(90,176,255)`, KPI bleu, `cre` vert / `deb` rouge préservés, équilibre ✅, 0 pageerror). Badge → **v342**.

---

## 🟢 MAJ précédente — Barre latérale : disposition IDENTIQUE au dépliage (anti-tassement flex) + défilement bleu — v341
**Quoi :** correctif du **décalage/espacement** signalé : en dépliant un module, les autres entrées **se tassaient** (hauteur de ligne 27 → 23 px). Cause : les boutons de la nav avaient le `flex-shrink:1` par défaut → quand la nav débordait, **flexbox compressait toutes les lignes**. Désormais `flex:0 0 auto` sur chaque entrée → **aucune compression** : la disposition reste **exactement la même** qu'un module soit déplié ou non ; s'il n'y a pas assez de place, la barre **défile** (barre de défilement **bleue** dégradée).

**Comment — 1 ajout dans `yada-addon173` (`<style id="sidebar-stable-mod">`, desktop) :** `#nav .nav-btn,.nav-sec,.nav-sub,.nav-sub-btn{flex:0 0 auto !important}` (anti-tassement) + scrollbar bleue (`#nav::-webkit-scrollbar-thumb{linear-gradient(#3b9bff,#0a64d6)}`, `scrollbar-color:#1e90ff`). Aucune logique modifiée.

**Limites :** habillage/mise en page. Validé : `node --check` (166 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (écarts entre modules **identiques** déplié/replié = 42 px, débordement → défilement, scrollbar bleue, équilibre ✅, 0 pageerror). Badge → **v341**.

---

## 🟢 MAJ précédente — Barre latérale : stabilité au clic + bouton « Outils » modernisé — v340
**Quoi :** deux retouches de la **barre latérale** (espace cabinet).
1. **Stabilité au clic** — en dépliant un module, la nav débordait → une **barre de défilement apparaissait et rétrécissait la largeur** (texte re-tronqué), donnant l'impression que la **taille d'écriture / l'espacement** changeaient. La **gouttière de défilement est désormais réservée** (`scrollbar-gutter:stable`) → largeur constante ; la **police est unifiée** (sous-modules 13 → 14px, même hauteur que les modules) et l'**espacement entre entrées est fixe** (la barre **défile** au lieu de se compresser).
2. **Bouton « Outils » modernisé** — la touche du bas reçoit un **design plus récent** : **pastille à icône carrée bleue** (dégradé), libellé « Outils », **chevron animé**, fond en **dégradé bleu + halo au survol** (léger soulèvement), coins arrondis 13 px.

**Comment — `yada-addon173` (100% additif) :** `<style id="sidebar-stable-mod">` (desktop : `#nav{scrollbar-gutter:stable}`, `.nav-btn/.nav-sub-btn` taille/espacement uniformes ; bouton `.sf-toggle.sf-tog-new` restylé avec spécificité supérieure → prime sur addon168) ; `modToggle()` (greffé sur `render`, idempotent) ajoute la classe `sf-tog-new` et le markup à icône (`.sf-ic` / `.sf-lbl` / `.sf-caret`). Aucune logique modifiée.

**Limites :** habillage/mise en page. Validé : `node --check` (166 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (toggle : `border-radius:13px`, fond dégradé bleu, bord `rgba(30,144,255,.45)`, icône pastille ; nav `scrollbar-gutter:stable` ; équilibre ✅, 0 pageerror). Badge → **v340**.

---

## 🟢 MAJ précédente — Espace Client : carte « Paramètres de facturation » en double retirée — v339
**Quoi :** dans l'**Espace Client** (page Facturation client), la carte **« ⚙️ Paramètres de facturation »** apparaissait **en double**. Cause : `addon104` greffait `factParamCard()` **à la fois** sur `pageFacturation` et `pageFacturationClient` ; or côté client le wrapper `pageFacturation` **appelle** `pageFacturationClient()` (bascule de rôle) → la carte était ajoutée deux fois. Cette carte regroupe des **réglages cabinet** (mentions de la facture A4 : condition de TVA, moyen de paiement, indemnité de recouvrement, escompte, RIB) → elle est désormais **réservée à l'espace Cabinet** et **retirée de l'Espace Client** (ce qui supprime aussi le doublon).

**Comment — 1 édition chirurgicale d'`addon104` :** le helper `greffe()` n'ajoute `factParamCard()` que si `(window.sessionRole||'cabinet')!=='client'` → côté client les deux wrappers sont sans effet ; côté cabinet, **une seule** carte. Aucune logique modifiée.

**Limites :** affichage uniquement. Validé : `node --check` (165 scripts, 0 erreur) + Playwright (client : `fparam-card` ×0 via `pageFacturationClient` **et** via `pageFacturation` ; cabinet : ×1 ; équilibre ✅, 0 pageerror). Badge → **v339**.

---

## 🟢 MAJ précédente — Barre de recherche retirée de la barre latérale (raccourci ⌘K conservé) — v338
**Quoi :** à la demande, la **barre de recherche** « 🔎 Rechercher… ⌘K » (ajoutée en v335 en tête de la barre latérale) est **retirée**. Le **raccourci clavier ⌘K / Ctrl+K** reste actif (la palette de commandes peut toujours s'ouvrir) ; seule la barre visible disparaît.

**Comment — 1 édition chirurgicale d'`yada-addon170` :** `injectBar()` n'insère plus la barre — elle se contente de **supprimer** toute `.cmdk-search` éventuellement présente (idempotent, re-greffé sur `render`). Le reste de la palette (`cmdkOpen`/`cmdkClose`, overlay, filtre) est inchangé ; styles `.cmdk-search` laissés inutilisés (sans effet).

**Limites :** aucune logique modifiée. Validé : `node --check` (165 scripts, 0 erreur) + Playwright (0 `.cmdk-search`, `cmdkOpen` toujours disponible, équilibre ✅, 0 pageerror). Badge → **v338**.

---

## 🟢 MAJ précédente — DA « phase 2 » (3/3) : KPI en pavés à icône — v337
**Quoi :** dernière étape de la phase 2 (d'après l'image de référence). Chaque **KPI** (tableau de bord, modules, espace client) reçoit un **petit carré d'icône arrondi à gauche**, coloré selon la nature de l'indicateur : **↗** produits/CA (vert), **↘** charges/dépenses (rouge), **Σ** résultat (bleu), **%** TVA, **▮** trésorerie/banque, **⊞** tiers/dossiers, **≣** factures/écritures, **◧** par défaut. La carte passe en **grille** (icône | libellé/valeur/méta) et le rendu devient **plat** (barreau latéral `::before` et reflet `::after` d'origine neutralisés). Accent **BLEU** conservé.

**Comment — `yada-addon172` (100% additif, scopé `body[data-theme="noir"]`) :** `<style id="kpi-pave-mod">` (grille `44px 1fr`, carré `.kpi-ic`, couleurs par variante green/red/blue, masquage des pseudo-éléments d'origine) ; `deco()` parcourt `.dash-wrap/.mod-wrap/.cli-col .kpi`, insère un `<span class="kpi-ic">` (idempotent) avec un glyphe choisi par **classe** (green/red/blue) puis par **mots-clés du libellé** ; re-greffé sur `render()`. Aucune logique comptable modifiée.

**Limites :** habillage uniquement (Mode Nuit) ; **phase 2 terminée** (⌘K v335 · badge de statut v336 · KPI à icône v337). Restera le restyle fin des graphiques en option. Validé : `node --check` (165 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (KPI : icônes ↗/↘/Σ/% injectées, `display:grid`, équilibre ✅, 0 pageerror). Badge → **v337**.

---

## 🟢 MAJ précédente — DA « phase 2 » (2/3) : badge de STATUT du dossier dans l'en-tête de page — v336
**Quoi :** suite de la refonte DA. Un **badge de statut** (pastille colorée) est ajouté **à droite du titre de chaque page** (en-tête `.page-head`) et reflète l'état de **tenue du dossier actif** : **À faire** (rouge) · **En cours** (bleu) · **À revoir** (ambre) · **Tenue cabinet ✓** (vert). Conformément à la demande, **le badge est l'unique contrôle (pas de boutons d'action)** : un **clic** ouvre un petit menu pour **changer le statut** → enregistré sur le dossier (persistant). Le nom du dossier est rappelé en petit dans le badge.

**Comment — `yada-addon171` (100% additif) :** `<style id="dstat-mod">` (pastille `.dstat-chip` + menu `.dstat-menu`, 4 couleurs de statut) ; `dossierActif()` lit `db.cabinet.dossiers` via `db.activeId` ; statut stocké dans **`dossier.statutTenue`** (persisté par `save()`) ; `dstatToggle`/`dstatSet` (changement + `save`+`render`) ; fermeture du menu au clic extérieur. **Greffe sur `head()`** : insère le badge comme 2ᵉ enfant de `.page-head` (flex → à droite), **sauf** écran non connecté et **portefeuille** (`current==='societe'`). Aucune logique comptable modifiée.

**Limites :** un seul statut par dossier (workflow simple) ; reste de la phase 2 : **KPI en pavés à icône** + **restyle des graphiques**. Validé : `node --check` (164 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (`dstatSet`/`dstatToggle` exposés, style injecté, `head()` valide, badge masqué hors connexion, équilibre ✅, 0 pageerror). Badge → **v336**.

---

## 🟢 MAJ précédente — DA « phase 2 » (1/3) : barre de recherche + palette de commandes ⌘K — v335
**Quoi :** suite de la refonte DA (d'après l'image de référence). Ajout d'une **barre de recherche** en tête de la **barre latérale** (« 🔎 Rechercher…  ⌘K ») et d'une **palette de commandes ⌘K** (raccourci **⌘K / Ctrl+K**, ou clic sur la barre) : une fenêtre centrée permet d'**aller directement à n'importe quel module** — saisie → **filtre instantané** (insensible aux accents, sur le libellé et la section), **↑/↓** pour choisir, **Entrée** pour ouvrir, **Échap** ou clic à l'extérieur pour fermer. Accent **BLEU** conservé.

**Comment — `yada-addon170` (100% additif) :** `<style id="cmdk-mod">` (barre `.cmdk-search`, overlay `#cmdk-ov`, palette `#cmdk-box`, items `.cmdk-it` au survol/sélection en dégradé bleu) ; `dests()` construit la liste depuis **`PAGES`** (filtrée par rôle : client → `CLIENT_PAGES` + Espace Client) ; `open()/close()/paint()/goItem()` ; la navigation réutilise **`current=<id>; render()`** (aucune logique modifiée) ; barre re-greffée en tête de `#nav` à chaque rendu (idempotent) ; ouverture bloquée tant que le logiciel n'est pas ouvert (`connecte`).

**Limites :** la palette navigue vers les **modules** (pas encore vers les dossiers/actions) ; reste de la phase 2 à venir : **en-tête dossier à chips** (À revoir / Tenue cabinet + Marquer revu / Déverser), **KPI en pavés à icône**, **restyle des graphiques**. Validé : `node --check` (163 scripts, 0 erreur) + brace CSS (2010/2010) + Playwright (`cmdkOpen`/`cmdkClose` exposés, style injecté, filtre « tva » → « Module TVA (CA3) », équilibre ✅ — 34 écritures, 0 pageerror). Badge → **v335**.

---

## 🟢 MAJ précédente — DA « phase 1 » (d'après image de référence) : fond ardoise plat, cartes épurées, interface plus compacte — v334
**Quoi :** première passe de **refonte de la direction artistique** (d'après l'image de référence fournie), en **Mode Nuit** : **fond ardoise plat sombre** (`#0b0e13`, fini le dégradé bleu v308 sur la zone de contenu), **cartes épurées** (ardoise unie `#12161d`, bord discret `rgba(255,255,255,.08)`, **sans ombre**, coins 12 px), et **interface plus compacte (« dézoom »)** : marges des volets réduites, grilles resserrées (gap 14 px), KPI/cartes/titres/tableaux à typo et paddings réduits. **Accent BLEU conservé** (choix utilisateur).

**Comment — `yada-addon169` (100% CSS, scopé `body[data-theme="noir"]`, injecté en dernier → prime sur v308) :** `<style id="da-ref-mod">` : fond plat sur `.layout:not(.solo)` + `mod-wrap`/`dash-wrap` ; restyle `.card`/`.kpi` (fond uni, bord, sans ombre, `::after` sheen masqué) ; densité (paddings/font-size réduits sur volets, grilles, KPI, `h2`, `th/td`) ; barre bleue de KPI amincie.

**Limites :** phase 1 = palette/cartes/densité uniquement (structure inchangée — la barre de recherche ⌘K, l'en-tête dossier à chips et le restyle des graphiques de l'image restent à faire en phases suivantes ; l'accent reste bleu, non olive). Validé : `node --check` (162 scripts, 0 erreur) + Playwright (`dash-wrap` fond `#0b0e13`, carte `#12161d` sans ombre, paddings/KPI compacts, équilibre ✅, 0 pageerror). Badge → **v334**.

---

## 🟢 MAJ précédente — Barre latérale : outils du bas regroupés derrière une seule touche « ⚙ Outils » — v333
**Quoi :** les **7 boutons du bas** (Déconnexion, Mode nuit, Changer de dossier, Télécharger la base, Importer, Ne pas enregistrer, Réinitialiser) ne sont **plus affichés en permanence** : seule **une touche « ⚙ Outils »** est visible ; au **clic**, un **menu flottant** les révèle au-dessus du bouton. Le menu est en **position absolue** → il **n'occupe aucune place** dans la barre latérale, donc **la barre garde sa forme/hauteur** même quand on **déplie un module** (le contenu ne déborde plus). Re-clic ou clic à l'extérieur referme le menu.

**Comment — `yada-addon168` (100% additif) :** `setup()` (greffé sur `render`, idempotent) déplace tous les enfants de `.side-foot` dans un conteneur `.sf-menu` (flottant, masqué) et insère la touche `.sf-toggle`. Un **balayage à chaque rendu** récupère tout bouton ajouté après coup (ex. « Déconnexion » d'`addSideBtn`) vers le menu → aucun bouton parasite hors menu. `<style id="sf-menu-mod">` (touche pilule, menu `position:absolute;bottom:100%`, chevron animé). Les wrappers existants (`applyRole`, bascule jour/nuit) continuent de fonctionner (boutons toujours descendants de `.side-foot`).

**Limites :** habillage/mise en page. Validé : `node --check` (161 scripts, 0 erreur) + Playwright (touche unique, 7 boutons regroupés dans le menu flottant — y compris « Déconnexion » ajouté dynamiquement —, 0 bouton parasite, ouverture/fermeture OK, équilibre ✅, 0 pageerror). Badge → **v333**.

---

## 🟢 MAJ précédente — App-shell : barre latérale FIXE + contenu de tous les modules atteignable (défilement interne, dvh) — v332
**Quoi :** la **barre latérale ne défile plus jamais** (fixe) et **tout le contenu de chaque module reste visible/atteignable** (le bas n'est plus coupé).
- **Mise en page verrouillée à l'écran** : `.layout:not(.solo){height:100dvh;overflow:hidden}` + `html,body{overflow:hidden}` → la fenêtre ne défile pas, la **barre latérale (`aside`, sticky, `100dvh`) reste fixe**.
- **Volet de contenu défilant** : `main.fullbleed .mod-wrap`/`.dash-wrap` en **`height:100dvh; overflow:auto`** (+ `padding-bottom:64px`, barre de défilement fine) → le contenu défile **à l'intérieur du volet**, le bas de page reste accessible. Fenêtres Sage (`.sg-app`/`.lx-app`/éditeur `.ec-win`) alignées sur `100dvh`.

**Pourquoi `dvh` :** la hauteur dynamique (`100dvh`) suit la zone réellement visible (barres d'outils du navigateur) → plus de contenu coupé en bas.

**Comment — `yada-addon167` (100% CSS, desktop ≥821px ; mobile/drawer inchangé) :** `<style id="appshell-mod">` injecté en dernier. Aucune logique modifiée.

**Limites :** habillage/mise en page. Validé : `node --check` (160 scripts, 0 erreur) + Playwright (layout `overflow:hidden`, `aside` sticky `100dvh` fixe, `mod-wrap` `100dvh` défilable — 40 cartes test toutes atteignables, équilibre ✅, 0 pageerror). Badge → **v332**.

---

## 🟢 MAJ précédente — Barre latérale : plus étroite, tout en noir, boutons du bas modernisés — v331
**Quoi :** la **barre latérale** (espace **cabinet** et **client**) est rendue **beaucoup plus étroite**, **entièrement noire**, et les **boutons du bas** (`.side-foot`) sont **modernisés**.
- **Largeur** : colonne de navigation **300 px → 208 px** (desktop), entrées de menu plus compactes (police 12,5 px, sous-sections/sous-modules resserrés, libellés tronqués proprement).
- **Tout en noir** : `aside` passe au **fond noir plein `#000`** (plus de dégradé bleu v318/v320 ni de flou), bord droit gris très sombre ; textes clairs lisibles, survol gris discret.
- **Boutons du bas modernisés** : pilules sobres translucides (`rgba(255,255,255,.055)`, bord léger, **arrondi 10 px**, plein largeur, centré), survol qui éclaircit, appui léger (`scale .97`) ; le bouton **« Mode nuit/jour »** (`#theme-toggle-side`) reçoit le même style (règle id pour primer).

**Comment — `yada-addon166` (100% CSS, injecté en dernier → prime sur addon160) :** `@media(min-width:821px){.layout:not(.solo){grid-template-columns:208px 1fr}…}` ; `body[data-theme] aside{background:#000;background-image:none;backdrop-filter:none}` ; restyle `.side-foot button`/`.theme-toggle-side` + override id `#theme-toggle-side`. S'applique à tous les thèmes (cabinet + client). Mobile (drawer 82vw) inchangé.

**Limites :** habillage/mise en page uniquement. Validé : `node --check` (159 scripts, 0 erreur) + Playwright (`.layout` = `208px 1fr`, `aside` fond `rgb(0,0,0)`, boutons du bas + Mode nuit en pilules arrondies 10 px translucides, équilibre ✅, 0 pageerror). Badge → **v331**.

---

## 🟢 MAJ précédente — 3ᵉ dossier « MBC » ajouté à la base (ALR CONSEIL · MBC · BY HOLDING) — v330
**Quoi :** ajout du dossier **MBC** dans la base, entre **ALR CONSEIL** (`d-ama`) et **BY HOLDING** (`d-sci42`). Le portefeuille « Sociétés » et l'écran de sélection affichent désormais **3 dossiers** : **ALR CONSEIL · MBC · BY HOLDING**. MBC est un **dossier vierge** (société « MBC », plan comptable BTP chargé) prêt à l'emploi / import FEC.

**Comment :**
- **Seed** : `cabinetDefaut().dossiers` reçoit `{id:'d-mbc', nom:'MBC', forme:'SAS'}` (au milieu), `total:3` ; `seed()` crée `db.dossiersData['d-mbc']=construireMBC()` (nouveau builder = `datasetVide` société MBC + `chargerPlanBTP`).
- **`yada-addon163`** : `ensureMBC()` **ajoute MBC** à une **base déjà enregistrée** (avant v330) si absent — insertion après `d-ama`, dataset vierge — **idempotent**. `save()` après ajout.

**Limites :** MBC est **vierge** (à alimenter par saisie / import FEC). Validé : `node --check` (158 scripts, 0 erreur) + Playwright (seed → 3 dossiers ALR CONSEIL/MBC/BY HOLDING, migration base à 2 dossiers → MBC ajouté & idempotent, total=3, équilibre ✅, 0 pageerror). Badge → **v330**.

---

## 🟢 MAJ précédente — Redéploiement de vérification (auto-déploiement) — v329
**Quoi :** **aucun changement fonctionnel** — simple **bump de version v328 → v329** pour vérifier de bout en bout la chaîne de déploiement automatique vers l'hébergeur du site. À chaque push sur `main`, l'hébergeur reconstruit le site et le badge passe à v329, confirmant que la mise à jour en ligne est automatique (service worker « réseau d'abord » + addon103 mise à jour auto). Badge `#yada-ver` → `YADA · v329`, `version.json` → 329.

**Limites :** aucune logique/écriture/UI modifiée. Validé : `node --check` + équilibre des écritures ✅. Badge → **v329**.

---

## 🟢 MAJ précédente — Module Fournisseurs (cabinet) : dépôt de facture + génération d'écritures, carte Correspondances retirée, « Fournisseur » → « Fournisseurs » — v328
**Quoi :** dans le **module Fournisseurs** (espace cabinet) :
1. **Renommage** « Fournisseur » → **« Fournisseurs »** (libellé de page/menu, `PAGES` id `achats`).
2. **Carte « Correspondances » supprimée** du module (sens **achat**) ; elle est **conservée côté Clients** (sens vente).
3. **Dépôt de facture fournisseur** ajouté dans le module (dropzone + lecture auto TTC/TVA/HT, via `depotFacturesCard('achat')`) — en plus de la capture manuelle/OCR.
4. **Génération d'écritures proposée** : la carte cabinet des dépôts (`depotsCabinetCard('achat')`, comptabilisation → écriture ACH) reste affichée + la carte « Capture d'une facture » (génère l'écriture).

**Comment — `yada-addon165` (100% additif, cabinet uniquement) :** wrap `correspondancesCard` → renvoie `''` si `sens==='achat'` (Clients/vente intacts) ; wrap `pageAchats` → insère `depotFacturesCard('achat', …)` **juste avant** la carte « Capture d'une facture » (`h.replace('<div class="card"><h2>Capture', dep+…)`, garde anti-doublon `fdep-achat`). Libellé : `PAGES` `achats` `lbl:'Fournisseur'` → `'Fournisseurs'`.

**Limites :** la génération depuis un dépôt passe par la carte cabinet (Recevoir → Comptabiliser) ; la capture directe (manuelle/OCR) génère aussi l'écriture. Validé : `node --check` (158 scripts, 0 erreur) + accolades addon165 (10/10) + Playwright (libellé « Fournisseurs », dropzone `fdep-achat` présent, Capture présent, dépôts cabinet présent, Correspondances achat retirée mais vente conservée, équilibre ✅, 0 pageerror). Badge → **v328**.

---

## 🟢 MAJ précédente — Navigation (cabinet) : 8 modules principaux + sous-modules dépliables — v327
**Quoi :** la barre de navigation (espace cabinet) est réorganisée en **8 modules principaux** : **Comptabilité, Fournisseurs, Clients, Tiers, Immobilisations et Financement, Charges et Paie, TVA, Banque**. Les autres pages deviennent des **sous-modules**, **listés uniquement quand on clique** sur le module principal (plusieurs modules peuvent rester ouverts, état mémorisé). Les pages hors comptabilité restent en **sections séparées** : **Pilotage** en haut (Tableau de bord, Sociétés, Espace Client) et **Dossier & réglages** en bas (Société & dossier, Informations société, Coffre-fort, Paramétrage).

**Sous-modules de Comptabilité** (+ renommages demandés) : **Analyse** (ex-« Consultation des comptes »), **Journal comptable**, **Éditions** (ex-« Éditions (Balance, Grand livre…) »), **Import / Export FEC**, **Suivi des règlements**, **Analytique & rentabilité**, **Plan comptable**, **Assistant IA**. Modules à page unique (Fournisseurs, Clients, Tiers, Charges et Paie, TVA) = **bouton direct** (pas de sous-liste). Banque → Banque (512) · Saisie journal Banque · Rapprochement. Immobilisations et Financement → Immobilisations & Financements · Frais km & carburant.

**Comment — `yada-addon164` (override `buildNav` pour le cabinet uniquement ; la nav Client n'est pas touchée) :** structure `MODULES` (module à `page` unique → bouton direct ; module à `subs` → en-tête dépliable `.nav-grp-h` + liste `.nav-sub`), libellés renommés via `LBL`, état d'ouverture mémorisé `localStorage 'yada-modnav-open'` (toggle `modnavToggle` → `buildNav()`), surbrillance `has-active` sur le module contenant la page courante. `<style id="modnav-mod">` (chevron, sous-liste indentée à liseré bleu).

**Choix retenus (questions) :** Tiers = **module principal séparé** (pas aussi sous Comptabilité) ; pages hors-compta en **sections séparées** ; **plusieurs modules ouverts** possibles. « Suivi des règlements » placé en sous-module de Comptabilité (sibling d'Analyse). Validé : `node --check` (157 scripts, 0 erreur) + accolades addon164 (52/52) + Playwright (8 modules, sous-modules listés au clic, défaut replié, multi-ouverts, renames OK, état persistant, équilibre ✅, 0 pageerror). Badge → **v327**.

---

## 🟢 MAJ précédente — Dossiers de la base : ALR CONSEIL & BY HOLDING (renommage des dossiers + migration) — v326
**Quoi :** les deux dossiers de la base s'appellent désormais **ALR CONSEIL** (id interne `d-ama`) et **BY HOLDING** (id interne `d-sci42`) — ils **apparaissent ainsi dans le logiciel** (portefeuille « Sociétés » + écran de sélection des dossiers + société active). Les **ids internes sont conservés** (`d-ama`/`d-sci42`) pour ne pas casser le filet de tests ni le portail Client (`CLIENT_DOSSIER='d-ama'`).

**Comment :**
- **Seed** (`cabinetDefaut`, `construireAMA`, `construireSCI42`) : `nom`/`raison`/`dossierNom` passés à **ALR CONSEIL** (SAS, Conseil) et **BY HOLDING** (SAS, Holding) ; les jeux de données de démonstration (tiers, écritures équilibrées) sont **conservés** (application fonctionnelle + tests verts).
- **`yada-addon163`** : migration **idempotente** au chargement et au 1er rendu — renomme une base **déjà enregistrée** (`db.cabinet.dossiers`, `db.dossiersData[*].societe`, société active), **uniquement** si le nom courant est exactement l'ancien nom de démo (`AMA`→ALR CONSEIL, `SCI DU 42`→BY HOLDING). `save()` après changement.

**Limites :** données de démonstration conservées sous les nouveaux noms (à compléter/réinitialiser pour les données réelles). Validé : `node --check` (155 scripts, 0 erreur) + accolades addon163 (24/24) + Playwright (seed → « ALR CONSEIL »/« BY HOLDING », migration depuis anciens noms OK & idempotente, équilibre ✅, 0 pageerror). Badge → **v326**.

---

## 🟢 MAJ précédente — Persistance grande capacité (IndexedDB) : les gros dossiers (> 5 Mo) ne sont plus perdus au redémarrage — v325
**Quoi :** correction d'un problème majeur de **persistance des données**. YADA enregistrait dans le **`localStorage`** (limité à ~5 Mo, et chaque caractère y compte double) : un dossier volumineux (ex. ~3,4 Mo de JSON) **dépassait le quota** → `save()` échouait **silencieusement** → au redémarrage, les données avaient disparu et il fallait **ré-importer le fichier à chaque fois**. Désormais chaque enregistrement est **miroité dans IndexedDB** (capacité bien plus grande) et **restauré au démarrage** : on importe **une seule fois**, et le dossier **reste** sur l'appareil.

**Comment — `yada-addon-idb-persist` (100% additif) :** helpers `idbSet`/`idbGet` (base `yada-store`, store `kv`, clé `db`) ; **wrap de `save()`** qui écrit aussi `{data:JSON(db), ts}` dans IndexedDB (+ un horodatage minuscule `yada-db-ts` en localStorage) ; au démarrage, `bootApply()` lit IndexedDB et **restaure** la copie si elle est **au moins aussi récente** que le localStorage (`idbTs ≥ lsTs`) — cas d'un dossier trop gros pour le localStorage où seule la copie IndexedDB est complète. Aucune logique comptable modifiée.

**Note confidentialité :** les données réelles du cabinet **ne sont PAS embarquées** dans l'application publique (ce serait exposé sur le web) — elles restent **locales** (IndexedDB), persistantes après un seul import.

**Limites :** la persistance est **par appareil** (IndexedDB local) — pour partager entre appareils, utiliser le transfert par fichier (Importer) ou la synchro cloud. Validé : `node --check` (155 scripts), filet d'équilibre (d-ama/d-sci42), test Playwright avec le fichier réel **3,33 Mo** (stocké en IndexedDB + 3 dossiers restaurés après reload, 0 pageerror). Badge → **v325**.

---

## 🟢 MAJ précédente — Espace Client : cartes horizontales (Client & Fournisseur) + « Créer une facture » ouvre la fenêtre complète (cabinet) avec aperçu A4 en direct — v323
**Quoi :** dans l'**espace Client**, trois demandes :
1. **Cartes horizontales** — les pages **Client** (facturation) et **Fournisseur** (achats) passent en **cartes pleine largeur empilées** (au lieu des 2 colonnes `.cli-2col`).
2. **Carte « Créer une facture » à la place du formulaire ouvert** — le **formulaire inline** de création (`.fa-cli-creer`) est **remplacé par une carte-bouton « ➕ Créer une facture »**.
3. **Fenêtre complète comme le cabinet** — au clic sur « Créer une facture », ouverture de la **même fenêtre que l'espace cabinet** (`#nf-overlay` via `factureNouvelleOuvrir()`) : **panneau de gauche large avec toutes les options** (type, client, dates, devise, lignes, remise, acompte, moyen, escompte, retenue…) **et l'aperçu de la facture au format A4 mis à jour en temps réel** à droite.

**Comment — `yada-addon162` (100% additif) :**
- **Cartes horizontales** : `<style>` `body[data-role="client"] .cli-2col{grid-template-columns:1fr !important}` (les deux pages client utilisent `.cli-2col`).
- **Bouton + retrait du formulaire** : greffe **post-render** sur `render` — si `sessionRole==='client'` et qu'un `.fa-cli-creer` est présent, il est **remplacé** (`outerHTML`) par la carte-bouton qui appelle `factureNouvelleOuvrir()` (fonction cabinet existante, ouvre `#nf-overlay` = `nfFormHTML()` + aperçu `nfApercu()`/`docHTML` en direct). La création (`nfCreer`) pousse la facture dans `db.docs` → visible dans « Mes factures de vente ».

**Limites :** la carte de **récurrence** et le **dépôt** restent (pleine largeur) ; le formulaire inline n'est plus utilisé (remplacé à l'affichage). Validé : `node --check` (153 scripts, 0 erreur) + accolades addon162 (14/14) + Playwright (page client : `.fa-cli-creer` retiré → carte-bouton présente, `.cli-2col` = 1 colonne pleine largeur, `factureNouvelleOuvrir` disponible, 0 pageerror ; équilibre ✅). Badge → **v323**.

---

## 🟢 MAJ précédente — Page d'ouverture (écran de connexion) : design amélioré bleu/noir + bleu Crystal — v322
**Quoi :** la **page d'ouverture du logiciel** (écran de connexion `#sec-lock`, disposition scindée marque/formulaire) est **améliorée** en gardant **tous les éléments** et **les mêmes couleurs** (bleu / noir / bleu Crystal) et les **mêmes effets** : panneau marque (gauche) à **dégradé bleu→noir plus riche + halo bleu Crystal**, logo « YADA » avec **glow bleu**, puces à **flèches bleu Crystal lumineuses** ; panneau formulaire (droite) en **dégradé bleu→noir** (au lieu d'un noir plat) ; **boutons Espace Cabinet/Client** en bleu Crystal avec **effet bleu au survol ET à l'appui** (halo + glow) ; **champs** à focus bleu Crystal ; liens/notes/version en accents bleu Crystal.

**Où / comment :** `yada-addon-sec-charme` injecte `<style id="sec-charme">` en dernier (prioritaire sur `sec-split`), ciblant uniquement `#sec-lock` (aucune logique modifiée, tous les éléments conservés). Validé : `node --check` (153), équilibre (d-ama/d-sci42), capture @2x (écran de connexion embelli, 0 pageerror). Badge → **v322**.

---

## 🟢 MAJ précédente — Espace Client : carte « 🔁 Récurrences effectuées » (suivi + téléchargement en lot / un par un) — v321
**Quoi :** dans l'**espace Client** (Mes factures clients), une nouvelle carte **« 🔁 Récurrences effectuées »** est ajoutée **en pleine largeur sous les deux colonnes** (placement choisi). Elle regroupe les factures créées par **récurrence** (addon124, `recurrence.groupe`) et affiche, **par récurrence** : **Client**, **Prestation**, **taux de TVA**, **nombre de mois**, **1ʳᵉ date de facture**, **dernière date de facture**, **montant total dû (TTC)**. En tête : KPIs **nombre de récurrences**, total factures (mois), **montant total dû**. Les factures sont **téléchargeables en lot** (📦 toutes les factures de la récurrence, chacune sur sa page A4) **et une par une** (⤓ PDF par facture, via le détail dépliable « ▾ Factures »).

**Comment — `yada-addon161` (greffe `pageFacturationClient`, 100% additif) :** `faRecGroupes()` regroupe `db.docs` par `recurrence.groupe` (taux depuis la 1ʳᵉ ligne, dates min/max, total TTC) ; `faRecSuivi()` rend la carte (table + `<tbody>` par récurrence, détail masqué `faRecToggle`) ; `faRecTelechargerLot(grp)` concatène les `docHTML()` de la récurrence dans `#print-area` puis `window.print()` (chaque facture sur sa page A4 via `@media print{.inv-page:not(:last-child){page-break-after:always}}`) ; téléchargement unitaire = `telechargerDoc(id)` existant. Greffe : `pageFacturationClient` renvoie son HTML **+ la carte** (donc pleine largeur sous `.cli-2col`). `<style id="frec-suivi-mod">`.

**Limites :** affichage/téléchargement uniquement (aucune écriture créée — les écritures se génèrent toujours depuis « Mes factures de vente ») ; la carte n'apparaît que s'il existe au moins une récurrence. Validé : `node --check` (152 scripts, 0 erreur) + accolades addon161 (46/46) + Playwright (récurrence test 3 mois → nb=3, TVA 20 %, 1ʳᵉ 15/01, dernière 15/03, total dû 360 €, boutons lot + unitaire présents, 0 pageerror ; équilibre ✅). Badge → **v321**.

---

## 🟢 MAJ précédente — Fenêtre « Nouvelle facture » + barre latérale : habillage « navy raffiné » (dégradé subtil + champs soignés) — v320
**Quoi :** le panneau de gauche de « Nouvelle facture » (jugé « pas élégant » en v319) est **redessiné en navy raffiné** (choix utilisateur) : **dégradé bleu nuit plus profond et subtil** (`168deg,#14365f→#0e2748→#0a1b34`, + léger reflet `inset` en haut), **champs soignés** (arrondis 10 px, fond translucide discret, libellés en **petites capitales bleu-gris**, anneau de focus bleu, plus d'espacement), **fins séparateurs** (totaux/pied/lignes), en-tête `.nf-bar` affiné. Le **même dégradé raffiné est appliqué à la barre latérale** (`aside`) pour rester cohérent (« pareil »).

**Comment — `yada-addon160` (surcharges `#nf-overlay .nf-form …` + gradient partagé `aside`/`.nf-form`) :** gradient v318/v319 `#103a73…` remplacé par `#14365f…` (2 occurrences) ; ajout des règles de champs (`label` petites capitales `#90a8cc`, `input/select/textarea` `background:rgba(255,255,255,.055)`, `border-radius:10px`, focus `#2f8fff` + halo) ; `.nf-form-body` padding 20/22 px ; `.nf-li`/`.nf-tot`/`.nf-foot` séparateurs bleu discret ; indicateur de date inversé (`invert(.85)`).

**Limites :** habillage uniquement. Validé : `node --check` (151 scripts, 0 erreur) + accolades addon160 (66/66) + Playwright (`.nf-form` = dégradé navy raffiné, `input` fond translucide + `border-radius:10px`, `label` `text-transform:uppercase` `#90a8cc`, 0 pageerror ; équilibre ✅). Badge → **v320**.

---

## 🟢 MAJ précédente — Fenêtre « Nouvelle facture » : panneau de gauche identique à la barre latérale (dégradé de bleu opaque) — v319
**Quoi :** à la demande, le **panneau de gauche de la fenêtre « Nouvelle facture »** (formulaire de la **facturation client** — et cabinet, même fenêtre) reçoit le **même dégradé de bleu opaque que la barre latérale** : **plus aucune transparence** (avant, `.nf-form{background:var(--card)}` valait `rgba(16,26,42,.72)` en Mode Nuit → on voyait le tableau de bord derrière). Le panneau est désormais **plein**, accordé à la barre latérale.

**Comment — `yada-addon160` (1 ajout, surcharge `#nf-overlay .nf-form` injectée en dernier, spécificité id+classe → bat `var(--card)`) :** `#nf-overlay .nf-form{background:linear-gradient(180deg,#103a73,#0b2a52,#071a33) !important;backdrop-filter:none !important;border-right:1px solid rgba(30,144,255,.55)}` (même dégradé que `aside` en v318) ; `.nf-form-body` transparent (laisse voir le dégradé) ; barre de défilement fine bleue. L'en-tête `.nf-bar` était déjà en dégradé bleu.

**Limites :** habillage uniquement (aucune logique modifiée). Validé : `node --check` (151 scripts, 0 erreur) + accolades addon160 équilibrées (53/53) + Playwright (`.nf-form` `background` = dégradé bleu opaque identique à la barre latérale, `backdrop-filter:none`, 0 pageerror ; équilibre des écritures ✅). Badge → **v319**.

---

## 🟢 MAJ précédente — Barre latérale : dégradé de bleu OPAQUE (sans transparence), contenu symétrique & sans débordement — v318
**Quoi :** à la demande, la **barre latérale** (`aside`) reçoit un **dégradé de bleu opaque** — **aucune transparence**, on ne voit **plus le fond** derrière (l'ancien rendu Mode Nuit laissait un **fond noir + un flou `backdrop-filter`** transparent). Le contenu est rendu **symétrique** (marges latérales égales) et **sans débordement** (aucun élément qui dépasse, libellés tronqués proprement, défilement vertical contenu).

**Comment — `yada-addon160` (`<style id="fa-a4-format-mod">`, surcharge `body[data-theme] aside` injectée en dernier → bat les règles de thème) :**
- **Fond** : `background:linear-gradient(180deg,#103a73,#0b2a52,#071a33)` **opaque** ; `backdrop-filter:none` (supprime le flou/transparence v308) ; bord droit bleu `rgba(30,144,255,.55)`.
- **Symétrie / pas de débordement** : `aside{padding:20px 16px 14px;overflow:hidden}` (marges latérales égales) ; `nav{padding 0 ; overflow-y:auto ; overflow-x:hidden}` ; `.nav-btn{width:100%;box-sizing:border-box;text-overflow:ellipsis;white-space:nowrap}` (libellés longs tronqués, plus de débordement horizontal) ; outils du bas `.side-foot button`/`.theme-toggle-side` **pleine largeur, centrés** (verre bleu lisible sur fond opaque) ; barre de défilement fine bleue.
- Appliqué à **tous les thèmes** (`body[data-theme] aside`), mobile compris.

**Limites :** habillage/mise en page uniquement (aucune logique modifiée). Validé : `node --check` (151 scripts, 0 erreur) + accolades addon160 équilibrées (49/49) + Playwright (aside `background` = dégradé bleu opaque, `backdrop-filter:none`, padding symétrique `20px 16px 14px`, `scrollWidth ≤ clientWidth` → aucun débordement, 0 pageerror). Badge → **v318**.

---

## 🟢 MAJ précédente — Barre latérale encore élargie (272 → 300 px) + entrées de navigation plus aérées — v317
**Quoi :** à la demande (« élargir la barre latérale »), la **barre latérale est encore élargie** sur les pages applicatives : la colonne de navigation passe de **272 px à 300 px** (desktop), avec un **padding latéral légèrement augmenté** (`aside` 18 → 20 px) et des **entrées de menu plus aérées** (`.nav-btn` police 14 px, padding 9/13 px) pour que les outils respirent mieux. La page de sélection des dossiers (`.layout.solo`) reste en **pleine largeur** (correctif v316 conservé via `.layout:not(.solo)`).

**Comment — 1 retouche dans `yada-addon160` (`<style id="fa-a4-format-mod">`) :** `.layout:not(.solo){grid-template-columns:272px 1fr}` → **`300px 1fr`** ; `aside{padding:22px 20px 16px}` ; ajout `.nav-btn{font-size:14px;padding:9px 13px}`. Mobile (≤820 px) inchangé.

**Limites :** mise en page uniquement (aucune logique modifiée). Validé : `node --check` (151 scripts, 0 erreur) + Playwright (pages applicatives `.layout:not(.solo)` → `300px 1fr` ; page dossiers `.layout.solo` → `1fr` pleine largeur ; 0 pageerror). Badge → **v317**.

---

## 🟢 MAJ précédente — Correctif : page de sélection des dossiers écrasée par l'élargissement de la barre latérale — v316
**Quoi :** correction d'un **bug introduit en v315**. L'élargissement de la barre latérale utilisait `.layout{grid-template-columns:272px 1fr !important}` ; comme l'`!important` l'emporte sur `.layout.solo{grid-template-columns:1fr}` (sans `!important`), la **page de connexion / sélection des dossiers** (rendue avec `.layout.solo`, sans barre latérale — voir `render()` : `if(!connecte){ layout.classList.add('solo') … }`) se retrouvait forcée en **deux colonnes 272 px / 1fr** → les **cartes de dossier** et le bouton **« Créer un dossier »** étaient **tassés dans une colonne étroite** à gauche.

**Comment — 1 retouche chirurgicale dans `yada-addon160` :** la règle d'élargissement cible désormais **`.layout:not(.solo)`** (au lieu de `.layout`) → la barre latérale reste élargie sur les pages applicatives, et la page de sélection des dossiers (`.layout.solo`) **retrouve sa pleine largeur (1fr)**.

**Limites :** mise en page uniquement (aucune logique modifiée). Validé : `node --check` (151 scripts, 0 erreur) + Playwright (page dossiers `.layout.solo` → grille pleine largeur `1fr`, plus de cartes tassées, 0 pageerror ; barre latérale toujours `272px 1fr` sur les pages applicatives). Badge → **v316**.

---

## 🟢 MAJ précédente — Facture : toujours au format A4 (multi-pages) + barre latérale élargie — v315
**Quoi :** deux demandes sur la **facture de vente** et l'interface :
1. **Facture toujours en A4** — la feuille de facture (`.inv-page`) devient une **vraie page A4 (210 × 297 mm)** à l'écran (aperçu en direct + modale) : le **vide se remplit jusqu'au bas** de la page (« le champ vide s'adapte »), et **si les désignations dépassent**, le contenu est **reporté sur une 2ᵉ/3ᵉ page A4** sans couper les lignes/blocs — **aussi bien à l'enregistrement PDF qu'à l'impression**. L'aperçu A4 en direct est **ajusté en largeur** pour tenir dans son cadre.
2. **Barre latérale élargie** — la colonne de navigation passe de **236 px à 272 px** (desktop) et les **boutons d'outils du bas** (`.side-foot`) sont **plus aérés** (police 11 px, padding 6/10 px, espacement 5 px) pour ne plus être « étouffants ».

**Comment — `yada-addon160` (100% additif, `<style id="fa-a4-format-mod">` injecté en dernier + ajusteur d'aperçu) :**
- **Écran (≥821 px)** : `.inv-page{width:210mm;max-width:210mm;min-height:297mm;box-sizing:border-box;padding:16mm 15mm}` (surcharge le `min-height:0` de `inv-a4-fix`/v200). Mesuré : 793,7 × 1122,5 px = A4.
- **Pagination** : `.inv-t thead{display:table-header-group}` (en-tête répété) + `page-break-inside:avoid` sur `.inv-t tr` et les blocs (`.inv-top/.inv-meta/.inv-parties/.inv-tot/.inv-pay/.inv-cond/.inv-foot-line`).
- **Impression / PDF** : `@page{size:A4;margin:14mm}` ; `#print-area .inv-page` remis à plat (sans bord/ombre, largeur auto, `min-height:0`) → le contenu **enchaîne les pages A4** ; `window.print()` (utilisé par « Télécharger PDF » et l'impression) en bénéficie.
- **Aperçu en direct** : `fitFA4()` (re-greffé sur `faMaj`, déjà enveloppée par addon105, + écouteur `resize`) met la feuille A4 à l'échelle pour tenir dans la largeur du cadre (`#fa-a4-wrap .fa-a4-paper`).
- **Barre latérale** : `@media(min-width:821px){.layout{grid-template-columns:272px 1fr}…}` (+ `aside`, `.side-foot`, `.side-foot button`, `.theme-toggle-side`). Mobile (≤820 px, barre fixe 82vw) inchangé.

**Limites :** affichage / mise en page uniquement (aucune donnée/écriture/logique modifiée). Validé : `node --check` (151 scripts, 0 erreur) + accolades équilibrées (CSS statique 2010/2010 ; addon160 37/37) + Playwright (`.inv-page` = 210×297 mm border-box, barre latérale `272px 1fr`, équilibre OK, 0 pageerror). Badge → **v315**.

---

## 🟢 MAJ précédente — Module TVA : suivi annuel CA3 en vert/rouge, suivi mensuel CA12 en bleu — v314
**Quoi :** ajustement des deux tableaux de suivi TVA selon la demande (« les deux points ») :
1. **Tableau « Suivi annuel de la TVA » (CA3)** — les colonnes **Collectée** et **Déductible** **retrouvent leur coloration comptable** : **vert** (classe `cre`) pour la collectée, **rouge** (classe `deb`) pour la déductible (c'était neutralisé en v313 ; rétabli pour la lisibilité comptable).
2. **Tableau « Suivi mensuel détaillé (CA3) » de la vue régime CA12** (réel simplifié) — les mêmes colonnes **Collectée / Déductible** passent au **texte neutre du thème (bleu système)** (classe `r num`), comme le reste du module.

La barre des mois « Néant » reste en bleu-gris neutre `#9fb6d0` (v313 conservé).

**Comment — 2 retouches chirurgicales dans `pageTVA` :**
- Suivi annuel (CA3) : `<td class="r num">` → `<td class="r num cre">` (collectée) et `<td class="r num deb">` (déductible).
- Suivi mensuel détaillé (CA12) : `<td class="r num cre">`/`<td class="r num deb">` → `<td class="r num">` (neutre).

**Limites :** couleurs d'affichage uniquement (aucun montant/logique modifié). Validé : `node --check` (150 scripts) + accolades CSS équilibrées (2010/2010) + Playwright (équilibre OK, badge v314, 0 pageerror). Badge → **v314**.

---

## 🟢 MAJ précédente — Module TVA : éléments accordés au système (rouge/vert → bleu Crystal) — v313
**Quoi :** dans le **Module TVA (CA3)**, les **éléments en rouge / vert** (« l'écriture » et « la forme ») passent au **bleu Crystal** comme le reste du système : (1) la barre des mois — le sous-libellé **« Néant »** des mois sans TVA, qui s'affichait en **magenta/rouge `#b08`**, passe au **bleu-gris neutre `#9fb6d0`** (cohérent avec les autres sous-libellés) ; (2) le tableau **« Suivi annuel de la TVA »** — les colonnes **Collectée** (qui était en **vert**, classe `cre`) et **Déductible** (en **rouge**, classe `deb`) repassent au **texte neutre du thème** (classe `r num`), les en-têtes de colonnes nommant déjà la nature des montants. Le mois actif et les onglets/segments de régime étaient déjà en bleu (v311/v312).

**Comment — 2 retouches chirurgicales dans `pageTVA` :**
- Barre des mois : `style="color:#b08"` (Néant) → `style="color:#9fb6d0"`.
- Suivi annuel : `<td class="r num cre">` (collectée) et `<td class="r num deb">` (déductible) → `<td class="r num">` (neutre).

**Limites :** couleurs d'affichage uniquement (aucun montant/logique modifié) ; les classes globales `cre`/`deb` (vert/rouge comptable) restent intactes ailleurs ; la vue régime **CA12** (réel simplifié) conserve sa coloration. Validé : `node --check` (150 scripts) + accolades CSS équilibrées (2010/2010) + Playwright (équilibre OK, `#b08` retiré, badge v313, 0 pageerror). Badge → **v313**.

---

## 🟢 MAJ précédente — Charges & Paie : indicateurs verts accordés au système (bleu Crystal) — v312
**Quoi :** dans le module **Charges & Paie**, les **éléments verts** de la barre du haut passent au **bleu Crystal** (comme les autres modules) : la **pastille « ✓ Mois saisi »** (`.cp-pill.ok`, qui était vert `#5bbf8a` sur fond vert) et les **sous-libellés « ✓ saisi »** des onglets de mois (`.cp-mtab .v`). La pastille **« ● Mois non saisi »** reste en rouge (avertissement « à faire »), et le mois actif était déjà en bleu.

**Comment — 3 retouches CSS :**
- `.cp-pill.ok` : `background:#163a2c;color:#5bbf8a;border:#2c6b4e` (vert) → `background:#0d2740;color:#5ab0ff;border:#1e90ff` (bleu).
- `.cp-mtab .v` : `color:#5bbf8a` → `#5ab0ff` ; `.cp-mtab.on .v` : `#9fe0bf` → `#cfe0ff`.

**Limites :** couleurs d'affichage uniquement ; le rouge « non saisi » est conservé (sémantique d'alerte). Validé : `node --check` (150 scripts) + accolades CSS équilibrées + Playwright (module rendu, plus de vert sur les indicateurs, équilibre OK, 0 pageerror). Badge → **v312**.

---

## 🟢 MAJ précédente — Consultation : sélections (période / journal / onglet) accordées au système (vert → bleu Crystal) — v311
**Quoi :** dans la **Consultation des comptes**, les **éléments de sélection** qui s'affichaient en **VERT** (ne correspondant pas au système bleu) passent au **bleu Crystal** : la **période active** (mois sélectionné, ex. « 12/25 »), le **journal actif** (ex. « A - HA ACHATS »), et le **liseré de l'onglet actif** (Comptes Généraux / Fournisseurs divers…). C'était surtout visible en **Mode nuit**, où le mois sélectionné restait vert (`#57b88b`) malgré le thème bleu.

**Comment — 5 retouches CSS chirurgicales :**
- `.sg-peritem.on` (période) : `#57b88b` → `#1e90ff` (base) ; surcharge nuit `#57b88b !important` → `#0a64d6`.
- `.sg-jrnitem.on` (journal) : `#d2eede` → `#dbeafe` (base) ; surcharge nuit `#d2eede !important` → `rgba(30,144,255,.28)` + texte clair.
- `.sg-tab.on` (onglet) : liseré `border-top #2fa46a` → `#0a64d6`.

**Limites :** couleurs d'affichage uniquement (aucune logique modifiée). Validé : `node --check` (150 scripts) + accolades CSS équilibrées + Playwright (Mode nuit : période active = `rgb(10,100,214)` bleu, onglet liseré bleu, plus aucun vert sur les sélections ; équilibre OK ; 0 pageerror). Badge → **v311**.

---

## 🟢 MAJ précédente — Qualité d'affichage : netteté du texte + bleu CRYSTAL + style plus épuré (hors page dossier) — v310
**Quoi :** passe de **qualité d'affichage** globale (Jour + Nuit) : **lissage des polices** (`-webkit-font-smoothing:antialiased` + `text-rendering:optimizeLegibility`) → texte plus net ; **bleu CRYSTAL** (`#1e90ff`) sur la sélection de texte, l'**anneau de focus** des champs, les **onglets/segments actifs**, les **liens** et les **valeurs KPI** (mode nuit) ; **lisibilité** des textes secondaires (sous-titres/libellés) renforcée par thème ; **ombres plus nettes/pro** sur les cartes internes. La **formule marketing** du hero (qui chevauchait le nom de la société) est **retirée** pour un rendu net. **La page de sélection des dossiers n'est PAS touchée** (`.login-*`/`.dossier-card` exclus).

**Où / comment :** `yada-addon-qualite-affichage` injecte `<style id="qualite-affichage">` en dernier (après jour/nuit-charme). Global, hors page dossier. Validé : `node --check` (150), équilibre (d-ama/d-sci42), captures @2x (jour + nuit nets, KPI bleu Crystal, hero propre, 0 pageerror). Badge → **v310**.

---

## 🟢 MAJ précédente — Éditeur (BANQUE) : contrepartie 512000000 posée même si la 2ᵉ ligne est « 000000000 » + écriture incomplète jamais validée — v309
**Quoi :** deux corrections liées à la saisie d'une **écriture bancaire (BQ)** :
1. **Contrepartie 512 automatique fiabilisée** : à la saisie du **compte de tiers** (classe 4) ou du **montant** sur la 1ʳᵉ ligne, le compte de la 2ᵉ ligne devient **512000000** — y compris quand cette 2ᵉ ligne portait le **compte non renseigné `000000000`** (cas d'une écriture importée/incomplète). Avant, `000000000` était traité comme un « compte choisi » et la banque n'apparaissait jamais.
2. **Jamais valider une écriture incomplète** : la fermeture/validation de la page de saisie est **bloquée** si une **ligne mouvementée** (débit ou crédit ≠ 0) a un compte **vide OU `000000000`** (saisie incomplète) — en plus du contrôle d'équilibre existant.

**Comment — 3 retouches chirurgicales :**
- `addon154` (compte) & `addon155` (montant) : le test « la 2ᵉ ligne est libre » considère désormais `''`, `000000000` et `c9(...)==='000000000'` comme **vides** (`vide1`) → on pose `512000000` au lieu de respecter le zéro.
- `ecFermer` : la garde « ligne mouvementée sans compte » traite aussi `000000000` comme **absence de compte** → blocage avec message « Renseignez un compte (≠ 000000000)… ».

**Limites :** scope banque pour l'auto-512 (≤ 2 lignes, hors split) ; le blocage de validation vaut pour tous les journaux. Validé : `node --check` (148 scripts) + Playwright (BQ : 2ᵉ ligne `000000000` → `512000000` à la saisie du compte ET du montant, miroir OK ; équilibre OK ; 0 pageerror). Badge → **v309**.

---

## 🟢 MAJ précédente — Mode NUIT : habillage « charme » BLEU & NOIR (dégradé global, lignes bleu vif, boutons à effet bleu, cartes fixes) — v308
**Quoi :** le **Mode Nuit** (`data-theme="noir"`) reçoit le même traitement que le Mode Jour mais en **bleu & noir** : **dégradé global bleu→noir** posé sur le `body` (plein écran, sans cadrage, **transmis à tout le logiciel** — login + pages internes), **lignes en BLEU VIF lumineux** (barre en tête de chaque KPI et avant chaque titre de carte, halo `box-shadow` bleu), **tables** à en-tête bleu nuit + survol bleu, **cartes dossier** en dégradé bleu→noir avec **bord bleu vif** et avatar lumineux, **boutons** avec **effet bleu au survol ET à l'appui** (`:hover`/`:active` → halo + glow bleu), **scrollbar** bleue. **Cartes & modules FIXES** (aucun mouvement : `transform:none`, seul le bleu varie).

**Où / comment :** `yada-addon-nuit-charme` injecte `<style id="nuit-charme">` en dernier, **100% scopé `body[data-theme="noir"]`** ; conteneurs (`.layout`/`main`/`.login-wrap`/`.mod-wrap`/`.dash-wrap`) transparents pour laisser voir le dégradé. **MODE JOUR inchangé.** Validé : `node --check` (149), équilibre (d-ama/d-sci42), captures (login + tableau de bord bleu/noir, lignes bleu vif, 0 pageerror). Badge → **v308**.

---

## 🟢 MAJ précédente — Consultation : flèches d'exercice sobres (chevrons ‹ › au lieu de ⟲ ⟳) — v307
**Quoi :** dans la barre de titre de la **Consultation des comptes**, les **flèches de changement d'année** (exercice précédent / suivant, autour de « Exercice <année> ») passent des glyphes **⟲ ⟳** (qui évoquaient un « rafraîchir/tourner ») à de **simples chevrons ‹ ›** — plus **sobres, simples et intuitifs** (gauche = précédent, droite = suivant). Le comportement est inchangé (`exPrecedent()` / `exSuivant()`).

**Comment — 2 retouches chirurgicales :** dans `pageCompta` (`.sg-title`), `>⟲</button>` → `>‹</button>` et `>⟳</button>` → `>›</button>` ; dans `addon150` (`.sg-exoarr`), `font-size` 15→18px, `font-weight` 700→600, `padding` ajusté pour que les chevrons restent bien lisibles. Les titres/`title` (« Exercice précédent/suivant ») et les fonctions restent identiques.

**Limites :** affichage uniquement (aucune logique modifiée). Validé : `node --check` (148 scripts) + Playwright (boutons `.sg-exoarr` = ‹ → `exPrecedent()` / › → `exSuivant()`, libellé « Exercice 2026 » ; équilibre OK ; 0 pageerror). Badge → **v307**.

---

## 🟢 MAJ précédente — Module Fournisseur (Achats, cabinet) : même disposition que le module Client (pleine largeur, sans split 2 colonnes) — v306
**Quoi :** dans l'espace **cabinet**, le **module Fournisseur (Achats)** adopte désormais la **même disposition que le module Client (Facturation)** : **pleine largeur**, cartes **empilées sur toute la largeur**, au lieu d'être scindé en **2 colonnes** (« Actions / Suivi & historique »). Le module Client était déjà en pleine largeur depuis la v199 ; le module Fournisseur le rejoint pour une présentation cohérente (capture de facture, suivi, correspondances… affichés en grand).

**Comment — 1 édition chirurgicale d'`addon73` :** le wrap de `pageAchats` (cabinet) ne fait plus `split(h, …)` (2 colonnes `.cli-2col`) → il renvoie `_pa()` tel quel, exactement comme `pageFacturation` (Client). Le helper `split()` reste défini (inutilisé pour Achats). L'espace **Client mobile** (`pageAchatsClient`) et son éventuelle mise en page restent inchangés.

**Limites :** affichage uniquement (aucune fonction/écriture modifiée). Validé : `node --check` (148 scripts) + Playwright (cabinet : `pageAchats()` et `pageFacturation()` ne contiennent plus `.cli-2col` → 0 ; 0 pageerror). Badge → **v306**.

---

## 🟢 MAJ précédente — Synchro cloud : message d'échec affiché UNE SEULE FOIS par session (plus à chaque enregistrement) — v305
**Quoi :** le **bandeau rouge d'échec de synchronisation** (« ☁ Échec de l'envoi : … » / « Réception impossible … », ex. l'erreur Supabase `PGRST205 : table yada_sync introuvable`) n'apparaît désormais **qu'une seule fois par session** — à la **première tentative** (à l'ouverture) — au lieu de réapparaître à **chaque enregistrement / mise à jour** (la poussée cloud est débattue après chaque `save`, donc l'erreur se répétait sans cesse). Après la première fois, les échecs de **synchro automatique** sont **silencieux** pour le reste de la session.

**Comment — `yada-addon102` (3 retouches) :** un drapeau de session `cloudErrShown` + un helper `cloudErr(txt, toastMsg)` qui n'affiche `status()` + `toast()` **que si `cloudErrShown` est faux** (puis le passe à vrai). Les branches d'erreur de `cloudPushNow` (envoi) et `cloudPull` (réception) appellent `cloudErr(...)` au lieu de `status()`/`toast()` directs. Les actions **manuelles** (« Tester la connexion » `cloudTest`, contrôle d'intégrité) gardent leur retour d'erreur **non filtré** (diagnostic à la demande). Le drapeau se réinitialise au **rechargement** (nouvelle session).

**Limites :** seuls les échecs de synchro **automatique** sont limités à une fois ; les boutons de test restent bavards (volontairement). Validé : `node --check` + Playwright (3 `cloudPushNow` en échec → **1 seul** toast d'erreur ; 0 pageerror). Badge → **v305**.

---

## 🟢 MAJ précédente — Mode JOUR : dégradé bleu→blanc GLOBAL (login + logiciel), plein écran sans cadrage — v304
**Quoi :** le **dégradé bleu→blanc** est désormais posé sur le **`body`** (racine, sans marge) → il **couvre tout l'écran bord à bord (plus de cadrage/frame)** et **se transmet à toutes les pages du logiciel** (tableau de bord, modules…), pas seulement l'écran de sélection des dossiers. Les conteneurs (`.layout`, `main`, `.login-wrap`, `.mod-wrap`, `.dash-wrap`) passent en **transparent** pour laisser voir le dégradé ; les cartes blanches « flottent » dessus.

**Aussi :** la **formule marketing** du hero (`#ec-hero.cab-hero::after`) qui **débordait/était coupée** est repositionnée proprement (`position:absolute` en bas du hero, plein largeur, sans rognage).

**Où / comment :** dans `jour-charme` — `body[data-theme="jour"]{background:linear-gradient(158deg,#5e9eff→#f4f9ff) fixed}` + conteneurs transparents ; `.login-wrap` n'a plus son propre dégradé (transparent). **100% scopé Mode Jour, MODE NUIT inchangé.** Validé : `node --check` (148), équilibre (d-ama/d-sci42), captures (login plein écran sans cadrage + dégradé dans le tableau de bord, 0 pageerror). Badge → **v304**.

---

## 🟢 MAJ précédente — Écran « Sélectionnez un dossier » (Mode Jour) : dégradé bleu plus INTENSE + en-tête en blanc lisible — v303
**Quoi :** le dégradé pleine page de l'écran de sélection des dossiers (Mode Jour) est rendu **nettement plus intense** (bleu soutenu `#3f86ff` en haut → blanc en bas). Comme le haut devient un bleu vif, l'**en-tête (logo « YADA », titre, sous-titre, nom du cabinet) passe en BLANC** pour rester parfaitement lisible ; les **cartes dossier** restent claires avec texte foncé.

**Où / comment :** dans `jour-charme` — `.login-wrap` : `linear-gradient(158deg,#3f86ff→#5e9eff→#86b8ff→#b4d4ff→#e3f0ff→#ffffff)` (fixed, 100vh) ; `.login-brand svg text/.login-title` → blanc (+ ombre portée légère), `.login-sub/.login-cab/small` → bleu très clair. **100% scopé Mode Jour, MODE NUIT inchangé.** Validé : `node --check` (148), équilibre (d-ama/d-sci42), capture (gradient intense, en-tête blanc lisible, cartes claires, 0 pageerror). Badge → **v303**.

---

## 🟢 MAJ précédente — Écran « Sélectionnez un dossier » (Mode Jour) : dégradé bleu→blanc pleine page, plus accentué, sans cadrage — v302
**Quoi :** le **dégradé** de la page de sélection des dossiers (Mode Jour) est rendu **plus accentué** (bleu plus soutenu en haut) et **couvre toute la page** (de haut en bas, bord à bord) — **plus de bande blanche en bas ni d'effet « panneau/cadrage »**.

**Où / comment :** dans `jour-charme`, la règle `body[data-theme="jour"] .login-wrap` passe d'un dégradé partiel (fondu transparent à 660px) à `linear-gradient(158deg,#8fbdff→#aed1ff→#cfe4ff→#e9f3ff→#ffffff)` avec `min-height:100vh` + `background-attachment:fixed` (couvre tout le viewport) ; `body[data-theme="jour"]:has(.login-wrap)` posé en bleu de départ en secours. **100% scopé Mode Jour, MODE NUIT inchangé.** Validé : `node --check` (148), équilibre (d-ama/d-sci42), capture (dégradé pleine page, sans cadrage, 0 pageerror). Badge → **v302**.

---

## 🟢 MAJ précédente — Écran « Sélectionnez un dossier » (Mode Jour) : logo lisible + fond bleu→blanc + cartes accordées — v301
**Quoi :** sur l'**écran de sélection de dossier** en **Mode Jour**, le **logo « YADA »** (texte SVG blanc) et le titre étaient **invisibles** (blanc sur blanc) et les **cartes dossier restaient sombres** (navy) sur fond blanc. Désormais : **logo + titres lisibles** (bleu nuit), **fond en dégradé bleu→blanc** sur la page, et **cartes dossier accordées** au thème (dégradé blanc→bleu clair, bord bleu, nom foncé lisible, pastille « Actif » bleue, avatar dégradé bleu).

**Où / comment :** rallonge de `yada-addon-jour-charme` (`<style id="jour-charme">`), **100% scopé `body[data-theme="jour"]`** : `.login-brand svg text` (fill bleu), `.login-title/.login-sub/.login-cab`, `.login-wrap` (dégradé bleu→blanc), `.dossier-card` + `.dc-nom/.dc-meta/.dc-siren/.dc-av/.dc-badge/.dc-open/.dc-star`. **MODE NUIT inchangé.** Validé : `node --check` (148), équilibre (d-ama/d-sci42), capture Playwright (logo visible, cartes claires, dégradé, 0 pageerror). Badge → **v301**.

---

## 🟢 MAJ précédente — Mode JOUR : habillage « charme » bleu & blanc + formule marketing + bandeau Nouveautés retiré — v300
**Quoi :** le **Mode Jour** (`data-theme="jour"`) est rendu **plus convaincant** : accents/dégradés **bleus**, **surlignements qui tapent à l'œil** (barre bleue en tête de chaque KPI et avant chaque titre de carte), **tables** en-tête bleu + zébrage, **hero** plus riche avec **formule marketing** (« ✨ Une comptabilité claire et maîtrisée — vos chiffres justes, en un coup d'œil. »), **scrollbar** fine et bleue. Le **bandeau « Nouveautés »** (addon111) est **désactivé**. **Le MODE NUIT n'est pas touché.**

**Où / comment :** `yada-addon-jour-charme` injecte `<style id="jour-charme">` en dernier, **100% scopé `body[data-theme="jour"]`** (couleurs uniquement, aucun mouvement — règle v235 ; rouge/vert comptables conservés). `addon111.show()` retourne immédiatement. Validé : `node --check`, équilibre (d-ama/d-sci42), captures Playwright (jour embelli, popup absent, 0 pageerror). Badge → **v300**.

---

## 🟢 MAJ précédente — Éditeur (hors banque) : Entrée sur DÉBIT → CRÉDIT + insertion d'une ligne interdite tant que non soldée — v299
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), pour **tous les journaux SAUF la banque (BQ)** : la touche **Entrée** depuis le champ **Débit** amène désormais le curseur sur le **Crédit** (on peut enfin accéder au crédit) — au lieu d'insérer une écriture/ligne parasite. L'**insertion d'une nouvelle ligne n'est possible qu'une fois l'écriture soldée** (Débit = Crédit) : tant qu'elle **n'est pas soldée**, **aucune ligne n'est insérée** — Entrée se contente de **naviguer** (pour atteindre/compléter le crédit). Une fois **soldée**, Entrée depuis la dernière ligne **passe à une nouvelle écriture**. Le **journal de banque (BQ) conserve son comportement** (contrepartie 512 / ajout de ligne pour solder, v279→v287).

**Comment — 2 éditions chirurgicales d'`addon114` :**
- **Entrée** : une branche **`e.journal!=='BQ'`** ajoutée en tête du bloc `col===6||col===7` → **Débit (col 6)** = `moveField(1)` (→ Crédit) ; **Crédit (col 7)** = `blur` (valide) puis, **uniquement si soldée et dernière ligne**, nouvelle écriture (`ecAjouterEcriture`) / écriture suivante, **sinon `moveField(1)`** (navigation, jamais d'insertion). Le bloc banque (`inp.blur()` + logique v283/v285) reste inchangé pour BQ.
- **Flèche bas** : dans la branche « non soldée » de la dernière ligne, garde **`if(journal!=='BQ') return;`** → plus d'insertion de ligne hors banque tant que non soldée (BQ garde `ecDescendre`).

**Limites :** ne touche que la navigation clavier ; l'écriture se solde via ses lignes existantes (assist HA/VT v293, lignes FEC, ou clic droit « Insérer une ligne » v292 en HA/VT). Validé : `node --check` (147 scripts) + Playwright (OD : Entrée Débit→Crédit col 7, non soldée → aucune insertion ; OD soldée → nouvelle écriture ; BQ non soldée → ligne ajoutée 1→2 ; équilibre OK ; 0 pageerror). Badge → **v299**.

---

## 🟢 MAJ précédente — Barre latérale : boutons d'actions rapides réduits + emoji du « Mode nuit/jour » retiré — v298
**Quoi :** dans la **barre latérale** (bas, `.side-foot` — Déconnexion, Mode nuit/jour, Changer de dossier, Télécharger la base, Importer, Ne pas enregistrer, Réinitialiser), les **boutons sont rendus plus compacts** (actions rapides qui prennent moins de place), en **gardant la même disposition** (pile verticale). L'**emoji** du bouton **« Mode nuit / Mode jour »** (🌙 / ☀️) est **retiré** → libellé texte seul.

**Comment — 4 retouches chirurgicales :**
- CSS `.side-foot` : `gap` 6→3px, `padding-top` 12→8px, `margin-top` 8→6px.
- CSS `.side-foot button` : `font-size` 11,5→**10px**, `padding` 7px→**4px 7px**, `border-radius` 7→6px (+`line-height:1.2`).
- CSS `.theme-toggle-side` (bouton Mode nuit) : `font-size` 12→**10,5px**, `padding` 9/10→**5/8px**, `border-radius` 10→6px, ombre allégée.
- JS : retrait de l'emoji dans le HTML statique (`Mode nuit`) **et** dans `maj()` (`Mode jour`/`Mode nuit`).

**Limites :** affichage uniquement (les autres emojis ⇆/⬇️/↩️/↺ restent, seul celui du Mode nuit/jour est retiré, conformément à la demande). Validé : `node --check` (147 scripts) + accolades CSS équilibrées + Playwright (libellé « Mode nuit » sans emoji ; font 10,5/10px, padding réduits, gap 3px ; 0 pageerror). Badge → **v298**.

---

## 🟢 MAJ précédente — Badge de version : libellé retiré (« YADA · vNNN » seul) + déplacé à gauche — v297
**Quoi :** le **badge de version** (repère de déploiement, `#yada-ver`) n'affiche plus le **libellé descriptif** de la mise à jour — uniquement **« YADA · v<version> »** — et il est **déplacé en bas à GAUCHE** (au lieu du bas à droite).

**Comment — `yada-addon37` (2 retouches) :** `textContent='YADA · v297'` (plus de suffixe descriptif) ; `style.cssText` passe de `right:10px;bottom:10px` à **`left:12px;bottom:82px`** (empilé au-dessus des indicateurs d'enregistrement `#yada-save-ind` à `bottom:10px` et de synchro `#yada-cloud-ind` à `bottom:46px`, pour éviter tout chevauchement). Le **format `YADA · vNNN` est conservé** → les lectures de version (`runningVer`, contrôle de mise à jour `/YADA · v(\d+)/`, plancher anti-rétro v248, CI `version.json`) continuent de fonctionner.

**Convention de suite :** à chaque version, le badge se met simplement à `YADA · v<NNN>` (sans libellé). Validé : `node --check` (147 scripts) + Playwright (badge = « YADA · v297 », `left:12px` / `bottom:82px`, 0 pageerror). Badge → **v297**.

---

## 🟢 MAJ précédente — Consultation (page principale) : panneau « Compte sélectionné » dans la barre du bas — v296
**Quoi :** reprise de la fonction v294 (panneau de l'éditeur) **sur la page principale de Consultation des comptes** (la grille en lecture, pas l'éditeur). À chaque **clic sur une ligne d'écriture** de la grille (`sgJournalGrid`, **tous les journaux**), la **barre du bas** (`.sg-status`, zone encerclée par l'utilisateur) affiche les **informations du compte cliqué** :
- **Compte de TIERS** → compte de tiers + libellé (Fournisseur/Client + nom, ou libellé de l'écriture), compte de TVA + libellé, compte de charge/produit + libellé (lus dans l'écriture).
- **Compte de TVA** → libellé du compte de TVA.
- **Compte de charge / produit** → libellé du compte de charge / produit.

**Comment — `yada-addon159` :** les lignes de la grille portent déjà `data-cpt` (compte) et `data-ecr` (écriture). Un écouteur `click` (capture) sur `.sgj tbody tr[data-cpt]` mémorise `{eid, compte}` ; `paint()` injecte un panneau `#sg-accinfo` dans `.sg-status` (avant le badge YADA) et le remplit via la même classification que v294 (`ecResolveTiers` ou préfixe `40/41` ; TVA `445…` ; charge `6…` ; produit `7…`) ; libellés via `COMPTES` (repli `db.plan`). Greffe `render` → repeint quand `current==='compta'`. `<style id="sg-accinfo-mod">` (couleurs adaptées au thème, accent bleu en mode nuit).

**Limites :** affichage seul ; cible la grille des journaux (`.sgj`) — la liste des comptes généraux (sans journal sélectionné) n'a pas de `data-cpt`. Validé : `node --check` (147 scripts) + Playwright (clic réel sur la grille ACH : tiers → tiers+TVA+charge avec libellés ; TVA → libellé TVA ; charge → libellé charge ; équilibre OK ; 0 pageerror). Badge → **v296 · Consultation : panneau « compte sélectionné »**.

---

## 🟢 MAJ précédente — Module TIERS : moyen de paiement préféré (liste fermée VIR/PRLV/CHQ/CB/ESP) — v295
**Quoi :** dans le **module TIERS**, la fiche d'édition (Modifier — <tiers>) gagne un champ **« Moyen de paiement préféré »** — une **liste déroulante fermée** à choisir parmi : **VIR (Virement)**, **PRLV (Prélèvement)**, **CHQ (Chèque)**, **CB (Carte Bancaire)**, **ESP (Espèces)** (+ « — » vide). Disponible pour **tous les tiers** : **Fournisseurs**, **Clients – Sociétés** et **Clients – Particuliers** (la fiche est commune aux 3 types). Le choix est **enregistré** sur le tiers (`t.modeReglement`, code VIR/PRLV/CHQ/CB/ESP) et **repré-sélectionné** à la réouverture.

**Comment — 2 éditions chirurgicales :**
- `tiersEditer` : ajout d'un `<select id="te-moyen">` (groupé en ligne avec l'IBAN) ; les options viennent de `MOYENS=[VIR,PRLV,CHQ,CB,ESP]` ; pré-sélection via une normalisation du `modeReglement` existant (mots complets « Virement »/« Prélèvement »… reconnus → code).
- `tiersEnregistrer` : `if(#te-moyen) t.modeReglement = valeur`.

**Limites :** stocke le **code** (VIR/PRLV…) ; les anciennes valeurs en toutes lettres sont reconnues à l'affichage de la liste mais ré-enregistrées en code. Validé : `node --check` (146 scripts) + Playwright (fournisseur & client : 5 options exactes, sauvegarde PRLV, re-sélection à la réouverture ; équilibre OK ; 0 pageerror). Badge → **v295 · TIERS moyen de paiement préféré**.

---

## 🟢 MAJ précédente — Éditeur : panneau « Compte sélectionné » (bas de l'éditeur) — infos du compte cliqué, tous journaux — v294
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), la **zone en bas à droite** (à côté de « tx TVA / Tiers / Échéance / mode Règlement ») affiche désormais, **à chaque sélection d'un compte sur une ligne** (clic / focus / saisie), les **informations du compte** — et ce **sur tous les journaux** :
- **Compte de TIERS sélectionné** → 3 lignes : **compte de tiers + libellé** (Fournisseur/Client + nom, ou libellé de l'écriture), **compte de TVA + libellé**, **compte de charge/produit + libellé** (lus dans l'écriture).
- **Compte de TVA sélectionné** → **libellé du compte de TVA**.
- **Compte de charge / produit sélectionné** → **libellé du compte de charge / produit**.

**Comment — `yada-addon158` :** un panneau `#ec-accinfo` est greffé dans `.ec-fields` (la barre du bas). Des écouteurs `focusin`/`click`/`input` sur `#ec-win` mémorisent `{eid, compte}` de la ligne sélectionnée, puis `paint()` classe le compte (tiers via `ecResolveTiers` ou préfixe `40/41` ; TVA = `445…` ; charge = `6…` ; produit = `7…`) et affiche les lignes. Pour un tiers, les comptes de TVA et de charge/produit sont **lus dans les lignes de l'écriture** (fonctionne aussi pour les comptes collectifs `401000000`/`411000000` issus du FEC). Libellés via `COMPTES` (repli `db.plan`). Greffe `ecRender` → le panneau est repeint après chaque rendu. `<style id="ec-accinfo-mod">` (thème bleu nuit).

**Limites :** affichage seul (aucune écriture modifiée) ; pour un tiers collectif sans fiche, le libellé du tiers = libellé de l'écriture. Validé : `node --check` (146 scripts) + Playwright (tiers → tiers+TVA+charge avec libellés ; TVA → libellé TVA ; charge → libellé charge ; équilibre OK ; 0 pageerror). Badge → **v294 · panneau « compte sélectionné »**.

---

## 🟢 MAJ précédente — Éditeur (HA/VT) : compte de tiers → TVA + charge/produit générés depuis TIERS, TTC → HT + TVA auto — v293
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), en **journal Achats (HA = ACH)** ou **Ventes (VT = VTE)**, dès qu'on **saisit un compte de tiers** (401…/411…) sur la **1ʳᵉ ligne**, l'application **récupère dans le module TIERS** le **taux de TVA**, le **compte de TVA** et le **compte de charge** (achat) / **produit** (vente), et **génère automatiquement les 2 lignes de contrepartie**. Puis, dès qu'on **saisit le montant TTC** sur la ligne du tiers, le **HT et la TVA sont calculés automatiquement** → l'écriture est **soldée** ; on peut valider et passer à une autre.
- **ACH (fournisseur)** : `401…` crédit TTC | `445660000` (compteTVA du tiers) débit TVA | `60x` (compteContre) débit HT.
- **VTE (client)** : `411…` débit TTC | `445710000` (compteTVA du tiers) crédit TVA | `70x` (compteContre) crédit HT.

**Comment — `yada-addon157` (wrap de `window.ecSetLine`) :** sur `i===0` et `e.journal ∈ {ACH,VTE}`, `ecResolveTiers(compte)` retrouve le tiers (type fournisseur↔ACH / client↔VTE) ; `build(e)` pose les comptes (`c9(compteTVA)`, `c9(compteContre)`) sur les lignes 2-3, normalise le côté du tiers (achat → crédit, vente → débit) et calcule HT/TVA via `calcMontants(TTC, taux, 'TTC')` (mêmes comptes/sens que `posterFacture`). Déclenché à la saisie du **compte** (génère les comptes) et du **montant** (recalcule HT/TVA). N'écrase pas un compte de contrepartie déjà saisi lors d'un simple changement de montant ; ne touche pas les écritures de plus de 3 lignes (split).

**Limites :** scope **HA/VT** + tiers correspondant au journal ; les comptes (TVA/charge/produit) et le taux proviennent de la **fiche du tiers** (module TIERS). Validé : `node --check` (145 scripts) + Playwright (ACH EDF Pro : 401/445660000/606100000 = 120/20/100 soldée ; VTE SARL Dupont : 411/445710000/706000000 = 240/40/200 soldée ; équilibre des écritures OK ; 0 pageerror). Badge → **v293 · saisie assistée HA/VT (tiers → TVA + HT auto)**.

---

## 🟢 MAJ précédente — Éditeur : « Insérer une ligne » réservé aux journaux HA/VT et seulement si l'écriture n'est PAS soldée — v292
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), le clic droit **« ↧ Insérer une ligne »** n'insère désormais une ligne **que dans les journaux Achats (HA = ACH) et Ventes (VT = VTE)**, et **uniquement si l'écriture n'est pas soldée** (Débit ≠ Crédit). Si l'écriture est **déjà soldée** → **insertion interdite** (message « Écriture déjà soldée — insertion impossible »). Dans les autres journaux (BQ, OD, ODP…) → insertion refusée (« réservée aux journaux Achats (HA) et Ventes (VT) »).

**Comment — 1 garde ajoutée en tête de `window.ecInsertLine` (`yada-addon113`) :** refus si `e.journal` ∉ {`ACH`,`VTE`} ; sinon calcul de l'équilibre (`Σdébit`/`Σcrédit`) → refus si soldée (`|Σd−Σc|<0,005` et un mouvement > 0) ; sinon insertion normale (`splice` + `ecRender`). Toast explicatif dans les deux cas de refus.

**Limites :** ne touche que l'action d'insertion (le menu reste affiché ; le refus est signalé par un toast). Validé : `node --check` (144 scripts) + Playwright (ACH/VTE non soldée → insérée ; ACH/VTE soldée → bloquée ; BQ/OD → bloquées ; équilibre OK ; 0 pageerror). Badge → **v292 · insérer une ligne : HA/VT non soldée seulement**.

---

## 🟢 MAJ précédente — Éditeur : le curseur passe sur le LIBELLÉ à chaque ligne (modifiable partout, tous journaux) — v291
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), pendant la **saisie au clavier** (Tab / Entrée / flèches), le **curseur passe désormais aussi sur le libellé** — sur **toutes les lignes** de l'écriture, pas seulement la première — afin de pouvoir **modifier le libellé** à tout moment. Vaut pour **tous les journaux**. Avant, le libellé n'était éditable que sur la 1ʳᵉ ligne (répété en lecture seule sur les suivantes) ; en saisie de banque, le flux amenait le curseur sur la 2ᵉ ligne (contrepartie 512) où le libellé était inaccessible.

**Comment — 1 édition chirurgicale de `ecRender` (cellule `ec-lb`) :** le libellé devient un **`<input class="ec-i">` sur chaque ligne** (au lieu d'un `<span class="ec-ro">` sur les lignes ≥ 2), toujours lié à `e.libelle` via `onchange="ecSetLibelleEcr(id, v)"`. La navigation clavier (`addon114`, basée sur les `input.ec-i`) inclut donc le libellé sur chaque ligne. `ecSetLibelleEcr` met à jour `e.libelle` et re-rend → le libellé **reste identique sur toutes les lignes** (invariant v221 préservé).

**Limites :** seul le **libellé** devient éditable sur toutes les lignes (la **pièce** reste éditable sur la 1ʳᵉ ligne uniquement). Validé : `node --check` (144 scripts) + Playwright (Tab depuis le compte de la 2ᵉ ligne → libellé col 5 ; édition du libellé depuis la L2 met à jour `e.libelle` ; équilibre des écritures OK ; 0 pageerror). Badge → **v291 · curseur passe sur le libellé (toutes lignes)**.

---

## 🟢 MAJ précédente — Éditeur : sélectionner toutes les lignes d'une écriture → l'écriture entière est supprimée (plus de 1ʳᵉ ligne vide laissée) — v290
**Quoi :** complément de la v289. Dans l'**éditeur d'écritures**, quand on **sélectionne toutes les lignes d'une écriture** (donc l'écriture entière) et qu'on **supprime** (clic droit → « Supprimer les N lignes sélectionnées »), **l'écriture entière est retirée** — on ne laisse **plus une première ligne vide** derrière. Si seules **certaines** lignes d'une écriture sont sélectionnées, elle conserve ses lignes restantes (inchangé). Vaut pour **plusieurs écritures** à la fois.

**Comment — 1 édition de `ecSupprimerLignesSelection` (`yada-addon120`) :** après avoir splicé les lignes sélectionnées (index décroissant), toute écriture qui se retrouve à **0 ligne** est **retirée du stockage** (`db.ecritures=db.ecritures.filter(e=>removeIds.indexOf(e.id)<0)` + `db.odiv` filtré sur `ecritureId`) **au lieu** d'y pousser une ligne vide. `save`+`ecRender` ; toast « N ligne(s) supprimée(s) · M écriture(s) retirée(s) ».

**Limites :** suppression directe (sans confirmation, demande explicite). Validé : `node --check` (144 scripts) + Playwright (pilotage réel de la sélection : 3 lignes d'une écriture sélectionnées → écriture retirée, 19→18, plus présente, 0 pageerror ; équilibre des écritures OK). Badge → **v290 · supprimer une écriture entière (sélection)**.

---

## 🟢 MAJ précédente — Éditeur : clic droit « Supprimer la ligne » supprime TOUTES les lignes sélectionnées (plus de « Supprimer l'écriture sélectionnée ») — v289
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), après avoir **sélectionné plusieurs lignes** (glisser / Maj+clic sur la zone gauche/droite des lignes), le **clic droit** ne propose plus **« Supprimer l'écriture sélectionnée »** (ni « les N écritures sélectionnées »). À la place, l'entrée **« 🗑 Supprimer la ligne »** (qui devient **« 🗑 Supprimer les N lignes sélectionnées »** quand plusieurs lignes sont sélectionnées) **supprime toutes les lignes sélectionnées** par l'utilisateur — sur une ou plusieurs écritures. Sans sélection, elle supprime simplement la ligne cliquée (comportement inchangé).

**Comment — 3 éditions chirurgicales :**
- **`yada-addon120`** : expose `window.ecSelectedLineRefs()` (`[{eid,li}]` des lignes sélectionnées) et `window.ecSupprimerLignesSelection()` (supprime chaque ligne, **index décroissant** par écriture pour ne pas décaler ; jamais d'écriture à 0 ligne ; `save`+`ecRender`).
- **`yada-addon113`** (menu contextuel) : retrait de l'entrée `delecr` (« Supprimer l'écriture sélectionnée ») ; le libellé de **« Supprimer la ligne »** devient dynamique selon le nombre de lignes sélectionnées ; l'action `del` appelle `ecSupprimerLignesSelection()` s'il y a une sélection, sinon `ecDelLine` (ligne cliquée).

**Limites :** suppression directe (pas de message de confirmation — demande explicite) ; la fonction v280 `ecSupprimerEcrituresSelection` reste définie mais n'est plus appelée. Validé : `node --check` (144 scripts) + Playwright (équilibre OK, fonctions présentes & sûres sans sélection, 0 pageerror). Badge → **v289 · clic droit : supprimer les lignes sélectionnées**.

---

## 🟢 MAJ précédente — Tous les modules suivent l'EXERCICE traité dans la Consultation des comptes — v288
**Quoi :** correction de la demande v276. Le **point d'ancrage de toute l'application = l'exercice (année) traité dans la Consultation des comptes** (`db.societe.exoDebut/exoFin` → `exoYear()`). Quand on **bascule d'exercice** (flèches ⟲⟳, menu Exercice), **tous les modules affichent et génèrent désormais sur cet exercice** : si on traite **2025**, la Banque, l'Analytique, le Journal comptable, etc. affichent 2025 ; si on passe à **2026**, tout bascule sur 2026. Granularité : **mois si le module gère les mois, sinon année**.

**Pourquoi :** en v276 seules les fonctions lisant déjà l'exercice suivaient (TVA, Bilan/Compte de résultat, Immobilisations `imYear`, Rapprochement). **Banque** et **Analytique avancée** choisissaient leur **propre année** (« la plus récente des écritures »), et le **Journal comptable** affichait **toutes les années mélangées**. De plus, basculer d'exercice ne réinitialisait pas les sélecteurs de période propres aux modules → ils restaient sur l'ancienne année.

**Comment — 3 éditions chirurgicales + `yada-addon156` :**
- **Banque** (`pageBanque`) : l'année par défaut = `exoYear()` (au lieu de l'année de données la plus récente) ; l'exercice traité est toujours présent dans la barre d'années.
- **Analytique avancée** (`anaYear`) : année par défaut = `exoYear()`.
- **Journal comptable** (`jrnMatch`) : filtre ajouté `(e.date).slice(0,4)===exoYear()` → n'affiche que les écritures de l'exercice traité.
- **`yada-addon156`** : `window.exoSyncPeriodes()` remet à `null` les sélecteurs locaux (`sgPer`, `sjMois`, `imAnnee`, `window.bqAnneeSel/bqMoisSel`, `window.anaYear`) ; **wrap de `exSuivant`/`exPrecedent`/`exPeriode`** → à chaque bascule d'exercice, chaque module se re-défaut sur le nouvel exercice.

**Limites :** la propagation se fait sur l'**année** d'exercice (les modules à mois gardent leur sélecteur de mois, re-défaut sur le 1ᵉ/dernier mois de l'exercice) ; le graphe « 12 derniers mois glissants » du tableau de bord reste glissant (par nature). Validé : `node --check` (144 scripts) + test Playwright (équilibre des écritures OK ; exoYear/anaYear/jrnMatch/exoSyncPeriodes suivent l'exercice 2025↔2026, 0 pageerror). Badge → **v288 · tous les modules suivent l'exercice traité**.

---

## 🟢 MAJ précédente — Éditeur (BANQUE) : montant de la 1ʳᵉ ligne → 2ᵉ ligne copiée en miroir pour solder — v287
**Quoi :** dans la **Consultation des comptes** (éditeur d'écritures), en **journal de banque (BQ)**, dès qu'on **saisit (ou modifie) le montant** (Débit ou Crédit) de la **1ʳᵉ ligne** d'une écriture, le **montant de la 2ᵉ ligne est copié en miroir** (Débit↔Crédit) sur la **contrepartie banque 512000000** → la 1ʳᵉ ligne est **soldée** automatiquement. Complète v286 (qui pose le compte 512 + le miroir à la saisie du **compte**) : ici le miroir suit aussi quand on saisit le **montant**.

**Comment — `yada-addon155` (wrap de `window.ecSetLine`) :** sur `field==='debit'||'credit'` et `i===0`, si `e.journal==='BQ'` et écriture **≤ 2 lignes**, on crée au besoin la 2ᵉ ligne (compte `512000000`), et si elle est bien la **banque** (vide → on pose 512 ; sinon on respecte un compte choisi) on recopie le **montant miroir** (D>0 → crédit ; C>0 → débit), reprend le libellé si vide, puis `ecRender()`. Aucune logique comptable modifiée.

**Limites :** scope **banque** + **montant de la 1ʳᵉ ligne** ; les écritures multi-lignes (> 2) et les 2ᵉ lignes sur un autre compte (split) sont préservées. Validé : `node --check` (143 scripts). Badge → **v287 · banque : montant 1ʳᵉ ligne → 2ᵉ ligne miroir**.

---

## 🟢 MAJ précédente — Éditeur (BANQUE) : compte de tiers en 1ʳᵉ ligne → 2ᵉ ligne 512000000 automatique — v286
**Quoi :** dans la **Consultation des comptes** (éditeur d'écritures), en **journal de banque (BQ)**, dès qu'on **saisit un compte de tiers** (classe 4 : 401…/411…/421…/43…/45…) sur la **1ʳᵉ ligne** d'une écriture, le **compte de la 2ᵉ ligne devient automatiquement 512000000** (banque), avec le **montant miroir** (débit↔crédit) pour solder l'écriture. Vaut pour **toute écriture BQ** — indépendamment de l'option « validation automatique » (v277), qui ne s'active que si elle est cochée. Si la 2ᵉ ligne est déjà renseignée avec un autre compte (écriture multi-lignes / split), elle **n'est pas écrasée**.

**Comment — `yada-addon154` (wrap de `window.ecSetLine`) :** sur `field==='compte'` et `i===0`, si `e.journal==='BQ'` et que le compte de la 1ʳᵉ ligne est de **classe 4** (`charAt(0)==='4'`), et que l'écriture a **≤ 2 lignes**, on crée au besoin la 2ᵉ ligne, on force `compte='512000000'` **seulement si elle est vide ou déjà la banque**, on reprend le libellé (si vide) et on pose le **montant miroir** (si aucun montant n'y figure encore), puis `ecRender()`. Aucune logique comptable modifiée.

**Limites :** scope **banque** + **compte de tiers (classe 4)** en 1ʳᵉ ligne ; les écritures multi-lignes (> 2) et les 2ᵉ lignes déjà saisies manuellement sont préservées. Validé : `node --check` (142 scripts). Badge → **v286 · banque : 1ʳᵉ ligne tiers → 2ᵉ ligne 512 auto**.

---

## 🟢 MAJ précédente — Éditeur (BANQUE) : tant que l'écriture n'est pas soldée, ne pas ajouter de ligne — curseur sur la ligne à corriger — v285
**Quoi :** dans l'éditeur, en **journal de banque (BQ)**, **tant que l'écriture n'est pas soldée** (Débit ≠ Crédit), descendre (Entrée/flèche du bas) **n'ajoute plus de nouvelle ligne** (compte) parasite. L'écriture ayant déjà sa contrepartie (2 lignes : opération + 512), le curseur **reste sur la ligne à corriger** — sur le **compte** s'il est vide, sinon sur le **montant manquant** (D > C → crédit à compléter, sinon débit) — avec le message « Soldez l'écriture… ». Une fois soldée, descendre passe à une nouvelle écriture (v283/v284). Les **autres journaux** (OD, ACH multi-lignes…) gardent l'ajout de ligne pour solder (v268).

**Comment — 1 édition de `ecDescendre` (`addon146`) :** garde ajoutée avant l'ajout de ligne — si `e.journal==='BQ'` et `e.lignes.length>=2` et non soldée, on **ne fait pas** `ecAddLine` ; on focalise la ligne courante (compte vide → `input.ec-cpt`, sinon le `input.ec-num` du côté à compléter selon le signe de `d−c`) et on retourne `true` (pas de descente / nouvelle écriture).

**Limites :** scope **banque** (les écritures multi-lignes BQ — split — s'ajoutent via clic droit « Insérer une ligne »). Validé : `node --check` (141 scripts). Badge → **v285 · banque : pas de ligne tant que non soldée**.

---

## 🟢 MAJ précédente — Éditeur : la FLÈCHE DU BAS valide aussi le montant (comme Entrée) → pas de 3ᵉ ligne fantôme, curseur sur la prochaine ligne — v284
**Quoi :** v283 avait corrigé la touche **Entrée** ; la **flèche du bas** générait encore une 3ᵉ ligne parasite quand l'écriture était soldée. Désormais, **flèche du bas** depuis un champ Débit/Crédit de la dernière ligne **valide d'abord le montant** (`blur`), puis : écriture **soldée** → **pas de 3ᵉ ligne** ; on **descend vers la prochaine ligne** — nouvelle écriture (curseur sur la **date**) **seulement si c'est la dernière écriture du journal**, sinon on passe à l'écriture suivante ; écriture **non soldée** → ligne ajoutée à solder (inchangé). Le curseur suit ainsi la suite chronologique.

**Comment — 1 édition chirurgicale (`addon114`, branche `ArrowDown`) :** sur la dernière ligne, si le champ est Débit/Crédit (`col===6||col===7`), on applique la même logique « blur d'abord » que la branche Entrée (v283) : `inp.blur()` → recalcul de l'équilibre sur données fraîches → soldée : `ecAjouterEcriture()` si dernière écriture (sinon focus de l'écriture suivante), **jamais** `ecDescendre` ; non soldée : `ecDescendre` (ligne à solder). Les autres champs gardent le comportement précédent.

**Limites :** navigation/saisie seulement. Validé : `node --check` (141 scripts). Badge → **v284 · flèche bas valide aussi**.

---

## 🟢 MAJ précédente — Éditeur : Entrée sur le montant valide d'abord → si l'écriture est soldée, PAS de 3ᵉ ligne fantôme — v283
**Quoi :** dans l'**éditeur d'écritures**, après avoir validé le **montant de la 2ᵉ ligne**, si l'écriture est **soldée** (Débit = Crédit), appuyer sur **Entrée** ne génère **plus de 3ᵉ ligne** (vide) parasite. Avant, Entrée appelait la logique « descendre/solder » **avant** que le montant saisi ne soit validé → l'écriture paraissait déséquilibrée → une ligne était ajoutée à tort. Désormais, Entrée depuis un champ Débit/Crédit **valide d'abord le montant** (`blur`), puis : écriture **soldée** → nouvelle écriture (curseur sur la date), **jamais** de 3ᵉ ligne ; **non soldée** → ligne ajoutée à solder (inchangé). Vaut pour **tous les modes** (avec ou sans validation automatique).

**Comment — 1 édition chirurgicale (`addon114`, branche Entrée) :** la branche « blur d'abord » (introduite en v279 pour la validation automatique) s'applique désormais à **tous** les champs Débit/Crédit (`if(col===6||col===7)` au lieu de `if(_cfg.valAuto && …)`) : `inp.blur()` valide le montant (équilibre à jour + contrepartie banque v277/v282 si activée), puis l'équilibre est recalculé sur des données fraîches avant de décider d'ajouter une ligne ou de passer à une nouvelle écriture.

**Limites :** navigation/saisie seulement. Validé : `node --check` (141 scripts). Badge → **v283 · pas de 3e ligne si écriture soldée**.

---

## 🟢 MAJ précédente — Éditeur : en journal de BANQUE, la 2ᵉ ligne génère automatiquement la contrepartie 512000000 — v282
**Quoi :** dans l'**éditeur d'écritures**, quand on ajoute la **2ᵉ ligne** d'une **écriture de banque** (journal BQ) — en descendant pour la solder, ou via « + Ajouter » — son **compte est automatiquement 512000000** (banque) avec le **montant miroir** (débit↔crédit de la 1ʳᵉ ligne), ce qui **solde** l'écriture. Avant, la 2ᵉ ligne s'ajoutait avec un compte vide (`000000000`). Indépendant du mode « validation automatique » (v277) : c'est désormais le comportement par défaut pour le journal BQ.

**Comment — 1 édition chirurgicale (`ecAddLine`) :** si `e.journal==='BQ'` et qu'on ajoute la **2ᵉ ligne** (`e.lignes.length===1`), la nouvelle ligne reçoit `compte:'512000000'` + montant miroir (`débit l0 → crédit`, `crédit l0 → débit`). Le libellé est déjà repris de la 1ʳᵉ ligne. Les lignes au-delà de la 2ᵉ restent vides (écritures multi-lignes inchangées).

**Limites :** affichage/saisie seulement (montant miroir modifiable) ; ne touche que la 2ᵉ ligne d'une écriture BQ. Validé : `node --check` (141 scripts). Badge → **v282 · banque : 2e ligne = 512 auto**.

---

## 🟢 MAJ précédente — Éditeur : nouvelle écriture → curseur sur la DATE (modifiable) puis Entrée continue la ligne — v281
**Quoi :** après avoir saisi une écriture, la **nouvelle écriture** proposée place désormais le **curseur sur la DATE** (sélectionnée, donc modifiable tout de suite) **pour toutes les écritures** — plus seulement en mode validation automatique (v279). On peut ajuster la date puis appuyer sur **Entrée** pour **continuer à saisir la ligne** (date → pièce → compte → libellé → montant), champ par champ.

**Comment — 1 édition chirurgicale (`addon140`, `ecAjouterEcriture`) :** le focus de la 1ʳᵉ ligne de la nouvelle écriture cible **inconditionnellement** `input.ec-datetxt` (la date) au lieu du compte (`var inp=row.querySelector('input.ec-datetxt')||…`). La date étant un `input.ec-i`, la navigation clavier d'`addon114` (Entrée → champ suivant) s'applique → Entrée depuis la date passe à la pièce/au compte.

**Limites :** affichage/navigation seulement (aucune logique comptable modifiée). Validé : `node --check` (141 scripts). Badge → **v281 · nouvelle écriture : curseur sur la date**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : défilement PRÉSERVÉ (plus de saut en haut) + suppression de masse des écritures sélectionnées (alerte ≥ 3) — v280
**Quoi :** dans l'**éditeur d'écritures** (Consultation / journaux) : (1) à **chaque modification**, la **vue reste fixe** sur l'écriture en cours — le tableau ne **saute plus en haut** (on garde la visibilité sur l'écriture traitée) ; (2) on peut **sélectionner plusieurs écritures** (glisser / Maj+clic sur la zone gauche/droite des lignes) puis **clic droit → « Supprimer les N écritures sélectionnées »** → **suppression de masse**. Le **message d'alerte de confirmation n'apparaît qu'à partir de 3 écritures** ; pour 1 ou 2, la suppression est directe.

**Comment — `yada-addon153` + 2 greffes :**
- **Défilement** : wrap de `ecRender` qui mémorise `scrollTop` de `.ec-tablewrap` avant le rendu et le restaure après (+ `requestAnimationFrame`), donc le rebuild `innerHTML` ne réinitialise plus le défilement.
- **Suppression de masse** : `addon120` expose `window.ecSelectedEcritureIds()` (eid distincts de la sélection) ; `addon113` (menu clic droit) ajoute l'entrée « 🗑 Supprimer … écritures sélectionnées » quand l'écriture cliquée est dans la sélection ; `ecSupprimerEcrituresSelection()` filtre `db.ecritures`/`db.odiv` sur les ids, `yadaConfirm` **uniquement si ≥ 3** (sinon direct), puis `save`+`ecRender`.

**Limites :** la sélection se fait via le mode multi-lignes existant (hors mode compte/lettrage) ; la suppression retire les écritures (et les O.D. liées) sans cascader sur d'éventuelles factures liées. Validé : `node --check` (141 scripts). Badge → **v280 · scroll fixe + suppression de masse**.

---

## 🟢 MAJ précédente — Saisie banque (validation automatique) : Entrée valide le montant → contrepartie 512 → Entrée passe à la nouvelle écriture (curseur sur la date) — v279
**Quoi :** en **mode « validation automatique de la ligne »** (Paramètres de saisie, v277), le flux clavier de l'éditeur en **journal de banque** suit la demande : on saisit la 1ʳᵉ ligne (date → pièce → compte → libellé → montant), **Entrée valide le montant** → la **2ᵉ ligne (contrepartie 512000000, montant miroir, même libellé/date/pièce) se génère** et **solde** l'écriture, le curseur se place sur son montant ; **Entrée de nouveau crée une nouvelle écriture** avec le **curseur sur la DATE** de la ligne créée (on recommence au début de la ligne). Hors mode validation automatique, le comportement précédent (v268) est conservé.

**Comment — 2 éditions chirurgicales :**
- `addon114` (Enter) : si `ecSaisieCfg().valAuto` && champ Débit/Crédit → `inp.blur()` **valide d'abord le montant** (déclenche la contrepartie banque de v277 via `ecSetLine`), puis : si l'écriture est **soldée** et qu'on n'est pas sur la dernière ligne → focus sur le montant de la **contrepartie** ; si déjà sur la dernière ligne soldée → `ecAjouterEcriture()` (nouvelle écriture) ou écriture suivante ; si **non soldée** → `ecDescendre` (ligne à solder).
- `addon140` (`ecAjouterEcriture`) : en mode validation auto, le curseur de la nouvelle écriture se place sur `input.ec-datetxt` (la **date**) au lieu du compte.

**Limites :** flux activé uniquement quand la **validation automatique** est cochée (opt-in) ; réutilise la contrepartie banque (v277) et `ecDescendre` (v268). Validé : `node --check` (140 scripts). Badge → **v279 · Entrée valide + contrepartie + nouvelle ligne**.

---

## 🟢 MAJ précédente — Module TIERS : renommage + boutons Modifier / Supprimer par tiers + changement de type (Fournisseur / Client–Société / Client–Particulier) — v278
**Quoi :** le **module Tiers** est renommé **« TIERS »** (entrée de menu + titre de page + libellé mobile). Dans les listes (Fournisseurs / Clients – Sociétés / Clients – Particuliers), chaque ligne reçoit une colonne **Actions** avec **✎ Modifier** et **🗑 Supprimer**. La **suppression** est désormais autorisée pour tous les tiers (avertissement si le tiers est mouvementé : ses écritures sont conservées mais ne sont plus rattachées à une fiche). La **fiche d'édition** gagne un sélecteur **« Type du tiers »** à 3 options : **Fournisseur**, **Client – Société**, **Client – Particulier**.

**Comment — `yada-addon152` :**
- Renommage : `lbl:'TIERS'` (nav), `head('TIERS', …)` (`pageTiers`), `LABELS.tiers='TIERS'` (mobile).
- `sectionTiers` (override) : colonne Actions (`tiersEditer`/`tiersSupprimer`), 7 colonnes.
- `tiersEditer` (wrap) : injecte un `<select id="te-type3">` (3 options) en tête de la modale → `tiersAppliquerType(id, val)`.
- `tiersAppliquerType` : applique `type`/`categorie` ; si bascule **Fournisseur ↔ Client**, régénère le **compte auxiliaire** (`genAux`, préfixe 401↔411), **rattache les écritures** du tiers au nouveau compte (montants inchangés → équilibre préservé) et réinitialise compteContre (606/706) + compteTVA (44566/44571) ; confirmation `yadaConfirm` si le tiers est mouvementé.
- `tiersSupprimer` (override) : suppression autorisée + avertissement si mouvementé (l'ancienne version la bloquait).

**Limites :** la bascule de type d'un tiers mouvementé déplace ses lignes d'écriture vers le nouveau compte (choix explicite, confirmé) ; les comptes de contrepartie/TVA repassent aux valeurs par défaut du nouveau type (modifiables ensuite). Validé : `node --check` (140 scripts). Badge → **v278 · TIERS modifier/supprimer**.

---

## 🟢 MAJ précédente — Éditeur : barre « Traitements » + « Paramètres de saisie » (panneau latéral) + contrepartie banque automatique — v277
**Quoi :** dans l'**éditeur d'écritures** (Consultation → Journal de Banque, saisie/édition), une barre **« Traitements ▾ »** apparaît **au-dessus du filtre** (façon Sage Génération Expert). Son menu ouvre **« ⚙ Paramètres de saisie… »** → un **panneau latéral** (drawer, glisse depuis la droite) avec les options d'aide à la saisie manuelle de la banque. Option principale : **« Avec validation automatique de la ligne »** → en **journal de banque (BQ)**, dès qu'on saisit la **1ʳᵉ ligne**, la **2ᵉ ligne est générée automatiquement** : compte **512000000** (contrepartie), **montant miroir** (débit↔crédit), **même libellé**, et la **pièce reprend le moyen de paiement** (VIR/CHQ/CB/PRLV/ESP). Date / journal / pièce / libellé sont déjà partagés au niveau de l'écriture.

**Comment — `yada-addon151` :** `ecSaisieCfg()` (config persistée `localStorage 'yada-ec-saisie'`) ; greffe `ecRender` → injecte `.ec-trtbar` **avant** `.ec-filtbar` ; `ecOuvrirParamSaisie`/`ecParamSave`/`ecParamFermer` (panneau `#ec-param-drawer`, cases : validation auto, moyen, sans propagation dates/pièces, incrémentation pièce, contrepartie journalière) ; **wrap `ecSetLine`** : si `valAuto` && `e.journal==='BQ'` && édition de la ligne 0 && ≤2 lignes → ligne 1 = `512000000` + montant miroir + libellé + pièce=moyen. `<style id="ec-trt-mod">` (barre, dropdown, drawer bleu nuit).

**Limites :** la contrepartie auto cible les écritures de banque **simples** (≤ 2 lignes) et est **opt-in** (désactivée par défaut) ; les cases « sans propagation / incrémentation / contrepartie journalière » sont **enregistrées** (parité Sage) — seule la validation automatique + le moyen sont câblés. Validé : `node --check` (139 scripts) + équilibre de la contrepartie (401/627/411 → 512, Σ débit = Σ crédit). Badge → **v277 · paramètres de saisie banque**.

---

## 🟢 MAJ précédente — Consultation des comptes : flèches d'exercice ⟲ ⟳ (année précédente / suivante) — v276
**Quoi :** dans la **barre de titre de la Consultation des comptes**, deux **flèches tournantes** sont ajoutées — **⟲ à gauche** (exercice **précédent**, N-1) et **⟳ à droite** (exercice **suivant**, N+1), encadrant un libellé « Exercice <année> ». À l'appui : si l'exercice **n'existe pas**, un **message de prévention** s'affiche (« Créer l'exercice… ? » avec **Annuler** pour rester sur l'année courante / **Confirmer** pour le créer) ; si l'exercice **existe déjà**, **bascule directe** sur cette année (les écritures saisies + FEC de l'exercice s'affichent). **Tous les modules suivent l'année traitée** : l'exercice actif (`db.societe.exoDebut/exoFin`) est global, et la Consultation (périodes via `monthsExo`/`exoYear`), la TVA (CA3), le Bilan/Compte de résultat, les Immobilisations (`imYear`), le Rapprochement… s'y rattachent.

**Comment :** les flèches appellent les fonctions **existantes** `exPrecedent()` / `exSuivant()` (qui gèrent déjà : `yadaConfirm` de création si l'exercice manque — sinon bascule directe — puis `exoDebut/exoFin` mis à jour, `sgPer=null`, `save`+`render`). Greffe : insertion de `.sg-exonav` (boutons `.sg-exoarr` + `.sg-exolbl`) dans le `.sg-title` de `pageCompta` ; `yada-addon150` (`<style id="sg-exonav-mod">`) pour le style (boutons arrondis, bleu Crystal au survol, libellé masqué < 760 px). Validé : `node --check` (138 scripts). Badge → **v276 · flèches d'exercice**.

---

## 🟢 MAJ précédente — Immobilisations : nature → compte → compte de dotation (chaîne stricte, sans décalage) — v275
**Quoi :** la création d'une immobilisation suit désormais une **chaîne stricte** conforme à la demande : (1) la **Nature est obligatoire** (saisie bloquée sinon) ; (2) la nature **détermine le compte d'immobilisation** (reconnaissance — véhicule → `218200000`, téléphone → `218300000`, mobilier → `218400000`, logiciel → `205000000`…) ; (3) le compte d'immobilisation **détermine le compte de dotation** (le compte d'**amortissement 28x**, obtenu en **insérant un « 8 » après le premier chiffre** : `218200000` → `281820000`). Les comptes dérivés sont **lecture seule** (aucune valeur ne correspondant pas n'est possible) et **se mettent à jour automatiquement** quand le compte d'immobilisation change.

**Comment — `yada-addon148` (édité) :**
- `imSave` : **Nature requise** ; `compteAmort=compteAmortDe(cpt)` (28x, règle « +8 »), `compteDot=imDotDe(cpt)` (charge 6811, interne à l'écriture) — dérivés du compte, plus lus depuis un champ libre.
- Modale : champ « Compte de dotation » désormais **lecture seule** (`im-dotdisp`), mis à jour par `imCptCascade` = `c9(compteAmortDe(compte))`. Nature marquée `*` (obligatoire).
- Fiche (`imDetail`, onglets Attributs **et** Comptable) : les anciens sélecteurs éditables 6811/28x sont remplacés par **une ligne lecture seule** « Compte de dotation : <28x> (accordé au compte d'immo) ». `imEdit` recalcule `compteAmort`/`compteDot` à chaque changement de compte → l'affichage suit.

**Note comptable :** le « compte de dotation » au sens de l'utilisateur = le compte d'**amortissement 28x** (crédité de l'OD de dotation). L'écriture de dotation reste **débit 6811 (dotation aux amortissements) / crédit 28x** (équilibrée). Validé : `node --check` (137 scripts) + dérivation testée (véhicule 218200000 → 281820000, logiciel 205 → 280500000…). Badge → **v275 · nature → compte → dotation (strict)**.

---

## 🟢 MAJ précédente — Immobilisations : compte de dotation (et d'amortissement) accordé au compte d'immobilisation, visible dans Attributs — v274
**Quoi :** dans la fiche d'immobilisation, **changer le compte d'immobilisation** met aussi à jour le **compte de dotation** (et le compte d'amortissement). Le changement était déjà appliqué en données (`imEdit` : compte → `compteAmort=compteAmortDe`, `compteDot=imDotDe`) mais les champs « Compte de dotation / d'amortissement » n'étaient affichés que dans l'onglet **Comptable** → l'accord n'était pas visible au moment du changement (fait dans **Attributs**). Désormais les deux comptes sont **affichés (et éditables) directement sous le Compte dans l'onglet Attributs** → ils se mettent à jour à l'écran dès qu'on change le compte d'immobilisation.

**Comment — 1 ajout dans l'override `imDetail` (Attributs) :** après la ligne `rowS('Compte :', …)`, insertion de `rowS('Compte de dotation :','compteDot', …, DOT_OPTS)` + `rowS("Compte d'amortissement :",'compteAmort', …, AMORT_OPTS)`. `imEdit` (inchangé) recalcule `compteDot` (incorporel 20x→681110000, corporel 21x→681120000) et `compteAmort` (28x) puis `render()` → les sélecteurs reflètent l'accord ; un choix manuel reste possible. Validé : `node --check` (137 scripts). Badge → **v274 · dotation accordée au compte immo**.

---

## 🟢 MAJ précédente — Immobilisations : liste de comptes FERMÉE (cliquer pour ouvrir) + génération des écritures d'immobilisation & de dotation — v273
**Quoi :** dans **Immobilisations & Financements** (`yada-addon148`, suite de v271) :
1. Le **sélecteur de compte d'immobilisation** (modale « Nouvelle immobilisation ») n'est **plus une liste ouverte** (`<select size="8">`) : c'est un **menu déroulant fermé** que l'on **clique pour ouvrir**, puis on voit la sélection. La reconnaissance/auto-dotation reste active.
2. **Génération des écritures** depuis l'onglet **Attributs** (section « Écritures comptables ») via 2 boutons :
   - **« Générer l'écriture d'immobilisation »** (`imGenererAcquisition`) → écriture d'acquisition (journal **ACH**) : **débit 2xx** (HT) + **débit 445620000** (TVA déductible/immo, selon le **Taux TVA** ajouté) = **crédit 404000000** (fournisseurs d'immobilisations, TTC). Équilibrée.
   - **« Générer l'écriture de dotation <année> »** (`imGenererDotation`) → OD : **débit 6811x** (dotation) / **crédit 28xx** (amortissement), montant = dotation de l'exercice (`immoRowAnnee`).
   - **Idempotent** (libellés « ACQUISITION IMMO <n°> » / « DOTATION IMMO <n°> <an> ») ; les boutons passent à **✓** une fois générés.
3. Champ **Taux TVA** ajouté (modale + Attributs éditable), comptes `404000000` / `445620000` enregistrés.

**Comment :** édition de l'override `imAdd` (select fermé + champ TVA), nouveau `window.imSave` (capture `tauxTVA`), `imGenererAcquisition`/`imGenererDotation`/`imAcqFaite`/`imDotFaite` (via `posterOD`), boutons greffés dans `imDetail` (Attributs). Validé : `node --check` (137 scripts) + équilibre de l'écriture d'acquisition à 20/10/0 % (Σ débit = Σ crédit). Badge → **v273 · immo : liste fermée + écritures**.

---

## 🟢 MAJ précédente — Consultation / éditeur : flèches (spinners) des champs Débit/Crédit masquées — v272
**Quoi :** dans la **Consultation des comptes** (saisie / édition), les champs **Débit** et **Crédit** (`<input type="number">`) affichaient les **petites flèches haut/bas** (spinners) pour augmenter/diminuer le montant. Elles sont désormais **masquées**.

**Comment — `yada-addon149` (100% CSS additif, `<style id="ec-nospin-mod">`) :** `::-webkit-outer/inner-spin-button{-webkit-appearance:none}` sur `.ec-num` et `.ec-sage input[type=number]`, + `appearance:textfield` (Firefox). Aucune logique modifiée (saisie au clavier inchangée). Validé : `node --check` (137 scripts). Badge → **v272 · débit/crédit sans flèches**.

---

## 🟢 MAJ précédente — Immobilisations : comptes enrichis + sélecteur à molette + reconnaissance + fiche éditable + reprise/sortie — v271
**Quoi :** refonte fonctionnelle du module **Immobilisations & Financements** (`yada-addon148`, 100% additif) :
1. **Liste des comptes d'immobilisation enrichie** (PCG) : ajout des comptes manquants (203, 206, 208, 212, 214, 215400, 215500, 218100, 218600, 271, 274), triés par numéro, avec libellés des comptes d'amortissement (28x).
2. **Sélecteur à molette** dans « Nouvelle immobilisation » : `<select size="8">` défilable (molette) pour voir tous les comptes.
3. **Association compte d'immo → compte de dotation automatique** : incorporel (20x) → `681110000`, corporel (21x) → `681120000`, financier (26/27) → aucune. Mise à jour auto à la sélection.
4. **Reconnaissance du compte d'après la nature / désignation** : téléphone/ordinateur → 2183, véhicule → 2182, mobilier → 2184, logiciel/licence → 205, machine/outillage → 215, terrain → 211, construction → 213, caution → 275… (`imDevineCompte`, texte sans accents). Auto-proposé tant que l'utilisateur n'a pas choisi manuellement.
5. **Onglets Attributs / Comptable / Fiscal ÉDITABLES** (paramètres) : Numéro, Nature, Compte, Montant HT, Dates, Fournisseur, Mode, Durée, Valeur résiduelle, Compte de dotation, Compte d'amortissement — modifiables (`imEdit` → `save`+`render`). Les **résultats** (dotation, cumul, VNC) restent **calculés** (immoPlan/immoRowAnnee).
6. **Attributs — boutons Sortie / Cession** (`imCeder`, comptabilisation VNC 675/amort/immo/512/775 existante) et **Reprise sur dépréciation** (`imReprise` → OD : débit 29x dépréciation / crédit `781600000`), + « Annuler la sortie » si une sortie existe.

**Comment :** override de `imAdd` (modale + handlers `imAutoCompte`/`imCptCascade`) et de `imDetail` (rendu éditable `imEdit`/`imReprise`/`imAnnulerSortie`) ; `IMMO_COMPTES` enrichi/trié ; mapping `imDotDe`/`imDeprecDe` ; `<style id="im-edit-mod">` (champs `.im-ev`, sélecteur `.im-cpt-scroll`).

**Limites :** reconnaissance par mots-clés (heuristique, modifiable manuellement) ; terrains (211) reçoivent un compte de dotation par défaut (non amortis en réalité — durée/dotation à la main) ; calculs d'amortissement inchangés. Validé : `node --check` (136 scripts) + test reconnaissance/association (iPhone→2183/681120000, logiciel→205/681110000, dépôt→275/—). Badge → **v271 · immo : comptes + édition + reprise**.

---

## 🟢 MAJ précédente — Suivi des règlements : cartes KPI du haut remplies depuis les factures non réglées (FEC inclus) — v270
**Quoi :** dans le **Suivi des règlements**, les **4 cartes KPI du haut** (Total dû / Dont en retard / Dont indemnités de recouvrement / Tiers en alerte) restaient à **0,00 €** pour un dossier alimenté par **FEC** (elles ne lisaient que `db.reglements`, vide). Elles sont désormais **remplies à partir des factures non réglées dérivées des écritures** (mêmes données que la carte « Factures non réglées » de v264) **quand le suivi `db.reglements` est vide** pour l'onglet courant — sinon l'existant (factures du logiciel) est conservé.

**Comment — `yada-addon147` (override `pageReglements`, 100% additif) :**
- `window.regKPIDepuisEcritures(type)` parcourt `window.regOpenGroups(type)` (factures non réglées = lignes non lettrées du compte de tiers) et calcule : **Total dû** (= montants + indemnités), **Dont en retard**, **Dont indemnités** (40 €), **Tiers en alerte** (≥3 factures en retard). **Échéance estimée** = date d'écriture + délai de paiement par défaut (`db.societe.delaiPaiement`, sinon 30 j) ; en retard si échéance < aujourd'hui.
- Greffe : si **aucun règlement ouvert** dans `db.reglements` pour le sens courant (`a_encaisser`/`a_payer`), les valeurs des 4 cartes (`.reg-k .v`) sont remplacées par regex sur leurs libellés (sinon inchangées).

**Limites :** retard/indemnités **estimés** (faute d'échéance saisie sur les écritures FEC) ; pour un dossier avec `db.reglements` (échéances réelles) le calcul existant est conservé. Affichage/calcul seulement. Validé : `node --check` (135 scripts) + test données réelles (MBC clients Total dû 29 692,40 € / 720 € indemnités / 1 alerte · MBC fourn. 12 644,15 € · ALR clients 1 820 €). Badge → **v270 · KPI règlements depuis écritures**.

---

## 🟢 MAJ précédente — Consultation : compteur des journaux PAR MOIS (zéro masqué) — v269
**Quoi :** dans la **Consultation des comptes**, la **liste des journaux** (colonne de gauche) affichait à côté de chaque journal (ex. « O - OD OPERATIONS DIVERSES (6) ») un nombre qui était le **cumul de l'année** (ex. 214 pour ACHATS), quel que soit le mois sélectionné. Désormais le nombre = **les écritures du SEUL mois sélectionné** (cohérent avec la grille `sgJournalGrid` qui n'affiche que le mois) ; et **s'il n'y a aucune écriture ce mois-là, aucun nombre n'est affiché** (le journal apparaît sans « (n) »).

**Comment — 2 éditions chirurgicales :**
- `sgJournaux(per)` : `ecrituresJusqua(per)` (cumul depuis le début d'année) → comptage **mois-exact** `db.ecritures` filtrées par `ym(e.date)===per` (ou tout le dossier si aucun mois).
- Ligne `jrnRows` (`pageCompta`) : `(${j.n})` → `${j.n>0?(' ('+j.n+')'):''}` → le compteur n'apparaît que si > 0 ; les journaux à 0 restent grisés (`.zero`) et sans nombre.

**Limites :** affichage/comptage seulement (aucune écriture modifiée). Validé : `node --check` (134 scripts) + test données réelles (MBC : ACH total 214 ; nov. 46 / déc. 36 / juin 15 ; « OD » en novembre = 0 → masqué). Badge → **v269 · compteur journal par mois**.

---

## 🟢 MAJ précédente — Éditeur : descendre sur une écriture NON soldée → ajoute une ligne à solder — v268
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), quand on **descend** — **Entrée** depuis un champ Débit/Crédit, ou **flèche du bas** — depuis la **dernière ligne d'une écriture NON soldée** (Débit ≠ Crédit), une **ligne est ajoutée à CETTE écriture** pour pouvoir la solder (au lieu de quitter ou de créer une autre écriture). **Garde :** tant que la dernière ligne ajoutée n'est **pas utilisée** (aucun compte ni montant), aucune autre ligne n'est ajoutée (le curseur y est maintenu) → chaque ligne doit être remplie avant de passer à la suivante. Si l'écriture **est soldée**, le comportement normal reprend (écriture suivante / nouvelle écriture, v259/v261).

**Comment — `yada-addon146` + 2 éditions d'`addon114` :**
- `window.ecDescendre(eid)` : calcule l'équilibre de l'écriture ; **soldée → `false`** (le caller continue normalement) ; **non soldée → `true`** après avoir, si la **dernière ligne est utilisée**, appelé `ecAddLine(eid)` (ajout d'une ligne + `ecRender`, curseur placé sur le compte de la nouvelle ligne), sinon maintenu le curseur sur la ligne vide (message « Remplissez cette ligne… »).
- `addon114` : sur **flèche du bas** depuis la dernière ligne d'une écriture → `ecDescendre(eid)` avant tout ; sur **Entrée** depuis un champ **Débit (col 6)/Crédit (col 7)** de la dernière ligne → idem. Sinon, comportement inchangé (navigation champ/ligne, nouvelle écriture en bas de liste si soldée).

**Limites :** réutilise `ecAddLine`/`ecRender` (aucune logique comptable ajoutée) ; la navigation champ par champ (compte/libellé) avec Entrée reste disponible. Validé : `node --check` (134 scripts). Badge → **v268 · ↓ ajoute une ligne à solder**.

---

## 🟢 MAJ précédente — Consultation / éditeur : ligne ROUGE sous une écriture non soldée + bouton « Solder l'écriture » retiré — v267
**Quoi :** dans l'**éditeur d'écritures** (Consultation des comptes), une **ligne ROUGE** apparaît désormais sous une **écriture NON soldée** (Débit ≠ Crédit) pour **prévenir l'utilisateur qu'il doit la solder avant de fermer ou de traiter une autre écriture**. Le **bouton « Solder l'écriture »** est **retiré** et remplacé par cette ligne rouge (+ un court message d'avertissement). La **ligne bleue** reste sous une écriture **soldée** (séparateur, inchangé). Le blocage de fermeture/creation tant qu'une écriture n'est pas soldée (v216/v261) est conservé.

**Comment — 2 éditions chirurgicales de `ecRender` + `yada-addon145` (CSS) :**
- `ecRender` : la ligne d'action n'affiche plus le bouton `ecSolder` ; à la place, **« ⚠ Écriture non soldée — à solder (Débit = Crédit)… »** (`.ec-koo`). Le filet séparateur (`.ec-redrow`) est émis **après chaque écriture** avec la classe `is-ok` (soldée) ou `is-ko` (non soldée).
- `addon145` (`<style id="ec-solder-rouge-mod">`, injecté en fin de `<head>`) : `.ec-redrow.is-ko .ec-soldee` → filet **rouge `#e1342c`** (spécificité `.ec-table tbody tr…` > règle bleue d'addon112) ; `.is-ok` → filet **bleu `#1e90ff`** ; `.ec-koo` rouge clair, `.ec-okk` vert.

**Limites :** affichage uniquement (aucune logique comptable modifiée) ; `ecSolder` reste défini mais n'est plus appelé. Validé : `node --check` (133 scripts). Badge → **v267 · ligne rouge non soldée**.

---

## 🟢 MAJ précédente — Modules Client / Fournisseur : factures (saisies + FEC) associées + carte de CORRESPONDANCES — v266
**Quoi :** dans le **module Client** (Suivi des factures de **vente**) et le **module Fournisseur** (Suivi des factures d'**achat**), une carte **« Correspondances — factures … (écritures VTE/ACH, FEC inclus) »** associe désormais **toutes les factures faites OU importées via le FEC** : reconstituées **depuis les écritures comptables** (journal VTE pour les ventes, ACH pour les achats), avec la **correspondance facture ↔ comptabilité**. Auparavant les suivis ne lisaient que `db.docs`/`db.factures` (saisies dans le logiciel) → **vides** pour un dossier FEC (ex. MBC : « Aucune facture de vente créée » alors que 59 écritures VTE existent).

**Comment — `yada-addon144` (override `suiviFacturesVente`/`suiviFacturesAchat`, 100% additif) :**
- `window.factDepuisEcritures(sens)` parcourt les écritures du **journal VTE** (vente) ou **ACH** (achat) et reconstitue chaque facture : **TTC** = mouvement du compte de tiers (411 débit / 401 crédit), **HT** = lignes classe 7 (vente) / classe 6 (achat), **TVA** = lignes `445x`. Tiers par **compte auxiliaire** (`c9(t.compteAux)`), sinon via `factureId`/banque, sinon « (tiers non identifié) ».
- **Correspondance** par facture : **« ✓ liée au logiciel »** si `e.factureId` ou un n° de pièce identique existe dans `db.docs`/`db.factures` ; sinon **« FEC / écriture »**.
- `window.correspondancesCard(sens)` rend la carte : **KPIs** (nb factures · dont liées / FEC · Total HT/TVA/TTC) + tableau N° de pièce / Tiers / Date / Jnl / HT / TVA / TTC / Correspondance (tri par date décroissante). Greffée sous chaque suivi.

**Limites :** affichage/calcul seulement (aucune écriture modifiée) ; un dossier en comptes **collectifs** sans comptes auxiliaires affiche « (tiers non identifié) » ; le TTC reflète le mouvement du compte de tiers de l'écriture. Validé : `node --check` (132 scripts) + test données réelles (MBC vente 59 fact./HT 113 347 € · MBC achat 214 · ALR vente 2/1 740 €). Badge → **v266 · correspondances factures FEC**.

---

## 🟢 MAJ précédente — Immobilisations & Financements : zone de travail accordée au thème (bleu nuit, fin du blanc) — v265
**Quoi :** dans le module **Immobilisations & Financements**, l'onglet **Immobilisations** affichait sa **zone de travail (`.im-screen`) en BLANC** (style Sage noir-sur-blanc) — en décalage avec les autres modules en **bleu nuit**. Elle est désormais **accordée au thème** : fond bleu nuit, accents bleu Crystal, textes clairs, **plus aucun blanc** (3 volets Périodes / Immobilisations / Détail, barre d'outils, onglets de détail, sections & lignes de la fiche). Les autres onglets (Emprunts, Crédit-bail, Locations, Taxe véhicules) utilisaient déjà des cartes `.card` au thème → inchangés.

**Comment — `yada-addon143` (100% CSS additif, `<style id="im-navy-mod">`) :**
- Surcharge **scopée `body[data-theme="noir"]`** et **injectée en fin de `<head>`** (source plus tardive) pour **battre** les anciennes règles `body[data-theme="noir"] .im-screen *{color:#1b1b1b}` / `background:#fff` (spécificité égale, dernière déclarée gagne).
- Palette reprise des autres modules : zone `#0c1a2a`, en-têtes `linear-gradient(#16304a,#0f2236)`, lignes/bordures `rgba(30,144,255,.2)`, sélection `rgba(30,144,255,.18)` + filet `#1e90ff`, valeurs `.im-row .v` `#0a1726`/`#24405d`, libellés `#9fb6d0`, accents `#5ab0ff`. Onglet **Immobilisations** actif raccordé à la zone (au lieu du blanc).

**Limites :** affichage uniquement (aucune logique/écriture modifiée) ; restylage **ciblé thème noir** (thèmes clairs inchangés, déjà cohérents avec leurs cartes claires). Validé : `node --check` (131 scripts) + balises structurelles uniques. Badge → **v265 · immo accordée au thème**.

---

## 🟢 MAJ précédente — Suivi des règlements : « Factures non réglées » depuis TOUTES les écritures (FEC inclus) — v264
**Quoi :** le module **Suivi des règlements** gagne une carte **« 📄 Factures non réglées »** (sous le suivi existant, pour l'onglet courant Clients/Fournisseurs) qui liste **toutes les factures saisies OU importées via le FEC** qui **n'ont pas encore été réglées** — y compris les **clients/fournisseurs sans `db.factures`** (dossiers alimentés par FEC). Auparavant le suivi ne lisait que `db.reglements` (créé uniquement par les factures émises dans le logiciel) → la liste était **vide** pour un dossier FEC.

**Comment — `yada-addon142` (override `pageReglements`, 100% additif) :**
- `window.regOpenGroups(type)` parcourt **toutes les écritures** : retient les **lignes NON LETTRÉES** (`!l.lettre` = non réglé) du **compte de tiers** — côté facture **débit** pour un client (créance), **crédit** pour un fournisseur (dette). Rattachement au tiers par **compte auxiliaire** (`c9(t.compteAux)`), sinon collectif 401/411 via `factureId`/banque, sinon « (tiers non identifié) ». Exclut « OD RÉSULTAT ».
- `window.regFacturesNonRegleesCard(type)` rend la carte : **KPIs** (Total non réglé · nb factures · tiers concernés) + un **bloc par tiers** (réutilise `.reg-bloc`/`.reg-t`/`.reg-kpis`) listant Date / Jnl / Pièce / Libellé / **Montant non réglé** (tri par montant décroissant, tiers non identifié en dernier).
- Greffe : `pageReglements = _pr() + regFacturesNonRegleesCard(regOnglet)`.

**Limites :** « non réglé » = ligne **non lettrée** du compte de tiers (le lettrage solde la facture) ; un dossier en comptes **collectifs** sans comptes auxiliaires regroupe sous « (tiers non identifié) ». Affichage/calcul seulement (aucune écriture modifiée). Validé : `node --check` (130 scripts) + test données réelles (MBC clients 18 fact./28 972,40 € · MBC fourn. 15/12 044,15 € · ALR clients 2/1 740 €). Badge → **v264 · factures non réglées**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : liste « Rapprochements bancaires effectués » retirée (haut de page) — v263
**Quoi :** dans le **Rapprochement bancaire**, la **liste du haut** « Rapprochements bancaires effectués » (récap) est **entièrement retirée** (jugée inutile). Le reste du module (barre des périodes avec badges ✓/🔒/◐, relevé, lignes…) est **inchangé**.

**Comment — `addon121` (1 retrait chirurgical) :** dans l'override `pageRappro`, suppression de l'injection `html.replace('<div class="rb-top">', rapRecapHTML()+…)`. La fonction `rapRecapHTML` reste définie mais n'est plus appelée.

**Limites :** affichage uniquement. Validé : `node --check` (129 scripts). Badge → **v263 · rappro sans récap**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : colonne « État » retirée du récap — v262
**Quoi :** dans le **Rapprochement bancaire**, le récapitulatif « Rapprochements bancaires effectués » n'affiche plus la colonne **« État »** (pastilles `✓ Soldé` / `🔒 Verrouillé` / `● Écart` qui ressemblaient à des interrupteurs inutiles). Le récap garde Mois · Compte 512 · Relevé · Solde relevé.

**Comment — `rapRecapHTML` (addon121), 2 retraits chirurgicaux :** suppression du `<th>État</th>` et de la cellule `<td>'+statut+'</td>`. Les badges de mois (✓/🔒/◐ dans la colonne Mois et sur la barre des périodes) restent inchangés.

**Limites :** affichage uniquement (aucune donnée/statut de rapprochement modifié). Validé : `node --check` (129 scripts). Badge → **v262 · rappro sans colonne État**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : ↓ crée une écriture SEULEMENT si la précédente est soldée — v261
**Quoi :** dans l'éditeur (Consultation des comptes), la **flèche du bas** ne crée une **nouvelle écriture** que si l'**écriture précédente est soldée** (Débit = Crédit) et **non vide**. Sinon un message s'affiche et le curseur revient sur l'écriture à corriger.

**Comment — verrou ajouté dans `window.ecAjouterEcriture` (addon140) :**
- Si une écriture mouvementée de la liste n'est **pas équilibrée** (écart ≥ 0,005) → message « Soldez l'écriture précédente… » + focus sur l'écriture concernée ; **création refusée**.
- Si la **dernière** écriture est **vide** (aucun montant) → message « Saisissez et soldez l'écriture en cours… » + focus ; **création refusée** (évite d'empiler des écritures vides).
- Sinon → création normale (comportement v259).

**Limites :** réutilise l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (129 scripts). Badge → **v261 · ↓ après solde**.

---

## 🟢 MAJ précédente — Analytique & rentabilité : cartes remplies depuis TOUTES les écritures — v260
**Quoi :** les cartes du module **Analytique & rentabilité** (Produits par compte, Charges par nature, CA par client, Dépenses par fournisseur, KPIs CA/Charges/Résultat) étaient **vides** pour un dossier alimenté par **FEC / saisies** (car `analytique()` ne lisait que `db.factures`). Elles sont désormais **calculées sur toutes les écritures**.

**Comment — `yada-addon141` (override `window.analytique`, même forme de retour) :**
- **Produits par compte** (classe 7 = crédit−débit), **Charges par nature** (classe 6 = débit−crédit), **CA / Charges / Résultat** = sommes correspondantes. Exclut « OD RÉSULTAT ».
- **CA par client / Dépenses par fournisseur** depuis les **comptes auxiliaires** des tiers (débit pour clients, crédit pour fournisseurs) — rempli quand le dossier utilise des comptes auxiliaires par tiers (sinon, comptes collectifs → non ventilable par tiers).
- Profite aussi à l'**Espace Client** (suivi par client) et au hero mobile qui lisent `analytique()`.

**Limites :** un dossier sans écritures (ex. société non démarrée) reste vide ; la ventilation par tiers nécessite des comptes auxiliaires. Validé : `node --check` (129 scripts) + test données réelles (MBC : CA 113 347 € / Charges 100 350 € / Résultat 12 997 €). Badge → **v260 · analytique sur écritures**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : FLÈCHE BAS en fin de liste → nouvelle écriture — v259
**Quoi :** dans l'**éditeur d'écritures** (page d'édition de la Consultation des comptes), appuyer sur **flèche du bas** depuis la **dernière ligne de la dernière écriture** **crée une nouvelle écriture** à saisir (curseur placé sur la saisie du compte). L'écriture doit être **soldée** (Débit = Crédit) pour être valide.

**Comment — `yada-addon140` + 1 édition d'`addon114` :**
- `addon114` (clavier) : sur `ArrowDown`, si la ligne courante est la **dernière** `tr.ec-r` de la table → `window.ecAjouterEcriture()` (sinon comportement normal `moveRow(1)`).
- `window.ecAjouterEcriture()` : pousse une nouvelle écriture (journal = filtre courant ou `OD` ; date = dernière écriture ; en mode compte, 1re ligne pré-remplie avec le compte consulté pour qu'elle apparaisse), `ecRender()`, puis focus sur la saisie du compte.
- **Validation** : `ecFermer` bloque déjà la fermeture tant qu'une écriture n'est pas équilibrée. Les écritures laissées **vides** (aucun montant) sont **purgées à la fermeture** (pas d'écriture fantôme).

**Limites :** réutilise l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (128 scripts). Badge → **v259 · éditeur ↓ nouvelle écriture**.

---

## 🟢 MAJ précédente — Module Banque : relevé présenté PAR ANNÉE puis PAR MOIS — v257/v258
**Quoi :** dans le **module Banque**, les écritures du relevé sont **présentées par mois**, et si le dossier comporte **plusieurs exercices** (2025, 2026…) une barre de **boutons d'année** apparaît d'abord (avec compteur), puis les **boutons mois** de l'année choisie. Tous les relevés traités restent accessibles (rien n'est masqué) ; il faut **choisir un mois** pour voir ses écritures.

**Année — v258 (`pageBanque` + `bqSetAnnee`) :** `anneesDispo` (années distinctes des écritures banque), barre `.bq-annee-bar` affichée **uniquement si >1 année** (accent or), défaut = année la plus récente ; changer d'année réinitialise le mois (`window.bqMoisSel=''`). `bqMois` n'est valide que si son année = année choisie.

**Comment — `pageBanque` (édition chirurgicale) + `yada-addon139` :**
- `pageBanque` : calcule `moisDispo` (mois distincts des écritures banque, via `ym`), `moisCount` (compteur par mois), et `bsrcMois` (écritures filtrées sur `window.bqMoisSel`). La carte « Relevé bancaire — par mois » rend la barre `.bq-mois-bar` (boutons `.bq-mois` + compteur `.bq-mc`) ; le tableau ne s'affiche **que si un mois est sélectionné**, sinon invite « 👆 Sélectionnez un mois ». Le filtre par compte bancaire (512) est conservé.
- `addon139` : `window.bqSetMois(m)` (toggle + `render`) + style des boutons mois (bleu nuit/Crystal, responsive).

**Limites :** affichage/filtre uniquement (aucune écriture/montant modifié). Validé : `node --check` (127 scripts). Badge → **v257 · banque par mois**.

---

## 🟢 MAJ précédente — Analytique & rentabilité : section avancée sur les ÉCRITURES (KPIs + graphiques + tableaux) — v256
**Quoi :** le module **Analytique & rentabilité** gagne une section **« 📊 Analytique avancée (sur écritures) »** calculée sur **toutes les écritures** (`db.ecritures` : factures + FEC + saisies), comme la Consultation — au lieu des seules factures.

**Contenu (`yada-addon138`, 100% additif, sans bibliothèque externe) :**
- **Filtre par exercice** (boutons année, défaut = année la plus récente des écritures).
- **KPIs** : CA (70x), Charges (60x), Résultat, marge %, Variation de trésorerie (flux 512).
- **4 graphiques SVG** (tooltips natifs `<title>`) : évolution mensuelle **CA vs Charges** (barres groupées), **trésorerie cumulée** (courbe), **répartition des charges** et **des produits** (donuts + légende top 6 + « Autres »).
- **Tableaux analytiques** : résultat mensuel (CA/Charges/Résultat/Marge + total), **Top clients** (CA) et **Top fournisseurs** (dépensé) calculés depuis les comptes auxiliaires.
- **Fonctionnalités** : **export CSV** du tableau mensuel, **impression** (`@media print`).

**Calcul :** classe 7 = crédit−débit (produit), classe 6 = débit−crédit (charge), exclut « OD RÉSULTAT ». Greffe : `pageAnalytique = _pa()+anaAvancee()`. Validé : `node --check` (126 scripts) + test sur données réelles (MBC 2025 : CA 113 347 € / Charges 100 350 € / Résultat 12 997 €). Badge → **v256 · analytique avancée**.

---

## 🟢 MAJ précédente — Paramétrage : bouton « Enregistrer la version actuelle & télécharger » — v255
**Quoi :** dans **Paramétrage** (carte « Transfert manuel »), un nouveau bouton **« 💾 Enregistrer la version actuelle & télécharger »** **enregistre l'état courant dans YADA** (localStorage + cloud si activé) **puis télécharge** le fichier `precompta-AAAA-MM-JJ.json` à jour.

**Comment — `yada-addon137` :** `window.exportJSONEnregistre()` = `persistActif()` → `save()` (enregistre dans YADA) → `cloudPushNow()` (push immédiat si synchro activée, sinon sans effet) → `exportJSON()` (télécharge le fichier à jour). Greffe sur `transfertManuelCard` (bouton injecté avant « ⬇️ Télécharger la base »).

**Limites :** export/enregistrement uniquement (aucune logique comptable touchée). Validé : `node --check` (125 scripts). Badge → **v255 · enregistrer & télécharger**.

---

## 🟢 MAJ précédente — Journal comptable : facture liée (fournisseur/client) à la suite de la date — v254
**Quoi :** dans le **module Journal comptable**, la **facture** liée à l'écriture (fournisseur ou client) s'affiche **juste après la date**, **cliquable** (voir) et **téléchargeable** (⤓).

**Comment — `yada-addon136` + 1 insertion dans `pageJournal` :**
- En-tête `.ecr-h` : après `${e.date}`, insertion de `${jrnFactureLien(e)}`.
- `window.jrnFactureLien(e)` résout le fichier par priorité : **dépôt** (PDF réel, `db.parametres.depots[].fichierId` → `gedVoir`/`gedDl`) → **doc avec fichier joint** (`gedVoir`/`gedDl`) → **doc** facture générée (`voirDoc`/`telechargerDoc`) → **facture d'achat** sans fichier (`voirFactureAchat`, aperçu seul). Libellé « 📎 Facture fourn./client N° ».
- Style `<style id="jrn-fac-mod">` (pastille bleue cliquable + bouton ⤓).

**Limites :** lien d'affichage/téléchargement (aucune écriture/montant modifié) ; les écritures sans facture (banque, O.D.) n'affichent rien. Validé : `node --check` (124 scripts). Badge → **v254 · journal facture liée**.

---

## 🟢 MAJ précédente — Journal comptable : clic droit sur une écriture → édition des comptes — v253
**Quoi :** dans le **module Journal comptable**, un **clic droit** sur une écriture ouvre l'**édition des comptes** (l'éditeur d'écritures façon Sage), positionné sur l'écriture cliquée — même mécanisme que la Consultation.

**Comment — `yada-addon135` + 1 attribut sur `.ecr` :**
- Bloc `.ecr` de `pageJournal` : ajout de `data-ecr` + `oncontextmenu="return jrnCtx(event, id)"`.
- `window.jrnCtx(ev,eid)` : menu contextuel `#jrn-ctx` (« ✎ Éditer l'écriture (édition des comptes) »).
- `window.jrnEditerEcr(eid)` : ouvre `ouvrirJournalEditable(e.journal, ym(e.date), e.id)` (éditeur filtré au journal + mois, défile/focus sur l'écriture) ; repli `ouvrirEcrituresCompte`.

**Limites :** ouverture de l'éditeur existant (aucune logique comptable ajoutée). Validé : `node --check` (123 scripts). Badge → **v253 · journal clic droit éditer**.

---

## 🟢 MAJ précédente — Journal comptable : un ONGLET par journal (BQ/HA/VT/OD/ODP/ODC/ODTVA) — v252
**Quoi :** la page **Journal comptable** affiche désormais une **barre d'onglets** — un onglet par journal (**Tous · BQ · HA · VT · OD · ODP · ODC · ODTVA**, avec compteur d'écritures) — qui **regroupe les écritures du journal sélectionné**. Remplace l'ancien menu déroulant qui mélangeait OD/ODP/ODTVA sous « OD ».

**Comment :**
- `jrnMatch` : filtrage en **journal exact** (`e.journal!==jrnFiltre`) → `OD` ≠ `ODP`/`ODC`/`ODTVA` (chaque onglet montre uniquement son journal).
- `pageJournal` (override) : le bloc « Filtrer par journal » (`<select>`) est remplacé par `.jrn-tabs` (boutons `.jrn-tab` avec compteur `.jrn-c`) ; tri par date + recherche conservés ; titre de carte = nom du journal sélectionné.
- `yada-addon134` : style `<style id="jrn-tabs-mod">` (onglets bleu nuit/Crystal, actif en dégradé, responsive mobile).

**Limites :** affichage/filtre uniquement (aucune écriture/montant modifié). Validé : `node --check` (122 scripts). Badge → **v252 · journal par onglets**.

---

## 🟢 MAJ précédente — Import de données → poussée cloud IMMÉDIATE (données importées toujours à jour partout) — v251
**Quoi :** après un **import de base** (Paramétrage → Transfert manuel → Importer), les données importées sont **poussées immédiatement vers le cloud** et deviennent la **version courante** sur tous les appareils — au lieu d'attendre le push différé (1,8 s) déclenché par `save()`.

**Pourquoi :** demande utilisateur — « chaque mise à jour de données importée doit toujours être actuelle ». La poussée immédiate supprime la fenêtre de latence et fixe l'horodatage local (`TSK`), donc **aucune ancienne copie cloud ne peut écraser** les données fraîchement importées au prochain pull.

**Comment — 1 édition chirurgicale d'`importJSON` :** après `save(); snapshotDB();`, ajout de `try{ if(typeof cloudPushNow==='function') cloudPushNow(); }catch(_e){}`. `cloudPushNow` (addon102) est **sans effet si la synchro n'est pas configurée** (`return Promise.resolve(false)`), donc 100% sûr hors-ligne / sans cloud.

**Prérequis multi-appareils :** la synchro cloud (Pantry) doit être **activée** pour propager ; sinon l'import reste local (et conservé) sur l'appareil. Validé : `node --check` (121 scripts). Badge → **v251 · import → cloud immédiat**.

---

## 🟢 MAJ précédente — Reclassement des journaux PRUDENT (les O.D. diverses restent en OD) — v250
**Quoi :** le reclassement des journaux (addon132) devient **prudent** pour ne plus déplacer par erreur des **O.D. diverses** qui contiennent simplement un compte 445/645/641. Les écritures déplacées à tort vers ODTVA/ODC/ODP sont **ramenées en OD**.

**Pourquoi :** la version v249 reclassait dès la **simple présence** d'un compte (ex. une O.D. avec une seule ligne 445 partait en ODTVA). Trop agressif → faux positifs.

**Comment — `cibleJournal` réécrit (libellé + signature structurelle, défaut = OD) :**
- **TVA → ODTVA** : libellé contient `TVA`, **ou** l'écriture est composée **uniquement** de comptes de TVA `445x` (déclaration CA3). Une O.D. avec une seule ligne 445 parmi d'autres **reste en OD**.
- **PAIE → ODP** : libellé paie, **ou** salaire brut `641` **ET** personnel `421` / cotisations `645` (signature complète).
- **CHARGES → ODC** : libellé charges, **ou** compte social classe 6 (`645/648/631`) **ET** organisme à payer (`431`/`437`).
- **Défaut = OD** : tout ce qui n'est ni TVA ni paie ni charges revient/reste en **OD** (répare les faux positifs de v249). Clôture/à-nouveaux/dotations/cessions/emprunts forcés en OD.

**Limites :** imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (121 scripts). Badge → **v250 · reclassement prudent**.

---

## 🟢 MAJ précédente — Reclassement étendu à la TVA : OD de TVA → journal ODTVA — v249
**Quoi :** le reclassement des journaux (addon132) s'applique désormais aussi à la **TVA** : les écritures de **TVA** (déclaration CA3, régularisation) placées à tort dans le journal **OD** sont reclassées dans le journal **ODTVA (OD TVA)** — comme la paie (→ODP) et les charges (→ODC).

**Comment — extension de `yada-addon132` :**
- `cibleJournal` : ajout d'une règle **TVA prioritaire** → `ODTVA` si le **libellé contient TVA** ou si une ligne porte un **compte de TVA `445x`** (44551/44562/44566/44567/44571…). Le journal `ODTVA` est ajouté à l'ensemble traité (corrige aussi les écritures mal placées en ODTVA).
- **Sécurité** : les à-nouveaux (qui reportent des soldes 445x) restent exclus via le libellé `NOUVEAU` ; les écritures **ACH/VTE** (qui contiennent de la TVA) ne sont jamais touchées (seules les O.D. le sont).
- `ensureJournaux` garantit aussi **ODTVA** dans `db.journaux`.

**Limites :** imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (121 scripts). Badge → **v249 · journaux TVA**.

---

## 🟢 MAJ précédente — Verrou anti-retour de version (no-downgrade) — v248
**Quoi :** dès qu'une version a été utilisée **sur l'appareil**, il devient **impossible de revenir sur une version plus ancienne**. Si une version inférieure se charge (cache périmé, onglet obsolète…), elle est **bloquée** par un voile non contournable et l'**enregistrement est désactivé** → toute modification se fait obligatoirement sur la dernière version.

**Pourquoi :** demande utilisateur — interdire le retour en arrière et garantir que les modifications portent toujours sur la nouvelle version.

**Comment — `yada-addon133` :**
- « Plancher » de version mémorisé dans `localStorage 'yada-ver-max'` (le plus haut numéro déjà exécuté, lu depuis le badge `#yada-ver`).
- Au démarrage : si `version courante ≥ plancher` → on relève le plancher ; sinon → **blocage** (overlay `#yada-ver-lock` plein écran + `window.save` neutralisé) avec bouton **« Charger la dernière version »** (`yadaForceUpdate` : `serviceWorker.update()` + reload « réseau d'abord » ; message si hors-ligne, sans vider le cache pour éviter tout blocage).
- Complète le SW « réseau d'abord » + la mise à jour auto (addon103) qui ramènent déjà la dernière version en ligne. `version.json` aligné sur 248.

**Limites :** le plancher est par **origine/appareil** (localStorage) — un fichier ouvert en `file://` (autre origine) ne partage pas ce plancher. Validé : `node --check` (121 scripts). Badge → **v248 · verrou de version**.

---

## 🟢 MAJ précédente — Reclassement des journaux : OD PAIE / OD CHARGES correctement imputées — v247
**Quoi :** correction des **erreurs d'imputation** : les écritures de **paie** placées à tort dans le journal **OD** sont reclassées en **ODP (OD PAIE)**, et les écritures de **charges (cotisations patronales)** en **ODC (OD CHARGES)**. Corrige aussi les échanges ODP↔ODC.

**Pourquoi :** d'anciennes écritures (versions antérieures, import FEC, etc.) restaient dans « OD » alors que la génération actuelle (`posterPaieMois`/`bpGenererODMois`) route déjà vers ODP/ODC. Les données existantes n'étaient pas corrigées.

**Comment — `yada-addon132` (détection par COMPTES + LIBELLÉ, prudente) :**
- **PAIE → ODP** : présence du compte **641** (salaire brut, classe 6) **ou** libellé `PAIE/SALAIRE/BULLETIN/RÉMUN`.
- **CHARGES → ODC** : présence d'un compte social de classe 6 (**645/648/631**) **ou** libellé `COTISATION/URSSAF/PATRONAL/CHARGES`.
- **Exclusions** (vraies O.D., jamais déplacées) : clôture/`RÉSULTAT`, à-nouveaux/`NOUVEAU`, dotations/amortissements, cessions, emprunts/intérêts/échéances, TVA.
- Migration unique tous-dossiers au chargement + reclassement à chaque `save` (couvre éditions, FEC, après synchro cloud) + au changement de dossier ; `ensureJournaux` garantit ODP/ODC dans `db.journaux`. `window.reclasserJournauxPaieCharges()` exposé.

**Limites :** le journal est une imputation descriptive (aucun montant/équilibre touché). Validé : `node --check` (120 scripts). Badge → **v247 · journaux paie/charges**.

---

## 🟢 MAJ précédente — Édition des comptes : libellé REPORTÉ depuis la Consultation — v246
**Quoi :** dans l'**éditeur d'écritures** (journal HA/VT/BQ/OD ouvert pour saisir/éditer), la colonne **Libellé** affiche désormais **exactement le même libellé que la Consultation des comptes / grand-livre** : le libellé de l'**écriture** (`e.libelle`, ex. « F2024-001 · DUPONT »).

**Pourquoi :** la Consultation affichait `e.libelle` alors que l'éditeur montrait le libellé de la **1re ligne** (`e.lignes[0].lib`, ex. « Fournisseur DUPONT ») → les deux ne correspondaient pas. Valable pour fournisseur, client, salarié, n'importe quelle écriture.

**Où / comment — `yada-addon131` + 1 édition chirurgicale :**
- `ecRender` (cellule `.ec-lb`) : `value=${ecAttr(e.libelle||'')}` et `onchange="ecSetLibelleEcr(id, v)"` (au lieu de `e.lignes[0].lib` / `ecSetLibAll`).
- `window.ecSetLibelleEcr(id,v)` : écrit `e.libelle=v` puis `ecRender()` → Consultation, journal de base et grand-livre restent synchronisés. La saisie d'un compte de tiers continue d'alimenter `e.libelle` via `ecSetLibAll`/`ecLibTiers` (addon125).

**Limites :** le libellé est descriptif (aucun montant/équilibre touché) ; `l.lib` reste en base mais n'est plus affiché dans l'éditeur (toutes les vues lisent `e.libelle`). Validé : `node --check` (119 scripts). Badge → **v246 · libellé journal**.

---

## 🟢 MAJ précédente — Paramétrage / Plan comptable séparés + transfert manuel + ajout direct fournisseur/client — v245
**Quoi :** la page « Paramétrage & plan comptable » est **scindée en deux entrées de menu** : **« Paramétrage (réglages) »** et **« Plan comptable »**. La page Paramétrage gagne une carte **« 📁 Transfert manuel (par fichier) »** (Télécharger la base / Importer). Les onglets **Fournisseur** et **Client** du plan comptable reçoivent un **formulaire d'ajout direct** de compte (401…/411…).

**Où / comment :**
- Nav : entrée `parametrage` renommée « Paramétrage (réglages) » + nouvelle entrée `plancomptable` ; dispatch `plancomptable:pagePlanComptable` (objet réévalué à chaque rendu).
- `pageParametrage` : retire `planComptableCard()`, ajoute `transfertManuelCard()` (réutilise `exportJSON`/`importJSON`, input `#param-imp`). Nouveau `pagePlanComptable()` = `head` + `planComptableCard()`.
- `planComptableCard` : l'`addRow` des onglets fournisseur/client affiche un champ nom + bouton « + Créer le compte 401…/411… » → `pcAjoutTiers(type)` (crée un `db.tiers` minimal, `compteAux` via `genAux`, comptes de contrepartie/TVA par défaut). Le module Tiers reste pour la fiche complète.
- Raccourci menu « Plan comptable… » → `current='plancomptable'`.

Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (pages séparées, transfert manuel présent, onglets + ajout fournisseur `401TEST00` créé, 0 pageerror). Badge → **v245**.

---

## 🟢 MAJ précédente — Capture de facture : compte d'Honoraires 622600000 dans le menu des comptes de charges — v244
**Quoi :** lors de la **capture / comptabilisation d'une facture fournisseur** (et dans la fiche tiers, la saisie d'achat, les dépôts), le menu déroulant **« compte de charge »** propose désormais **« 622600 — Honoraires »**.

**Où / comment :** ajout de `'622600'` à `COMPTES_CHARGE` (liste du menu, utilisée par `optComptes` dans la fiche tiers `ti-contre`, la comptabilisation des dépôts d'achat et la saisie d'achat) + libellé `'622600':'Honoraires'` dans `COMPTES` (clé 6 chiffres). À la génération, `c9('622600')='622600000'`. Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (option « 622600 — Honoraires » présente, c9 OK, 0 pageerror). Badge → **v244**.

---

## 🟢 MAJ précédente — Saisie : TOUS les comptes proposés en autocomplétion (charges classe 6 incluses) — v243
**Quoi :** dans l'éditeur d'écritures, l'**autocomplétion de compte** (`ecAllAccounts`) propose désormais **tout le Plan Comptable** — **tous les comptes de charges (classe 6)** et **tous les comptes** (classes 1 à 8), plus les tiers auxiliaires du dossier.

**Pourquoi :** `ecAllAccounts` se limitait à **`db.plan`** quand celui-ci était peuplé (au lieu du PCG complet) → des comptes de charges absents de `db.plan` n'étaient **jamais proposés**. De plus `familles()` restreignait aux classes 401/411/44/6/7.

**Ce qu'il fait :** la source des suggestions est désormais **`COMPTES` (= PCG_COMPLET fusionné, ~970 comptes) ∪ `db.plan`** (jamais `db.plan` seul), et `familles()` accepte **toutes les classes 1 à 8**. Filtré par préfixe saisi + 14 résultats max (inchangé).

**Où / comment :** édition chirurgicale de `familles()` et `ecAllAccounts()` (addon85). Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (saisie « 606 »/« 615 » → comptes de charges proposés ; « 2 » → immobilisations ; 0 pageerror). Badge → **v243**.

---

## 🟢 MAJ précédente — TVA & factures : montants calculés sur TOUTES les écritures + concordance comptable — v242
**Quoi :** le **Module TVA (CA3)** calcule désormais la **TVA collectée et déductible sur toutes les écritures** (factures + import FEC + saisies), et les listes de factures **fournisseurs/clients** affichent la **concordance avec la comptabilité** (nombre d'écritures VTE/ACH).

**Pourquoi :** (1) `tvaDuMois` comparait des codes courts (`'44571'`) alors que les écritures stockent des comptes en **9 chiffres** (`445710000`, addon22) → il renvoyait **0** (le suivi annuel TVA était vide). (2) `tvaDetailMois` ne lisait que `db.factures` → les montants **importés du FEC** (présents en écritures sur les comptes de TVA mais sans `db.factures`) étaient **ignorés**.

**Ce qu'il fait :**
- `tvaDuMois(m)` : somme les **crédits sur 44571x** (collectée) et les **débits sur 44566x/44562x** (déductible), comparés en **`c9`** → capte FEC + manuel + factures. Le suivi annuel CA3 est désormais juste.
- `tvaDetailMois(m)` : **totaux autoritaires depuis les écritures** (`col`/`ded` = `tvaDuMois`), justification **par facture conservée** (ventilation par taux), et **part « autres » (FEC/écritures)** = `col − colFact` / `ded − dedFact`. Le tableau CA3 ajoute une ligne « Autres ventes/achats taxables (import FEC / écritures sur 44571 / 44566-44562) » pour réconcilier le total.
- **Suivi des factures de vente** : KPI « TVA collectée » + ligne de **concordance** « N écriture(s) VTE — concordance ✓ / G comptabilisée(s) sur N ». **Suivi des factures fournisseurs** : concordance « N écriture(s) ACH ».

**Où / comment :** éditions chirurgicales de `tvaDuMois`, `tvaDetailMois`, du tableau CA3 (`pageTVA`) et des sous-titres de `suiviFacturesVente`/`suiviFacturesAchat`. **Affichage/calcul seulement — aucune écriture modifiée.** Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (`tvaDuMois` 2026-05 = col 820 / ded 184 — valait 0 avant ; CA3 rendu, 0 pageerror). Badge → **v242**.

**Reste à faire (signalé) :** lister dans les suivis les factures présentes **uniquement** en écritures (FEC) pour une parité de comptage stricte — la concordance les rend visibles ; la synthèse de lignes depuis les écritures est un chantier suivant.

---

## 🟢 MAJ précédente — Synchro : Pantry seul (méthode Supabase retirée de l'interface) — v241
**Quoi :** la carte de **Synchronisation** ne propose plus que **Pantry** (`getpantry.cloud`). Les sections **Supabase** (URL/clé/table, aide SQL) et **Serveur YADA** sont **retirées de l'interface** pour une configuration simple et sans confusion. À l'**enregistrement**, l'ancienne config Supabase est **effacée** (les champs absents repassent à vide → `url/key/server/token=''`).

**Ce qu'il fait :**
- `cloudCard` : titre « (Pantry) », section verte Pantry (identifiant + clé d'espace) + chiffrement + boutons + aide Pantry ; plus aucun champ Supabase/serveur affiché.
- `cloudSaveCfg` lit toujours les ids `cloud-url/key/table/server/token` mais, ces champs n'existant plus, ils valent `''` → **la méthode Supabase est effacée** au premier « Enregistrer la configuration ».
- **Le transport Pantry/Supabase/serveur reste inchangé côté code** (repli conservé) ; seule l'UI est simplifiée. Le chiffrement de bout en bout est toujours appliqué.

**Où / comment :** greffes chirurgicales dans `cloudCard` (addon102) — suppression des blocs Supabase avancé, Serveur YADA et aide SQL ; variable `sql` retirée. Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (carte Pantry-only, 0 champ Supabase, effacement au save, 0 pageerror). Badge → **v241**.

---

## 🟢 MAJ précédente — Synchro : méthode simple « Pantry » (stockage JSON sans base SQL) — v240
**Quoi :** ajout d'un **3ᵉ mode de synchronisation, sans base SQL** — **Pantry** (`getpantry.cloud`). Aucune table, aucune RLS, aucun cache de schéma → **les erreurs Supabase de type `PGRST205` (« table introuvable ») sont impossibles**. Onboarding minimal : créer un Pantry (un e-mail), copier l'**identifiant** dans YADA. C'est le **mode recommandé** désormais (mis en avant dans la carte de Paramétrage), Supabase/serveur restant disponibles.

**Ce qu'il fait :**
- **Client** (addon102) : `cfg()` lit `pantry` ; helpers `pantryGet`/`pantryPut` (un « panier » nommé d'après la clé d'espace stocke `{data,ts,enc}` via `POST`/`GET` sur `getpantry.cloud/apiv1/pantry/<id>/basket/<espace>`). `cloudGetRows`/`cloudPut`/`cloudTest` routent vers Pantry **en priorité** quand l'identifiant est rempli, sinon serveur, sinon REST Supabase. Garde `cloudReady(c)` = `enabled && (pantry || server || (url&&key))`. **Le chiffrement de bout en bout reste appliqué avant l'envoi** (le stockage ne voit qu'un blob). Panier inexistant (HTTP 400/404) traité comme « vide ».
- **UI** : section verte **« 📦 Méthode simple — Pantry (recommandé, sans base SQL) »** en tête de la carte (champ identifiant + clé d'espace) ; les champs **Supabase** passent dans un `<details>` « Méthode avancée » ; aide pas-à-pas Pantry. `cloudSaveCfg` persiste `pantry` dans `localStorage 'yada-cloud'`.

**Où / comment :** greffes chirurgicales dans addon102 (transport Pantry + priorité, carte de réglage). Validé : `node --check` (118 scripts), filet d'équilibre (d-ama/d-sci42), smoke Playwright (routage Pantry `POST`/`GET` vers le bon panier + repli Supabase/serveur, 0 pageerror). Badge → **v240**.

**Limites :** Pantry est un service tiers gratuit (taille de panier ~1,4 Mo, disponibilité « best-effort ») ; convient à un dossier de petite/moyenne taille. Pour de gros volumes, préférer Supabase/serveur. L'envoi effectif dépend de la disponibilité de `getpantry.cloud` (non testable depuis l'environnement de build — réseau restreint).

---

## 🟢 MAJ précédente — Synchro : câblage du serveur YADA (`@supabase/server`) de bout en bout — v239
**Quoi :** la synchro cloud peut désormais **passer par un serveur** (proxy `@supabase/server`, dossier `server/`) au lieu d'appeler Supabase directement, pour que la **clé secrète reste côté serveur** (jamais dans le navigateur). 100% optionnel : champ **« Serveur YADA »** vide ⇒ mode Supabase direct inchangé (clé anon + chiffrement de bout en bout).

**Ce qu'il fait :**
- **Serveur** (`server/index.mjs`) : vrai proxy `withSupabase({ auth:'none' })` exposant `GET /health`, `GET /sync?espace=…`, `POST /sync` (upsert via `ctx.supabaseAdmin`, qui contourne la RLS avec la clé secrète). CORS gérée par le SDK ; jeton partagé optionnel `YADA_API_TOKEN`. Adaptateur Node http pour exécution autonome ; déployable aussi en Supabase Edge Function (`verify_jwt=false`). La clé secrète ne vit qu'en variable d'environnement (`.env` git-ignoré).
- **Client** (`precompta.html`, addon102) : `cfg()` lit `server`/`token` ; helpers `srvFetch`/`cloudGetRows`/`cloudPut` ; `cloudPushNow`/`cloudPull`/`cloudTest`/`cloudIntegrityCheck` routent vers `<server>/sync` quand une URL serveur est renseignée, sinon repli REST Supabase. Garde `cloudReady(c)` = `enabled && (server || (url && key))`. Le **chiffrement reste appliqué avant l'envoi** (le serveur ne voit qu'un blob). Carte Paramétrage : section **« 🖧 Serveur YADA (optionnel) »** (URL + jeton) ; `cloudSaveCfg` persiste `server`/`token` dans `localStorage 'yada-cloud'`.

**Où / comment :** greffes chirurgicales dans addon102 (transport branché serveur/direct) ; `server/` (index.mjs proxy, `.env.example`, README de déploiement Node/Edge). Validé : `node --check` (118 scripts + serveur), filet d'équilibre (d-ama/d-sci42), smokes Playwright (routage serveur **et** repli direct, 0 pageerror). Badge → **v239**.

**Limites :** le déploiement effectif du serveur (Render/Railway/Fly/Edge) requiert le compte Supabase de l'utilisateur ; le proxy n'est pas requis pour synchroniser (le mode direct fonctionne déjà).

---

## 🟢 MAJ précédente — Synchro cloud : SQL Supabase corrigé (colonne `enc`) — v238
**Quoi :** l aide SQL de la carte de Paramétrage créait la table `yada_sync` sans la colonne **`enc`**, alors que le PUSH envoie `enc` (0/1, chiffrement) → l upload échouait (« column enc does not exist »). Le script crée désormais `enc int default 0` (+ `add column if not exists` pour les tables déjà créées). Badge → **v238**.

---

## 🟢 Dernière mise à jour — Synchronisation multi-appareils : suivi continu + dossiers ADDITIFS (le travail du PC principal sur toutes les interfaces) — v237
**Quoi :** tout le **travail fait sur le PC principal** (dossiers créés, écritures, règles) est **suivi en continu** sur les autres appareils — **mêmes dossiers, mêmes données, mêmes règles**. (1) **PULL automatique** périodique (40 s) + au **retour au premier plan** (`visibilitychange`/`focus`) + à la **reconnexion** (`online`), en plus du push après chaque save (addon102) ; cloudPull n'applique que si le cloud est **plus récent** (horodatage, dernier gagnant). (2) **Dossiers ADDITIFS** : à la réception, le cloud (PC principal) l'emporte pour les dossiers partagés, mais **aucun dossier créé localement n'est perdu** (les dossiers présents seulement en local sont conservés puis repoussés → visibles partout).

**Où / comment :** `yada-addon130` — `setInterval(cloudPull(true), 40s)` + écouteurs `visibilitychange`/`focus`/`online` (garde : pas de pull si un overlay/modale est ouvert). `applyRemote` (addon102) **fusionne** `dossiersData` et `cabinet.dossiers` (union : cloud prioritaire pour l'existant, ajout des dossiers locaux manquants). **Prérequis** : la synchronisation cloud doit être **configurée et activée** (Paramétrage → URL/clé Supabase + clé d'espace) ; sinon inactif. 100% additif, aucune logique comptable modifiée. Badge → **v237**.

---

## 🟢 MAJ précédente — Éditions : balances fournisseurs/clients calculées sur les ÉCRITURES (FEC + manuel) — v236
**Quoi :** toutes les **Éditions** sont générées à partir de **tous les montants** — qu'ils proviennent de l'**import FEC** ou d'une **saisie manuelle**. La **balance générale**, le **grand-livre**, les **journaux**, le **bilan** et le **compte de résultat** itéraient déjà `db.ecritures` (FEC + manuel). Les **balances fournisseurs / clients** s'appuyaient en revanche sur `auxMvt(t)` (qui lit `db.factures`/`db.banque`) → elles **ignoraient les montants FEC** (présents en écritures mais sans `db.factures`). Désormais elles somment les **lignes d'écriture du compte de tiers** via `auxLignes(t)` → **FEC + manuel inclus**.

**Où / comment :** `balanceLignes(type)` — pour `fournisseurs`/`clients`, remplacement de `auxMvt(t,null)` par la somme `débit/crédit` de `auxLignes(t)` (lignes sur le compte auxiliaire + collectif rattaché), avec filtre des comptes non mouvementés. Aucune logique comptable modifiée (calcul d'affichage uniquement). Badge → **v236**.

---

## 🟢 MAJ précédente — Interface FIXE (cartes/modules sans mouvement) + boutons en transparence + « Montants sans facture » repliable (fermé) — v235
**Quoi :** (1) **tous les modules / sous-modules / cartes sont FIXES** — aucun mouvement ni animation au survol ou à l'entrée (plus de `transform`/`scale`/`translateY`/animation d'apparition), en mode **JOUR comme NUIT** ; (2) **seuls les BOUTONS** gardent un effet de **TRANSPARENCE** (opacité) au survol (`.82`) et au clic (`.62`), sans déplacement ; (3) dans les **Éditions** (Grand-livre), la carte **« Montants sans facture »** devient **repliable** (`<details>`), **FERMÉE par défaut** et **plus compacte** (un simple bandeau « ⚠ … — N ligne(s) · X € · ▸ ouvrir », cliquer pour déplier).

**Où / comment :** `yada-addon129` — `<style id="fixe-ui-mod">` (injecté en dernier) : `transition:none/animation:none` + `transform:none !important` (au survol) sur `.card/.kpi/.cp-k/.cf-org/.kv2/.dossier-card/.figer-card` avec préfixe `body[data-theme]` pour **battre** les règles noir/liquid (spécificité ≥ règles thème) ; boutons `.btn{transition:opacity;transform:none}` + `:hover/:active{opacity}` ; styles `.sf-details/.sf-sum` (marqueur custom `▸/▾`). `blocSansFacture` rend un `<details>` (sans attribut `open`). 100% CSS/markup additif, aucune logique modifiée. Badge → **v235**.

---

## 🟢 MAJ précédente — Toutes les éditions (Grand-livre, Bilan, Compte de résultat, Journaux…) : écritures en noir sur fond blanc légèrement bleuté — v234
**Quoi :** l'habillage de la Balance (v233) est **généralisé à toutes les éditions imprimables** (`.doc-page`) — **Grand-livre**, **Bilan**, **Compte de résultat**, **Journaux**, **centralisateur**, justificatifs : **écritures en NOIR** sur **fond BLANC légèrement bleuté** (en-têtes / lignes alternées / totaux en bleu clair, titre & filets bleus), **quel que soit le thème**. Les **factures** (`.inv-page`) ne sont pas touchées.

**Où / comment :** `yada-addon128` — `<style id="doc-edit-mod">` reprend les règles de la balance mais sur **`.doc-page`** (toutes les éditions). Pour battre la règle du thème noir `body[data-theme="noir"] .doc *{color:#1b1b1b !important}` (spécificité 0,2,1), les règles texte utilisent **`body[data-theme] .doc-page *`** (même spécificité, injectées en dernier → priorité) → texte `#111418`. 100% CSS additif, aucune donnée/logique modifiée. Badge → **v234**.

---

## 🟢 MAJ précédente — Édition de la Balance : écritures en noir sur fond blanc légèrement bleuté — v233
**Quoi :** l'**édition de la Balance** (Balance générale / fournisseurs / clients / personnel / immo / retenue, ouverte depuis Éditions → modale) est rendue **plus lisible** : **toutes les écritures en NOIR** (compte, libellé, montants) sur un **fond BLANC légèrement bleuté** (en-têtes bleu clair, lignes alternées bleu très clair, totaux teintés de bleu, titre & filets bleus), **quel que soit le thème** (corrige le faible contraste en mode nuit).

**Où / comment :** `balanceDoc` pose la classe **`bal-doc`** sur le `.doc-page` ; `yada-addon127` injecte `<style id="bal-edit-mod">` : `.bal-doc *{color:#111418}` (noir) + `background:#fff` + accents bleus (`th` `#eaf2fb`/`#0b346e`, lignes impaires `#f5f9ff`, totaux `sub/cls/tg` en bleu clair, titre `#0b346e` souligné `#0a64d6`). 100% CSS additif, aucune donnée ni logique modifiée. Badge → **v233**.

---

## 🟢 MAJ précédente — Consultation (grand-livre) : lettrage manuel inter-journaux (solder le tiers : Banque ↔ Vente / Achat) — v232
**Quoi :** dans la **Consultation des comptes**, en ouvrant le **grand-livre d'un tiers** (clic sur 411HABI00 / 401…, lecture seule), on peut désormais **lettrer manuellement** : **clic gauche** sélectionne les lignes à rapprocher — typiquement la **VENTE** (journal VT, débit) et son **ENCAISSEMENT** (journal BQ, crédit), ou l'**ACHAT** (HA, crédit) et son **PAIEMENT** (BQ, débit). Une **barre de lettrage** indique Σ Débit / Σ Crédit et **« équilibré ✓ »** ; le bouton **« Lettrer la sélection »** n'est actif que si **Débit = Crédit** → le **compte du tiers est soldé**. Boutons **Délettrer** / **Vider la sélection**. Le déplacement d'un compte (collectif 411000000 → auxiliaire 411HABI00) fait apparaître la ligne sur le tiers (recalcul des soldes), prête à lettrer.

**Où / comment :** `clLignesGeneral` expose `idx`/`key` (comme `auxLignes`) ; `clRender` rend les lignes **sélectionnables** (`data-k`, `onclick="clToggleSel"`, classe `cl-sel`) + barre `.cl-letbar` (Σ sélection, état). `yada-addon126` : `clToggleSel`/`clSelVider`/`clLettrerSel`/`clDelettrerSel` (réutilisent **`lzLettrer`/`lzDelettrer`**, contrôle Σdébit=Σcrédit) ; reset de `clSel` à la navigation/ouverture. Le clic droit (→ Journal) reste disponible. Aucune logique comptable modifiée (le lettrage ne touche pas aux montants). Badge → **v232**.

---

## 🟢 MAJ précédente — Consultation : libellé déversé par le compte (nom du tiers) + identique partout, et facture = nom + n° + moyen — v231
**Quoi :** (1) lors de la **saisie au journal**, quand on saisit un **compte de tiers** (401…/411…, ex. **401ALRC00**), le **libellé se remplit automatiquement** avec le **nom complet** du tiers (ex. **ALR CONSEIL**) ; (2) le libellé reste **identique partout** — même valeur dans la **saisie**, le **journal de base** (Consultation) et le **grand-livre** (toutes les lignes d'une écriture portent le même libellé) ; (3) pour une **facture enregistrée/générée**, le libellé est **« <nom du tiers> — <n° de facture> — <moyen de paiement> »**.

**Où / comment :** `posterFacture` pose le libellé **canonique** (`nom — numéro — modeReglement`) sur **toutes les lignes** + `e.libelle`. `ecSetLibAll` synchronise aussi `e.libelle` (« pièce · libellé ») pour que la Consultation et le grand-livre affichent le même libellé que l'éditeur. `yada-addon125` : `window.ecLibTiers(e,t)` (nom seul si saisie simple ; nom + n° + moyen si facture liée) + **wrap `ecSetLine`** (à la saisie d'un compte résolu en tiers via `ecResolveTiers`, déverse le libellé via `ecSetLibAll`). Aucune logique comptable modifiée. Badge → **v231**.

---

## 🟢 MAJ précédente — Module Client : carte « 🔁 Récurrence » (prestations de service facturées en plusieurs fois) — v230
**Quoi :** dans le **Module Client (Facturation)**, une carte **« 🔁 Récurrence — prestation de service »** crée une **prestation facturée en plusieurs fois** (ex. **Tenue Comptable** sur **12 mois**) : une **facture de prestation** est générée **pour chaque mois** (statut « à générer »), retrouvable dans **« Mes factures de vente »**. Champs : client, désignation (déf. « Tenue Comptable »), montant HT/mois, TVA, nombre de mois (déf. 12), date de 1ʳᵉ facture, conditions de paiement.

**Où / comment :** `yada-addon124` — `faRecCard()` (greffé en tête de la colonne « Créer / Déposer » de `pageFacturationClient`) ; `faRecGenerer()` boucle sur N mois (`addMonthsISO`), crée des `db.docs` (type facture, **ligne `nature:'prestation'`**, `qte:1`, `pu`=montant/mois), `numero` via `nextNumUnique('FAC')`, échéance via `faEcheanceFromCond`, libellé « <prestation> — <mois> », `recurrence:{groupe,index,total,designation}`, statut `valide` non comptabilisé. Les écritures se génèrent ensuite normalement (une par mois, VTE équilibrée). Aucune logique comptable modifiée. Badge → **v230**.

---

## 🟢 MAJ précédente — Tiers : détection de doublons par MOTS (pluriel + mots de liaison ignorés) — ex. « Résidence(s) Picardie » — v229
**Quoi :** la détection des doublons de tiers (v228) compare désormais aussi les **mots significatifs** : on **ignore les mots de liaison** (de, des, la, le, et…) et on **ramène au singulier** (RÉSIDENCES → RÉSIDENCE), de sorte que « **Résidences Picardie** », « Résidence Picardie », « Résidence DE Picardie », « SCI Résidence Picardie » sont reconnus comme **le même tiers** (surlignés jaune + fusionnables), **sans** confondre des entités distinctes qui partagent un mot (« Résidence Amiens » ≠ « Résidence Picardie »).

**Où / comment :** `yada-addon123` — `similaire(n1,n2)` enrichi : `tokens()` (majuscules, sans accents, sans formes juridiques ni mots STOP, singulier) + `tokenKey()` ; vrai si **mêmes mots significatifs** (token-set égal), sinon inclusion, sinon **Jaccard de tokens ≥ 0,6**, sinon Dice ≥ 0,80. Aucune logique comptable modifiée. Badge → **v229**.

---

## 🟢 MAJ précédente — Libellé reporté automatiquement (saisie journal) + Tiers : doublons par ressemblance (jaune) + fusion globale + anti-doublon — v228
**Quoi :** (1) **report automatique du libellé** dans la saisie au journal — une **nouvelle ligne** (clic droit « Insérer » ou « + Ajouter ») **hérite du libellé** de l'écriture (déjà identique sur toutes les lignes, v221) ; (2) **Tiers — doublons par RESSEMBLANCE** : les fournisseurs/clients dont la **dénomination se ressemble** (pas seulement identique) sont **détectés**, **surlignés en JAUNE** (tag **DOUBLON**) et regroupés ; un bouton **« ⚙️ Fusionner TOUS les doublons similaires »** regroupe chaque famille en un seul compte (SIRET différents laissés) ; à la **validation d'une fiche tiers**, si un tiers ressemblant existe déjà, on **propose de le rattacher** (anti-doublon) plutôt que d'en créer un nouveau.

**Où / comment :** `ecAddLine`/`ecInsertLine` héritent de `e.lignes[0].lib`. `yada-addon123` : `norm` (majuscules + suppression formes juridiques SARL/SAS… + alphanum), `dice` (bigrammes) + `similaire` (égalité / inclusion / Dice ≥ 0,82) ; `window.tiersSimilaireExistant` ; **override `scanDoublonsTiers`** (groupes flous via union-find → `dupTiersIds` jaune) ; **override `tiersConsoliderDoublons`** (auto-fusion seulement des noms STRICTEMENT identiques, prudent) ; `tiersFusionnerSimilaires` (fusion de toutes les familles ressemblantes, SIRET divergents laissés) ; greffe `blocDoublonsTiers` (bouton « Fusionner tous ») ; garde `ficheValider` (proposition de rattachement). Aucune logique comptable modifiée. Badge → **v228**.

---

## 🟢 MAJ précédente — Saisie Journal de Banque : éditeur Sage + dépôt / lecture du relevé bancaire → écritures — v227
**Quoi :** dans **Saisie journal Banque**, une carte **« 📒 Saisie & relevé de banque »** ajoute : (1) **« ✎ Saisir le journal de banque (éditeur Sage) »** qui ouvre **le même éditeur que les journaux** (`ouvrirJournalEditable('BQ', mois)` — saisie directe, clic droit, navigation clavier, copier/coller) ; (2) **dépôt d'un relevé bancaire PDF**, avec **⬇ Télécharger** et **👁 Voir (page à part)** (ouvre le PDF dans un nouvel onglet pour vérification) ; (3) **🧾 Lire le relevé → écritures** : lecture du PDF (décompression FlateDecode + décodage de la **police vectorisée**, auto-décalage), extraction des **opérations** (jour, libellé, **montant**), **aperçu de vérification** (modale : jour / libellé / compte / Débit / Crédit éditables) puis **génération des écritures BQ** via `posterBanque` (équilibrées).

**Où / comment :** `yada-addon122` — greffe `pageSaisieBq` (+`rbqCard`) ; dépôt dans `db.parametres.pieces` (cat `releve`) ; `rbqVoir`/`rbqTelecharger`/`rbqSupprimer` ; lecteur PDF autonome (`extractText` + `DecompressionStream`, `shiftStr`/`autoDecode` pour les polices CID à octets nuls + glyphes décalés, chiffres compris) ; `rbqParse` (ancres tolérantes aux accents, split par « EUR », montant en fin de segment) → `rbqOuvrirApercu` → `rbqGenerer` (`posterBanque`). 100% additif, aucune logique comptable modifiée. **Limite :** l'extraction est *best-effort* (vérification humaine obligatoire avant génération ; sens Débit/Crédit et compte à confirmer ; certains relevés vectorisent les chiffres → l'OCR connecté reste le repli). Badge → **v227**.

---

## 🟢 MAJ précédente — Consultation des journaux : HA / VT / BQ filtrés sur le SEUL mois sélectionné (fin du cumul) — v226
**Quoi :** dans la **Consultation des comptes**, quand on sélectionne un **mois** (janvier→décembre) dans la colonne des périodes, les journaux **HA (ACH)**, **VT (VTE)** et **BQ** affichent **uniquement les écritures de ce mois** (et plus le cumul depuis le début d'année). Tous les journaux se comportent désormais pareil (mois sélectionné uniquement) ; l'en-tête indique « — mois MM/AAAA ».

**Où / comment :** `sgJournalGrid` — `const cumul=(code==='ACH'||code==='VTE')` remplacé par `const cumul=false` → le filtre devient `ym(e.date)===per` pour tous les journaux. L'éditeur (`ecEcritures` en mode `ecJournalFiltre`) filtrait déjà au mois. Affichage seul, aucune logique comptable modifiée. Badge → **v226**.

---

## 🟢 MAJ précédente — Rapprochement bancaire : récap de tous les rapprochements + validation au mois + cadenas multi-comptes — v225
**Quoi :** dans le **Rapprochement bancaire**, (1) une bande **« Rapprochements bancaires effectués »** liste **tous les relevés** avec leur **état** (✓ soldé / 🔒 verrouillé / ● écart), cliquable pour ouvrir le rapprochement ; (2) un **cadenas 🔒** apparaît sur le **mois** (colonne des périodes) et sur la ligne du relevé quand c'est **verrouillé** ; (3) **validation au mois** : s'il y a **plusieurs comptes bancaires** mouvementés sur le mois, le mois n'est **« validé » (✓)** que lorsque **TOUS** sont rapprochés & soldés (sinon **◐ en attente** — aucune validation), mais le compte déjà rapproché **reste visible** dans son mois (colonne Journaux + récap).

**Où / comment :** `yada-addon121` — helpers `window.rapBanquesMois(m)` (comptes 512 ayant des mouvements ce mois), `window.rapMoisStatut(m)` (`{total,faits,soldes,verrouilles,valide,verrouille}` ; `valide = soldes===total`, `verrouille = valide && tous verrouillés`), `window.rapRecapHTML()`. Greffe `pageRappro` : badges 🔒/✓/◐ par mois (regex sur les items `.it` de `.rb-per`) + injection du récap avant `.rb-top`. Édition chirurgicale de la ligne « Relevé BQ au … » (🔒 si verrouillé, ✓ si soldé). Aucune logique comptable modifiée. Badge → **v225**.

---

## 🟢 MAJ précédente — Fenêtre plein écran au glisser-haut + saisie sur l'écriture cliquée + sélection multi-lignes copier/coller — v224
**Quoi :** trois améliorations de la saisie / des fenêtres : (1) **glisser une fenêtre (manipulable) vers le haut de l'écran → plein écran** (snap façon Windows, repère bleu en haut) ; (2) dans **tous les journaux**, le **clic droit « ✎ Saisir / éditer cette écriture »** ouvre l'éditeur **positionné sur l'écriture cliquée** (défilement + curseur sur la **saisie du compte** de la ligne sélectionnée, surbrillance temporaire) ; (3) **sélection multi-lignes** dans l'éditeur (glisser le pointeur sur la zone gauche/droite des lignes, ou **Maj+clic** ; **Échap** annule) puis **Ctrl/Cmd+C / Ctrl/Cmd+V** pour **copier / coller** les lignes (collées après la ligne active, et copiées en TSV dans le presse-papiers).

**Où / comment :** `addon89` — `dragMove`/`dragEnd` détectent le haut de l'écran (`#wm-topzone`) → `wmMaximize(k)` (dé-flotte / sort de `sg-reduit`). `sgJournalGrid` — lignes `data-ecr`/`data-cpt` ; `addon117` transmet l'id d'écriture ; `ouvrirJournalEditable(journal,mois,ecrId,cpt)` défile + focus `input.ec-cpt` (classe `ec-focus-ecr`). `yada-addon120` — sélection (`mousedown`/glisser sur cellules hors saisie, `.ec-rowsel`), `Ctrl+C`/`Ctrl+V` (`window.ecClip`, collage `e.lignes.splice`), actif hors mode compte (`!window.ecCode`, pour ne pas gêner le lettrage). Aucune logique comptable modifiée. Badge → **v224**.

---

## 🟢 MAJ précédente — Confirmations & saisies aux couleurs YADA (fin des `confirm()` / `prompt()` natifs) — v223
**Quoi :** toutes les **confirmations de suppression** et **invites de saisie** du logiciel s'affichent désormais dans des **modales soignées aux couleurs YADA (bleu nuit + bleu Crystal)** au lieu des boîtes `confirm()` / `prompt()` natives du navigateur (« …github.io indique »). Boutons **Annuler / Confirmer** (le bouton de suppression est en **rouge danger**), champ de saisie intégré pour les prompts ; **Échap / clic dehors = Annuler**, **Entrée = Confirmer / OK**. `window.alert` est aussi redirigé.

**Où / comment :** `yada-addon119` — `window.yadaConfirm(msg, onYes, opts)` et `window.yadaPrompt(msg, valeur, onOk, opts)` (callback, modale `.ya-ov`/`.ya-card`, réutilise le style de `yadaAlert`/addon118 + `<style id="ya-confirm-mod">`). **~49 confirmations** et **~15 saisies** converties (fire-and-forget → callback ; séquences de prompts imbriquées ; confirmations conditionnelles via fonction `_go`/`_gen`). **2 cas laissés en natif** (garde à retour synchrone) : `quitterRappro` (renvoie `false` pour bloquer la navigation) et la renumérotation de compte tiers dans `tiersEnregistrer` (garde au milieu d'un enregistrement synchrone). Aucune logique comptable modifiée. Badge → **v223**.

---

## 🟢 MAJ précédente — Messages d'alerte aux couleurs YADA (fin des `alert()` natifs) — v222
**Quoi :** le message « ⚠ Écriture non soldée » (affiché quand on tente de quitter l'éditeur avec une écriture déséquilibrée) — et plus largement les alertes — s'affichent désormais dans une **modale soignée aux couleurs YADA (bleu nuit + bleu Crystal)** au lieu de la **boîte `alert()` native** du navigateur (« …github.io indique »). En-tête avec titre + pastille **YADA**, corps lisible, bouton **OK** ; **Échap / Entrée / clic dehors** ferment. La modale passe **au-dessus** de l'éditeur et des listes (z-index élevé).

**Où / comment :** `yada-addon118` — `window.yadaAlert(msg, titre)` (création d'un overlay `#yada-alert`, `<style id="ya-alert-mod">`). `ecFermer` appelle `yadaAlert(msg,'⚠ Écriture non soldée')` (repli `alert`/`toast` si indisponible). Aucune logique modifiée (le blocage de fermeture v216 reste identique). Badge → **v222**.

---

## 🟢 MAJ précédente — Saisie au journal : clic droit pour saisir, en-têtes répétés par ligne, navigation clavier complète (flèches) — v221
**Quoi :** refonte de la **saisie au journal** (Consultation + éditeur `.ec-sage`) : (1) **plus de bouton « Éditer le journal du mois »** — on fait désormais **clic droit sur une écriture** du journal → « ✎ Saisir / éditer ce journal » (ouvre l'éditeur) ; (2) dans l'éditeur, le **journal**, la **pièce** et le **libellé** **suivent toutes les lignes** de l'écriture (journal + pièce + libellé affichés sur chaque ligne jusqu'au solde ; le **libellé est identique** sur toutes les lignes — édité sur la 1re ligne, répliqué via `ecSetLibAll`) ; (3) les **comptes de tiers 401000000 / 411000000** apparaissent **avec les comptes auxiliaires fournisseurs / clients** dans l'autocomplétion ; (4) **navigation clavier complète** : **↓/↑** choisissent le compte dans la liste (sinon cellule dessous/dessus), **→/←** passent au champ suivant/précédent (au bord du champ ; toujours sur les montants), **Tab/Maj+Tab** champ suivant/précédent, **Entrée** = « passer à la suite » (valide le compte sélectionné dans la liste puis avance).

**Où / comment :** `ecRender` (journal/pièce/libellé sur chaque ligne, `ec-ro` en lignes suivantes, `ecSetLibAll`) ; `addon85` (`ecSuggMove`/`ecSuggConfirm` + item actif `.act`) ; `addon114` réécrit (gestion Tab/Entrée/flèches + liste de comptes) ; `addon117` (clic droit `#sgj-ctx` sur `.sgj` → `ouvrirJournalEditable` ; styles `ec-ro`/`sgj-hint`) ; `sgJournalGrid` (bouton retiré, `data-jrn`/`data-per`). Aucune logique comptable modifiée. Badge → **v221**.

---

## 🟢 MAJ précédente — Consultation des journaux : défilement (molette) pour voir TOUTES les écritures — v220
**Quoi :** dans la **Consultation des comptes**, quand on sélectionne un **journal** (ACH, VTE, BQ, ODP, ODC, ODTVA, OD), la grille des écritures **défile désormais à la molette** pour voir **toutes les écritures**, même longues (ex. journal ACHATS de plusieurs centaines de lignes). Avant, le contenu **débordait** sous la fenêtre (rogné par `.sg-app{overflow:hidden}`) au lieu de défiler.

**Pourquoi / cause :** la zone de droite `.sg-right` est une **cellule de grille CSS** ; sans `min-height:0`, un enfant en `overflow:auto` ne peut pas défiler (la cellule grandit au-delà de la piste et déborde). 

**Où / comment :** `yada-addon116` — `<style id="sg-scroll-mod">` : `.sg-right{min-height:0}` + `.sgj-wrap{min-height:0}` + `.sgj-grid/.sg-grid{overflow:auto;min-height:0}` (+`overscroll-behavior:contain`). 100% CSS additif, aucune logique modifiée. Badge → **v220**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : navigation clavier (Tab / Entrée) + retrait du bouton « + Ajouter une désignation » — v219
**Quoi :** (1) **navigation clavier façon tableur** dans l'éditeur d'écritures (`.ec-sage`) — **TAB / MAJ+TAB** = champ suivant / précédent (gauche→droite puis ligne suivante, avec bouclage) ; **ENTRÉE** = descend dans la **même colonne** (cellule du dessous), et en bas d'une écriture passe à la première ligne de l'écriture suivante. (2) **Retrait du bouton « + Ajouter une désignation »** (l'insertion se fait au **clic droit**, addon113) ; le bouton **« Solder l'écriture »** reste visible.

**Pourquoi :** la validation d'un champ relance `ecRender` (table reconstruite) → le Tab/Entrée natif perdait le focus. On re-cible le champ par ses **coordonnées** après reconstruction.

**Où / comment :** `yada-addon114` — écouteur `keydown` (capture) : sur Tab/Entrée dans un `input.ec-i` de `#ec-win`, `blur()` (valide) puis re-focus par coordonnées (`data-eid`/`data-li`/`cellIndex` via `cellInput`/`editInputs`/`ecrOrder`). `yada-addon115` — `<style id="ec-noadd-mod">` masque `.ec-act .ec-bt:not(.ec-bt-solde)`. Aucune logique comptable modifiée. Badge → **v219**.

---

## 🟢 MAJ précédente — Éditeur d'écritures : saisie directe « tableur » (champs plats, clic droit pour insérer, date sur toutes les lignes, colonnes fixes) — v218
**Quoi :** l'**éditeur d'écritures** (`.ec-sage`) devient une vraie grille de saisie directe, plus simple : (1) **saisie directe sur le texte ET les montants** — champs **totalement plats**, **aucune bulle / aucun cercle / aucun halo** au focus (juste un léger fond bleu) ; (2) **insérer une ligne au CLIC DROIT** (menu contextuel « ↧ Insérer une ligne » / « 🗑 Supprimer la ligne ») — le **bouton ✕ (cercle rouge)** par ligne est **masqué** ; (3) la **date** de l'écriture est **répétée sur toutes les lignes** (jusqu'au solde) en **texte éditable (jj/mm/aaaa)** — **plus aucun sélecteur de date** ; (4) **tableau à colonnes FIXES** (`table-layout:fixed`) : tout reste en place quand on **agrandit / redimensionne** la fenêtre.

**Où / comment :** `yada-addon113` — `<style id="ec-tableur-mod">` (colonnes `cw-*` fixes, champs plats, ✕ masqué, menu `#ec-ctx`) + helpers `window.ecSetDateTxt(id,v)` (parse jj/mm/aaaa → ISO) et `window.ecInsertLine(id,i)` + écouteur `contextmenu` (capture) sur `tr.ec-r` de `#ec-win`. `ecRender` génère désormais `data-eid`/`data-li` par ligne, la **date-texte sur chaque ligne** (`ec-datetxt`, plus de `type=date`) et un **`<colgroup>`** à largeurs fixes. Aucune logique comptable modifiée. Badge → **v218**.

---

## 🟢 MAJ précédente — Éditeur d'écritures (Compte auxiliaire / Consultation) : refonte sobre façon Sage aux couleurs YADA — v217
**Quoi :** l'**éditeur d'écritures** façon Sage (`.ec-sage` — Compte auxiliaire, double-clic sur un compte, « Saisir une opération ») est rendu **plus sobre, plus dense et plus léger**, au plus près du **format Sage** mais aux **couleurs YADA (bleu nuit + bleu Crystal)** : (1) suppression des **bandeaux « Écriture i / N · Pièce · Équilibrée ✓ »** (moins de texte, moins de cadrage) ; (2) une **seule ligne bleu Crystal (#1e90ff, 2px)** fine **après chaque écriture SOLDÉE** (la logique v216 est inchangée : aucune ligne après une écriture non soldée) ; (3) **lignes serrées + champs compacts** (densité façon journal Sage) ; (4) ligne d'actions **allégée** (sans fond ni « Soldée ✓ », bouton « + Ajouter » discret — « Solder l'écriture » conservé) ; (5) en-tête/pied **aplatis**.

**Où / comment :** `yada-addon112` injecte `<style id="ec-epure-mod">` en fin de `<head>` (prioritaire dans la cascade) ; **100% CSS**, aucune logique modifiée (séparateur conditionné au solde + fermeture bloquée tant qu'une écriture n'est pas soldée restent tels quels). Badge → **v217**.

---

## 🟢 MAJ précédente — Consultation / journal éditable : pas de quitter une écriture non soldée + ligne bleue seulement après écriture soldée — v216
**Quoi :** dans l'éditeur de journal/compte (Consultation des comptes), (1) la **ligne bleue de séparation** n'apparaît **qu'après une écriture SOLDÉE** (équilibrée) — déjà le cas (`if(ok)` dans `ecRender`, ligne `ec-redrow`/`ec-soldee`) ; les écritures soldées avant une écriture modifiée gardent leur ligne ; (2) **impossible de fermer la page** tant qu'une écriture n'est pas soldée — un **message d'erreur** s'affiche à chaque tentative de sortie, avec la pièce et l'écart Débit/Crédit. Aucun changement de format/encadrement.

**Où / comment :** `ecFermer` — ajout d'un contrôle : si une écriture a `Σdébit ≠ Σcrédit` (≥ 0,005), `alert(...)` détaillé et `return` (fermeture bloquée). La logique de la ligne bleue (uniquement après écriture équilibrée) était déjà en place. Badge → **v216**.

---

## 🟢 MAJ précédente — Charges & Paie : suppression des fiches de paie et des tableaux/documents de charges — v214
**Quoi :** boutons **🗑 Supprimer** ajoutés pour retirer une **fiche de paie** (depuis la liste), un **bulletin déposé**, et un **document de charges** déposé (journal de paie). Les écritures de paie/charges restaient déjà supprimables (`pjSupprimer`, `bpSupprimerOD`, `cpSupprimerMois`, `pjReset`).

**Où / comment :** `bpCard` — bouton 🗑 par fiche (`bpSupprimer`) + 🗑 par bulletin déposé (`bpSupprPiece` retire la pièce de `db.parametres.pieces`) ; `pjCard` (addon93) — `pjSupprDoc(m)` retire le document de charges du mois (`d.doc` + pièce `cat:'paie'`). Badge → **v214**.

---

## 🟢 MAJ précédente — Tiers : montants réels par ligne + un seul tiers par nom (auto-fusion) + ligne bleue dans la Consultation — v207
**Quoi :** (1) la liste des Tiers affiche le **vrai total** (CA TTC clients / Dépensé TTC fournisseurs) calculé depuis les **écritures** du compte de tiers ; (2) les doublons de même nom sont **fusionnés automatiquement en un seul compte** (tous les montants regroupés) ; (3) une **ligne bleue** sépare chaque écriture dans la **Consultation des comptes** (grand-livre).

**Pourquoi :** les lignes de tiers affichaient 0 pour les comptes alimentés par le FEC (pas de `db.factures`) ; plusieurs « HABITAT CONCEPT » subsistaient ; et la ligne bleue n'apparaissait pas dans le grand-livre.

**Ce qu'il fait :**
- **`statsTiers`** : total depuis les écritures sur `c9(compteAux)` — client = Σ débits, fournisseur = Σ crédits (+ TVA estimée) ; repli sur `db.factures`.
- **`auxLignes` corrigé** : rattache aussi les lignes portées **directement sur le compte auxiliaire** (FEC + factures depuis v201), pas seulement le collectif via facture → le grand-livre montre tous les mouvements du tiers.
- **Auto-fusion** (`tiersConsoliderDoublons`, appelée au rendu de la page Tiers) : fusionne les groupes de même nom normalisé en **un seul** compte (déplace les lignes `c9(compteAux)` des doublons vers le maître, rattache factures/docs/banque/règlements) ; **sécurité** : ne fusionne pas si SIRET différents (alerte + fusion manuelle). Bouton « Fusionner » manuel conservé.
- **Ligne bleue** entre écritures (`lx-ecr-sep`) dans le grand-livre auxiliaire (`auxLignes`) **et** la consultation lecture seule (`#cl-overlay`).

**Où / comment :** `statsTiers`, `auxLignes`, `_fusionGroupeTiers`/`tiersConsoliderDoublons` + greffe `pageTiers`, CSS `lx-ecr-sep` (addon110). Badge → **v207**.

---

## 🟢 MAJ précédente — Tiers : doublons clients/fournisseurs fusionnés en UN seul compte (montants regroupés) + dédoublonnage à la réception — v206
**Quoi :** quand un client (ex. **HABITAT CONCEPT**) apparaît plusieurs fois dans les tiers, la **fusion** ne garde **qu'une fiche** et **regroupe tous les montants saisis** sur **ce compte tiers** (les lignes d'écriture du compte auxiliaire des doublons sont déplacées vers celui de la fiche conservée). La **réception** des factures clients ne crée plus de doublon (réutilisation du tiers existant).

**Pourquoi :** les factures clients reçues créaient un nouveau client à chaque fois (plusieurs « HABITAT CONCEPT ») ; l'utilisateur veut une alerte de doublon, une seule fiche par client et tous les montants regroupés sur ce compte.

**Ce qu'il fait :**
- **Alerte doublon** (déjà existante) : tag **DOUBLON** + carte « Doublons fournisseurs / clients » (`scanDoublonsTiers`/`blocDoublonsTiers`, normalisation du nom).
- **Fusion corrigée** (`tiersFusionner`) : choisit la fiche maître (la plus active / compte personnalisé), rattache factures/`docs`/écritures/banque/règlements, **et déplace les lignes d'écriture `c9(compteAux)` des doublons vers `c9(compteAux)` du maître** → tous les montants sur un seul compte tiers. `compteAuxCustom=true` sur le maître.
- **Dédoublonnage à la création** : `integrerFEC`/`trouverOuCreerTiers` (FEC), `ficheValider` (dépôt « client/fournisseur inconnu ») et `faClientEmettre` (nouveau client) **réutilisent** un tiers du même nom (comparaison **normalisée** : majuscules, sans accents ni ponctuation) au lieu d'en recréer un.

**Où / comment :** `tiersFusionner` (consolidation des lignes via `c9`), `trouverOuCreerTiers`/`ficheValider`/`faClientEmettre` (réutilisation par nom normalisé). Badge → **v206**.

**Limites :** le rapprochement se fait sur le **nom normalisé** ; deux entités réellement distinctes au même nom devraient être distinguées manuellement (bouton « Laisser »).

---

## 🟢 MAJ précédente — Import FEC : écritures classées par libellé (OD PAIE / OD CHARGES / OD TVA / OD) + ligne bleue entre écritures — v205
**Quoi :** à l'import FEC, chaque écriture d'O.D. est placée dans le **bon journal d'après son libellé** : « OD PAIE » → **OD PAIE (ODP)**, charges (CHARGE/COTISATION/URSSAF/PATRONAL) → **OD CHARGES (ODC, nouveau journal)**, TVA → **OD TVA (ODTVA)**, le reste → **OD (Opérations diverses)**. Les écritures de charges générées par la paie vont aussi en **ODC**. Une **ligne bleue** sépare chaque écriture dans le Journal comptable.

**Où / comment :**
- Nouveau journal **`ODC` (OD CHARGES)** dans `journauxDefaut`.
- `fecJournalMoteur(code, jlib, ecrLib)` classe les O.D. par libellé (TVA → ODTVA ; CHARGE/COTISATION/URSSAF/PATRONAL → ODC ; PAIE/SALAIRE/BULLETIN → ODP ; sinon OD) ; `integrerFEC` transmet le libellé d'écriture.
- Paie : `posterPaieMois` et `bpGenererODMois` postent l'**OD CHARGES en journal ODC** ; idempotence (`paieDejaPostee`, `bpODFaite`/`bpSupprOD`) gère ODP **et** ODC.
- Affichage : `ODC` ajouté à `sgJournaux`, `sgJournalGrid`, `journauxDoc`, `centralisateurDoc`, filtre éditeur.
- `yada-addon110` : ligne bleue (`border-top:2px #1e90ff`) entre chaque `.ecr` de la page Journal comptable (le grand-livre/Consultation ont déjà `sgj-ecr-sep`). Badge → **v205**.

**Limites :** la classification se base sur des mots-clés du libellé/journal FEC (tolérante mais heuristique).

---

## 🟢 MAJ précédente — Charges & Paie : 2 onglets (Paie / Charges) + vérification du bulletin avant génération — v204
**Quoi :** le module **Charges & Paie** est organisé en **2 onglets — « Paie (bulletins de salaire) » et « Charges (cotisations & organismes) »** — et la modale d'un bulletin affiche un **panneau de Vérification & Validation** avant la génération de l'écriture de paie.

**Pourquoi :** l'utilisateur veut déposer un bulletin (scan/OCR/saisie), voir toutes les informations reprises et **vérifiées** (société employeur, période, salarié, compte 421, cumuls, taux, montants, cotisations), puis valider et générer l'écriture.

**Ce qu'il fait :**
- **Onglets Paie / Charges** (`cpTabPC`) : « Paie » = bulletins de salaire (`.bp-card` : dépôt → OCR → fiche éditable → génération) ; « Charges » = journal de paie + cotisations patronales / organismes (cartes héritées).
- **Panneau de vérification** (`bpVerifHTML`, injecté dans `bpVoir`) : 🏢 **Société employeur** (raison, adresse, SIRET), 📅 **Période**, 👤 **Salarié** (nom, n° SS, emploi, statut), 💼 **Compte de personnel 421** (net à payer), 📊 **Cumuls annuels** (brut / net imposable / net à payer / charges patronales, sur les bulletins de l'année), ✅ **Contrôle des calculs** : chaque cotisation (montant = base × taux, parts salariale & patronale) + total cotisations + net à payer, avec ✓/✗ et l'écart attendu. Badge « Calculs cohérents ✓ » global.
- L'écriture (OD de paie + OD de charges) se génère ensuite via le panneau existant (addon106).

**Où / comment :** `yada-addon109` — réorganise les enfants de `.cp-scroll` en 2 `.cp-pane` + barre `.cp-pc-tabs` (greffe `pageChargesPaie`) ; `bpVerifHTML` réutilise `window.bpCalc` (exposé par addon106) ; greffe sur `bpVoir` pour insérer le panneau avant les « Écritures proposées ». CSS `<style id="cp-pc-mod">`. Badge → **v204**.

**Limites :** l'OCR des bulletins scannés nécessite le réseau (addon52) ; le contrôle vérifie la cohérence base × taux = montant (tolérance 0,02 €) — les taux/bases restent modifiables sur la fiche.

---

## 🟢 MAJ précédente — Sociétés (portefeuille) : bouton « Accéder à Qonto » — v203
**Quoi :** dans **Sociétés (portefeuille)**, un bouton cliquable **« 🏦 Accéder à Qonto »** ouvre le compte bancaire **Qonto** (application `https://app.qonto.com`) dans un nouvel onglet. Le lien « Accéder à Qonto » de chaque ligne de dossier ouvre désormais réellement Qonto (au lieu d'ouvrir le dossier).

**Où / comment :** `accederQonto(url)` (`window.open(url||'https://app.qonto.com','_blank','noopener,noreferrer')`) ; bouton ajouté dans l'entête de la carte « Portefeuille d'entreprises » (`cabinetApercu`) ; lien par ligne (`cabinetTable`) → `accederQonto(d.qontoUrl||'')` (URL Qonto propre au dossier si renseignée, sinon l'app générique). Badge → **v203**.

---

## 🟢 MAJ précédente — Facturation : « Conditions de paiement » à la place du délai en jours — v202
**Quoi :** dans la création de facture (Espace Client **et** fenêtre cabinet), la case **« Délai de paiement (jours) »** est remplacée par une liste **« Conditions de paiement »** (À réception, 8 / 15 / 30 / 45 / 60 jours, 30 / 45 jours fin de mois). La date d'échéance se calcule automatiquement selon la condition choisie ; la condition est imprimée sur la facture.

**Où / comment :** `yada-addon108` — `FA_CONDITIONS`, `faCondDefaut`, `faCondOptions`, `faEcheanceFromCond` (+ `lastDayOfMonthISO` pour « fin de mois ») ; `faEcheanceAuto`/`nfEcheanceAuto` lisent `fa-cond`/`nf-cond`. Champs `fa-cond`/`nf-cond` (selects) à la place de `fa-delai`/`nf-delai` dans `faClientCreer`, `pageFacturation`, `nfFormHTML`. `emettre` enregistre `doc.conditions` (affiché par `docHTML`). Réglage **« Conditions de paiement par défaut »** dans `factParamCard`/`factParamSave` (`db.societe.conditionPaiement`, + `delaiPaiement` dérivé pour compat). Badge → **v202**.

---

## 🟢 MAJ précédente — Facture fournisseur : écriture ACH avec le compte de tiers complet (401GASO00) — v201
**Quoi :** l'**écriture d'achat** (journal ACH), en aperçu **et** générée, utilise désormais le **compte de tiers complet (auxiliaire)** — ex. **401GASO00** — au lieu du collectif 401000000, et l'aperçu affiche les comptes en **codes 9 chiffres** dans l'ordre **401 (tiers) / 445xxx (TVA) / 606xxx (charge)**.

**Pourquoi :** l'utilisateur veut voir, dans « l'écriture qui sera générée », le compte de tiers réel (401GASO00) puis la TVA déductible puis le compte de charge.

**Où / comment :**
- `posterFacture` remplace la ligne collective 401/411 par `tiers.compteAux` (centralisé — vaut pour achats **et** ventes, manuels comme déposés ; les dépôts le faisaient déjà via `posterFactureAux`).
- `majAc` (aperçu ACH) : ordre **tiers (compteAux, `c9`) / TVA (`tiers.compteTVA`, `c9`) / charge (`c9`)**, libellés complets. `validerAchat` transmet `tiers.compteTVA`. Aperçu autoliquidation aligné sur le compte auxiliaire.
- Les cartes de comptabilisation des **dépôts** restent pré-remplies (OCR/scan/saisie, addon48/50) et utilisent ces mêmes comptes. Badge → **v201**.

**Limites :** le code TVA exact (ex. 445667000) et le compte de charge (ex. 606200000) proviennent de la **fiche du tiers** (compteTVA / compteContre) — à régler sur la fiche pour qu'ils apparaissent tels quels.

---

## 🟢 MAJ précédente — Facture : échéance auto (émission + délai) + adresse société sur 2 lignes — v200
**Quoi :** (1) la **date d'échéance** se calcule **automatiquement** = date d'émission + **délai de paiement** (30 j par défaut, modifiable) ; recalcul à chaque changement de la date d'émission OU du délai. (2) l'**adresse de la société** (ex. ALR CONSEIL) est **mise à la ligne** sur la facture A4 (rue / code postal + ville).

**Où / comment :**
- `yada-addon108` : `addDaysISO(iso,n)`, `faDelaiDefaut()` (= `db.societe.delaiPaiement` ?? 30), `faEcheanceAuto()` (champs `fa-*`) et `nfEcheanceAuto()` (fenêtre cabinet `nf-*`). Champs **« Délai de paiement (jours) »** ajoutés dans `faClientCreer`, le formulaire `pageFacturation` et la fenêtre `nfFormHTML` ; `fa-date`/`nf-date` `onchange` → recalcul de l'échéance ; valeurs initiales d'échéance déjà calculées. Réglage **« Délai de paiement par défaut »** dans `factParamCard`/`factParamSave` (`db.societe.delaiPaiement`).
- `adrLignes(adresse,cp,ville)` (avant `docHTML`) : coupe la rue / le code postal (5 chiffres) — sinon vers le 15e caractère sans couper un mot ; utilisé pour le bloc société **et** client dans `docHTML`.
- Badge → **v200**.

---

## 🟢 MAJ précédente — Facturation cabinet : liste des factures agrandie (pleine largeur, 25/page) — v199
**Quoi :** la **liste des factures de génération** (page « Client » côté cabinet) est **agrandie** : affichée en **pleine largeur** (au lieu d'une colonne étroite avec défilement horizontal) et **25 factures par page** au lieu de 10.

**Où / comment :** `addon73` ne **scinde plus** `pageFacturation` en 2 colonnes (cabinet) → la liste `factureListe` occupe toute la largeur ; `factureListe` : `per` 10 → **25**. `addon73` continue de scinder `pageAchats`. Badge → **v199**.

---

## 🟢 MAJ précédente — Facturation client : retrait de la « saisie rapide » (page épurée) — v198
**Quoi :** suppression du module **« Émettre un document client (saisie rapide) »** de la page **Facturation client** (menu « Client ») pour une présentation plus paisible et harmonieuse.

**Où / comment :** `pageFacturation` ne rend plus `formulaireRapide()` ; le bouton **« ↧ Saisir »** (qui reprenait une facture dans la saisie rapide) est retiré de `factureListe` — la comptabilisation reste accessible via **« ⚙️ Générer »** sur chaque ligne. Sous-titre de la page mis à jour. `formulaireRapide`/`faReprendre` restent définis (inutilisés) ; aucune autre fonction impactée. Badge → **v198**.

---

## 🟢 MAJ précédente — Module Client : facture créée → liste + génération en un clic — v197
**Quoi :** refonte du **Module Client (Facturation)**. Une facture de vente créée est **immédiatement ajoutée à la liste « Mes factures de vente »** (toujours visible), puis **son écriture se génère depuis cette liste** (tableau de génération, pré-rempli) au lieu d'être comptabilisée automatiquement.

**Pourquoi :** l'utilisateur veut voir la facture toujours dans la liste et pouvoir la générer/pré-saisir dans un tableau de génération, avec une interface simple et intuitive.

**Ce qu'il fait :**
- **« Créer la facture »** crée le document (statut *valide*, **non comptabilisé**) → il apparaît aussitôt dans **« Mes factures de vente »** avec le statut **« À générer »** (ligne surlignée).
- **« ⚙️ Générer l'écriture »** dans la liste comptabilise la facture (`genererEcritureDoc` → écriture VTE équilibrée, TVA collectée transmise) ; la facture **reste dans la liste** et passe à **« Comptabilisée ✓ »**.
- KPIs : Total TTC facturé · À générer · Comptabilisées. Actions par ligne : Voir / Générer / Envoyer / → Facture (devis).

**Où / comment :** `emettre(valider, skipGen)` — nouveau paramètre `skipGen` (côté client) ne poste pas l'écriture à la validation. `faClientEmettre` appelle `emettre(valider,true)`. Nouvelle fonction `faClientFactures()` (liste complète + génération) remplace `faClientRecentes`/`suiviFacturesVente` dans `pageFacturationClient` (colonnes « Créer / Déposer » | « Mes factures de vente »). Badge → **v197**.

---

## 🟢 MAJ précédente — Lisibilité des listes déroulantes (option) — v196
**Quoi :** correctif d'**affichage** des menus déroulants natifs (`<select>`/`<option>`). Sur le thème noir, le texte des options (ex. « Compte de contrepartie ») était **peu lisible** (terne) car les `<option>` n'avaient aucune couleur explicite.

**Où / comment :** `yada-addon107` injecte un `<style id="option-readability">` qui force, **par thème**, un fond opaque + un texte contrasté sur les `<option>` (noir : fond bleu nuit `#0c1a2a` / texte clair ; clairs : fond blanc / texte foncé) et une **surbrillance bleue** (`#0a64d6`, texte blanc) sur l'option sélectionnée/survolée. 100% additif. Badge → **v196**.

---

## 🟢 MAJ précédente — Tiers : numéro de compte (401/411) modifiable — v195
**Quoi :** dans la fiche **Modifier — <tiers>**, on peut désormais **changer le numéro de compte tiers** (401XXXX pour un fournisseur, 411XXXX pour un client). La renumérotation **met à jour les écritures existantes** du tiers pour qu'elles restent rattachées.

**Où / comment :** `tiersEditer` ajoute le champ `te-aux` ; `tiersEnregistrer` valide le préfixe (401/411 selon le type), l'unicité (aucun autre tiers), la longueur (≤9), puis remplace `c9(ancien)` par `c9(nouveau)` dans toutes les lignes d'écriture (avec confirmation si des écritures existent) et marque `t.compteAuxCustom=true`. `migrerAuxTiers` **préserve** les numéros saisis manuellement (ne les régénère plus). Badge → **v195**.

---

## 🟢 MAJ précédente — Création de dossier : Statuts facultatifs — v194
**Quoi :** lors de la **création d'un dossier**, les **Statuts ne sont plus obligatoires** (seul le K-bis reste requis). On peut créer le dossier sans joindre les statuts et les ajouter plus tard.

**Où / comment :** `creerDossierComplet()` — suppression du blocage `if(!cdDocs.statuts)…` ; `statutsRecu/statutsNom/statutsPdf` renseignés seulement si un fichier est joint ; libellés du formulaire (« Statuts (facultatif) ») et toast adaptés. Badge → **v194**.

---

## 🟢 MAJ précédente — Paie : écritures visibles (carte Bulletins + Journal comptable) — v192
**Quoi :** correctif de **visibilité des écritures de paie**. Les OD de paie / OD de charges (journal `ODP`) sont désormais affichées **directement dans la carte Bulletins de paie** (pas seulement dans la modale du bulletin) et apparaissent dans le **Journal comptable imprimable** et le **centralisateur**.

**Pourquoi :** l'utilisateur ne voyait pas les écritures générées — elles n'apparaissaient que dans la modale du bulletin, et le journal comptable imprimable (`journauxDoc`) n'affichait que `ACH/VTE/BQ/OD` (pas `ODP`/`ODTVA`).

**Ce qu'il fait :**
- La carte **Bulletins de paie** intègre le panneau **« Écritures proposées / ✅ Écritures comptabilisées »** (détail OD de paie + OD de charges, statut, bouton générer/régénérer/supprimer) en plus de la modale.
- Indication explicite « Retrouvez ces écritures dans le **Journal comptable** (filtre OD) et la **Consultation des comptes** (641, 645, 421, 431, 437, 442) ».
- `journauxDoc`/`centralisateurDoc` ajoutent **`ODP` (OD - PAIE)** et **`ODTVA` (OD - TVA)** quand des écritures existent (corrige aussi la visibilité de la paie/TVA héritée).

**Où / comment :** `yada-addon106` — `bpODApercu(m)` injecté dans `bpCard` ; `journauxDoc`/`centralisateurDoc` : liste de journaux = `['ACH','VTE','BQ','OD']` + `ODP`/`ODTVA` présents. Badge → **v192**.

---

## 🟢 MAJ précédente — Paie : génération de la fiche + proposition des OD de paie ET de charges — v191
**Quoi :** après la saisie d'une fiche de paie, YADA **génère le bulletin** (aperçu A4) puis **propose de comptabiliser** l'**OD de paie** (salaires) **et** l'**OD de charges** (patronales) du mois — deux écritures distinctes et équilibrées.

**Pourquoi :** l'utilisateur veut, suite à la saisie d'une fiche, voir la fiche générée et se voir proposer la génération des écritures d'OD de paie et d'OD de charges.

**Ce qu'il fait (description fonctionnelle) :**
- Bouton **« ✅ Générer la fiche de paie »** dans l'éditeur → ouvre l'**aperçu A4** du bulletin et, en dessous, un panneau **« Écritures proposées »** montrant le détail des deux écritures (OD de paie + OD de charges) agrégeant **toutes les fiches du mois**, avec un bouton **« ⚙️ Générer l'OD de paie et l'OD de charges »**.
- **OD de paie** (équilibrée) : 641 (brut) + 648 (primes panier/transport) au débit = 645100000/645300000 (cotisations salariales) + 442100000 (PAS) + 421 (net à payer) au crédit.
- **OD de charges** (équilibrée) : 645100000/645300000 (charges patronales) au débit = 431000000 (URSSAF) + 437300000 (caisses retraite/prévoyance) au crédit.
- **Idempotent par mois** : régénérer **remplace** les écritures « OD PAIE / OD CHARGES » du mois (jamais de doublon) ; statut affiché (« déjà comptabilisées ») ; bouton de suppression.

**Où / comment (description technique) :**
- `yada-addon106` : `bpCalc` expose la décomposition salariale/patronale par organisme (`salUrssaf/patUrssaf/salPrev/patPrev/salCsg/patCsg`) ; `bpAgg(m)` agrège les fiches du mois ; `bpLignesPaie`/`bpLignesCharges` construisent les deux écritures équilibrées ; `bpGenererODMois(m)` supprime puis re-poste « OD PAIE/OD CHARGES »+pièce via `posterOD` (journal ODP, dernier jour du mois) ; `bpFinaliser(id)` enregistre + ouvre `bpVoir` (A4 + aperçu des OD via `bpODApercu`). `bpODStatut(m)` / `bpSupprimerOD(m)`.
- Badge de version → **v191**.

**Limites assumées :** une seule OD de paie et une seule OD de charges par mois (agrégat de toutes les fiches) ; net à payer = brut − cotisations salariales − PAS + primes non soumises ; taux par défaut indicatifs, modifiables ligne par ligne.

---

## 🟢 MAJ précédente — Charges & Paie : bulletins de paie éditables (modèle français) + OD de paie multi-mois — v190
**Quoi :** un module **Bulletins de paie** dans Charges & Paie qui **génère des fiches de paie au modèle français** dont **tous les éléments sont modifiables** (gains, cotisations salariales & patronales, primes, PAS), pour **plusieurs salariés** et **plusieurs mois**, avec **récupération de plusieurs bulletins déposés** et alimentation automatique du **Journal de paie** (addon93) pour produire les **OD de paie**.

**Pourquoi :** l'utilisateur veut que YADA repère les bulletins de paie déposés, génère des fiches de paie entièrement éditables (sur le modèle fourni), récupère les informations de plusieurs fiches et de plusieurs mois de journal de paie pour les OD.

**Ce qu'il fait (description fonctionnelle) :**
- **Fiche de paie éditable** (`yada-addon106`) : création/édition d'un bulletin au modèle français (employeur depuis `db.societe`, salarié, gains avec nombre/taux/montant, **table de cotisations** où base, taux salarial, part salariale, taux patronal, part patronale sont **tous modifiables** — ajout/suppression de lignes), primes non soumises (panier, Navigo), **PAS** (taux ou montant). Totaux en direct : brut, cotisations salariales, **net imposable**, **net à payer**, charges patronales, coût employeur.
- **Aperçu A4 + impression** du bulletin (`bpVoir`/`bpImprimer`).
- **Multi-salariés / multi-mois** : chaque fiche est rattachée à un mois ; la liste du mois affiche brut/net imposable/net à payer/charges patronales + totaux.
- **Dépôt de plusieurs bulletins** : `bpDepot` (sélection multiple) stocke dans `db.parametres.pieces` (cat `bulletin`) ; **OCR auto quand connecté** (réutilise `window.ocrImage`) → crée une fiche pré-remplie ; repli saisie manuelle (scans sans couche texte).
- **OD de paie du mois** : `bpGenererODMois` **agrège toutes les fiches du mois**, reporte les totaux dans `db.parametres.paieJournal[mois]` (clés `brut/urssaf/csg/prev/panier/navigo/pas`) et appelle **`pjGenerer`** (addon93) → écriture **OD PAIE équilibrée** (641 / 6451 / 6453 / 648 / 4421 / 421).

**Où / comment (description technique) :**
- `yada-addon106` : greffe sur `pageChargesPaie` (injection de `bpCard()` avant la carte `.pj-card`). Données dans `db.parametres.bulletins.fiches[]` (chaque fiche : salarié, `gains[]`, `cotis[]` avec org `urssaf/prev/csg` + `ded`, panier/navigo/PAS). `bpCalc(f)` calcule brut/net/charges + les clés du Journal de paie ; `bpGenererODMois` agrège puis délègue à `pjGenerer` (réutilisation testée, OD garantie équilibrée). Rendu A4 `bpBulletinHTML`, CSS `<style id="bp-mod">`. 100% additif.
- Badge de version → **v190**.

**Limites assumées :** les **taux de cotisation par défaut sont indicatifs** (modèle simplifié 2024) et **entièrement modifiables** ligne par ligne ; l'OCR des bulletins **scannés (images)** nécessite le réseau (Tesseract.js, addon52), les PDF scannés sans couche texte → saisie manuelle ; l'OD de paie suit le mapping pré-compta de l'addon93 (net à payer en équilibrage), garanti équilibré.

---

## 🟢 MAJ précédente — Facture Client : aperçu A4 en direct + indemnité de recouvrement 40 € — v189
**Quoi :** deux finitions du module **Facture Client** : (1) une **prévisualisation au format A4 mise à jour en direct** pendant la création d'une facture/devis, et (2) l'ajout automatique de l'**indemnité forfaitaire de recouvrement (40 €)** au montant dû de chaque facture **en retard** dans le **Suivi des règlements**.

**Pourquoi :** l'utilisateur veut voir la facture exactement telle qu'elle sera imprimée pendant qu'il la saisit (désignations, RIB, conditions), et veut que le montant réclamé en cas d'impayé inclue l'indemnité de 40 € déjà mentionnée sur la facture (art. L441-10 / D441-5 du Code de commerce).

**Ce qu'il fait (description fonctionnelle) :**
- **Aperçu A4 en direct** (`yada-addon105`) : sous le formulaire d'émission, un panneau « 📄 Aperçu de la facture (format A4 · mis à jour en direct) » rend la **vraie page A4** (`docHTML`) à chaque frappe — désignations saisies, Qté masquée pour les **prestations** / affichée pour les **produits/marchandises**, totaux HT/TVA/TTC, conditions (TVA, escompte, indemnité 40 €), **RIB en bas**. N° de facture prévisualisé sans consommer le compteur.
- **Indemnité 40 € dans le Suivi des règlements** (`yada-addon98`) : chaque facture en retard se voit ajouter `frais = db.societe.fraisRecouvrement ?? 40` ; nouvelles colonnes **Frais (40 €)** et **Total dû** dans les tableaux Clients/Fournisseurs ; KPI « Total dû (frais inclus) » + « Dont indemnités de recouvrement » ; l'alerte impayés (≥3 retards) et ses pièces jointes affichent restant + frais + total dû.

**Où / comment (description technique) :**
- `yada-addon105` : greffe sur le **binding global** `faMaj` (`var _f=faMaj; faMaj=function(){…; refreshA4();}`) — intercepte aussi l'appel interne de `render` (`if(current==='facturation'…) faMaj()`), donc l'aperçu se peint au premier affichage ET à chaque oninput/onchange. `draftDoc()` lit `fa-type`/`fa-client`/`fa-date`/`fa-ech` + `faLignes` + `faTotaux()` + paramètres `db.societe` ; `ensureA4()` insère `#fa-a4-wrap`/`#fa-a4` juste après `#fa-apercu` ; CSS `<style id="fa-a4-mod">` (cadre gris, `.inv` mis à l'échelle, responsive mobile). 100% additif, aucune écriture créée.
- `yada-addon98` : `regLignes` renvoie `frais`/`du` par ligne (frais si `enRetard`) ; `tiersAlerteImpayes` cumule `montant` (avec frais) + `frais` ; `regAlerteModal` et `pageReglements` propagent `du` (sous-totaux, KPI, colonnes, en-têtes).
- Badge de version → **v189**.

**Limites assumées :** l'aperçu A4 utilise le même `docHTML` que le PDF final (fidèle) ; le montant de l'indemnité est paramétrable via `db.societe.fraisRecouvrement` (Paramétrage facturation, addon104), défaut 40 €.

---

## 🟢 MAJ précédente — Refonte visuelle mobile (Espace Client) — v180
**Quoi :** une refonte **visuelle** de l'application **mobile** (téléphone, Espace Client uniquement) qui modernise l'écran d'accueil et la navigation, en conservant l'identité **bleu nuit / or** « liquid glass ».

**Pourquoi :** sur mobile le client n'a accès qu'à son Espace Client (addon38/62) ; l'accueil et la barre d'onglets méritaient une présentation plus soignée et plus lisible au pouce.

**Ce qu'il fait (description fonctionnelle) :**
- **Écran d'accueil « hero »** : salutation contextuelle (Bonjour / Bon après-midi / Bonsoir selon l'heure), **nom de la société** (typo Fraunces), date du jour, et **3 chiffres clés** en pastilles (Chiffre d'affaires, Résultat, Trésorerie).
- **Tuiles d'action 2×2** : Mes factures & devis, Réception factures, Mes clients & fournisseurs, Déposer une pièce.
- **Barre de navigation basse FLOTTANTE** (pilule détachée, verre dépoli) à **3 onglets** : 🏠 **Accueil** / ✚ **Créer** / 📥 **Déposer**, avec le bouton central **« Créer » surélevé** en accent **or**.

**Où / comment (description technique) — addon `yada-addon99` :**
- Override `window.ecHero` **sur mobile uniquement** (`isMobile()` ≤820px) : renvoie le hero + les tuiles ; sur bureau, délègue à l'ancien `ecHero` (capturé au chargement). Aucun impact desktop.
- Reconstruction du `#m-tabbar` après chaque `render` (greffe `render`, s'exécute **après** addon63 → 3 onglets `.mtab`, dont `.mtab-fab` central). Marquage `active` selon `current`.
- Feuille de style **`<style id="mobile-refonte">`** injectée en fin de `<head>` (priorité cascade), entièrement gardée par `@media(max-width:820px)` + `body[data-role="client"]` ; neutralise l'indicateur `::before` de l'ancienne barre, masque le `.page-head` redondant de l'accueil, et augmente le `padding-bottom` du contenu pour la barre flottante + bouton surélevé.
- Badge de version (addon37) → **v180 · mobile**.

**Limites assumées :** purement **visuel** (aucune logique comptable touchée, écritures inchangées) ; pages **Créer** (facturation) et **Déposer** (achats) conservent leur mise en forme mobile existante (cartes `li-cli`, etc.).

---

## Refonte visuelle mobile (Espace Client) — addon99
- **`yada-addon99` (refonte visuelle mobile)** : accueil « hero » mobile (salutation + société + 3 chiffres clés en pastilles) + tuiles d'action 2×2 + **barre de navigation basse flottante** 3 onglets (🏠 Accueil / ✚ Créer / 📥 Déposer, bouton central or surélevé). Override `window.ecHero` (mobile only) + reconstruction `#m-tabbar` post-`render` + `<style id="mobile-refonte">`. 100% additif, bureau inchangé.

## Maniabilité mobile (Espace Client) — addon100
- **`yada-addon100` (maniabilité mobile)** : rend l'app mobile plus facile à manier, 3 axes. **(1) Cibles tactiles plus grandes** : boutons (`.btn` min 52px), champs (52px/16px), onglets/FAB et tuiles agrandis (`<style id="mobile-maniabilite">`). **(2) Retour & repères clairs** : bouton **« ← »** (`#m-back`) injecté dans `#m-topbar` quand `current !== 'client'` (revient à l'accueil) + **titre = nom de la page** (`LABELS`), via `updateTopbar()` greffé sur `render`. **(3) Écrans épurés** : `.flow` décoratif + paragraphes `.page-head p` masqués sur mobile client, grille KPI `.grid.g4` masquée sur l'accueil (redondante avec le hero), et **tableaux longs repliés** au-delà de 5 lignes derrière un bouton **« Voir plus / Voir moins »** (`truncateTables()`, classes `.vp-hidden`/`.vp-more`/`.vp-btn`, idempotent par `data-vp`). Gardé par `isMobile()`/@media + `body[data-role="client"]`. 100% additif, bureau inchangé.

---

## 🟢 MAJ précédente — Facturation électronique : opérateur relié (PPF/PDP) + Factur-X
**Quoi :** un module ajouté dans la page **Facturation client** (`pageFacturation`) qui simule l'intégration à un **opérateur de dématérialisation agréé** (PPF — Portail Public de Facturation, ou PDP — Plateforme de Dématérialisation Partenaire), conformément à l'esprit de la réforme française de la facturation électronique B2B.

**Pourquoi :** à terme, un PDF par e-mail ne suffira plus en B2B ; les factures doivent transiter par une plateforme agréée au format structuré (**Factur-X / XML**). Le module pose les fondations côté outil.

**Ce qu'il fait (description fonctionnelle) :**
- **Connexion d'un opérateur** : choix du type (PPF/PDP), nom, identifiant/SIRET → bouton « Relier l'opérateur ». État mémorisé et sauvegardé.
- **Transmission** d'une facture validée à l'opérateur au format **Factur-X** (« Transmettre »).
- **Cycle de vie e-invoice** suivi par facture : `à transmettre → Déposée → Émise par la plateforme → Mise à disposition du client → Approuvée → Encaissée`, avec une branche **Refusée**.
- **Flux horodaté** consultable en modale (timeline des étapes + dates).
- **Génération Factur-X** : un **XML CII** (profil simplifié) téléchargeable, avec vendeur (SIRET/TVA de la société), acheteur, lignes, TVA et totaux.
- Compteur « N/M factures transmises ».

**Où / comment (description technique) — addon `yada-addon20` :**
- Greffe : `const _pf=pageFacturation; pageFacturation=function(){ return _pf()+efacturationCard(); }`.
- Constante d'étapes : `EFACT_ETAPES = ['Déposée','Émise par la plateforme','Mise à disposition du client','Approuvée','Encaissée']`.
- Config persistée dans **`db.parametres.efact`** = `{operateur, idOp, mode:'PPF'|'PDP', connecte}` via `efactCfg()`.
- Statut par facture stocké sur l'objet document : **`doc.efact`** = `{statut, operateur, mode, flux:[{etape,date}]}`.
- Fonctions : `efacturationCard()`, `efactStatutTag(s)`, `efactConnecter()`, `efactDeconnecter()`, `efactTransmettre(id)`, `efactAvancer(id)`, `efactRefuser(id)`, `efactFlux(id)` (modale), `efactXML(id)` (génère + télécharge le Factur-X).
- CSS ajouté : `<style id="efact-mod">` (timeline `.ef-step/.ef-dot/.ef-timeline`, encart `.ef-on`).

**Limites assumées :** simulation **hors-ligne** (pas de connexion réelle à un PPF/PDP) ; le Factur-X généré est **représentatif** du format CII, à fiabiliser (schéma officiel) avant un usage réel ; le calendrier de la réforme a été décalé plusieurs fois → vérifier les dates en vigueur.

**Pistes de suite sur ce module :** statut « reçu » côté Achats (e-reporting / réception fournisseurs) ; embarquer le Factur-X dans un PDF/A-3 ; variante en ligne réelle via clé API d'un opérateur.

---

## Le projet
App de **pré-comptabilité française** (style Sage) en **un seul fichier `precompta.html`** autonome, **hors-ligne**, tout en français. Logique + UI dans des `<script>`. 3 thèmes (`noir` défaut, `liquid-clair`, `liquid-teinte`). Écran de connexion + portefeuille multi-dossiers. 2 démos : **AMA** (`d-ama`), **SCI DU 42** (`d-sci42`).
État actuel : ~764 Ko, 55 `<script>`, **54 modules d'extension** (`yada-addon` → `yada-addon60`, n°49 réservé) + **PWA installable** (manifest.webmanifest, sw.js, icônes) + **interface mobile** (style `mobile-ui` + `mobile-theme` bleu nuit/or, viewport verrouillé sans zoom, barre d'onglets ; client = factures vente/achat uniquement), 23 entrées de navigation.
Feuille de route : voir **`ROADMAP.md`** (finalisation par module).
- **`yada-addon21` (T1)** : clôture de l'exercice — **OD de résultat** (solde 6/7 → 120/129) + **report des à‑nouveaux** (classes 1→5), carte page Éditions. Continuité comptable (bilan d'ouverture N+1 équilibré). Fonctions : `t1ResultatLignes/t1GenererResultat`, `t1ANLignes/t1GenererAN`, `t1SupprimerCloture`, `t1Card`.
- **`yada-addon22` (T2)** : **cohérence des comptes** — normalisation `c9` (9 chiffres) de tous les comptes d'écriture (migration de tous les dossiers + à chaque `save`), de sorte que l'**OD TVA solde réellement** les comptes alimentés par les factures (44571→445710000, 44566→445660000). `tvaDuMois` comparé en `c9`. Fonction : `t2Normaliser()`. + correctif chirurgical du solde banque (ligne ~3390 : `c9(l.compte)==='512000000'`).
- **`yada-addon23` (T4)** : **états de synthèse** — **Bilan** + **Compte de résultat** imprimables, carte page Éditions. CR calculé hors « OD RÉSULTAT » (valable avant/après clôture) ; Bilan toujours équilibré (résultat non affecté ajouté en capitaux propres). Fonctions : `t4Card`, `t4Afficher('bilan'|'cr')` (+ `etatBilan/etatCR` internes).
- **`yada-addon24` (T3)** : **lettrage unifié** — moteur commun `lzLettrer(refs)`/`lzDelettrer(refs)`/`lzProchaineLettre(cptC9)` (champ `l.lettre`, contrôle Σ débit = Σ crédit) ; **lettrage interactif dans l'éditeur** (clic sur lignes → `ecSel`, barre `.ec-letbar`, `ecLettrerSel/ecDelettrerSel`). Données partagées avec le compte auxiliaire. **Fondations T1→T4 terminées.**
- **`yada-addon25` (risque compta)** : **Règlements ↔ Banque** — `marquerRegle`/`ecart` génèrent l'écriture de trésorerie (encaissement client : crédit 411 / débit 512 ; paiement fournisseur : débit 401 / crédit 512) puis lettrent la facture. La créance/dette est réellement soldée par la trésorerie.
- **`yada-addon26` (risque compta)** : **Cession d'immobilisation** — `imCeder` génère l'OD de sortie équilibrée : 675 (VNC) + 28x (amort. cumulés) D = 21x (immo brute) C ; 512 (prix) D = 775 (produit) C. Idempotent (libellé « CESSION IMMOBILISATION … »). Fonction : `imCederComptabilise(im,date,prix)`.
- **`yada-addon27`** : éditeur d'écritures — **filtre / tri** (`ecSetFiltre/ecToggleSort`, barre `.ec-filtbar`). Affichage seul.
- **`yada-addon28`** : **Tiers — édition/suppression** d'une fiche (`tiersEditer/tiersEnregistrer/tiersSupprimer`, bouton ✎). Bloqué si tiers mouvementé ; pas de modif rétroactive des écritures. **+ Complétion via le SIRET** dans la modale d'édition (`tiersEditSiret` → `lookupSiret` ; champs `te-siret`/`te-tvaintra` remplis : nom, adresse, CP/ville, n° TVA ; persistés par `tiersEnregistrer`). La création de tiers a déjà l'auto-SIRET (`remplirTiersDepuisSiret`).
- **`yada-addon29`** : **Éditions — balance âgée** clients & fournisseurs (`balanceAgeeCard`, ventilation par ancienneté). Lecture seule.
- **`yada-addon30`** : **Tableau de bord** — trésorerie réelle (solde 512, `soldeTresorerie()`) + CA/charges depuis les écritures (`dashTresoCard`).
- **`yada-addon31`** : **GED** — dépôt glisser-déposer de vrais fichiers (`db.parametres.pieces`, `gedAdd/gedCard`), carte Espace Client.
- **`yada-addon32`** : **Espace Client séparé** — `window.sessionRole` (cabinet|client) + `CLIENT_PAGES=['client','facturation','achats','tiers']` (navigation restreinte côté client) ; `choisirDossierClient/quitterEspaceClient` ; actions cabinet masquées.
- **`yada-addon33`** : **Messagerie client ↔ cabinet** + pièces demandées (`db.parametres.messages/demandes`, `messagerieCard`).
- **`yada-addon34`** : **FEC inverse** — bouton « ouvrir l'exercice précédent (N-1) » pour les à-nouveaux (`fecOuvrirPrecedent`).
- **`yada-addon35`** : **Autoliquidation de TVA (achats)** — case « Autoliquidation » dans Achats ; écriture 4 lignes équilibrée (60x HT + 445660000 TVA déd. D = 401 HT + 445710000 TVA coll. C). Net dû = HT ; TVA collectée + déductible déclarées sur la CA3. Fonction : `posterAchatAutoliq(o)` (override `validerAchat`/`majAc`).
- **`yada-addon36`** : **cohérence des KPI de synthèse** — Tableau de bord & Espace Client alignent **CA / Charges / Résultat** sur les **écritures** (classe 7/6 hors « OD RÉSULTAT »), comme le Compte de résultat (avant : basés sur les factures, ignoraient paie/dotations). `resEcritures()` ; greffe `dashCompta`/`pageEspaceClient`. L'Analytique reste basé factures (analyse par pièce).
- **`yada-addon37`** : badge de version (repère de déploiement, bas-droite) — confirme qu'une MAJ est en ligne (GitHub Pages).
- **`yada-addon38`** : **Connexion 2 espaces avant les dossiers** — choix Cabinet/Client puis identifiant+mot de passe (empreintes SHA-256 salées `CAB`/`CLI`) ; **Client = accès direct à SON dossier** (`CLIENT_DOSSIER='d-ama'`) **sans page intermédiaire** (page rendue sous l'écran de connexion puis dévoilée) ; cloisonnement, verrouillage auto, déconnexion.  `secChoisir/secEssayer/secRetour/secVerrouiller/secOuvrir`. **Sur mobile (`isMobile()` ≤820px) : seul l'Espace Client est accessible** — la gate force `CHOICE='client'` (formulaire client direct, pas de choix ni de Cabinet), `secChoisir('cabinet')` ignoré, `boot` ignore une mémorisation cabinet. **Proposition d'installation mobile depuis l'ordinateur** (addon62) : `mobileInstallModal()` (QR code via api.qrserver.com + lien + instructions Android/iOS, repli lien si hors-ligne) ; bannière discrète une fois (`yada-mob-prop`) + bouton dans Paramétrage. **+ Connexion automatique « appareil de confiance »** (addon57) : case « Rester connecté sur cet appareil » → `secOuvrir(role,true)` mémorise le rôle en `localStorage` (`yada-remember`) ; au chargement, `boot` rouvre directement l'espace sans gate (timer d'inactivité désactivé sur appareil mémorisé) ; `secVerrouiller` (déconnexion) efface session + mémorisation.
- **`yada-addon40`** : **Refonte visuelle Espace Client** — en-tête « hero » + 4 raccourcis (`ecHero()`, classes `#ec-hero`/`.ec-shortcuts`/`.ec-tile`), greffe `pageEspaceClient`. Style `<style id="ec-refonte">` ; espacement des modules client via `<style id="ec-spacing">` (colonne centrée 1080px, marges aérées, ciblé `body[data-page="client"]`).
- **`yada-addon41`** : **Refonte visuelle Tableau de bord Cabinet** — même esprit hero que l'Espace Client (`dashHero()`, hero vert `#ec-hero.cab-hero` + 4 raccourcis Facturation/Achats/Compta/TVA) **injecté dans le `.dash-wrap`** via greffe `pageDash` (`html.replace('<div class="dash-wrap">', …)`) ; styles ciblés `body[data-page="dash"]` dans `<style id="ec-spacing">`. Contenu inchangé en dessous.
- **`yada-addon42`** : **Vues client simplifiées (Facturation & Factures fournisseurs)** — quand `window.sessionRole==='client'`, `pageFacturation`→`pageFacturationClient()` et `pageAchats`→`pageAchatsClient()` (greffes à bascule ; le cabinet conserve la page complète). **Facturation client** = création simplifiée (`faClientCreer()` réutilise `faLignes`/`faSync`/`faMaj`/`emettre` ; type Facture/Devis, client, dates, lignes Qté·PU·TVA·Total HT) + « Factures récemment créées » (`faClientRecentes()`, 5 dernières) + `suiviFacturesVente()` + `listeFacturesEnvoyees()`. **Achats client** = « Dernières factures déposées » (`achatsClientRecentes()`, 5 dernières) + « Détail des factures fournisseur » (`achatsClientDetail()` : KPI HT/TVA/TTC + table N°/Fournisseur/Date/Règlement/HT/TVA/TTC/Paiement/Voir). Aucune écriture directe : la création passe par `emettre()`/`posterFacture` (VTE équilibrée). **+ Dépôt de factures** dans les deux pages client (`depotFacturesCard(cat,…)`, `factDepotAdd/factDrop/factPick/factFile`) : stockage réel dans `db.parametres.pieces` avec champ `cat` (`'vente'` côté Facturation, `'achat'` côté Achats) ; liste filtrée par catégorie, consultation/téléchargement/suppression via `gedVoir/gedDl/gedDel`. **Disposition 2 colonnes** (addon58) des pages client : colonne gauche = actions (créer/déposer), colonne droite = suivis/listes (`.cli-2col/.cli-col`, repli 1 colonne <1000px).
- **`yada-addon44`** : **Dépôts de factures — workflow d'approbation cabinet** (client & cabinet, vente & achat). Le client dépose un fichier (Facturation→`cat:'vente'`, Achats→`cat:'achat'`) : création d'une **pièce** (`db.parametres.pieces`) + d'un **dépôt** (`db.parametres.depots` : `{statut,doublon,fichierId,tiersId,numero,ht,tva,ttc,taux,ecritureId,…}`) + d'une **notification** (`db.parametres.notifsDepot`). **Doublon** repéré dès la réception (même nom de fichier dans le dossier) → liste colorée **vert = unique / rouge = doublon** (`.dep-ok/.dep-dup`), visible **côté client et cabinet**. Le cabinet valide en 2 temps : **`depotRecevoir`** (statut `deposee→recue`) puis **`depotComptabiliser`** (formulaire inline tiers/n°/date/TTC/TVA → `posterFacture` type vente/achat, écriture équilibrée, statut `comptabilisee`) ; **`depotRefuser`** sinon. Le client ne peut que déposer/retirer (`depotSupprimer` si `deposee`). Fonctions : `depotsListe(cat,role)`, `depotsCabinetCard(cat)` (greffée sur `pageFacturation`/`pageAchats` côté cabinet), `depotFacturesCard` (client, override addon42), `notifMarquerLu(cat)` + pastille menu cabinet (`.nav-badge-dep`, greffe `buildNav`). **Aucune saisie sans double validation cabinet.**
- **`yada-addon45`** : **Fournisseur inconnu → fiche d'information** (achats). Au dépôt d'une facture d'achat, le client choisit le fournisseur (`#dep-four-achat`) ou « ➕ inconnu / nouveau ». Si inconnu : `factDepotAdd` (override) marque `dep.tiersInconnu` et crée une **fiche** (`db.parametres.fichesTiers` : `{type:'fournisseur',depotId,statut:'a_remplir'|'remplie'|'validee',raison,siret,tvaIntra,adresse,cp,ville,email,tel,iban,tiersId}`). Proposition visible **côté client** (`fichesClientCard`, bouton « Remplir » → modale `ficheRemplir`/`ficheEnregistrer`) **et cabinet** (`fichesCabinetCard`, greffée sur `pageAchats`). Le cabinet valide (`ficheValider`) → création du `db.tiers` fournisseur (606000/44566, `genAux`) + rattachement `dep.tiersId`, puis comptabilisation normale du dépôt. `ficheVoir` (modale lecture). **Complétion auto via le SIRET** (addon53) : bouton « 🔎 Compléter via le SIRET » dans la fiche → `ficheCompletSiret()` appelle `lookupSiret` (API publique **recherche-entreprises.api.gouv.fr**, sans clé) et remplit raison sociale, adresse, CP, ville, **n° TVA** (`tvaFromSiren`) depuis le seul SIRET (e-mail/tél/IBAN restent manuels ; recherche nécessite le réseau).
- **`yada-addon46`** : **Préservation du défilement** — `render` (override) mémorise le `scrollTop` du conteneur (`.mod-wrap`/`.dash-wrap`) et le restaure quand la page (`current`) est ré-rendue à l'identique (plus de « retour en haut » après chaque enregistrement, ex. Achats cabinet).
- **`yada-addon47`** : **Comptabilisation des dépôts — compte tiers auxiliaire + doublon comptable**. La comptabilisation d'un dépôt utilise désormais le **compte auxiliaire 401XXXX / 411XXXX** (`posterFactureAux` : `posterFacture` puis remplacement de la ligne collective `401`/`411` — comparée en `c9` car `save` normalise — par `tiers.compteAux`). Avant saisie, **détection de doublon comptable** (`factureDoublon` : même tiers + même n°, sinon même tiers + date + TTC) → **modale de confirmation** (`compareModal`) affichant **les deux factures côte à côte** (existante vs nouvelle, chacune ouvrable via `gedVoir`/`voirFactureAchat`) avec 3 choix : **Conserver l'existante** (annule), **Comptabiliser les deux** (`depotComptaGarderLesDeux`), **Remplacer par la nouvelle** (`depotComptaRemplacer` → `supprimerFactureEtEcriture` : **délettrage** `delettrerEcriture` si l'écriture portait une lettre, suppression facture+écriture+règlement, puis saisie de la nouvelle). Toutes les infos saisies (date, n°, HT/TVA/TTC, fournisseur). La facture déposée reste **ouvrable dès la réception** (bouton 📎 dans la liste cabinet). Greffe : override `depotComptabiliser`.
- **`yada-addon48`** : **Saisie complète de la facture reçue + pré-remplissage de la comptabilisation**. Le dépôt d'un achat se fait via un **formulaire complet** (fournisseur, n°, date facture, **HT, remise fournisseur, taux TVA** → **net HT, TVA, TTC calculés en direct** `depotCalcAchat`, + justificatif) — `depotAchatDeposer` enregistre toutes ces infos sur le dépôt (`htBrut,remise,ht,tva,ttc,taux,numero,dateFacture`). Override de `depotsListe` : la **saisie comptable cabinet est pré-remplie automatiquement** (fournisseur pré-sélectionné, n°, date, TTC, taux + HT/remise affichés) avec un **récapitulatif comparatif** « Informations reçues » et un bouton **« 📎 Comparer avec la facture »** (ouvre le fichier) → l'utilisateur vérifie puis valide. Override de `depotFacturesCard` (achat = formulaire ; vente = dépôt fichier simple). La remise est déduite de la base HT (TTC = net HT + TVA). **Montants exacts** : la comptabilisation utilise les **montants HT et TVA transmis** (champs `cmp-ht`/`cmp-tva` éditables et pré-remplis, TTC = HT+TVA recalculé via `depotCmpCalc`) — `posterFactureMontants` (addon47) construit l'écriture avec ces montants exacts (pas de recalcul depuis le TTC), sur le compte auxiliaire 401XXXX, équilibre garanti (TTC = HT+TVA).
- **`yada-addon50`** : **Lecture automatique de la facture d'achat → le cabinet n'a qu'à valider**. Le client **dépose seulement le fichier** (plus aucun montant à saisir) : `factDepotAdd` (override) lance `extractFromFile` (lecture **simulée** hors-ligne : montant détecté dans le nom du fichier — décimales prioritaires, sinon plus grand entier, sinon valeur simulée déterministe — + n° et taux 20%), calcule **HT et TVA depuis le TTC** (`net=TTC/(1+taux)`, `TVA=TTC−net`) et les stocke sur le dépôt (`auto:true`). La saisie comptable cabinet est alors **entièrement pré-remplie** (TTC/HT/TVA/n°/taux via `depotsListe` addon48) → le cabinet **valide** (et peut « Comparer avec la facture » / corriger). `depotFacturesCard` (override) : achat = sélecteur fournisseur + zone de dépôt fichier (lecture auto) ; vente = dépôt fichier. Tout le circuit aval (doublon/confirmation/remplacement, compte 401XXXX, montants exacts) reste actif.
- **`yada-addon51`** : **Lecture RÉELLE de la facture PDF** (couche texte) — **sans bibliothèque ni réseau**. `factDepotAdd` (override) lit le PDF déposé : décompression des flux **FlateDecode** via **`DecompressionStream` natif** (`flate`/`inflate`/`pumpToU8`), extraction du texte (`pdfExtractText` + `textFromContent`/`pdfUnescape`/`hexDecode`) puis détection des montants (`pdfParseAmounts` : repère TTC/TVA/HT par mots-clés, taux déduit, n° de facture), et calcule HT/TVA depuis le TTC. Repli `extractFromFile` (nom de fichier) si PDF non lisible ; **image = pas d'OCR hors-ligne** → repli nom de fichier (mention explicite). `dep.lecture` indique la source ; toast récapitulatif. Le cabinet n'a qu'à valider (saisie pré-remplie addon48).
- **`yada-addon52`** : **OCR des images / scans (prêt pour le réseau)**. Définit le point d'accroche `window.ocrImage(file,dataUrl)` appelé par `factDepotAdd` (addon51) pour les images : **charge Tesseract.js à la demande** depuis un CDN (`db.parametres.ocr.cdn`, défaut jsDelivr `tesseract.js@5`) **uniquement si le réseau est disponible** (`navigator.onLine`) ; lance `Tesseract.recognize(..,'fra')` → texte → `pdfParseAmounts` (TTC/TVA/HT). **Repli automatique** (lecture par nom de fichier, addon51) si hors-ligne / CDN bloqué / délai. Réglages : `db.parametres.ocr={enabled,lang,cdn}`, `ocrConfig()`, `ocrSetEnabled(v)`. Non bloquant pour l'usage hors-ligne (lazy-load, try/catch, timeout 20 s).
- **`yada-addon54-55`** : **Nouveaux fournisseurs créés par le client** — `ficheValider` marque le tiers `nouveau:true, origine:'client', dateAjout`. Affichage **badge « NOUVEAU »** (vert) dans la liste Tiers (`sectionTiers`, ligne `.new-tiers`) + **pastille** sur le menu Tiers (`.nav-badge-new`, `tiersNbNouveaux`, greffe `buildNav`). Le cabinet **modifie la fiche** (modale `tiersEditer`) avec champs **IBAN** (`te-iban`), e-mail, téléphone, SIRET, n° TVA + bouton « Compléter via le SIRET » (`tiersEditSiret`) ; `tiersEnregistrer` persiste `iban/siret/tvaIntra` et **retire le marquage `nouveau`** une fois la fiche vérifiée.

- **`yada-addon56`** : **Même système pour les clients** — le flux « tiers inconnu → fiche → validation cabinet → tiers marqué nouveau » est généralisé au **type client** (vente). Sélecteur « Client inconnu / nouveau » dans le dépôt Facturation (`dep-client-vente`) ; fonctions `ficheRemplir/ficheVoir/ficheValider/fichesClientCard/fichesCabinetCard` rendues **type-aware** (fournisseur → 401/606/44566 ; client → 411/706/44571). Greffes : `fichesClientCard('client')` sur Facturation client, `fichesCabinetCard('client')` sur Facturation cabinet (et inchangées pour fournisseur sur Achats). Marquage `nouveau` + badge/pastille et édition cabinet (IBAN/mail/tél/SIRET) communs aux deux types.

> **Hors périmètre hors-ligne** : l'OCR d'images nécessite le réseau (chargement de Tesseract.js) — **prêt et activé automatiquement quand connecté**, repli hors-ligne ; la lecture PDF couche-texte est réelle et hors-ligne ; IA en ligne et e-reporting Achats à compléter ultérieurement.

- **`yada-addon59`** : **Sauvegarde automatique + indicateur** — `save()` (déjà appelé après chaque action) est enveloppé pour afficher un indicateur **« 💾 Enregistré ✓ HH:MM:SS »** (bas-gauche, `#yada-save-ind`) à chaque mise à jour ; filet de sécurité : sauvegarde **avant fermeture** (`beforeunload`) + **périodique** (60 s). Données dans `localStorage` (`yada-db`).

- **`yada-addon63` (format mobile client)** : sur mobile (Espace Client), **barre d'onglets en bas** centrée sur les 2 actions — **🏠 Accueil / 🧾 Créer (facturation) / 📥 Déposer (achats)** (`#m-tabbar`, reconstruite à chaque `render`, état actif sur `current`, visible via `body[data-role=client]` + media ≤820px). Cadrage mobile soigné (style `mobile-ui`) : lignes de facture `.li-row` en **carte empilée** (désignation pleine largeur, Qté/PU/TVA/Total + ✕), libellés `Qté`/`PU HT` ajoutés, anti-zoom iOS (`font-size:16px`), anti-débordement (`overflow-x:hidden`), `padding-bottom` pour la barre. Combiné à addon62 (mobile = client uniquement).

- **`yada-addon64` (fiche tiers groupée)** : plusieurs factures d'un **même nouveau tiers** se rattachent à **une seule fiche** (plus d'énumération). Le dépôt propose les **fiches en cours** (`<optgroup>` « Nouveaux … en cours », valeur `fiche:ID` via `fichePendOptions`) ; `factDepotAdd` rattache le dépôt (`fiche.depotIds[]`) sans recréer de fiche ; `ficheValider` rattache **tous** les `depotIds` au tiers créé. Les cartes de fiches affichent un **compteur** « (N factures) » au lieu d'une ligne par facture. **Regroupement automatique** (addon65) : `fichePendOptions` **pré-sélectionne la fiche en cours la plus récente** → les dépôts suivants se rattachent au même nouveau tiers par défaut (modifiable ; « ➕ inconnu » crée une fiche distincte).

- **`yada-addon87` (consultation — comptes de tiers cliquables → grand-livre lecture seule)** : dans la **Consultation des comptes**, onglets **Fournisseurs divers** et **Clients divers**, le **n° de compte du tiers est cliquable** (`ouvrirCompteLecture(code)`) et ouvre le **grand-livre du tiers en LECTURE SEULE** (overlay `#cl-overlay`, présentation façon Sage `.lx-app`/`table.lx` : Date/Jnl/I/Pièce/Libellé/Débit/Crédit/Solde/L), reconstitué via `auxLignes(t)` (toutes les écritures touchant le compte collectif 401/411 du tiers). Les lignes **ne sont pas modifiables** ; pour modifier, **clic droit** sur une ligne → menu `#cl-ctx` « 📓 Journal » (`clMenu`/`clVersJournal`) qui **redirige vers l'éditeur d'écritures** (`ouvrirEcrituresCompte`) tout en **laissant le compte ouvert** ; la page ne se ferme **qu'avec le bouton de fermeture** (`clFermer`). Valable pour **tous les comptes fournisseurs et clients** enregistrés & utilisés **ET pour les Comptes Généraux** (v167) : `ouvrirCompteLecture` ouvre tout code ; si aucun tiers ne correspond (`tiersDe`), le grand-livre du **compte général** est reconstruit via `clLignesGeneral(code)` (toutes les écritures dont une ligne a `c9(compte)===c9(code)`), libellé via `COMPTES`. Greffe sur les 3 onglets : lignes de `pageCompta` (généraux + `estAux` fournisseurs/clients) → `onclick="ouvrirCompteLecture(...)"`. **Navigation ↑/↓** (v168) : flèches ▲/▼ dans la barre (et touches clavier ↑/↓) pour passer au **fournisseur / client suivant ou précédent** (compte général : compte mouvementé suivant) — `clNav(sens)` parcourt `clSiblings()` (tiers du même type ayant des écritures, triés par `sageCode` ; ou comptes généraux mouvementés), avec libellé de position « Fournisseur i / N » (`.cl-navlbl`) et bouclage circulaire. Greffe : édition chirurgicale des lignes de tiers dans `pageCompta` (`estAux` → `onclick="ouvrirCompteLecture(...)"`) + addon (overlay, menu contextuel, CSS `<style id="cl-mod">`).

- **`yada-addon88` (consultation — fenêtre réductible)** : le bouton **▢** de la barre de titre (`.sg-win`) de la **Consultation des comptes** bascule la fenêtre (`.sg-app`) entre **plein écran** et une **fenêtre réduite centrée** (classe `.sg-reduit` : `min(1040px,100vw−64) × min(640px,100vh−72)`, marge auto, ombre, fond visible autour). Couvre les **6 onglets** (Comptes Généraux, Fournisseurs divers, Fournisseurs d'immobilisations, Clients divers, Retenue de Garantie, Personnel) car ils partagent la même fenêtre. État **mémorisé** (`localStorage 'yada-sg-reduit'`, lu dans `window.sgReduit`, appliqué par `pageCompta`). Le glyphe morphe ▢↔▣ ; ─ réduit aussi. Fonctions : `sgToggleReduit`, `sgReduireFenetre`. Greffe : édition de la `.sg-win`/classe `.sg-app` dans `pageCompta` + addon (logique + CSS `<style id="sg-reduit-mod">`).

- **`yada-addon88` (consultation — fenêtre réductible)** : le bouton **▢** de la barre de titre (`.sg-win`) de la **Consultation des comptes** bascule la fenêtre (`.sg-app`) entre **plein écran** et une **fenêtre réduite centrée** (classe `.sg-reduit` : `min(1040px,100vw−64) × min(640px,100vh−72)`, marge auto, ombre, fond visible autour). Couvre les **6 onglets** (Comptes Généraux, Fournisseurs divers, Fournisseurs d'immobilisations, Clients divers, Retenue de Garantie, Personnel) car ils partagent la même fenêtre. État **mémorisé** (`localStorage 'yada-sg-reduit'`, lu dans `window.sgReduit`, appliqué par `pageCompta`). Le glyphe morphe ▢↔▣ ; ─ réduit aussi. Fonctions : `sgToggleReduit`, `sgReduireFenetre`. Greffe : édition de la `.sg-win`/classe `.sg-app` dans `pageCompta` + addon (logique + CSS `<style id="sg-reduit-mod">`).

- **`yada-addon89` (gestionnaire de fenêtres — déplaçable / redimensionnable / réductible / autre écran)** : transforme les fenêtres façon Sage **et les sous-pages (modales)** en fenêtres manipulables. Cibles : Consultation (`.sg-app`), Compte auxiliaire (`#main .lx-app`), Grand-livre lecture seule (`#cl-overlay .lx-app`), Éditeur d'écritures (`#ec-overlay .ec-win`), **Rapprochement** (`.rb-app`/`.rb-title`), **Charges & paie** (`.cp-wrap`/`.cp-topbar`), **Immobilisations** (`.im-app`/`.im-title`), et **modales** (`#modal.show #modal-c`, via `.modal-h`). Chaque fenêtre reçoit : **déplacement** (glisser la barre de titre), **redimensionnement** (poignée coin bas-droite `.wm-resize`), **réduction `▢`** (bascule fenêtre flottante `.wm-float` ↔ plein écran ; pour la Consultation c'est `sgToggleReduit`/addon88), **`⧉` autre écran** (`wmPop` → `window.open` avec clone HTML + styles inlinés → à glisser sur le 2e moniteur ; vue). Géométrie mémorisée `localStorage 'yada-wm'` (`WM.st` par fenêtre `{float,x,y,w,h}`) ; les **modales** sont éphémères (état remis à zéro à la fermeture, non persisté). Réapplication après chaque rendu via greffes `wrap('render'/'ecRender'/'ouvrirCompteLecture'/'clNav')` + **MutationObserver** sur `#modal`/`#modal-c`. Quand une modale/overlay flotte, le fond (`.wm-floating`) devient transparent et non bloquant. Fonctions : `wmToggle(k)`, `wmPop(k)`, `wmApply()` ; CSS `<style id="wm-mod">`.

- **`yada-addon90` (saisie d'une opération — même interface que l'éditeur)** : bouton **« ＋ Saisir une opération »** (menu **Compte** de la Consultation + barre du **grand-livre lecture seule**) → ouvre l'**éditeur d'écritures** (`#ec-overlay`, déjà façon Sage et fenêtré) en **CRÉATION** via `window.ecNewId`. Barre injectée `.ec-newbar` (sélecteur **Journal** OD/BQ/HA/VT/OD TVA/OD Paie, **Date**, **Pièce**) + saisie des lignes (compte + autocomplétion addon85, libellé, débit, crédit) + contrôle Σ débit = Σ crédit. **Valider l'opération** (`ecValiderOperation` : nettoie les lignes vides, exige un compte par ligne mouvementée, équilibre obligatoire sinon `ecNotifSolde`, puis `save`) ; **Annuler** (`ecAnnulerOperation`) et fermeture ✕ (`ecFermer` en mode création) retirent le brouillon. Greffes base : `ecEcritures` (court-circuit → seule l'écriture en cours), `ouvrirEcrituresCompte` (sort du mode création), `ecFermer` (abandon = retrait du brouillon) ; `ecRender` enveloppé pour injecter la barre. CSS `<style id="ec-newop-mod">`.

- **`yada-addon91` (éditeur d'écritures — refonte noir & bleu, lisible & épurée)** : restyle l'**unique surface de saisie** `#ec-overlay/.ec-sage` (utilisée par « Modifier l'écriture » clic droit→Journal, double-clic sur un compte, ET « Saisir une opération » addon90) en **fond noir + accents bleus** (#1e90ff/#5ab0ff), **tout le texte lisible** (clair sur noir, surcharge des anciennes règles `!important` texte noir), débit/crédit/solde contrastés (rouge compta conservé). **Simplicité** : barres décoratives `.ec-menubar` (menu façon Windows) + `.ec-toolbar` (glyphes) **masquées** ; la `.ec-filtbar` (filtre/tri addon27, sœur de la menubar) reste et est restylée. CSS `<style id="ec-noir-mod">` (surcharge en fin de `<head>`, aucune logique modifiée).

- **`yada-addon93` (Charges & Paie — journal de paie mensuel assisté + comptabilisation)** : carte greffée dans `pageChargesPaie` (injection dans `.cp-scroll`). **Dépôt de document** (journal de paie/charges) stocké dans `db.parametres.pieces` (cat `paie`) ; **reconnaissance OCR auto quand connecté** (`window.ocrImage`+`pjParse` par mots-clés), repli saisie manuelle (scans sans couche texte). **Décomposé par mois** (utilise `cpMois`). Rubriques pré-mappées (`PJ_RUBR`, montants saisis dans `db.parametres.paieJournal[mois]`) : Salaire brut/total général→**641**, URSSAF+CSG/CRDS→**6451**, BTP prévoyance/retraite→**6453**, panier+Navigo→**648**, PAS→**4421**, **Net à payer (équilibrage)→421**. Détail de l'écriture affiché en dessous ; **génère l'OD PAIE équilibrée** (`pjGenerer`, journal `ODP`, libellé `JOURNAL PAIE MM/AAAA`, idempotent ; `pjSupprimer`). CSS `<style id="pj-mod">`.

- **`yada-addon96` (plan comptable — création des comptes Achats/Ventes/TVA demandés + tiers par nature)** : enrichit `COMPTES` + `PCG_COMPLET` (+ `db.plan` si déjà peuplé, sinon repli `COMPTES`) avec les comptes de **charges** (601/606/615x/616x/622600/622700/623000/623100/625100/625600), **produits** (701/704/705/706/707 + 707020/030/040/055/060) et **TVA** (collectée 445711..717, déductible 445661..667, sur immo 445621..627, assimilées/régul 445780/800/810/830/670) s'ils n'existent pas (idempotent, sans écraser les libellés existants). Crée 2 **tiers fournisseurs « par nature »** si absents : **GASOIL → 401GASO00** (606000000) et **RESTAURANT → 401REST00** (625700000). Re-joué après `chargerDossier`/`seed`. + **ligne ROUGE** sous une écriture soldée dans l'éditeur (`.ec-redrow .ec-soldee` repassé en rouge #e1342c) pour le Journal d'achat HA éditable.

- **`yada-addon98` (suivi des règlements — onglets Clients/Fournisseurs + alerte impayés)** : override `pageReglements` en **2 onglets** (Clients = règlements `a_encaisser` reçus, Fournisseurs = `a_payer` émis), à partir des factures. Par tiers/facture : **TTC, réglé, restant, retard (jours)** (échéance dépassée) ou **délai restant**, **date du dernier paiement** (`marquerRegle` mémorise `r.datePaiement`). KPIs (total impayé, dont en retard, tiers en alerte). **Alerte après 3 impayés en retard** (`SEUIL_IMPAYES`) : bandeau **« 🚫 Ne plus traiter avec ce client/fournisseur »** + modale `regAlerteModal` (montant impayé, dernier paiement, **factures non réglées en pièces jointes** ouvrables `regVoirFacture`). Helper réutilisable `tiersAlerteImpayes(tid)` ; **hook `posterFacture`** → l'alerte s'affiche **à la création/réception** d'une facture pour un tiers en alerte. CSS `<style id="reg-mod">`.

- **`yada-addon102` (synchronisation cloud multi-appareils — Supabase)** : retrouve le **dernier enregistrement sur tous les appareils** du même compte. Config **hors `db`** (localStorage `yada-cloud` = `{url,key,table,espace,enabled}`) pour ne pas être écrasée par les données reçues. **PUSH** (upsert horodaté `{id:espace,data:JSON(db),ts}` via REST `POST /rest/v1/<table>?on_conflict=id`, `Prefer:resolution=merge-duplicates`) **débounce après chaque `save()`** ; **PULL** au chargement (`pullOnLoad`) et à la demande (`GET ?id=eq.<espace>`), applique si `remote.ts > localTs` (« dernier gagnant », `localStorage 'yada-cloud-ts'`). Fonctions : `cloudPushNow/cloudPull/cloudSyncNow/cloudTest` ; `fetch` avec `AbortController` (timeout 15s), try/catch, hors-ligne géré ; indicateur `#yada-cloud-ind`. Carte de réglage greffée dans **Paramétrage** (URL/clé anon/table/clé d'espace + activer + Tester + Synchroniser + aide SQL de création de table/policy). 100% additif. **Chiffrement de bout en bout (v183)** : option `encrypt` + `pass` (localStorage) → `encryptStr/decryptStr` (AES‑256‑GCM, PBKDF2 150k itér., WebCrypto) ; le cloud ne stocke qu'un blob `enc1:base64(salt+iv+ct)` illisible, la phrase secrète ne quitte jamais l'appareil ; phrase invalide → pull refusé (données locales préservées). Sans la phrase : données irrécupérables. **Contrôle d'intégrité multi-dossiers (v185)** : `cloudIntegrityCheck` compare, **dossier par dossier**, `db.dossiersData` local vs cloud (empreinte `dsFp` = débit/crédit/lignes/TTC + égalité JSON stricte) et affiche une modale « ✓ identique / ✗ écart » par dossier (la synchro réplique déjà le `db` complet — tous les dossiers). Bouton « 🔎 Vérifier les montants (tous les dossiers) » dans la carte Paramétrage.
- **`yada-addon103` (mise à jour automatique du système — même version partout)** : garantit que **toutes les surfaces / tous les appareils** convergent vers la **dernière version déployée**, jamais de système divergent. Vérifie périodiquement `version.json` (réseau, `cache:no-store`) + relance `serviceWorker.update()` ; si `remote.version > version courante` (badge), **enregistre les données puis recharge** (`applyUpdate`). Déclencheurs : démarrage (+6 s), toutes les 5 min, retour au premier plan (`visibilitychange`), reconnexion (`online`). Couplé au **SW « réseau d'abord »** (sw.js `CACHE yada-v4`, `version.json` réseau-seulement) et au **`controllerchange` → `save()` + reload**. `version.json` est **auto-généré par la CI** (`build-zip.yml`) depuis le badge de version → pas de dérive. 100% additif.
- **`yada-addon104` (paramétrage de la facturation)** : carte « Paramètres de facturation » greffée sur `pageFacturation`/`pageFacturationClient` (`factParamCard`/`factParamSave`) persistant dans `db.societe` : **condition TVA** (encaissements/débits), **moyen de paiement par défaut** (CB/Espèces/Chèque/Virement), **indemnité de recouvrement** (40 € par défaut), **escompte** (taux + délai), **RIB** (bénéficiaire/IBAN/BIC). Supprime le tableau « suivi & validation » (`documentsClientsCard`→''). **Plafond année à 4 chiffres** sur les `<input type=date>` (`max=9999-12-31`).
- **`yada-addon105` (facture — aperçu A4 en direct)** : sous le formulaire d'émission, panneau **« 📄 Aperçu de la facture (format A4 · mis à jour en direct) »** qui rend la vraie page A4 (`docHTML`) à chaque frappe. Greffe le **binding global** `faMaj` (`var _f=faMaj; faMaj=function(){…refreshA4();}`) → intercepte aussi l'appel interne de `render` (premier affichage) et chaque oninput/onchange. `draftDoc()` (champs `fa-*` + `faLignes` + `faTotaux` + `db.societe`), `ensureA4()` insère `#fa-a4-wrap`/`#fa-a4` après `#fa-apercu`, CSS `<style id="fa-a4-mod">`. N° prévisualisé sans consommer le compteur ; Qté masquée pour prestation. 100% additif (aucune écriture).
- **`yada-addon106` (Charges & Paie — bulletins de paie éditables + OD multi-mois)** : module **Bulletins de paie** greffé sur `pageChargesPaie`. Génère/édite des **fiches de paie au modèle français entièrement modifiables** (gains, **table de cotisations** base/taux/part salariale & patronale, primes panier/Navigo, **PAS** taux ou montant) pour **plusieurs salariés et plusieurs mois** ; totaux en direct (brut, net imposable, net à payer, charges patronales, coût employeur) ; **aperçu A4 + impression** (`bpBulletinHTML`/`bpVoir`/`bpImprimer`). **Dépôt multiple de bulletins** (`bpDepot`, `db.parametres.pieces` cat `bulletin`, OCR auto si connecté → fiche pré-remplie). **OD de paie du mois** : `bpGenererODMois` agrège toutes les fiches du mois → `db.parametres.paieJournal[mois]` → **`pjGenerer`** (addon93) → OD PAIE équilibrée. Données `db.parametres.bulletins.fiches[]` ; CSS `<style id="bp-mod">`. 100% additif.

## Règles de travail (IMPÉRATIF)
1. **Ajouter par-dessus l'existant sans rien casser.** Édition chirurgicale, jamais de réécriture globale. Les nouveautés = nouveaux **scripts d'extension** `yada-addonN` injectés avant `</body>` (greffe sur fonctions globales) + éventuels `<style id="...">` avant `</head>`.
2. **Numéros de ligne instables** → toujours re-chercher les ancres (grep) avant d'éditer.
3. **UTF-8 en clair** (accents/emoji), jamais `\uXXXX`. Attention aux apostrophes dans les chaînes JS en quotes simples : préférer les backticks pour le HTML, ou des guillemets doubles.
4. **Valider chaque modification** :
   - extraire chaque `<script>` et faire `node --check` (zéro erreur) ;
   - accolades CSS équilibrées (`{` == `}`) ;
   - balises `</head>`/`</body>`/`</html>` uniques ;
   - **rendu réel via Playwright** (Chromium) sur les 2 démos : parcourir les modules, capturer pageerror/console, vérifier que **toutes les écritures sont équilibrées** (Σ débit = Σ crédit).
   - Pré-requis test : `npm i -g playwright && npx playwright install chromium`.
   - **Filet de tests automatisé** : `node tests/equilibre-ecritures.mjs` charge `precompta.html` dans Chromium, réinitialise sur les 2 démos et vérifie que **chaque écriture est équilibrée** (Σ débit = Σ crédit) + exerce `posterFacture` (vente/achat). Lancé en CI à chaque push/PR via `.github/workflows/tests.yml` (installe Playwright à la volée — pas de `package.json` committé, voir `.gitignore`). En local hors-ligne, pointer un Chrome via `YADA_CHROME=/chemin/vers/chrome`.

## Architecture
- `render()` lit `current`, pose `document.body.dataset.page=current`, puis appelle le module via un objet de **dispatch réévalué à chaque rendu**. Réassigner `pageX = function(){…}` fonctionne → pattern de greffe : `const _p=pageX; pageX=function(){ return _p()+complement(); }`.
- **Persistance auto** : `save()` écrit tout `db` dans `localStorage` (clé `yada-db`) ; rechargé au démarrage (sinon `seed()` charge la démo). Export/Import JSON disponibles.
- Modale générique : `#modal` / `#modal-c` + `closeModal()`. Toasts : `toast(msg)`.

## Modèle de données `db`
`db = { cabinet:{dossiers[]}, dossiersData:{[id]:dataset}, activeId, …champs du dossier actif copiés au top-level (CHAMPS_DOSSIER, recopiés dans dossiersData[activeId] par persistActif()) }`.
Dataset : `societe` (raison, formeJur, siren, siret, tvaIntra, codeAPE, adresse, cp, ville, dirigeant, exoDebut/exoFin, exercices[], kbisRecu/kbisPdf, statutsRecu/statutsPdf…), `tiers[]` (type client/fournisseur, compteContre, compteTVA, taux, email, siret), `factures[]` (type achat/vente, tiersId, date, numero, ht/tva/ttc, compteContre, ecritureId), `ecritures[]` (journal ACH/VTE/BQ/OD/ODP/ODTVA, libelle, lignes:[{compte,lib,debit,credit,lettre?}]), `banque[]`, `reglements[]` (sens a_payer/a_encaisser, statut, restant), `docs[]` (documents commerciaux : type facture/devis/avoir, lignes[], ht/tva/ttc, statut brouillon/valide, envoye, ecritureId, **efact** pour e-invoice), `propositions[]` (Assistant IA), `relances{}`, `catalogue, immos, emprunts, paie, plan, journaux, seq, parametres` (dont **parametres.efact** = config opérateur e-invoice).

## Helpers globaux
`eur, r2, uid, c9, frDate, todayStr, ym, moisLabel, nextNum/nextNumUnique, save, render, toast, closeModal, head, flow, calcMontants(base,taux,'HT'|'TTC'), posterFacture(...), posterBanque(...), posterOD(...), genEcriture, analytique() → {prod,charge,parClient,parFourn,ca,achats,resultat}, tvaDuMois(m) → {col,ded,aDecaisser,credit}, moisDisponibles(), statsTiers(id), sageCode(t) (collectif 401/411 + 4 lettres — affichage), exoYear, addAnnees, exSuivant/exPrecedent, COMPTES, COMPTES_CHARGE, COMPTES_PRODUIT, PCG_COMPLET (~970 comptes), numIdentifiant, lookupSiret, tvaFromSiren, lookupConvention, relancesData/relancerClient, relancesCard, statutTag, dashRoute, chargerDossier, choisirDossier, datasetVide, societeDefaut, cabinetDefaut, chargerPlanBTP, voirDoc, telechargerDoc, docHTML, peutEnvoyer, genererEcritureDoc, transformerDevis, docEtatTag, ecTresorerie, ecEncoursParClient`.

## Modules (id → rôle)
`dash` tableau de bord · `societe` portefeuille · `client` **Espace Client** (chiffres clés, dépôt de pièces→OCR/IA, devis & factures, encours & relances, suivi par client) · `tiers` référentiel · `facturation` ventes : nouvelle facture (overlay), **cycle de vie** (attente→validé→envoyé verrouillé, suppression, lot), liste **Factures** (transfert ⚙ Générer), suivi/envoyées/saisie rapide/catalogue, **+ Facturation électronique opérateur relié (PPF/PDP) + Factur-X** · `achats` factures fournisseurs OCR (→ Assistant IA, panneau IA fournisseurs embarqué) · `compta` consultation (éditeur d'écritures façon Sage au double-clic) · `chargespaie` · `journal` · `ia` Assistant IA (écritures) · `tva` CA3 · `editions` (balance, grand livre) · `fec` import/export FEC (un FEC année N ouvre N **et** N+1) · `analytique` · `banque` · `saisiebq` (édition inline) · `rappro` lettrage · `reglements` · `immos` · `dossier` (création + suppression de dossier) · `infosociete` (fiche complète) · `coffre` · `parametrage`.

## Fonctionnalités majeures déjà livrées (addons 10→20)
Éditeur d'écritures façon Sage (double-clic) ; saisie banque inline ; facturation cycle de vie + lot ; Assistant IA (propositions d'écritures) ; achats → IA + panneau IA fournisseurs ; création de dossier (fiche + K-bis/Statuts) ; suppression de dossier ; Espace Client ; import FEC multi-exercice (N + N+1) ; sauvegarde automatique localStorage ; **facturation électronique opérateur relié + Factur-X** (dernière MAJ, voir en haut).

## Démarrage attendu d'une session
« Lis ce CLAUDE.md et `precompta.html`. Continue par ajouts chirurgicaux sans rien casser, en validant par `node --check` sur chaque `<script>` + un rendu Playwright sur les 2 démos (d-ama, d-sci42). »
