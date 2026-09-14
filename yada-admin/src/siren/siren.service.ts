import { Injectable, ServiceUnavailableException, BadRequestException, Logger } from '@nestjs/common';
import { FicheSiren, mapRechercheEntreprises } from './siren.mapper';

/**
 * Auto-remplissage de la fiche société à partir du SIREN.
 * Source publique sans clé : recherche-entreprises.api.gouv.fr.
 * Mode dégradé : si la source est injoignable (réseau/pare-feu), on renvoie 503
 * — la saisie manuelle reste toujours possible (aucun blocage).
 */
@Injectable()
export class SirenService {
  private readonly logger = new Logger('Siren');
  private readonly base =
    process.env.SIREN_API_BASE || 'https://recherche-entreprises.api.gouv.fr';

  async lookup(siren: string): Promise<FicheSiren> {
    const clean = (siren || '').replace(/\s/g, '');
    if (!/^\d{9}$/.test(clean)) {
      throw new BadRequestException('SIREN invalide (9 chiffres attendus).');
    }
    const url = `${this.base}/search?q=${clean}&page=1&per_page=1`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const fiche = mapRechercheEntreprises(json, clean);
      if (!fiche.denomination) {
        throw new ServiceUnavailableException('Aucune entreprise trouvée pour ce SIREN.');
      }
      return fiche;
    } catch (e) {
      this.logger.warn(`Enrichissement SIREN indisponible (${clean}) : ${(e as Error).message}`);
      throw new ServiceUnavailableException(
        'Source SIREN indisponible — saisissez la fiche manuellement (mode dégradé).',
      );
    }
  }
}
