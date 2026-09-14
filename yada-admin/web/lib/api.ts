// Client typé de l'API YADA Administration (L0→L5). Jeton en localStorage.
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const KEY = 'yada-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setToken(t: string | null) {
  if (typeof window === 'undefined') return;
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}

async function req<T = any>(method: string, path: string, body?: unknown, asText = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  const tk = getToken();
  if (tk) headers['authorization'] = 'Bearer ' + tk;
  const res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const raw = await res.text();
  if (!res.ok) {
    let msg = raw;
    try { const p = JSON.parse(raw); msg = Array.isArray(p.message) ? p.message.join(', ') : (p.message || raw); } catch { /* keep raw */ }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (asText) return raw as unknown as T;
  try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
}

export const api = {
  // Auth
  register: (d: any) => req('POST', '/auth/register', d),
  login: (d: any) => req('POST', '/auth/login', d),
  me: () => req('GET', '/auth/me'),
  // Entreprises / CRM
  entreprises: () => req('GET', '/entreprises'),
  pipeline: () => req('GET', '/entreprises/pipeline'),
  creerEntreprise: (d: any) => req('POST', '/entreprises', d),
  entreprise: (id: string) => req('GET', `/entreprises/${id}`),
  patchEntreprise: (id: string, d: any) => req('PATCH', `/entreprises/${id}`, d),
  etape: (id: string, etape: string) => req('POST', `/entreprises/${id}/etape`, { etape }),
  siren: (s: string) => req('GET', `/siren/${s}`),
  tiers: (id: string) => req('GET', `/entreprises/${id}/tiers`),
  creerTiers: (id: string, d: any) => req('POST', `/entreprises/${id}/tiers`, d),
  // Facturation
  factures: (id: string) => req('GET', `/entreprises/${id}/factures`),
  creerFacture: (id: string, d: any) => req('POST', `/entreprises/${id}/factures`, d),
  emettre: (id: string, fid: string) => req('POST', `/entreprises/${id}/factures/${fid}/emettre`, {}),
  regler: (id: string, fid: string, d: any) => req('POST', `/entreprises/${id}/factures/${fid}/reglements`, d),
  facturx: (id: string, fid: string) => req('GET', `/entreprises/${id}/factures/${fid}/facturx`, undefined, true),
  // Réception
  receptions: (id: string) => req('GET', `/entreprises/${id}/receptions`),
  deposer: (id: string, d: any) => req('POST', `/entreprises/${id}/receptions`, d),
  recevoir: (rid: string) => req('POST', `/receptions/${rid}/recevoir`, {}),
  comptabiliserRec: (rid: string, d: any = {}) => req('POST', `/receptions/${rid}/comptabiliser`, d),
  rapprocher: (rid: string, tiersId: string) => req('POST', `/receptions/${rid}/rapprocher`, { tiersId }),
  fiches: (id: string) => req('GET', `/entreprises/${id}/fiches-tiers`),
  validerFiche: (fid: string, d: any = {}) => req('POST', `/fiches-tiers/${fid}/valider`, d),
  // Compta
  creerExercice: (id: string, d: any) => req('POST', `/entreprises/${id}/compta/exercices`, d),
  ecriture: (id: string, d: any) => req('POST', `/entreprises/${id}/compta/ecritures`, d),
  ecritureFacture: (id: string, fid: string) => req('POST', `/entreprises/${id}/compta/facture/${fid}`, {}),
  ecritureReception: (id: string, rid: string) => req('POST', `/entreprises/${id}/compta/reception/${rid}`, {}),
  balance: (id: string, ex: string) => req('GET', `/entreprises/${id}/compta/balance/${ex}`),
  ca3: (id: string, ex: string) => req('GET', `/entreprises/${id}/compta/ca3/${ex}`),
  // Pilotage
  kpis: (id: string, ex: string) => req('GET', `/entreprises/${id}/pilotage/kpis/${ex}`),
  fisc: (id: string, ex: string, type = 'is') => req('GET', `/entreprises/${id}/pilotage/fisc/${ex}?type=${type}`),
};

export const eur = (n: number) => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
