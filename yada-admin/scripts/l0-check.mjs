// Vérifie le critère de sortie L0 :
//   « Créer une société, un utilisateur, s'y connecter, retrouver la donnée
//     après redémarrage serveur. » + isolation multi-tenant (RLS).
//
// phase "full"    : inscription, création, listing, isolation entre 2 orgs.
// phase "persist" : après redémarrage du conteneur DB, la donnée est toujours là.
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:3000/api';
const STATE = '/tmp/yada-l0-state.json';
const phase = process.argv[2] || 'full';

const j = async (r) => {
  const t = await r.text();
  let b; try { b = JSON.parse(t); } catch { b = t; }
  if (!r.ok) throw new Error(`HTTP ${r.status} → ${JSON.stringify(b)}`);
  return b;
};
const post = (p, body, token) => fetch(BASE + p, {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
  body: JSON.stringify(body),
}).then(j);
const get = (p, token) => fetch(BASE + p, {
  headers: token ? { authorization: 'Bearer ' + token } : {},
}).then(j);

const assert = (cond, msg) => { if (!cond) throw new Error('ASSERT: ' + msg); console.log('  ✓ ' + msg); };

if (phase === 'full') {
  const stamp = Date.now();
  const a = { organisation: 'Cabinet ALPHA', email: `alpha_${stamp}@yada.test`, motDePasse: 'Password123!', nom: 'Alpha', prenom: 'Admin' };
  const b = { organisation: 'Cabinet BETA',  email: `beta_${stamp}@yada.test`,  motDePasse: 'Password123!', nom: 'Beta',  prenom: 'Admin' };

  console.log('· Inscription org A + admin');
  const ra = await post('/auth/register', a);
  assert(ra.token && ra.user.role === 'admin', 'org A créée, admin authentifié');

  console.log('· Création d\'une entreprise (dossier) dans A');
  const ent = await post('/entreprises', { denomination: 'MENUISERIE DURAND', formeJuridique: 'SAS', siren: '812345678' }, ra.token);
  assert(ent.id && ent.denomination === 'MENUISERIE DURAND', 'entreprise créée');

  console.log('· Listing A');
  const listA = await get('/entreprises', ra.token);
  assert(listA.some((e) => e.id === ent.id), 'A voit son entreprise');

  console.log('· Inscription org B + isolation (RLS)');
  const rb = await post('/auth/register', b);
  await post('/entreprises', { denomination: 'AUTRE SARL' }, rb.token);
  const listB = await get('/entreprises', rb.token);
  assert(!listB.some((e) => e.id === ent.id), 'B ne voit PAS l\'entreprise de A (isolation)');
  assert(listB.length === 1, 'B ne voit que sa propre entreprise');

  console.log('· Re-connexion A (login)');
  const la = await post('/auth/login', { email: a.email, motDePasse: a.motDePasse });
  const listA2 = await get('/entreprises', la.token);
  assert(listA2.some((e) => e.id === ent.id), 'après re-login, A retrouve son entreprise');

  writeFileSync(STATE, JSON.stringify({ email: a.email, motDePasse: a.motDePasse, entrepriseId: ent.id, denomination: ent.denomination }));
  console.log('\nPHASE FULL : OK\n');
} else {
  const s = JSON.parse(readFileSync(STATE, 'utf8'));
  console.log('· Après redémarrage du conteneur DB — re-connexion');
  const l = await post('/auth/login', { email: s.email, motDePasse: s.motDePasse });
  assert(!!l.token, 'l\'utilisateur existe toujours (persistance auth)');
  const list = await get('/entreprises', l.token);
  assert(list.some((e) => e.id === s.entrepriseId && e.denomination === s.denomination),
    `l'entreprise « ${s.denomination} » a survécu au redémarrage (persistance donnée)`);
  console.log('\nPHASE PERSIST : OK\n');
}
