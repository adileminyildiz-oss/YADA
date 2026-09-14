/**
 * Calculs fiscaux PURS (testables) — estimations indicatives, à valider par un
 * expert-comptable (hors décote, plafonnement du quotient, crédits d'impôt…).
 */
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Impôt sur les sociétés. Taux réduit PME 15 % jusqu'à 42 500 €, puis 25 %. */
export function calcIS(base: number): { base: number; reduit: number; normal: number } {
  const b = base > 0 ? base : 0;
  const part15 = Math.min(b, 42500);
  const part25 = Math.max(0, b - 42500);
  return { base: r2(b), reduit: r2(part15 * 0.15 + part25 * 0.25), normal: r2(b * 0.25) };
}

/** Barème IR 2024 (revenus 2023), par part. */
const TRANCHES = [
  { plafond: 11294, taux: 0 },
  { plafond: 28797, taux: 0.11 },
  { plafond: 82341, taux: 0.30 },
  { plafond: 177106, taux: 0.41 },
  { plafond: Infinity, taux: 0.45 },
];

/** Impôt sur le revenu au barème progressif par parts (quotient familial). */
export function calcIR(revenuImposable: number, parts = 1): { impot: number; tauxMoyen: number } {
  const p = parts > 0 ? parts : 1;
  const qf = Math.max(0, revenuImposable) / p;
  let impotParPart = 0; let bas = 0;
  for (const t of TRANCHES) {
    if (qf > bas) { impotParPart += (Math.min(qf, t.plafond) - bas) * t.taux; bas = t.plafond; }
    else break;
  }
  const impot = r2(impotParPart * p);
  return { impot, tauxMoyen: revenuImposable > 0 ? r2((impot / revenuImposable) * 100) : 0 };
}
