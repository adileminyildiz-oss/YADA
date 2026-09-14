/**
 * Factur-X / CII conforme — profil EN 16931 (et BASIC), PUR et testable.
 *
 * Produit le XML « factur-x.xml » (Cross Industry Invoice, UN/CEFACT) structuré
 * selon la norme EN 16931 : contexte + URN de guideline, document, lignes,
 * parties (adresses postales + immatriculations), ventilation de TVA par taux
 * (BG-23), récapitulatif monétaire (BG-22), échéance de paiement.
 *
 * NB conformité : le XML vise le schéma officiel EN 16931 (les BT/BG requis y
 * sont). La validation ultime (Schematron EN 16931 + veraPDF pour le conteneur
 * PDF/A-3) reste à exécuter avant transmission réelle via une PDP.
 */

export type FacturxProfil = 'minimum' | 'basicwl' | 'basic' | 'en16931' | 'extended';

export const GUIDELINE_URN: Record<FacturxProfil, string> = {
  minimum: 'urn:factur-x.eu:1p0:minimum',
  basicwl: 'urn:factur-x.eu:1p0:basicwl',
  basic: 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic',
  en16931: 'urn:cen.eu:en16931:2017',
  extended: 'urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended',
};

export interface FacturxPartie {
  nom: string; siren?: string | null; tvaIntra?: string | null;
  adresse?: string | null; cp?: string | null; ville?: string | null; pays?: string | null;
}
export interface FacturxLigne {
  designation: string; quantite: number; prixUnitaireHt: number; tauxTva: number; remisePct?: number;
}
export interface FacturxDoc {
  numero: string;
  type?: string;                 // facture | avoir | acompte
  dateEmission: string;          // YYYY-MM-DD
  dateEcheance?: string | null;  // YYYY-MM-DD
  devise?: string;
  buyerReference?: string | null;
  vendeur: FacturxPartie;
  acheteur: FacturxPartie;
  lignes: FacturxLigne[];
  totaux: { ht: number; tva: number; ttc: number; parTaux: { taux: number; base: number; tva: number }[] };
}

const r2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const m2 = (n: number) => r2(n).toFixed(2);                 // montant 2 décimales
const x = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function typeCode(type?: string): string {
  if (type === 'avoir') return '381';      // note de crédit
  if (type === 'acompte') return '386';    // facture d'acompte
  return '380';                            // facture commerciale
}

function adresse(p: FacturxPartie): string {
  const pays = (p.pays || 'FR').slice(0, 2).toUpperCase();
  return `<ram:PostalTradeAddress>`
    + (p.cp ? `<ram:PostcodeCode>${x(p.cp)}</ram:PostcodeCode>` : '')
    + (p.adresse ? `<ram:LineOne>${x(p.adresse)}</ram:LineOne>` : '')
    + (p.ville ? `<ram:CityName>${x(p.ville)}</ram:CityName>` : '')
    + `<ram:CountryID>${pays}</ram:CountryID>`
    + `</ram:PostalTradeAddress>`;
}

export function facturxCII(d: FacturxDoc, profil: FacturxProfil = 'en16931'): string {
  const dev = d.devise || 'EUR';
  const dt = (d.dateEmission || '').replace(/-/g, '');
  const urn = GUIDELINE_URN[profil] || GUIDELINE_URN.en16931;

  const lignes = d.lignes.map((l, i) => {
    const net = r2((Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0) * (1 - (Number(l.remisePct) || 0) / 100));
    return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct><ram:Name>${x(l.designation)}</ram:Name></ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice><ram:ChargeAmount>${m2(l.prixUnitaireHt)}</ram:ChargeAmount></ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">${l.quantite}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${l.tauxTva}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${m2(net)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
  }).join('\n');

  const taxes = d.totaux.parTaux.map((g) =>
    `      <ram:ApplicableTradeTax>`
    + `<ram:CalculatedAmount>${m2(g.tva)}</ram:CalculatedAmount>`
    + `<ram:TypeCode>VAT</ram:TypeCode>`
    + `<ram:BasisAmount>${m2(g.base)}</ram:BasisAmount>`
    + `<ram:CategoryCode>S</ram:CategoryCode>`
    + `<ram:RateApplicablePercent>${g.taux}</ram:RateApplicablePercent>`
    + `</ram:ApplicableTradeTax>`).join('\n');

  const seller = `<ram:SellerTradeParty>`
    + `<ram:Name>${x(d.vendeur.nom)}</ram:Name>`
    + (d.vendeur.siren ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${x(d.vendeur.siren)}</ram:ID></ram:SpecifiedLegalOrganization>` : '')
    + adresse(d.vendeur)
    + (d.vendeur.tvaIntra ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(d.vendeur.tvaIntra)}</ram:ID></ram:SpecifiedTaxRegistration>` : '')
    + `</ram:SellerTradeParty>`;
  const buyer = `<ram:BuyerTradeParty>`
    + `<ram:Name>${x(d.acheteur.nom)}</ram:Name>`
    + adresse(d.acheteur)
    + (d.acheteur.tvaIntra ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(d.acheteur.tvaIntra)}</ram:ID></ram:SpecifiedTaxRegistration>` : '')
    + `</ram:BuyerTradeParty>`;

  const echeance = d.dateEcheance
    ? `      <ram:SpecifiedTradePaymentTerms><ram:DueDateDateTime><udt:DateTimeString format="102">${d.dateEcheance.replace(/-/g, '')}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>\n`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>${urn}</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${x(d.numero)}</ram:ID>
    <ram:TypeCode>${typeCode(d.type)}</ram:TypeCode>
    <ram:IssueDateTime><udt:DateTimeString format="102">${dt}</udt:DateTimeString></ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${lignes}
    <ram:ApplicableHeaderTradeAgreement>
      ${d.buyerReference ? `<ram:BuyerReference>${x(d.buyerReference)}</ram:BuyerReference>` : ''}
      ${seller}
      ${buyer}
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${dev}</ram:InvoiceCurrencyCode>
${echeance}${taxes}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${m2(d.totaux.ht)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${m2(d.totaux.ht)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${dev}">${m2(d.totaux.tva)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${m2(d.totaux.ttc)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${m2(d.totaux.ttc)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}
