// Test PUR Factur-X (sans base ni réseau) :
//  · XML CII conforme EN 16931 (contexte/URN, parties+adresses, TVA par taux, totaux) ;
//  · conteneur PDF/A-3 embarquant le XML (AF/EmbeddedFiles/XMP/OutputIntent+ICC).
import { facturxCII, GUIDELINE_URN } from '../dist/factures/facturx.js';
import { facturxPdfA3 } from '../dist/factures/pdfa3.js';
const assert = (c, m) => { if (!c) { console.error('ASSERT ÉCHEC: ' + m); process.exit(1); } console.log('  ✓ ' + m); };

const doc = {
  numero: 'FAC-2026-0001', type: 'facture', dateEmission: '2026-03-15', dateEcheance: '2026-04-14',
  devise: 'EUR', buyerReference: 'BC-778',
  vendeur: { nom: 'ACTION BTP', siren: '812345678', tvaIntra: 'FR40812345678', adresse: '5 rue des Lilas', cp: '80000', ville: 'AMIENS', pays: 'France' },
  acheteur: { nom: 'ACME SARL', tvaIntra: 'FR00999888777', adresse: '2 av. du Port', cp: '75001', ville: 'PARIS' },
  lignes: [
    { designation: 'Prestation conseil', quantite: 1, prixUnitaireHt: 1500, tauxTva: 20 },
    { designation: 'Fournitures', quantite: 3, prixUnitaireHt: 120, tauxTva: 10 },
  ],
  totaux: { ht: 1860, tva: 336, ttc: 2196, parTaux: [{ taux: 20, base: 1500, tva: 300 }, { taux: 10, base: 360, tva: 36 }] },
};

// ── XML EN 16931 ────────────────────────────────────────────────────────────
const xml = facturxCII(doc, 'en16931');
assert(xml.startsWith('<?xml'), 'déclaration XML');
assert(xml.includes('<rsm:CrossIndustryInvoice'), 'racine CrossIndustryInvoice');
assert(xml.includes(`<ram:ID>${GUIDELINE_URN.en16931}</ram:ID>`), 'URN de guideline EN 16931 (contexte)');
assert(xml.includes('<ram:TypeCode>380</ram:TypeCode>'), 'type de document 380 (facture)');
assert(xml.includes('<udt:DateTimeString format="102">20260315</udt:DateTimeString>'), 'date d\'émission format 102');
assert(xml.includes('<ram:DueDateDateTime><udt:DateTimeString format="102">20260414'), 'échéance de paiement');
assert(xml.includes('schemeID="0002">812345678'), 'SIREN vendeur (schemeID 0002)');
assert(xml.includes('<ram:CountryID>FR</ram:CountryID>'), 'adresse postale avec pays (BR-9/BR-10)');
assert(xml.includes('schemeID="VA">FR40812345678'), 'TVA intra vendeur');
assert(xml.includes('<ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>'), 'devise EUR');
// ventilation par taux (BG-23)
assert((xml.match(/<ram:ApplicableTradeTax>/g) || []).length >= 2, 'ventilation TVA sur 2 taux (en-tête)');
assert(xml.includes('<ram:BasisAmount>1500.00</ram:BasisAmount>') && xml.includes('<ram:CalculatedAmount>300.00</ram:CalculatedAmount>'), 'taux 20 % : base 1500 / TVA 300');
assert(xml.includes('<ram:BasisAmount>360.00</ram:BasisAmount>') && xml.includes('<ram:CalculatedAmount>36.00</ram:CalculatedAmount>'), 'taux 10 % : base 360 / TVA 36');
// récapitulatif monétaire (BG-22)
assert(xml.includes('<ram:TaxBasisTotalAmount>1860.00</ram:TaxBasisTotalAmount>'), 'total HT 1860.00');
assert(xml.includes('<ram:TaxTotalAmount currencyID="EUR">336.00</ram:TaxTotalAmount>'), 'total TVA 336.00');
assert(xml.includes('<ram:GrandTotalAmount>2196.00</ram:GrandTotalAmount>'), 'total TTC 2196.00');
assert(xml.includes('<ram:DuePayableAmount>2196.00</ram:DuePayableAmount>'), 'net à payer 2196.00');
// bien formé : balises ouvrantes = fermantes
const open = (xml.match(/<[a-zA-Z][^!?][^>]*[^/]>/g) || []).filter((t) => !/\/>$/.test(t)).length;
const close = (xml.match(/<\/[a-zA-Z]/g) || []).length;
assert(open === close, `XML équilibré (${open} ouvrantes = ${close} fermantes)`);

// profils : URN correcte
assert(facturxCII(doc, 'basic').includes(GUIDELINE_URN.basic), 'profil BASIC → URN dédiée');
assert(facturxCII({ ...doc, type: 'avoir' }, 'en16931').includes('<ram:TypeCode>381</ram:TypeCode>'), 'avoir → type 381');

// ── Conteneur PDF/A-3 ────────────────────────────────────────────────────────
const pdf = facturxPdfA3(doc, xml, 'en16931');
const s = pdf.toString('latin1');
assert(s.startsWith('%PDF-1.7'), 'PDF 1.7');
assert(s.trimEnd().endsWith('%%EOF'), 'se termine par %%EOF');
assert(s.includes('/EmbeddedFiles') && s.includes('(factur-x.xml)'), 'pièce jointe factur-x.xml (EmbeddedFiles)');
assert(s.includes('/AFRelationship /Data'), 'AFRelationship /Data');
assert(s.includes('/AF [9 0 R]'), 'tableau /AF au catalogue');
assert(s.includes('/OutputIntents [10 0 R]') && s.includes('/DestOutputProfile 11 0 R'), 'OutputIntent + profil ICC');
assert(s.includes('acsp'), 'profil ICC embarqué (signature acsp)');
assert(s.includes('<pdfaid:part>3</pdfaid:part>') && s.includes('<pdfaid:conformance>B</pdfaid:conformance>'), 'XMP : identification PDF/A-3B');
assert(s.includes('urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#'), 'XMP : schéma d\'extension Factur-X');
assert(s.includes('<fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>'), 'XMP : niveau de conformité EN 16931');
// le XML embarqué est bien présent (octet pour octet) dans le flux
assert(pdf.includes(Buffer.from(xml, 'utf8')), 'le XML CII est embarqué tel quel dans le PDF');
// xref cohérent
const off = Number(s.match(/startxref\n(\d+)\n/)[1]);
assert(s.slice(off, off + 4) === 'xref', 'startxref pointe sur xref');

console.log('\n✅ Factur-X — XML EN 16931 conforme + conteneur PDF/A-3 (dernière validation veraPDF/PDP à exécuter)');
