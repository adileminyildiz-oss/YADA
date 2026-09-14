// Test PUR du générateur de PDF de facture (sans base ni réseau) :
// le fichier produit est un PDF structurellement valide (header, objets, xref, EOF).
import { facturePdf } from '../dist/factures/facture.pdf.js';
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

const pdf = facturePdf({
  numero: 'FAC-2026-0001',
  type: 'facture',
  dateEmission: '2026-03-15',
  dateEcheance: '2026-04-14',
  devise: 'EUR',
  statut: 'emise',
  conditions: 'Paiement à 30 jours — pénalités de retard 3× taux légal + 40 € (art. L441-10)',
  vendeur: { nom: 'ACTION BTP', siren: '812345678', tvaIntra: 'FR40812345678' },
  acheteur: { nom: 'Client Résidence Picardie', tvaIntra: 'FR00999888777' },
  lignes: [
    { designation: 'Prestation conseil comptable', quantite: 1, prixUnitaireHt: 1500, tauxTva: 20 },
    { designation: 'Fournitures diverses (accents : é è à ç €)', quantite: 3, prixUnitaireHt: 120, tauxTva: 10, remisePct: 5 },
  ],
  totaux: { ht: 1842, tva: 334.2, ttc: 2176.2, parTaux: [
    { taux: 20, base: 1500, tva: 300 }, { taux: 10, base: 342, tva: 34.2 },
  ] },
});

assert(Buffer.isBuffer(pdf), 'renvoie un Buffer');
const s = pdf.toString('latin1');
assert(s.startsWith('%PDF-1.'), 'commence par un en-tête %PDF-1.x');
assert(s.trimEnd().endsWith('%%EOF'), 'se termine par %%EOF');
assert(s.includes('/Type /Catalog'), 'contient le Catalog');
assert(s.includes('/Type /Page') && s.includes('/MediaBox [0 0 595 842]'), 'page A4 (595×842)');
assert(s.includes('/BaseFont /Helvetica') && s.includes('/WinAnsiEncoding'), 'polices Helvetica + WinAnsi');
assert(/\nxref\n0 7\n/.test(s), 'table xref avec 7 entrées (6 objets)');
assert(/startxref\n\d+\n%%EOF/.test(s), 'startxref pointe l\'offset xref');
// L'offset annoncé par startxref doit tomber sur le mot-clé "xref".
const off = Number(s.match(/startxref\n(\d+)\n/)[1]);
assert(s.slice(off, off + 4) === 'xref', 'l\'offset startxref pointe bien sur "xref"');
assert(pdf.length > 800, `taille plausible (${pdf.length} octets)`);

console.log('\n✅ facture.pdf — PDF valide généré');
