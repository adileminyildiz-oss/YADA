/**
 * Transformation PURE (testable sans réseau) d'une réponse de l'API publique
 * `recherche-entreprises.api.gouv.fr` en fiche société pré-remplie YADA.
 * Aucune donnée n'est écrite ici : l'humain relit et valide (règle du plan).
 */
export interface FicheSiren {
  siren: string | null;
  siret: string | null;
  denomination: string | null;
  formeJuridique: string | null;
  codeApe: string | null;
  tvaIntra: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  dateCreation: string | null;
  dirigeants: { nom: string; fonction: string }[];
  source: 'recherche-entreprises.api.gouv.fr';
}

/** Clé TVA intracommunautaire française : FR + (12 + 3*SIREN mod 97) + SIREN. */
export function tvaFromSiren(siren: string): string | null {
  if (!/^\d{9}$/.test(siren)) return null;
  const cle = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(cle).padStart(2, '0')}${siren}`;
}

interface REResult {
  siren?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  nature_juridique?: string;
  date_creation?: string;
  siege?: {
    siret?: string;
    activite_principale?: string;
    code_postal?: string;
    libelle_commune?: string;
    adresse?: string;
    numero_voie?: string;
    type_voie?: string;
    libelle_voie?: string;
  };
  dirigeants?: {
    nom?: string;
    prenoms?: string;
    denomination?: string;
    qualite?: string;
  }[];
}

export function mapRechercheEntreprises(json: unknown, sirenAsked?: string): FicheSiren {
  const results = (json as { results?: REResult[] })?.results;
  const r: REResult = (results && results[0]) || {};
  const s = r.siege || {};
  const siren = r.siren || (sirenAsked ?? null);
  const adresse =
    s.adresse ||
    [s.numero_voie, s.type_voie, s.libelle_voie].filter(Boolean).join(' ') ||
    null;

  const dirigeants = (r.dirigeants || [])
    .map((d) => ({
      nom: (d.denomination || [d.prenoms, d.nom].filter(Boolean).join(' ')).trim(),
      fonction: d.qualite || 'dirigeant',
    }))
    .filter((d) => d.nom.length > 0);

  return {
    siren: siren,
    siret: s.siret || null,
    denomination: r.nom_raison_sociale || r.nom_complet || null,
    formeJuridique: r.nature_juridique || null,
    codeApe: s.activite_principale || null,
    tvaIntra: siren ? tvaFromSiren(siren) : null,
    adresse,
    codePostal: s.code_postal || null,
    ville: s.libelle_commune || null,
    dateCreation: r.date_creation || null,
    dirigeants,
    source: 'recherche-entreprises.api.gouv.fr',
  };
}
