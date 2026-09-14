/**
 * Générateur de PDF de facture — PUR, sans dépendance (pas de lib PDF).
 * Produit un PDF A4 mono-page valide (objets + xref + trailer), texte Helvetica
 * en encodage WinAnsi. Testable hors base/réseau (facture.pdf.test.mjs).
 *
 * NB : c'est un PDF "lisible" (aperçu/téléchargement). Le PDF/A-3 conforme
 * embarquant le Factur-X est traité au Lot 3 (production).
 */

export interface PdfLigne {
  designation: string; quantite: number; prixUnitaireHt: number; tauxTva: number; remisePct?: number;
}
export interface PdfFacture {
  numero: string;
  type?: string;                 // facture | devis | avoir | acompte
  dateEmission: string;
  dateEcheance?: string | null;
  devise?: string;
  vendeur: { nom: string; siren?: string | null; tvaIntra?: string | null };
  acheteur: { nom: string; tvaIntra?: string | null };
  lignes: PdfLigne[];
  totaux: { ht: number; tva: number; ttc: number; parTaux: { taux: number; base: number; tva: number }[] };
  conditions?: string | null;
  statut?: string;
}

const r2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function money(n: number): string {
  const s = r2(n).toFixed(2);
  let [i, d] = s.split('.');
  const neg = i.startsWith('-'); if (neg) i = i.slice(1);
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '-' : '') + i + ',' + d + ' EUR';
}

