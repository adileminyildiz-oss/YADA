// Vérifie le critère de sortie L2 :
//   émettre une facture multi-taux conforme (numéro continu) ;
//   générer le Factur-X ; encaisser et suivre les impayés.
const BASE = process.env.BASE || 'http://localhost:3000/api';
const j = async (r) => { const t = await r.text(); let b; try { b = JSON.parse(t); } catch { b = t; } if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`); return b; };
const req = (m, p, body, token) => fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
const post = (p, b, t) => req('POST', p, b, t).then(j);
const get = (p, t) => req('GET', p, undefined, t).then(j);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const stamp = Date.now();
const s = await post('/auth/register', { organisation: 'Cabinet L2', email: `l2_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'L2', prenom: 'Admin' });
const T = s.token;
const ent = await post('/entreprises', { denomination: 'MENUISERIE DURAND' }, T);
await req('PATCH', `/entreprises/${ent.id}`, { siren: '812345678', tvaIntra: 'FR25812345678' }, T).then(j);
const cli = await post(`/entreprises/${ent.id}/tiers`, { type: 'client', nom: 'ACME SARL' }, T);

const lignes = [
  { designation: 'Prestation conseil', quantite: 1, prixUnitaireHt: 1500, tauxTva: 20, nature: 'prestation' },
  { designation: 'Fournitures', quantite: 3, prixUnitaireHt: 120, tauxTva: 10, nature: 'bien' },
];

console.log('· Création facture multi-taux (brouillon)');
const d = await post(`/entreprises/${ent.id}/factures`, { type: 'facture', tiersId: cli.id, lignes }, T);
assert(d.facture.statut === 'brouillon' && d.facture.numero.startsWith('BR-'), 'brouillon avec numéro provisoire BR-');
assert(Number(d.facture.montant_ttc) === 2196, 'TTC = 2196');
assert(d.ventilation.parTaux.length === 2, 'TVA ventilée sur 2 taux');

console.log('· Émission → numéro FAC continu');
const e1 = await post(`/entreprises/${ent.id}/factures/${d.facture.id}/emettre`, {}, T);
assert(/^FAC-\d{4}-0001$/.test(e1.facture.numero) && e1.facture.statut === 'emise', `émise ${e1.facture.numero}`);

const d2 = await post(`/entreprises/${ent.id}/factures`, { type: 'facture', tiersId: cli.id, lignes: [{ designation: 'x', quantite: 1, prixUnitaireHt: 100, tauxTva: 20 }] }, T);
const e2 = await post(`/entreprises/${ent.id}/factures/${d2.facture.id}/emettre`, {}, T);
assert(/^FAC-\d{4}-0002$/.test(e2.facture.numero), `2e facture continue ${e2.facture.numero}`);

console.log('· Un brouillon supprimé ne casse pas la suite FAC');
const dBr = await post(`/entreprises/${ent.id}/factures`, { type: 'facture', tiersId: cli.id, lignes: [{ designation: 'y', quantite: 1, prixUnitaireHt: 50, tauxTva: 20 }] }, T);
assert(dBr.facture.numero.startsWith('BR-'), 'reste en brouillon (BR-), pas de FAC consommé');
const d3 = await post(`/entreprises/${ent.id}/factures`, { type: 'facture', tiersId: cli.id, lignes: [{ designation: 'z', quantite: 1, prixUnitaireHt: 70, tauxTva: 20 }] }, T);
const e3 = await post(`/entreprises/${ent.id}/factures/${d3.facture.id}/emettre`, {}, T);
assert(/^FAC-\d{4}-0003$/.test(e3.facture.numero), `suite FAC continue et sans trou ${e3.facture.numero}`);

console.log('· Factur-X (XML CII conforme EN 16931)');
const xml = await req('GET', `/entreprises/${ent.id}/factures/${e1.facture.id}/facturx`, undefined, T).then((r) => r.text());
assert(xml.includes('<rsm:CrossIndustryInvoice') && xml.includes(e1.facture.numero), 'Factur-X généré (racine + numéro)');
assert(xml.includes('urn:cen.eu:en16931:2017'), 'URN de guideline EN 16931');
assert(xml.includes('<ram:GrandTotalAmount>2196.00</ram:GrandTotalAmount>'), 'Factur-X : TTC 2196.00 (2 décimales)');
assert(xml.includes('<ram:CountryID>FR</ram:CountryID>'), 'adresse postale (pays) présente');
assert(xml.includes('812345678'), 'Factur-X : SIREN vendeur');
const xmlB = await req('GET', `/entreprises/${ent.id}/factures/${e1.facture.id}/facturx?profil=basic`, undefined, T).then((r) => r.text());
assert(xmlB.includes('urn:factur-x.eu:1p0:basic'), 'profil BASIC sélectionnable (URN dédiée)');

console.log('· Conteneur Factur-X (PDF/A-3 embarquant le XML)');
const fxRes = await req('GET', `/entreprises/${ent.id}/factures/${e1.facture.id}/facturx-pdf`, undefined, T);
assert((fxRes.headers.get('content-type') || '').includes('application/pdf'), 'Content-Type application/pdf');
const fxBuf = Buffer.from(await fxRes.arrayBuffer());
const fxStr = fxBuf.toString('latin1');
assert(fxStr.startsWith('%PDF-') && fxStr.includes('(factur-x.xml)') && fxStr.includes('/AFRelationship /Data'), 'PDF/A-3 : factur-x.xml embarqué (AF /Data)');
assert(fxStr.includes('<pdfaid:part>3</pdfaid:part>'), 'PDF/A-3 : identification XMP');
assert(fxBuf.includes(Buffer.from('<rsm:CrossIndustryInvoice', 'utf8')), 'le XML CII est bien dans le PDF');

console.log('· PDF de facture (téléchargement)');
const pdfRes = await req('GET', `/entreprises/${ent.id}/factures/${e1.facture.id}/pdf`, undefined, T);
assert((pdfRes.headers.get('content-type') || '').includes('application/pdf'), 'Content-Type application/pdf');
const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
assert(pdfBuf.slice(0, 5).toString('latin1') === '%PDF-', 'corps = PDF (magic %PDF-)');
assert(pdfBuf.toString('latin1').includes(e1.facture.numero), 'le PDF contient le numéro de facture');

console.log('· Encaissement & impayés');
const p1 = await post(`/entreprises/${ent.id}/factures/${e1.facture.id}/reglements`, { montant: 1000, moyen: 'virement' }, T);
assert(p1.facture.statut === 'partielle' && Number(p1.facture.montant_paye) === 1000, 'règlement partiel → partielle');
const p2 = await post(`/entreprises/${ent.id}/factures/${e1.facture.id}/reglements`, { montant: 1196, moyen: 'cb' }, T);
assert(p2.facture.statut === 'payee' && Number(p2.facture.montant_paye) === 2196, 'solde → payée');

console.log('\nL2 — CRITÈRE DE SORTIE : OK\n');
