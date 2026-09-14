'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [f, setF] = useState({ organisation: '', email: '', motDePasse: '', nom: '', prenom: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const upd = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit(e: any) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r: any = mode === 'register'
        ? await api.register(f)
        : await api.login({ email: f.email, motDePasse: f.motDePasse });
      setToken(r.token);
      router.push('/dossiers');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="wrap" style={{ maxWidth: 440 }}>
      <div className="brand" style={{ marginBottom: 18 }}><span className="mk">Y</span> YADA Administration</div>
      <div className="card">
        <div className="tabs">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Connexion</button>
          <button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>Créer un cabinet</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && (<>
            <label>Nom du cabinet</label><input value={f.organisation} onChange={upd('organisation')} required />
            <div className="row"><div style={{ flex: 1 }}><label>Prénom</label><input value={f.prenom} onChange={upd('prenom')} required /></div>
              <div style={{ flex: 1 }}><label>Nom</label><input value={f.nom} onChange={upd('nom')} required /></div></div>
          </>)}
          <label>E-mail</label><input type="email" value={f.email} onChange={upd('email')} required />
          <label>Mot de passe</label><input type="password" value={f.motDePasse} onChange={upd('motDePasse')} required minLength={8} />
          {err && <div className="err">{err}</div>}
          <div style={{ marginTop: 14 }}>
            <button className="pri" type="submit" disabled={busy}>{busy ? '…' : mode === 'register' ? 'Créer & entrer' : 'Se connecter'}</button>
          </div>
        </form>
      </div>
      <p className="faint mono" style={{ fontSize: 12 }}>Multi-tenant · chaque cabinet est isolé (RLS).</p>
    </div>
  );
}
