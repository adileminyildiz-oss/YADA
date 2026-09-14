// Test PUR de l'auto-remplissage SIREN (aucun réseau) :
// une réponse de l'API publique → fiche société pré-remplie.
// Vérifie le volet « Saisir un SIREN → fiche pré-remplie » du critère de sortie L1.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mapRechercheEntreprises, tvaFromSiren } from '../dist/siren/siren.mapper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(__dirname, '..', 'test', 'fixtures', 'recherche-entreprises.sample.json'), 'utf8'),
);
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

const f = mapRechercheEntreprises(fixture, '812345678');
assert(f.denomination === 'MENUISERIE DURAND', 'dénomination extraite');
assert(f.siret === '81234567800027', 'SIRET du siège extrait');
assert(f.codeApe === '43.32A', 'code APE extrait');
assert(f.ville === 'AMIENS' && f.codePostal === '80000', 'commune + code postal extraits');
assert(f.adresse === '14 RUE DES ARTISANS', 'adresse du siège reconstruite');
assert(/^FR\d{2}812345678$/.test(f.tvaIntra), 'n° TVA intra reconstitué depuis le SIREN');
assert(tvaFromSiren('812345678') === f.tvaIntra, 'clé TVA déterministe');
assert(f.dirigeants.length === 1 && f.dirigeants[0].nom === 'Jean DURAND' && f.dirigeants[0].fonction === 'Président',
  'dirigeant (nom + qualité) remonté → futur tiers');
assert(f.source === 'recherche-entreprises.api.gouv.fr', 'source tracée');

console.log('\nSIREN MAPPER : OK\n');
