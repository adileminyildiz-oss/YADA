// Test PUR de l'extraction facture (couche texte / OCR) — sans réseau ni base.
import { extractInvoiceData } from '../dist/reception/extract.js';
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

const texte = `EDF PRO
Facture n° FE-2026-77120
Date : 05/09/2026
Total HT      260,33
TVA 20%        52,07
Net à payer   312,40 EUR`;

const r = extractInvoiceData(texte);
assert(r.numero === 'FE-2026-77120', `numéro extrait (${r.numero})`);
assert(r.dateFacture === '2026-09-05', `date extraite (${r.dateFacture})`);
assert(r.ttc === 312.40, `TTC extrait (${r.ttc})`);
assert(r.tva === 52.07, `TVA extraite (${r.tva})`);
assert(r.ht === 260.33, `HT extrait (${r.ht})`);
assert(r.taux === 20, `taux extrait (${r.taux})`);
assert(r.fournisseur === 'EDF PRO', `fournisseur (1re ligne) (${r.fournisseur})`);
assert(r.confiance >= 0.8, `confiance élevée (${r.confiance})`);

// Déduction : seulement TTC + taux → HT/TVA calculés.
const r2 = extractInvoiceData('Total TTC 120,00\nTVA 20 %');
assert(r2.ht === 100 && r2.tva === 20, `déduction HT/TVA depuis TTC+taux (${r2.ht}/${r2.tva})`);

console.log('\nEXTRACTION FACTURE : OK\n');
