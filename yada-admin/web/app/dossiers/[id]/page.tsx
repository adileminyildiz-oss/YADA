'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, getToken, eur } from '../../../lib/api';
import Header from '../../components/Header';

const exKey = (id: string) => `yada-ex-${id}`;

// Ouvre un Blob dans un onglet (aperçu) ; nettoie l'URL après.
function ouvrirBlob(blob: Blob) {
  const u = URL.createObjectURL(blob);
  window.open(u, '_blank');
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}

export default function DossierPage() {
  const router = useRouter();
  const id = String(useParams().id);
  const [tab, setTab] = useState<'fiche' | 'facturation' | 'reception' | 'compta'>('fiche');
  const [ent, setEnt] = useState<any>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try { setEnt(await api.entreprise(id)); } catch (e: any) { setErr(e.message); }
  }, [id]);
  useEffect(() => { if (!getToken()) { router.replace('/login'); return; } load(); }, [router, load]);

  return (
    <div className="wrap">
      <Header right={<button className="sm" onClick={() => router.push('/dossiers')}>← Dossiers</button>} />
      <h1>{ent?.denomination || '…'}</h1>
      <p className="muted mono" style={{ fontSize: 12, margin: '4px 0 14px' }}>
        {ent ? `${ent.forme_juridique || '—'} · ${ent.siren || 'SIREN ?'} · ${ent.statut} / ${ent.etape_crm}` : ''}
      </p>
      <div className="tabs">
        <button className={tab === 'fiche' ? 'on' : ''} onClick={() => setTab('fiche')}>Fiche & CRM</button>
        <button className={tab === 'facturation' ? 'on' : ''} onClick={() => setTab('facturation')}>Facturation</button>
        <button className={tab === 'reception' ? 'on' : ''} onClick={() => setTab('reception')}>Réception</button>
        <button className={tab === 'compta' ? 'on' : ''} onClick={() => setTab('compta')}>Comptabilité</button>
      </div>
      {err && <div className="err">{err}</div>}
      {tab === 'fiche' && <Fiche id={id} ent={ent} reload={load} />}
      {tab === 'facturation' && <Facturation id={id} />}
      {tab === 'reception' && <Reception id={id} />}
      {tab === 'compta' && <Compta id={id} />}
    </div>
  );
}

