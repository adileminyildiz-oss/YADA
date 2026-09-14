/**
 * Plan comptable & journaux par défaut, helpers PURS (testables).
 */
export const JOURNAUX_DEFAUT: { code: string; libelle: string; type: 'achat' | 'vente' | 'banque' | 'od' }[] = [
  { code: 'ACH', libelle: 'Achats', type: 'achat' },
  { code: 'VTE', libelle: 'Ventes', type: 'vente' },
  { code: 'BQ', libelle: 'Banque', type: 'banque' },
  { code: 'OD', libelle: 'Opérations diverses', type: 'od' },
  { code: 'ODP', libelle: 'OD de paie', type: 'od' },
  { code: 'ODC', libelle: 'OD de charges', type: 'od' },
  { code: 'ODTVA', libelle: 'OD de TVA', type: 'od' },
  { code: 'AN', libelle: 'À-nouveaux', type: 'od' },
];

export const COMPTES_DEFAUT: Record<string, string> = {
  '101000000': 'Capital',
  '108000000': "Compte de l'exploitant",
  '120000000': "Résultat de l'exercice (bénéfice)",
  '129000000': "Résultat de l'exercice (perte)",
  '401000000': 'Fournisseurs',
  '411000000': 'Clients',
  '445510000': 'TVA à décaisser',
  '445620000': 'TVA déductible sur immobilisations',
  '445660000': 'TVA déductible sur autres biens et services',
  '445670000': 'Crédit de TVA à reporter',
  '445710000': 'TVA collectée',
  '512000000': 'Banque',
  '606100000': 'Fournitures non stockables (énergie)',
  '606000000': 'Achats non stockés de matières et fournitures',
  '607000000': 'Achats de marchandises',
  '627000000': 'Services bancaires et assimilés',
  '706000000': 'Prestations de services',
  '707000000': 'Ventes de marchandises',
};

/** Normalise un compte sur 9 caractères (complété par des zéros à droite). */
export function c9(numero: string): string {
  const s = String(numero || '').replace(/\s/g, '');
  return (s + '000000000').slice(0, 9);
}

export function classeDe(numero: string): number {
  return Number(c9(numero).charAt(0)) || 0;
}

export function libelleDe(numero: string): string {
  const n = c9(numero);
  return COMPTES_DEFAUT[n] || `Compte ${n}`;
}

export function estLettrable(numero: string): boolean {
  const n = c9(numero);
  return n.startsWith('401') || n.startsWith('411');
}

/** Compte de TVA collectée (ventes). Déclaration agrège toute la famille 4457x. */
export const TVA_COLLECTEE = '445710000';
/** TVA déductible sur biens & services (achats). */
export const TVA_DEDUCTIBLE = '445660000';
export const COMPTE_PRODUIT_DEFAUT = '706000000';
export const COMPTE_CHARGE_DEFAUT = '606000000';
export const COMPTE_CLIENT = '411000000';
export const COMPTE_FOURNISSEUR = '401000000';
export const COMPTE_BANQUE = '512000000';
export const RESULTAT_BENEFICE = '120000000';
export const RESULTAT_PERTE = '129000000';
