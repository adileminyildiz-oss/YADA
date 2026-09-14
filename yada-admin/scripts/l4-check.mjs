// Vérifie le critère de sortie L4 (le moteur comptable) :
//  écriture équilibrée (auto + manuelle) ; déséquilibrée REJETÉE par la base ;
//  lettrage ; balance ; CA3 ; FEC ; clôture (OD résultat + à-nouveaux équilibrés).
const BASE = process.env.BASE || 'http://localhost:3000/api';
const j = async (r) => { const t = await r.text(); let b; try { b = JSON.parse(t); } catch { b = t; } if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`); return b; };
const raw = (m, p, body, token) => fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
const post = (p, b, t) => raw('POST', p, b, t).then(j);
const get = (p, t) => raw('GET', p, undefined, t).then(j);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const stamp = Date.now();
const s = await post('/auth/register', { organisation: 'Cabinet L4', email: `l4_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'L4', prenom: 'Admin' });
const T = s.token;
const ent = (await post('/entreprises', { denomination: 'MENUISERIE DURAND' }, T)).id;
const cpath = `/entreprises/${ent}/compta`;

console.log('· Exercice 2026');
const ex = await post(`${cpath}/exercices`, { dateDebut: '2026-01-01', dateFin: '2026-12-31' }, T);
assert(ex.statut === 'ouvert', 'exercice ouvert');
const exList = await get(`${cpath}/exercices`, T);
assert(Array.isArray(exList) && exList.some((x) => x.id === ex.id), 'GET exercices liste l\'exercice créé');

console.log('· Saisie manuelle équilibrée (OD)');
const od = await post(`${cpath}/ecritures`, { journal: 'OD', date: '2026-03-10', piece: 'OD1', libelle: 'Frais de mission',
  lignes: [{ compte: '625600', debit: 120 }, { compte: '512', credit: 120 }] }, T);
assert(od.equilibree && od.totalDebit === 120 && od.totalCredit === 120, 'écriture manuelle équilibrée enregistrée');

console.log('· Écriture DÉSÉQUILIBRÉE refusée par la base');
const bad = await raw('POST', `${cpath}/ecritures`, { journal: 'OD', date: '2026-03-11', libelle: 'Bancal',
  lignes: [{ compte: '625600', debit: 100 }, { compte: '512', credit: 90 }] }, T);
assert(bad.status === 400, `déséquilibre rejeté (HTTP ${bad.status})`);

console.log('· Génération auto depuis une facture (VTE)');
const cli = await post(`/entreprises/${ent}/tiers`, { type: 'client', nom: 'ACME SARL' }, T);
const fac = await post(`/entreprises/${ent}/factures`, { type: 'facture', tiersId: cli.id, dateEmission: '2026-04-05',
  lignes: [{ designation: 'Conseil', quantite: 1, prixUnitaireHt: 1500, tauxTva: 20 },
           { designation: 'Fournitures', quantite: 3, prixUnitaireHt: 120, tauxTva: 10 }] }, T);
await post(`/entreprises/${ent}/factures/${fac.facture.id}/emettre`, {}, T);
const vte = await post(`${cpath}/facture/${fac.facture.id}`, {}, T);
assert(vte.equilibree && vte.totalDebit === 2196, 'écriture VTE équilibrée (TTC 2196)');
assert(vte.lignes.some((l) => l.compte_numero === '411000000' && Number(l.debit) === 2196), 'client 411 débité du TTC');
const tvaColl = vte.lignes.filter((l) => l.compte_numero === '445710000').reduce((s, l) => s + Number(l.credit), 0);
assert(Math.round(tvaColl * 100) / 100 === 336, `TVA collectée 336 (20%+10% ventilés, obtenu ${tvaColl})`);

console.log('· Génération auto depuis une réception (ACH)');
const four = await post(`/entreprises/${ent}/tiers`, { type: 'fournisseur', nom: 'GASOIL EXPRESS' }, T);
const dep = await post(`/entreprises/${ent}/receptions`, { sens: 'achat', nomFichier: 'g.pdf', cheminStockage: 'obj://g.pdf',
  texteOcr: 'GASOIL EXPRESS\nFacture n° G-77\nDate : 06/04/2026\nTotal HT 500,00\nTVA 20% 100,00\nNet à payer 600,00 EUR' }, T);
await post(`/receptions/${dep.reception.id}/rapprocher`, { tiersId: four.id }, T);
await post(`/receptions/${dep.reception.id}/recevoir`, {}, T);
await post(`/receptions/${dep.reception.id}/comptabiliser`, {}, T);
const ach = await post(`${cpath}/reception/${dep.reception.id}`, {}, T);
assert(ach.equilibree && ach.totalDebit === 600, 'écriture ACH équilibrée (TTC 600)');
assert(ach.lignes.some((l) => l.compte_numero === '445660000' && Number(l.debit) === 100), 'TVA déductible 100');

console.log('· Lettrage client (facture ↔ encaissement)');
await post(`${cpath}/ecritures`, { journal: 'BQ', date: '2026-04-30', piece: 'BQ1', libelle: 'Encaissement ACME',
  lignes: [{ compte: '512', debit: 2196 }, { compte: '411000000', credit: 2196 }] }, T);
const gl = await get(`${cpath}/grand-livre/411000000?exerciceId=${ex.id}`, T);
assert(gl.solde === 0, 'compte client soldé (0)');
const let2 = await post(`${cpath}/lettrage`, { compte: '411000000', ligneIds: gl.lignes.map((l) => l.id) }, T);
assert(!!let2.lettre, `lettrage posé (${let2.lettre})`);

console.log('· Balance équilibrée');
const bal = await get(`${cpath}/balance/${ex.id}`, T);
assert(bal.equilibree && bal.totalDebit === bal.totalCredit, `balance équilibrée (${bal.totalDebit} = ${bal.totalCredit})`);

console.log('· CA3 (TVA)');
const ca3 = await get(`${cpath}/ca3/${ex.id}`, T);
assert(ca3.collectee === 336 && ca3.deductible === 100 && ca3.aDecaisser === 236, `CA3 : 336 − 100 = 236 à décaisser`);

console.log('· FEC (export normé)');
const fec = await raw('GET', `${cpath}/fec/${ex.id}`, undefined, T).then((r) => r.text());
assert(fec.startsWith('JournalCode\t'), 'FEC : en-tête normé (18 champs tabulés)');
assert(fec.includes('VTE') && fec.includes('ACH') && fec.includes('OD'), 'FEC : journaux VTE + ACH + OD présents');

console.log('· Clôture (OD résultat + à-nouveaux)');
const clo = await post(`${cpath}/cloture/${ex.id}`, {}, T);
// produits 1860 (1500+360) − charges 620 (500 achat + 120 frais) = 1240
assert(clo.resultat === 1240, `résultat = 1240 (obtenu ${clo.resultat})`);
assert(clo.exerciceSuivant && clo.aNouveaux > 0, 'exercice N+1 créé + à-nouveaux reportés');
const balN1 = await get(`${cpath}/balance/${clo.exerciceSuivant}`, T);
assert(balN1.equilibree, 'bilan d\'ouverture N+1 équilibré');

console.log('\nL4 — CRITÈRE DE SORTIE : OK\n');
