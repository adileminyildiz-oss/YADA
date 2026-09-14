/**
 * Proposition d'imputation PURE (testable) : d'après un libellé/fournisseur,
 * suggère un compte de charge (classe 6) + un niveau de confiance.
 * L'IA propose, l'humain valide (règle du produit).
 */
export interface Imputation { compte: string; libelle: string; confiance: number; }

const REGLES: { mots: string[]; compte: string; libelle: string }[] = [
  { mots: ['gasoil', 'carburant', 'essence', 'diesel', 'station'], compte: '606100000', libelle: 'Carburants' },
  { mots: ['edf', 'engie', 'electricite', 'électricité', 'gaz', 'energie', 'énergie'], compte: '606100000', libelle: 'Énergie' },
  { mots: ['restaurant', 'repas', 'traiteur', 'brasserie'], compte: '625700000', libelle: 'Réceptions / repas' },
  { mots: ['hotel', 'hôtel', 'sncf', 'train', 'peage', 'péage', 'taxi', 'voyage'], compte: '625100000', libelle: 'Déplacements' },
  { mots: ['honoraire', 'avocat', 'notaire', 'expert', 'conseil'], compte: '622600000', libelle: 'Honoraires' },
  { mots: ['orange', 'sfr', 'bouygues', 'free', 'telecom', 'télécom', 'internet', 'mobile'], compte: '626000000', libelle: 'Télécommunications' },
  { mots: ['assurance', 'mutuelle'], compte: '616000000', libelle: 'Primes d\'assurance' },
  { mots: ['loyer', 'location', 'bail'], compte: '613000000', libelle: 'Locations' },
  { mots: ['fourniture', 'bureau', 'papeterie'], compte: '606400000', libelle: 'Fournitures de bureau' },
  { mots: ['banque', 'frais bancaire', 'commission'], compte: '627000000', libelle: 'Services bancaires' },
  { mots: ['marchandise', 'achat', 'stock'], compte: '607000000', libelle: 'Achats de marchandises' },
];

export function proposeCompte(libelle: string): Imputation {
  const t = (libelle || '').toLowerCase();
  for (const r of REGLES) {
    if (r.mots.some((m) => t.includes(m))) {
      return { compte: r.compte, libelle: r.libelle, confiance: 0.9 };
    }
  }
  return { compte: '606000000', libelle: 'Achats non stockés (par défaut)', confiance: 0.4 };
}
