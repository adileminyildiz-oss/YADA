// Test PUR des calculs fiscaux (IS/IR) + proposition d'imputation IA.
import { calcIS, calcIR } from '../dist/pilotage/fisc.js';
import { proposeCompte } from '../dist/pilotage/ia.js';
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

let is = calcIS(100000);
assert(is.reduit === 20750, `IS PME base 100000 → 20 750 (obtenu ${is.reduit})`);
assert(is.normal === 25000, `IS normal base 100000 → 25 000 (obtenu ${is.normal})`);
is = calcIS(30000);
assert(is.reduit === 4500, `IS PME base 30000 → 4 500 (obtenu ${is.reduit})`);
assert(calcIS(-500).reduit === 0, 'base négative → IS 0');

const ir = calcIR(40000, 1);
assert(ir.impot === 5286.23, `IR 40000 / 1 part → 5 286,23 (obtenu ${ir.impot})`);
assert(calcIR(40000, 2).impot < ir.impot, 'quotient familial : 2 parts < 1 part');

assert(proposeCompte('GASOIL EXPRESS').compte === '606100000', 'imputation carburant → 606100000');
assert(proposeCompte('Honoraires avocat').compte === '622600000', 'imputation honoraires → 622600000');
const def = proposeCompte('BIDULE INCONNU');
assert(def.compte === '606000000' && def.confiance < 0.5, 'inconnu → compte par défaut, confiance faible');

console.log('\nFISCALITÉ + IA (purs) : OK\n');
