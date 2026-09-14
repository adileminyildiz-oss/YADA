// Vérifie le critère de sortie L3 :
//   déposer une facture → lue & pré-remplie ; validation cabinet en 2 temps ;
//   doublon signalé ; fournisseur inconnu → fiche → tiers rattaché ;
//   pièce rangée & cherchable (coffre-fort plein-texte).
const BASE = process.env.BASE || 'http://localhost:3000/api';
const j = async (r) => { const t = await r.text(); let b; try { b = JSON.parse(t); } catch { b = t; } if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`); return b; };
const req = (m, p, body, token) => fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
const post = (p, b, t) => req('POST', p, b, t).then(j);
const get = (p, t) => req('GET', p, undefined, t).then(j);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const stamp = Date.now();
const s = await post('/auth/register', { organisation: 'Cabinet L3', email: `l3_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'L3', prenom: 'Admin' });
const T = s.token;
const ent = await post('/entreprises', { denomination: 'MENUISERIE DURAND' }, T);
const E = ent.id;

const texte = `EDF PRO
Facture n° FE-2026-77120
Date : 05/09/2026
Total HT 260,33
TVA 20% 52,07
Net à payer 312,40 EUR`;

console.log('· Dépôt d\'une facture fournisseur (canal e-mail) → lecture auto');
const dep = await post(`/entreprises/${E}/receptions`, {
  sens: 'achat', canal: 'email', nomFichier: 'facture_edf_09.pdf',
  cheminStockage: 'obj://depot/edf_09.pdf', hash: 'abc123', texteOcr: texte,
}, T);
assert(dep.reception.statut === 'lue', 'pièce lue automatiquement');
assert(Number(dep.reception.montant_ttc) === 312.40 && dep.reception.numero === 'FE-2026-77120', 'pré-remplie (TTC + numéro)');
assert(dep.ficheACreer && dep.ficheACreer.statut === 'a_remplir', 'fournisseur inconnu → fiche à créer');

console.log('· Doublon signalé au 2e dépôt (même numéro)');
const dep2 = await post(`/entreprises/${E}/receptions`, {
  sens: 'achat', canal: 'client', nomFichier: 'edf_dup.pdf',
  cheminStockage: 'obj://depot/edf_dup.pdf', texteOcr: texte,
}, T);
assert(dep2.doublon === true, 'doublon détecté (même n° de facture)');

console.log('· Fiche fournisseur inconnu → validation → tiers créé + pièces rattachées');
const v = await post(`/fiches-tiers/${dep.ficheACreer.id}/valider`, { raison: 'EDF PRO', siret: '55208131766522' }, T);
assert(v.tiers && v.tiers.compte_auxiliaire.startsWith('401'), `tiers fournisseur créé (${v.tiers.compte_auxiliaire})`);
assert(v.receptionsRattachees >= 1, 'pièce(s) rattachée(s) au nouveau tiers');
const recAfter = (await get(`/entreprises/${E}/receptions`, T)).find((r) => r.id === dep.reception.id);
assert(recAfter.tiers_id === v.tiers.id, 'la réception pointe désormais le tiers');

console.log('· Validation cabinet en 2 temps : recevoir → comptabiliser');
await post(`/receptions/${dep.reception.id}/recevoir`, {}, T);
const done = await post(`/receptions/${dep.reception.id}/comptabiliser`, {}, T);
assert(done.statut === 'comptabilisee', 'pièce comptabilisée (écriture ACH = L4)');

console.log('· Upload réel d\'un fichier → stockage puis téléchargement conforme');
const octets = Buffer.from('%PDF-1.4 fichier de test YADA — octets réels\n', 'latin1');
const depF = await post(`/entreprises/${E}/receptions`, {
  sens: 'achat', canal: 'manuel', nomFichier: 'piece_reelle.pdf', mime: 'application/pdf',
  cheminStockage: 'obj://depot/piece_reelle.pdf', contenuBase64: octets.toString('base64'),
}, T);
const docId = depF.reception.document_id;
assert(!!docId, 'pièce déposée avec un document lié');
const dl = await req('GET', `/entreprises/${E}/documents/${docId}/contenu`, undefined, T);
assert(dl.ok && (dl.headers.get('content-type') || '').includes('application/pdf'), 'téléchargement 200 + Content-Type pièce');
const back = Buffer.from(await dl.arrayBuffer());
assert(back.equals(octets), 'octets téléchargés identiques aux octets déposés');

console.log('· Coffre-fort : recherche plein-texte (par contenu)');
const found = await get(`/entreprises/${E}/documents?q=${encodeURIComponent('EDF')}`, T);
assert(found.length >= 1 && found.some((d) => d.nom_fichier === 'facture_edf_09.pdf'), 'document retrouvé par son contenu OCR');

console.log('\nL3 — CRITÈRE DE SORTIE : OK\n');
