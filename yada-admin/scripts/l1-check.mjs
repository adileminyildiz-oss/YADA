// Vérifie le critère de sortie L1 :
//   « Saisir un SIREN → fiche pré-remplie ; suivre un prospect jusqu'à client. »
// (Le volet SIREN→fiche est prouvé sans réseau par siren-mapper.test.mjs ;
//  ici on prouve la fiche pré-remplie PERSISTÉE + le pipeline prospect→client live.)
const BASE = process.env.BASE || 'http://localhost:3000/api';

const j = async (r) => {
  const t = await r.text(); let b; try { b = JSON.parse(t); } catch { b = t; }
  if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`);
  return b;
};
const req = (m, p, body, token) => fetch(BASE + p, {
  method: m,
  headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});
const post  = (p, b, t) => req('POST', p, b, t).then(j);
const patch = (p, b, t) => req('PATCH', p, b, t).then(j);
const get   = (p, t)    => req('GET', p, undefined, t).then(j);
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const stamp = Date.now();
console.log('· Inscription cabinet');
const s = await post('/auth/register', {
  organisation: 'Cabinet L1', email: `l1_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'L1', prenom: 'Admin',
});
const T = s.token;

console.log('· Création d\'un prospect');
const ent = await post('/entreprises', { denomination: 'MENUISERIE DURAND', origine: 'Recommandation' }, T);
assert(ent.statut === 'prospect' && ent.etape_crm === 'nouveau', 'entré comme prospect (étape nouveau)');

console.log('· Fiche pré-remplie via SIREN → enregistrée (l\'humain valide)');
const filled = await patch(`/entreprises/${ent.id}`, {
  siren: '812345678', siret: '81234567800027', codeApe: '43.32A',
  tvaIntra: 'FR25812345678', ville: 'AMIENS', formeJuridique: 'SAS',
}, T);
assert(filled.siren === '812345678' && filled.tva_intra === 'FR25812345678', 'champs identité persistés');
assert(!!filled.source_maj_at, 'horodatage d\'enrichissement posé (source_maj_at)');

console.log('· Contact dirigeant (issu de l\'INPI) → tiers principal');
await post(`/entreprises/${ent.id}/tiers`, { type: 'prospect', nom: 'Jean DURAND', fonction: 'Président', principal: true }, T);
const contacts = await get(`/entreprises/${ent.id}/tiers`, T);
assert(contacts[0].principal === true && contacts[0].nom === 'Jean DURAND', 'contact référent enregistré');

console.log('· Pipeline : prospect → qualifié → proposition → gagné');
await post(`/entreprises/${ent.id}/etape`, { etape: 'qualifie' }, T);
await post(`/entreprises/${ent.id}/etape`, { etape: 'proposition' }, T);
const won = await post(`/entreprises/${ent.id}/etape`, { etape: 'gagne' }, T);
assert(won.entreprise.statut === 'actif' && won.entreprise.etape_crm === 'gagne', 'converti en client actif');
assert(won.mission && won.mission.statut === 'ouverte', 'une première mission a été ouverte à la conversion');

console.log('· Vérifications finales');
const full = await get(`/entreprises/${ent.id}`, T);
assert(full.missions.length >= 1, 'la mission est rattachée à l\'entreprise');
const pipe = await get('/entreprises/pipeline', T);
assert(pipe.gagne.some((e) => e.id === ent.id), 'le dossier apparaît dans la colonne « gagné »');
assert(!pipe.nouveau.some((e) => e.id === ent.id), 'il a quitté la colonne « nouveau »');

// Mode dégradé de l'enrichissement live (réseau souvent bloqué en bac à sable).
const live = await req('GET', '/siren/812345678', undefined, T);
assert(live.status === 200 || live.status === 503,
  live.status === 200 ? 'endpoint SIREN live : enrichissement OK' : 'endpoint SIREN live : mode dégradé propre (503)');

console.log('\nL1 — CRITÈRE DE SORTIE : OK\n');
