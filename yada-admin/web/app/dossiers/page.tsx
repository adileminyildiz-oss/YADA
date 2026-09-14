'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '../../lib/api';
import Header from '../components/Header';

const ETAPES = ['nouveau', 'qualifie', 'proposition', 'gagne', 'perdu'];
const LBL: Record<string, string> = { nouveau: 'Nouveau', qualifie: 'Qualifié', proposition: 'Proposition', gagne: 'Client', perdu: 'Perdu' };
const SUIV: Record<string, string> = { nouveau: 'qualifie', qualifie: 'proposition', proposition: 'gagne' };

export default function DossiersPage() {
  const router = useRouter();
  const [pipe, setPipe] = useState<Record<string, any[]>>({});
  const [err, setErr] = useState('');
  const [nom, setNom] = useState('');
  const [siren, setSiren] = useState('');

  const load = useCallback(async () => {
    try { setPipe(await api.pipeline()); } catch (e: any) { setErr(e.message); }
  }, []);

  useEffect(() => { if (!getToken()) { router.replace('/login'); return; } load(); }, [router, load]);

  async function creer(e: any) {
    e.preventDefault(); setErr('');
    try {
      const d: any = { denomination: nom };
      if (siren.trim()) d.siren = siren.trim();
      await api.creerEntreprise(d); setNom(''); setSiren(''); load();
    } catch (e: any) { setErr(e.message); }
  }
  async function avancer(id: string, etape: string) {
    try { await api.etape(id, etape); load(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="wrap">
      <Header />
      <h1>Dossiers</h1>
      <p className="muted" style={{ margin: '4px 0 16px' }}>Pipeline commercial — du prospect au client.</p>

      <div className="card">
        <h2>Nouveau prospect</h2>
        <form onSubmit={creer} className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 200 }}><label>Dénomination</label><input value={nom} onChange={(e) => setNom(e.target.value)} required /></div>
          <div style={{ flex: 1, minWidth: 140 }}><label>SIREN (option)</label><input value={siren} onChange={(e) => setSiren(e.target.value)} maxLength={9} /></div>
          <button className="pri" type="submit">Créer</button>
        </form>
      </div>
      {err && <div className="err">{err}</div>}

      <div className="kan">
        {ETAPES.map((et) => (
          <div className="col" key={et}>
            <div className="h"><span>{LBL[et]}</span><span>{(pipe[et] || []).length}</span></div>
            {(pipe[et] || []).map((e: any) => (
              <div className="kard" key={e.id}>
                <div className="nm">{e.denomination}</div>
                <div className="faint mono" style={{ fontSize: 11 }}>{e.origine || e.statut}</div>
                <div className="row" style={{ marginTop: 6, gap: 6 }}>
                  <button className="sm" onClick={() => router.push(`/dossiers/${e.id}`)}>Ouvrir</button>
                  {SUIV[et] && <button className="sm" onClick={() => avancer(e.id, SUIV[et])}>→ {LBL[SUIV[et]]}</button>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
