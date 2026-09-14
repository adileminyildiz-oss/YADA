/**
 * Extraction PURE (testable) des données d'une facture depuis sa couche texte
 * (PDF texte, ou sortie OCR d'une image). Mirroir du post-traitement du prototype.
 * Aucune écriture : l'humain valide ensuite (règle du produit).
 */
export interface ExtractResult {
  numero: string | null;
  dateFacture: string | null; // YYYY-MM-DD
  fournisseur: string | null;
  ht: number | null;
  tva: number | null;
  ttc: number | null;
  taux: number | null;
  confiance: number; // 0..1
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** "1 234,56" | "1.234,56" | "1234.56" → 1234.56 */
function money(raw: string): number | null {
  let s = raw.replace(/[^\d.,]/g, '').trim();
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); // FR : , = décimal
  else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, ''); // 1.234.567
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function findAmount(text: string, labels: string[]): number | null {
  for (const lab of labels) {
    // Le nombre capturé ne doit pas être un pourcentage (ex. « TVA 20% 52,07 » → 52,07, pas 20).
    const re = new RegExp(lab + '[^0-9\\-]{0,20}(-?[0-9][0-9.,\\s]*[0-9])(?!\\s*%)', 'i');
    const m = text.match(re);
    if (m) { const v = money(m[1]); if (v != null) return v; }
  }
  return null;
}

export function extractInvoiceData(text: string): ExtractResult {
  const t = (text || '').replace(/ /g, ' ');
  let ttc = findAmount(t, ['net\\s*[aà]\\s*payer', 'total\\s*ttc', 'montant\\s*ttc', '\\bttc\\b']);
  let tva = findAmount(t, ['total\\s*tva', 'montant\\s*tva', 'dont\\s*tva', '\\btva\\b', 't\\.v\\.a']);
  let ht = findAmount(t, ['total\\s*ht', 'montant\\s*ht', 'total\\s*hors\\s*taxes', '\\bht\\b']);

  const tauxM = t.match(/(\d{1,2}(?:[.,]\d)?)\s*%/);
  let taux = tauxM ? Number(tauxM[1].replace(',', '.')) : null;

  const numM = t.match(/(?:facture|invoice|n[°o]|no|fa|réf|ref)[^\dA-Z]{0,6}([A-Z]{0,4}[-/]?\d[\d\-/.]{2,})/i);
  const numero = numM ? numM[1].replace(/[.\s]+$/, '') : null;

  const dateM = t.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  let dateFacture: string | null = null;
  if (dateM) {
    let [, d, mo, y] = dateM;
    if (y.length === 2) y = '20' + y;
    dateFacture = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Déductions croisées quand un montant manque.
  if (ttc != null && taux != null && ht == null && tva == null) {
    ht = r2(ttc / (1 + taux / 100)); tva = r2(ttc - ht);
  } else if (ht != null && tva != null && ttc == null) {
    ttc = r2(ht + tva);
  } else if (ht != null && taux != null && tva == null) {
    tva = r2(ht * taux / 100); if (ttc == null) ttc = r2(ht + tva);
  }
  if (taux == null && ht && tva) { const r = r2((tva / ht) * 100); if (r > 0 && r < 30) taux = r; }

  const found = [numero, dateFacture, ttc, tva, ht].filter((v) => v != null).length;
  const confiance = Math.min(1, r2(found / 5));

  // Fournisseur : 1re ligne significative (heuristique ; corrigé par l'humain).
  const ligne = t.split(/\r?\n/).map((l) => l.trim())
    .find((l) => l.length >= 3 && /[A-Za-zÀ-ÿ]/.test(l) && !/facture|invoice|date|siret|tva/i.test(l));

  return { numero, dateFacture, fournisseur: ligne || null, ht, tva, ttc, taux, confiance };
}
