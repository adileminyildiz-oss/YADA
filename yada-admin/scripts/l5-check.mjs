// Vérifie le critère de sortie L5 :
//  fiscalité (calcul + déclaration + échéancier) ; pilotage (KPI vivants) ;
//  assistant IA (propose → l'humain valide), contrôle de cohérence.
const BASE = process.env.BASE || 'http://localhost:3000/api';
const j = async (r) => { const t = await r.text(); let b; try { b = JSON.parse(t); } catch { b = t; } if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`); return b; };
const raw = (m, p, body, token) => fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
const post = (p, b, t) => raw('POST', p, b, t).then(j);
const patch = (p, b, t) => raw('PATCH', p, b, t).then(j);
const get = (p, t) => raw('GET', p, undefined, t).then(j);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const stamp = Date.now();
const s = await post('/auth/register', { organisation: 'Cabinet L5', email: `l5_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'L5', prenom: 'Admin' });
const T = s.token;
const ent = (await post('/entreprises', { denomination: 'MENUISERIE DURAND' }, T)).id;
const ex = await post(`/entreprises/${ent}/compta/exercices`, { dateDebut: '2026-01-01', dateFin: '2026-12-31' }, T);
const P = `/entreprises/${ent}/pilotage`;

console.log('· Écritures de base (vente + achat)');
await post(`/entreprises/${ent}/compta/ecritures`, { journal: 'VTE', date: '2026-05-10', piece: 'F1', libelle: 'Vente',
  lignes: [{ compte: '411000000', debit: 1200 }, { compte: '706', credit: 1000 }, { compte: '445710000', credit: 200 }] }, T);
await post(`/entreprises/${ent}/compta/ecritures`, { journal: 'ACH', date: '2026-05-12', piece: 'A1', libelle: 'Achat',
  lignes: [{ compte: '606', debit: 500 }, { compte: '445660000', debit: 100 }, { compte: '401000000', credit: 600 }] }, T);

console.log('· Pilotage : KPI vivants (dérivés des écritures)');
const k = await get(`${P}/kpis/${ex.id}`, T);
assert(k.chiffreAffaires === 1000 && k.charges === 500 && k.resultat === 500, 'CA 1000 / charges 500 / résultat 500');
assert(k.creancesClients === 1200 && k.dettesFournisseurs === 600, 'créances 1200 / dettes 600');

console.log('· Fiscalité : calcul IS sur le résultat');
const fisc = await get(`${P}/fisc/${ex.id}?type=is`, T);
assert(fisc.base === 500 && fisc.reduit === 75 && fisc.normal === 125, 'IS base 500 → réduit 75 / normal 125');

console.log('· Déclaration + échéancier');
await post(`${P}/declarations`, { type: 'is', periode: '2026', dateEcheance: '2027-05-15', montant: 75 }, T);
const decls = await get(`${P}/declarations`, T);
assert(decls.length === 1 && decls[0].type === 'is', 'déclaration IS planifiée');
const dep = await patch(`${P}/declarations/${decls[0].id}`, { statut: 'deposee' }, T);
assert(dep.statut === 'deposee', 'déclaration marquée déposée');

console.log('· Assistant IA : propose → l\'humain valide');
const sug = await post(`${P}/ia/proposer`, { libelle: 'GASOIL EXPRESS facture carburant' }, T);
assert(sug.type === 'imputation' && sug.proposition.compte === '606100000' && sug.statut === 'en_attente',
  'imputation proposée (606100000), en attente de validation');
const acc = await patch(`${P}/ia/${sug.id}`, { statut: 'acceptee' }, T);
assert(acc.statut === 'acceptee', 'suggestion validée par l\'humain');

console.log('· Contrôle de cohérence : compte d\'attente 471 non soldé');
await post(`/entreprises/${ent}/compta/ecritures`, { journal: 'OD', date: '2026-06-01', piece: 'OD9', libelle: 'À ventiler',
  lignes: [{ compte: '471', debit: 300 }, { compte: '512', credit: 300 }] }, T);
const ctrl = await post(`${P}/ia/controle-attente/${ex.id}`, {}, T);
assert(ctrl.anomalie === true, 'anomalie détectée (471 non soldé)');
const iaList = await get(`${P}/ia`, T);
assert(iaList.some((x) => x.type === 'anomalie'), 'anomalie présente dans la file IA');

console.log('\nL5 — CRITÈRE DE SORTIE : OK\n');