function Fiche({ id, ent, reload }: { id: string; ent: any; reload: () => void }) {
  const [siren, setSiren] = useState('');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [tiers, setTiers] = useState<any[]>([]);
  const [nt, setNt] = useState({ nom: '', type: 'client', fonction: '' });
  const loadT = useCallback(async () => { try { setTiers(await api.tiers(id)); } catch { /* */ } }, [id]);
  useEffect(() => { loadT(); }, [loadT]);

  async function autofill() {
    setErr(''); setMsg('');
    try {
      const f: any = await api.siren(siren.trim());
      await api.patchEntreprise(id, {
        siren: f.siren, siret: f.siret, codeApe: f.codeApe, tvaIntra: f.tvaIntra,
        formeJuridique: f.formeJuridique, ville: f.ville, adresse: f.adresse, codePostal: f.codePostal,
      });
      setMsg('Fiche pré-remplie depuis le SIREN.'); reload();
    } catch (e: any) { setErr(e.message + ' (saisie manuelle possible)'); }
  }
  async function addTiers(e: any) {
    e.preventDefault();
    try { await api.creerTiers(id, { ...nt, principal: true }); setNt({ nom: '', type: 'client', fonction: '' }); loadT(); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <>
      <div className="card">
        <h2>Auto-remplissage SIREN</h2>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}><label>SIREN</label><input value={siren} onChange={(e) => setSiren(e.target.value)} maxLength={9} placeholder="812345678" /></div>
          <button onClick={autofill}>Pré-remplir</button>
        </div>
        {msg && <p className="muted" style={{ fontSize: 13 }}>{msg}</p>}
        {err && <div className="err">{err}</div>}
      </div>
      <div className="card">
        <h2>Identité</h2>
        <div className="grid g3">
          {[['SIRET', ent?.siret], ['Code APE', ent?.code_ape], ['N° TVA', ent?.tva_intra],
            ['Ville', ent?.ville], ['Forme', ent?.forme_juridique], ['Origine', ent?.origine]].map(([l, v]) => (
            <div key={l as string}><div className="faint" style={{ fontSize: 10, textTransform: 'uppercase' }}>{l}</div><div className="mono">{v || '—'}</div></div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Interlocuteurs</h2>
        <form onSubmit={addTiers} className="row" style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <div style={{ flex: 2, minWidth: 160 }}><label>Nom</label><input value={nt.nom} onChange={(e) => setNt({ ...nt, nom: e.target.value })} required /></div>
          <div style={{ flex: 1, minWidth: 120 }}><label>Fonction</label><input value={nt.fonction} onChange={(e) => setNt({ ...nt, fonction: e.target.value })} /></div>
          <div style={{ minWidth: 120 }}><label>Type</label>
            <select value={nt.type} onChange={(e) => setNt({ ...nt, type: e.target.value })}>
              <option value="client">Client</option><option value="fournisseur">Fournisseur</option><option value="prospect">Prospect</option>
            </select></div>
          <button type="submit">Ajouter</button>
        </form>
        <table><tbody>
          {tiers.map((t) => <tr key={t.id}><td>{t.nom}</td><td className="muted">{t.fonction || '—'}</td><td><span className="pill">{t.type}</span></td></tr>)}
          {tiers.length === 0 && <tr><td className="muted">Aucun interlocuteur.</td></tr>}
        </tbody></table>
      </div>
    </>
  );
}

function Facturation({ id }: { id: string }) {
  const [list, setList] = useState<any[]>([]); const [err, setErr] = useState('');
  const [l, setL] = useState({ designation: 'Prestation', quantite: 1, prixUnitaireHt: 1000, tauxTva: 20 });
  const load = useCallback(async () => { try { setList(await api.factures(id)); } catch (e: any) { setErr(e.message); } }, [id]);
  useEffect(() => { load(); }, [load]);

  async function creer(e: any) {
    e.preventDefault(); setErr('');
    try { await api.creerFacture(id, { type: 'facture', lignes: [{ ...l, quantite: Number(l.quantite), prixUnitaireHt: Number(l.prixUnitaireHt), tauxTva: Number(l.tauxTva) }] }); load(); }
    catch (e: any) { setErr(e.message); }
  }
  const act = (fn: () => Promise<any>) => async () => { setErr(''); try { await fn(); load(); } catch (e: any) { setErr(e.message); } };
  async function dlFacturx(fid: string) {
    try { const xml = await api.facturx(id, fid); ouvrirBlob(new Blob([xml as any], { type: 'application/xml' })); }
    catch (e: any) { setErr(e.message); }
  }
  async function dlPdf(fid: string) {
    setErr('');
    try { ouvrirBlob(await api.facturePdf(id, fid)); }
    catch (e: any) { setErr(e.message); }
  }
  async function dlFacturxPdf(fid: string) {
    setErr('');
    try { ouvrirBlob(await api.facturxPdf(id, fid)); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <>
      <div className="card">
        <h2>Nouvelle facture</h2>
        <form onSubmit={creer} className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 160 }}><label>Désignation</label><input value={l.designation} onChange={(e) => setL({ ...l, designation: e.target.value })} /></div>
          <div style={{ width: 70 }}><label>Qté</label><input type="number" value={l.quantite} onChange={(e) => setL({ ...l, quantite: +e.target.value })} /></div>
          <div style={{ width: 100 }}><label>PU HT</label><input type="number" value={l.prixUnitaireHt} onChange={(e) => setL({ ...l, prixUnitaireHt: +e.target.value })} /></div>
          <div style={{ width: 80 }}><label>TVA %</label><input type="number" value={l.tauxTva} onChange={(e) => setL({ ...l, tauxTva: +e.target.value })} /></div>
          <button className="pri" type="submit">Créer</button>
        </form>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="card">
        <h2>Factures</h2>
        <table>
          <thead><tr><th>Numéro</th><th>Statut</th><th className="n">TTC</th><th></th></tr></thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td className="mono">{f.numero}</td>
                <td><span className={'pill' + (f.statut === 'payee' ? ' solid' : '')}>{f.statut}</span></td>
                <td className="n">{eur(f.montant_ttc)}</td>
                <td className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  {f.statut === 'brouillon' && <button className="sm" onClick={act(() => api.emettre(id, f.id))}>Émettre</button>}
                  <button className="sm" onClick={act(() => api.ecritureFacture(id, f.id))}>Écriture VTE</button>
                  <button className="sm" onClick={() => dlPdf(f.id)}>⤓ PDF</button>
                  <button className="sm" onClick={() => dlFacturx(f.id)}>Factur-X XML</button>
                  <button className="sm" onClick={() => dlFacturxPdf(f.id)}>Factur-X PDF/A-3</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td className="muted" colSpan={4}>Aucune facture.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Reception({ id }: { id: string }) {
  const [list, setList] = useState<any[]>([]); const [fiches, setFiches] = useState<any[]>([]); const [err, setErr] = useState('');
  const [d, setD] = useState({ nomFichier: 'facture.pdf', texteOcr: 'FOURNISSEUR X\nFacture n° F-001\nDate : 06/04/2026\nTotal HT 500,00\nTVA 20% 100,00\nNet à payer 600,00 EUR' });
  const [fichier, setFichier] = useState<{ nom: string; mime: string; b64: string } | null>(null);
  const load = useCallback(async () => {
    try { setList(await api.receptions(id)); setFiches(await api.fiches(id)); } catch (e: any) { setErr(e.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  const act = (fn: () => Promise<any>) => async () => { setErr(''); try { await fn(); load(); } catch (e: any) { setErr(e.message); } };

  function choisirFichier(e: any) {
    const f = e.target.files?.[0]; if (!f) { setFichier(null); return; }
    const r = new FileReader();
    r.onload = () => setFichier({ nom: f.name, mime: f.type || 'application/octet-stream', b64: String(r.result || '') });
    r.readAsDataURL(f);
  }
  async function deposer(e: any) {
    e.preventDefault(); setErr('');
    const nom = fichier?.nom || d.nomFichier;
    try {
      await api.deposer(id, {
        sens: 'achat', canal: 'manuel', nomFichier: nom, cheminStockage: 'obj://' + nom,
        mime: fichier?.mime, contenuBase64: fichier?.b64, texteOcr: d.texteOcr || undefined,
      });
      setFichier(null); load();
    } catch (e: any) { setErr(e.message); }
  }
  async function voir(docId: string) {
    setErr('');
    try { ouvrirBlob(await api.pieceContenu(id, docId)); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <>
      <div className="card">
        <h2>Déposer une pièce fournisseur</h2>
        <form onSubmit={deposer}>
          <label>Fichier (PDF / image) — stocké et consultable</label>
          <input type="file" accept="application/pdf,image/*" onChange={choisirFichier} />
          {fichier && <p className="muted" style={{ fontSize: 12 }}>Sélectionné : <b>{fichier.nom}</b> ({fichier.mime})</p>}
          {!fichier && <><label>…ou nom du fichier (sans upload)</label><input value={d.nomFichier} onChange={(e) => setD({ ...d, nomFichier: e.target.value })} /></>}
          <label>Couche texte (OCR simulé) — pour la lecture auto</label><textarea rows={4} value={d.texteOcr} onChange={(e) => setD({ ...d, texteOcr: e.target.value })} />
          <div style={{ marginTop: 10 }}><button className="pri" type="submit">Déposer → lecture auto</button></div>
        </form>
      </div>
      {err && <div className="err">{err}</div>}
      {fiches.filter((f) => f.statut !== 'validee').length > 0 && (
        <div className="card">
          <h2>Fournisseurs inconnus à créer</h2>
          <table><tbody>
            {fiches.filter((f) => f.statut !== 'validee').map((f) => (
              <tr key={f.id}><td>{f.raison}</td><td><span className="pill">{f.statut}</span></td>
                <td style={{ textAlign: 'right' }}><button className="sm" onClick={act(() => api.validerFiche(f.id))}>Valider → tiers</button></td></tr>
            ))}
          </tbody></table>
        </div>
      )}
      <div className="card">
        <h2>Bannette de réception</h2>
        <table>
          <thead><tr><th>Fichier</th><th>N°</th><th className="n">TTC</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.nom_fichier}{r.est_doublon && <span className="pill" style={{ marginLeft: 6 }}>doublon</span>}</td>
                <td className="mono">{r.numero || '—'}</td>
                <td className="n">{r.montant_ttc ? eur(r.montant_ttc) : '—'}</td>
                <td><span className={'pill' + (r.statut === 'comptabilisee' ? ' solid' : '')}>{r.statut}</span></td>
                <td className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  {r.a_fichier && <button className="sm" onClick={() => voir(r.document_id)}>Voir</button>}
                  {(r.statut === 'lue' || r.statut === 'recue') && <button className="sm" onClick={act(() => api.recevoir(r.id))}>Recevoir</button>}
                  {r.statut === 'a_valider' && <button className="sm" onClick={act(() => api.comptabiliserRec(r.id))}>Comptabiliser</button>}
                  {r.statut === 'comptabilisee' && <button className="sm" onClick={act(() => api.ecritureReception(id, r.id))}>Écriture ACH</button>}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td className="muted" colSpan={5}>Aucune pièce.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Compta({ id }: { id: string }) {
  const [exList, setExList] = useState<any[]>([]);
  const [ex, setEx] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [kpis, setKpis] = useState<any>(null); const [bal, setBal] = useState<any>(null);
  const [ca3, setCa3] = useState<any>(null); const [fisc, setFisc] = useState<any>(null);
  const [err, setErr] = useState('');
  const [dates, setDates] = useState({ dateDebut: '2026-01-01', dateFin: '2026-12-31' });
  const dstr = (v: any) => String(v ?? '').slice(0, 10);

  const loadEx = useCallback(async () => {
    try {
      const list: any[] = await api.exercices(id);
      setExList(list);
      let stored: string | null = null; try { stored = localStorage.getItem(exKey(id)); } catch { /* */ }
      const chosen = (list.find((x) => x.id === stored) || list[0])?.id || null;
      setEx(chosen);
      if (chosen) { try { localStorage.setItem(exKey(id), chosen); } catch { /* */ } }
    } catch (e: any) { setErr(e.message); }
  }, [id]);
  useEffect(() => { loadEx(); }, [loadEx]);

  const refresh = useCallback(async (exId: string) => {
    setErr('');
    try {
      setKpis(await api.kpis(id, exId)); setBal(await api.balance(id, exId));
      setCa3(await api.ca3(id, exId)); setFisc(await api.fisc(id, exId, 'is'));
    } catch (e: any) { setErr(e.message); }
  }, [id]);
  useEffect(() => { if (ex) refresh(ex); }, [ex, refresh]);

  function choisirEx(exId: string) { setEx(exId); try { localStorage.setItem(exKey(id), exId); } catch { /* */ } }
  async function creerEx(e: any) {
    e.preventDefault(); setErr('');
    try { const r: any = await api.creerExercice(id, dates); setCreating(false); await loadEx(); choisirEx(r.id); }
    catch (e: any) { setErr(e.message); }
  }

  const creerForm = (
    <div className="card">
      <h2>Ouvrir un exercice</h2>
      <form onSubmit={creerEx} className="row" style={{ alignItems: 'flex-end' }}>
        <div><label>Début</label><input type="date" value={dates.dateDebut} onChange={(e) => setDates({ ...dates, dateDebut: e.target.value })} /></div>
        <div><label>Fin</label><input type="date" value={dates.dateFin} onChange={(e) => setDates({ ...dates, dateFin: e.target.value })} /></div>
        <button className="pri" type="submit">Ouvrir</button>
        {exList.length > 0 && <button type="button" className="sm" onClick={() => setCreating(false)}>Annuler</button>}
      </form>
      {err && <div className="err">{err}</div>}
    </div>
  );

  if (!ex && exList.length === 0) return creerForm;
  if (creating) return creerForm;

  return (
    <>
      <div className="card" style={{ padding: '12px 16px', marginBottom: 14 }}>
        <div className="row" style={{ alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>Exercice</label>
            <select value={ex || ''} onChange={(e) => choisirEx(e.target.value)}>
              {exList.map((x) => (
                <option key={x.id} value={x.id}>
                  {dstr(x.date_debut)} → {dstr(x.date_fin)}{x.statut === 'cloture' ? ' (clôturé)' : ''}
                </option>
              ))}
            </select>
          </div>
          <button className="sm" onClick={() => setCreating(true)}>＋ Nouvel exercice</button>
        </div>
      </div>
      {err && <div className="err">{err}</div>}
      {kpis && (
        <div className="grid g4" style={{ marginBottom: 14 }}>
          <div className="kpi"><div className="l">Chiffre d'affaires</div><div className="v">{eur(kpis.chiffreAffaires)}</div></div>
          <div className="kpi"><div className="l">Charges</div><div className="v">{eur(kpis.charges)}</div></div>
          <div className="kpi"><div className="l">Résultat</div><div className="v">{eur(kpis.resultat)}</div></div>
          <div className="kpi"><div className="l">Trésorerie</div><div className="v">{eur(kpis.tresorerie)}</div></div>
        </div>
      )}
      <div className="grid g2">
        {ca3 && <div className="card"><h2>TVA (CA3)</h2>
          <table><tbody>
            <tr><td>Collectée</td><td className="n">{eur(ca3.collectee)}</td></tr>
            <tr><td>Déductible</td><td className="n">{eur(ca3.deductible)}</td></tr>
            <tr><td><b>À décaisser</b></td><td className="n"><b>{eur(ca3.aDecaisser)}</b></td></tr>
          </tbody></table></div>}
        {fisc && <div className="card"><h2>Impôt sur les sociétés</h2>
          <table><tbody>
            <tr><td>Base (résultat)</td><td className="n">{eur(fisc.base)}</td></tr>
            <tr><td>IS taux réduit PME</td><td className="n">{eur(fisc.reduit)}</td></tr>
            <tr><td>IS taux normal</td><td className="n">{eur(fisc.normal)}</td></tr>
          </tbody></table><p className="faint" style={{ fontSize: 11 }}>Estimation — à valider par un expert-comptable.</p></div>}
      </div>
      {bal && (
        <div className="card">
          <h2>Balance {bal.equilibree ? '✓ équilibrée' : '✗ déséquilibrée'}</h2>
          <table>
            <thead><tr><th>Compte</th><th>Libellé</th><th className="n">Débit</th><th className="n">Crédit</th></tr></thead>
            <tbody>
              {bal.lignes.map((x: any) => <tr key={x.compte}><td className="mono">{x.compte}</td><td>{x.libelle}</td><td className="n">{eur(x.debit)}</td><td className="n">{eur(x.credit)}</td></tr>)}
              <tr><td></td><td><b>Totaux</b></td><td className="n"><b>{eur(bal.totalDebit)}</b></td><td className="n"><b>{eur(bal.totalCredit)}</b></td></tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
