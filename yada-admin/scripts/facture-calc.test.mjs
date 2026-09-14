// Test PUR des calculs de facturation (sans base ni réseau) :
// TVA ventilée par taux + Factur-X (CII).
import { computeTotals, facturxXML } from '../dist/factures/facture.calc.js';
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

const lignes = [
  { designation: 'Prestation conseil', quantite: 1, prixUnitaireHt: 1500, tauxTva: 20 },
  { designation: 'Fournitures',        quantite: 3, prixUnitaireHt: 120,  tauxTva: 10 },
];
const t = computeTotals(lignes);
assert(t.ht === 1860, `HT = 1860 (obtenu ${t.ht})`);
assert(t.tva === 336, `TVA = 336 (obtenu ${t.tva})`);
assert(t.ttc === 2196, `TTC = 2196 (obtenu ${t.ttc})`);
assert(t.parTaux.length === 2, 'deux taux distincts');
const g20 = t.parTaux.find((g) => g.taux === 20);
const g10 = t.parTaux.find((g) => g.taux === 10);
assert(g20.base === 1500 && g20.tva === 300, 'ventilation 20 % : base 1500, TVA 300');
assert(g10.base === 360 && g10.tva === 36, 'ventilation 10 % : base 360, TVA 36');

// Remise ligne
const t2 = computeTotals([{ designation: 'x', quantite: 2, prixUnitaireHt: 100, tauxTva: 20, remisePct: 10 }]);
assert(t2.ht === 180 && t2.tva === 36 && t2.ttc === 216, 'remise 10 % appliquée (HT 180, TTC 216)');

const xml = facturxXML({
  numero: 'FAC-2026-0001', dateEmission: '2026-09-14',
  vendeur: { nom: 'MENUISERIE DURAND', siren: '812345678', tvaIntra: 'FR25812345678' },
  acheteur: { nom: 'ACME SARL', tvaIntra: null },
  lignes, totaux: t, devise: 'EUR',
});
assert(xml.includes('<rsm:CrossIndustryInvoice'), 'Factur-X : racine CII présente');
assert(xml.includes('FAC-2026-0001'), 'Factur-X : numéro présent');
assert(xml.includes('<ram:GrandTotalAmount>2196</ram:GrandTotalAmount>'), 'Factur-X : total TTC 2196');
assert((xml.match(/<ram:ApplicableTradeTax>/g) || []).length >= 3, 'Factur-X : TVA ventilée (lignes + en-tête)');
assert(xml.includes('812345678'), 'Factur-X : SIREN vendeur présent');

console.log('\nFACTURE CALC + FACTUR-X : OK\n');