/** Réduit le texte à ce que WinAnsi/latin1 sait rendre + échappe ( ) \. */
function pdfText(s: unknown): string {
  return String(s ?? '')
    .replace(/€/g, 'EUR').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/[–—]/g, '-')
    .replace(/…/g, '...').replace(/[→➔]/g, '->')
    .replace(/[^\x20-\xFF]/g, '?')
    .replace(/([\\()])/g, '\\$1');
}
function trunc(s: string, n: number): string { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
const TYPE_LABEL: Record<string, string> = { facture: 'FACTURE', devis: 'DEVIS', avoir: 'AVOIR', acompte: 'FACTURE D\'ACOMPTE' };

export interface FactureContent { content: Buffer; W: number; H: number; }

/** Construit le flux de contenu (dessin) de la page A4 — réutilisé par le PDF simple ET le PDF/A-3. */
export function factureContentStream(f: PdfFacture): FactureContent {
  const W = 595, H = 842, M = 50;
  const ops: string[] = [];
  const gray = (g: number) => ops.push(`${g} g`);
  const strokeGray = (g: number) => ops.push(`${g} G`);
  const text = (x: number, y: number, s: string, size = 10, bold = false) => {
    ops.push('BT', `/${bold ? 'F2' : 'F1'} ${size} Tf`, `1 0 0 1 ${x} ${H - y} Tm`, `(${pdfText(s)}) Tj`, 'ET');
  };
  // texte aligné à droite (mesure approx. Helvetica ~0.5em/char)
  const textR = (xRight: number, y: number, s: string, size = 10, bold = false) => {
    const w = pdfText(s).replace(/\\/g, '').length * size * 0.5;
    text(xRight - w, y, s, size, bold);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, lw = 0.6) => {
    ops.push(`${lw} w`, `${x1} ${H - y1} m ${x2} ${H - y2} l S`);
  };

  // ── En-tête vendeur ──────────────────────────────────────────────────────
  gray(0.05);
  text(M, 70, f.vendeur.nom || 'Société', 18, true);
  gray(0.35);
  let hy = 88;
  if (f.vendeur.siren) { text(M, hy, `SIREN ${f.vendeur.siren}`, 9); hy += 13; }
  if (f.vendeur.tvaIntra) { text(M, hy, `TVA ${f.vendeur.tvaIntra}`, 9); hy += 13; }

  // ── Titre + n° + dates (à droite) ─────────────────────────────────────────
  gray(0.05);
  textR(W - M, 70, TYPE_LABEL[f.type || 'facture'] || 'FACTURE', 20, true);
  gray(0.3);
  textR(W - M, 90, `N° ${f.numero}`, 11, true);
  textR(W - M, 105, `Émise le ${f.dateEmission}`, 9);
  if (f.dateEcheance) textR(W - M, 118, `Échéance ${f.dateEcheance}`, 9);
  if (f.statut) textR(W - M, 131, `Statut : ${f.statut}`, 9);

  // ── Bloc client ────────────────────────────────────────────────────────────
  const clY = 165;
  strokeGray(0.8); line(M, clY - 14, W - M, clY - 14, 0.6);
  gray(0.4); text(M, clY, 'FACTURÉ À', 8, true);
  gray(0.05); text(M, clY + 16, f.acheteur.nom || 'Client', 12, true);
  if (f.acheteur.tvaIntra) { gray(0.4); text(M, clY + 31, `TVA ${f.acheteur.tvaIntra}`, 9); }

  // ── Tableau des lignes ─────────────────────────────────────────────────────
  const cols = { des: M, qte: 320, pu: 375, tva: 445, tot: W - M };
  let y = 230;
  gray(1); ops.push(`${M} ${H - (y - 12)} ${W - 2 * M} 20 re f`); // bandeau d'en-tête
  strokeGray(0.75); line(M, y - 12, W - M, y - 12, 0.6); line(M, y + 8, W - M, y + 8, 0.6);
  gray(0.15);
  text(cols.des, y + 3, 'Désignation', 9, true);
  textR(cols.qte, y + 3, 'Qté', 9, true);
  textR(cols.pu, y + 3, 'PU HT', 9, true);
  textR(cols.tva, y + 3, 'TVA', 9, true);
  textR(cols.tot, y + 3, 'Total HT', 9, true);
  y += 26;

  gray(0.1);
  for (const l of f.lignes) {
    const net = r2((Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0) * (1 - (Number(l.remisePct) || 0) / 100));
    text(cols.des, y, trunc(l.designation, 52), 10);
    textR(cols.qte, y, String(l.quantite), 10);
    textR(cols.pu, y, money(l.prixUnitaireHt), 10);
    textR(cols.tva, y, `${l.tauxTva} %`, 10);
    textR(cols.tot, y, money(net), 10);
    if (Number(l.remisePct) > 0) { gray(0.45); text(cols.des + 8, y + 12, `remise ${l.remisePct} %`, 8); gray(0.1); y += 12; }
    strokeGray(0.9); line(M, y + 6, W - M, y + 6, 0.4);
    y += 22;
    if (y > H - 170) break; // garde mono-page (MVP)
  }

  // ── Totaux ─────────────────────────────────────────────────────────────────
  y += 10;
  const tx = W - M;
  gray(0.35); textR(tx - 120, y, 'Total HT', 10); gray(0.1); textR(tx, y, money(f.totaux.ht), 10); y += 16;
  for (const g of f.totaux.parTaux) {
    if (!g.tva) continue;
    gray(0.35); textR(tx - 120, y, `TVA ${g.taux} %`, 9); gray(0.1); textR(tx, y, money(g.tva), 9); y += 14;
  }
  strokeGray(0.6); line(tx - 200, y, tx, y, 0.6); y += 16;
  gray(0.05); textR(tx - 120, y, 'TOTAL TTC', 12, true); textR(tx, y, money(f.totaux.ttc), 12, true); y += 8;

  // ── Conditions / pied ──────────────────────────────────────────────────────
  if (f.conditions) { gray(0.4); text(M, Math.max(y + 30, H - 120), trunc(`Conditions : ${f.conditions}`, 95), 8); }
  gray(0.55); text(M, H - 40, `Document généré par YADA Administration — ${f.numero}`, 7);

  return { content: Buffer.from(ops.join('\n'), 'latin1'), W, H };
}

export function facturePdf(f: PdfFacture): Buffer {
  const { content, W, H } = factureContentStream(f);
  // ── Assemblage du PDF (objets + xref) ──────────────────────────────────────
  const objs: Buffer[] = [];
  objs.push(Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'));
  objs.push(Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'));
  objs.push(Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`, 'latin1'));
  objs.push(Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, 'latin1'), content, Buffer.from('\nendstream', 'latin1')]));
  objs.push(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', 'latin1'));
  objs.push(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>', 'latin1'));

  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets: number[] = [];
  let pos = parts[0].length;
  objs.forEach((body, i) => {
    const head = Buffer.from(`${i + 1} 0 obj\n`, 'latin1');
    const tail = Buffer.from('\nendobj\n', 'latin1');
    offsets[i] = pos;
    parts.push(head, body, tail);
    pos += head.length + body.length + tail.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  parts.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(parts);
}
