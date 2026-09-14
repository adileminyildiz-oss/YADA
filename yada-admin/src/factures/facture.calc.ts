/**
 * Calculs de facturation PURS (testables sans base ni réseau).
 * TVA ventilée PAR TAUX (jamais à un taux moyen).
 */
export interface LigneInput {
  designation: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
  remisePct?: number;
  nature?: 'bien' | 'service' | 'prestation';
  compteProduit?: string;
  ordre?: number;
}

export interface VentilationTaux { taux: number; base: number; tva: number; }
export interface Totaux { ht: number; tva: number; ttc: number; parTaux: VentilationTaux[]; }

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeTotals(lignes: LigneInput[]): Totaux {
  const parTaux = new Map<number, VentilationTaux>();
  let ht = 0;
  for (const l of lignes) {
    const brut = (Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0);
    const net = r2(brut * (1 - (Number(l.remisePct) || 0) / 100));
    const taux = Number(l.tauxTva) || 0;
    ht = r2(ht + net);
    const g = parTaux.get(taux) || { taux, base: 0, tva: 0 };
    g.base = r2(g.base + net);
    parTaux.set(taux, g);
  }
  let tva = 0;
  const rows = [...parTaux.values()].sort((a, b) => b.taux - a.taux);
  for (const g of rows) { g.tva = r2(g.base * g.taux / 100); tva = r2(tva + g.tva); }
  return { ht, tva, ttc: r2(ht + tva), parTaux: rows };
}

/** Échappement XML minimal. */
const x = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface FacturxCtx {
  numero: string;
  dateEmission: string;        // YYYY-MM-DD
  vendeur: { nom: string; siren?: string | null; tvaIntra?: string | null };
  acheteur: { nom: string; tvaIntra?: string | null };
  lignes: LigneInput[];
  totaux: Totaux;
  devise?: string;
}

/**
 * Factur-X / CII (profil simplifié, représentatif de la norme EN 16931).
 * À fiabiliser (schéma officiel + PDF/A-3) avant transmission réelle via PDP.
 */
export function facturxXML(c: FacturxCtx): string {
  const dev = c.devise || 'EUR';
  const dt = (c.dateEmission || '').replace(/-/g, '');
  const lignes = c.lignes.map((l, i) => {
    const net = r2((Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0) * (1 - (Number(l.remisePct) || 0) / 100));
    return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct><ram:Name>${x(l.designation)}</ram:Name></ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${r2(l.prixUnitaireHt)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">${l.quantite}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${l.tauxTva}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${net}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
  }).join('\n');

  const taxes = c.totaux.parTaux.map((g) =>
    `      <ram:ApplicableTradeTax><ram:CalculatedAmount>${g.tva}</ram:CalculatedAmount><ram:TypeCode>VAT</ram:TypeCode><ram:BasisAmount>${g.base}</ram:BasisAmount><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${g.taux}</ram:RateApplicablePercent></ram:ApplicableTradeTax>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100">
  <rsm:ExchangedDocument>
    <ram:ID>${x(c.numero)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime><udt:DateTimeString format="102" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">${dt}</udt:DateTimeString></ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${lignes}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty><ram:Name>${x(c.vendeur.nom)}</ram:Name>${c.vendeur.siren ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${x(c.vendeur.siren)}</ram:ID></ram:SpecifiedLegalOrganization>` : ''}${c.vendeur.tvaIntra ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(c.vendeur.tvaIntra)}</ram:ID></ram:SpecifiedTaxRegistration>` : ''}</ram:SellerTradeParty>
      <ram:BuyerTradeParty><ram:Name>${x(c.acheteur.nom)}</ram:Name>${c.acheteur.tvaIntra ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(c.acheteur.tvaIntra)}</ram:ID></ram:SpecifiedTaxRegistration>` : ''}</ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${dev}</ram:InvoiceCurrencyCode>
${taxes}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:TaxBasisTotalAmount>${c.totaux.ht}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${dev}">${c.totaux.tva}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${c.totaux.ttc}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${c.totaux.ttc}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}
