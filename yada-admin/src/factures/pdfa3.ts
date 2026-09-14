/**
 * Conteneur Factur-X : PDF embarquant le XML CII conforme (pièce jointe
 * « factur-x.xml »), avec les structures visées par PDF/A-3 :
 *  · /AF + /Names/EmbeddedFiles + Filespec (AFRelationship /Data) ;
 *  · métadonnées XMP (identification PDF/A-3B + schéma d'extension Factur-X) ;
 *  · OutputIntent + profil ICC sRGB embarqué (généré ici, sans dépendance).
 *
 * Limite honnête : les polices restent les Standard-14 (Helvetica) non
 * embarquées → la certification veraPDF PDF/A-3b stricte exige encore l'embarquement
 * des polices. La conformité EN 16931 du **XML** (ce que valide une PDP) est, elle,
 * assurée par facturx.ts. À faire valider (veraPDF + Chorus Pro) avant transmission réelle.
 */
import { PdfFacture, factureContentStream } from './facture.pdf';
import { FacturxProfil } from './facturx';

const CONFORMANCE_LABEL: Record<FacturxProfil, string> = {
  minimum: 'MINIMUM', basicwl: 'BASIC WL', basic: 'BASIC', en16931: 'EN 16931', extended: 'EXTENDED',
};

const s16 = (v: number) => { const b = Buffer.alloc(4); b.writeInt32BE(Math.round(v * 65536)); return b; };

/** Profil ICC sRGB minimal mais structurellement valide (matrice/TRC, PCS D50). */
function srgbIcc(): Buffer {
  const xyz = (X: number, Y: number, Z: number) =>
    Buffer.concat([Buffer.from('XYZ \0\0\0\0', 'latin1'), s16(X), s16(Y), s16(Z)]);
  const curv = Buffer.concat([Buffer.from('curv\0\0\0\0', 'latin1'), (() => { const b = Buffer.alloc(4); b.writeUInt32BE(0); return b; })()]); // identité
  const textDesc = (str: string) => {
    const ascii = Buffer.from(str + '\0', 'latin1');
    const cnt = Buffer.alloc(4); cnt.writeUInt32BE(ascii.length);
    return Buffer.concat([Buffer.from('desc\0\0\0\0', 'latin1'), cnt, ascii,
      Buffer.alloc(4 + 4), Buffer.alloc(3), Buffer.alloc(67)]); // uni lang/cnt=0, script code+cnt, mac buf
  };
  const cprt = Buffer.concat([Buffer.from('text\0\0\0\0', 'latin1'), Buffer.from('YADA — sRGB\0', 'latin1')]);

  const tags: { sig: string; data: Buffer }[] = [
    { sig: 'desc', data: textDesc('sRGB') },
    { sig: 'wtpt', data: xyz(0.9642, 1.0, 0.8249) },   // D50
    { sig: 'rXYZ', data: xyz(0.4361, 0.2225, 0.0139) },
    { sig: 'gXYZ', data: xyz(0.3851, 0.7169, 0.0971) },
    { sig: 'bXYZ', data: xyz(0.1431, 0.0606, 0.7141) },
    { sig: 'rTRC', data: curv }, { sig: 'gTRC', data: curv }, { sig: 'bTRC', data: curv },
    { sig: 'cprt', data: cprt },
  ];
  const n = tags.length;
  const tableSize = 4 + n * 12;
  let offset = 128 + tableSize;
  const table = Buffer.alloc(tableSize); table.writeUInt32BE(n, 0);
  const blobs: Buffer[] = [];
  tags.forEach((t, i) => {
    const pad = (4 - (t.data.length % 4)) % 4;
    const data = pad ? Buffer.concat([t.data, Buffer.alloc(pad)]) : t.data;
    table.write(t.sig, 4 + i * 12, 'latin1');
    table.writeUInt32BE(offset, 4 + i * 12 + 4);
    table.writeUInt32BE(t.data.length, 4 + i * 12 + 8);
    blobs.push(data); offset += data.length;
  });
  const body = Buffer.concat([table, ...blobs]);
  const header = Buffer.alloc(128);
  header.writeUInt32BE(128 + body.length, 0);          // taille totale
  header.write('acsp', 36, 'latin1');                  // signature
  header.writeUInt32BE(0x02100000, 8);                 // version 2.1
  header.write('mntr', 12, 'latin1');                  // classe : moniteur
  header.write('RGB ', 16, 'latin1');                  // espace couleur
  header.write('XYZ ', 20, 'latin1');                  // PCS
  s16(0.9642).copy(header, 68); s16(1.0).copy(header, 72); s16(0.8249).copy(header, 76); // illuminant PCS D50
  return Buffer.concat([header, body]);
}

export function facturxPdfA3(f: PdfFacture, xml: string, profil: FacturxProfil = 'en16931'): Buffer {
  const { content, W, H } = factureContentStream(f);
  const dt = (f.dateEmission || '').replace(/-/g, '') || '19700101';
  const modDate = `D:${dt}000000`;
  const xmlBuf = Buffer.from(xml, 'utf8');
  const icc = srgbIcc();
  const conf = CONFORMANCE_LABEL[profil] || 'EN 16931';

  const xmp = Buffer.from(`<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
   <pdfaid:part>3</pdfaid:part>
   <pdfaid:conformance>B</pdfaid:conformance>
  </rdf:Description>
  <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Facture ${f.numero}</rdf:li></rdf:Alt></dc:title>
  </rdf:Description>
  <rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
   <fx:DocumentType>INVOICE</fx:DocumentType>
   <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
   <fx:Version>1.0</fx:Version>
   <fx:ConformanceLevel>${conf}</fx:ConformanceLevel>
  </rdf:Description>
  <rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
   <pdfaExtension:schemas><rdf:Bag>
    <rdf:li rdf:parseType="Resource">
     <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
     <pdfaSchema:namespaceURI>urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#</pdfaSchema:namespaceURI>
     <pdfaSchema:prefix>fx</pdfaSchema:prefix>
     <pdfaSchema:property><rdf:Seq>
      <rdf:li rdf:parseType="Resource"><pdfaProperty:name>DocumentFileName</pdfaProperty:name><pdfaProperty:valueType>Text</pdfaProperty:valueType><pdfaProperty:category>external</pdfaProperty:category><pdfaProperty:description>name of the embedded XML</pdfaProperty:description></rdf:li>
      <rdf:li rdf:parseType="Resource"><pdfaProperty:name>DocumentType</pdfaProperty:name><pdfaProperty:valueType>Text</pdfaProperty:valueType><pdfaProperty:category>external</pdfaProperty:category><pdfaProperty:description>INVOICE</pdfaProperty:description></rdf:li>
      <rdf:li rdf:parseType="Resource"><pdfaProperty:name>Version</pdfaProperty:name><pdfaProperty:valueType>Text</pdfaProperty:valueType><pdfaProperty:category>external</pdfaProperty:category><pdfaProperty:description>version</pdfaProperty:description></rdf:li>
      <rdf:li rdf:parseType="Resource"><pdfaProperty:name>ConformanceLevel</pdfaProperty:name><pdfaProperty:valueType>Text</pdfaProperty:valueType><pdfaProperty:category>external</pdfaProperty:category><pdfaProperty:description>conformance level</pdfaProperty:description></rdf:li>
     </rdf:Seq></pdfaSchema:property>
    </rdf:li>
   </rdf:Bag></pdfaExtension:schemas>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`, 'utf8');

  // Objets (ordre fixe pour un xref simple).
  const objs: Buffer[] = [];
  const S = (s: string) => Buffer.from(s, 'latin1');
  const stream = (dict: string, data: Buffer) =>
    Buffer.concat([S(`${dict}\nstream\n`), data, S('\nendstream')]);

  objs.push(S(`<< /Type /Catalog /Pages 2 0 R /Metadata 7 0 R /MarkInfo << /Marked true >> /OutputIntents [10 0 R] /AF [9 0 R] /Names << /EmbeddedFiles << /Names [(factur-x.xml) 9 0 R] >> >> >>`));
  objs.push(S(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`));
  objs.push(S(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`));
  objs.push(stream(`<< /Length ${content.length} >>`, content));
  objs.push(S(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`));
  objs.push(S(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`));
  objs.push(stream(`<< /Type /Metadata /Subtype /XML /Length ${xmp.length} >>`, xmp));
  objs.push(stream(`<< /Type /EmbeddedFile /Subtype /text#2Fxml /Length ${xmlBuf.length} /Params << /ModDate (${modDate}) /Size ${xmlBuf.length} >> >>`, xmlBuf));
  objs.push(S(`<< /Type /Filespec /F (factur-x.xml) /UF (factur-x.xml) /AFRelationship /Data /Desc (Factur-X ${conf}) /EF << /F 8 0 R /UF 8 0 R >> >>`));
  objs.push(S(`<< /Type /OutputIntent /S /GTS_PDFA1 /OutputConditionIdentifier (sRGB) /Info (sRGB IEC61966-2.1) /DestOutputProfile 11 0 R >>`));
  objs.push(stream(`<< /N 3 /Length ${icc.length} >>`, icc));

  const parts: Buffer[] = [S('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n')];
  const offsets: number[] = [];
  let pos = parts[0].length;
  objs.forEach((body, i) => {
    const head = S(`${i + 1} 0 obj\n`); const tail = S('\nendobj\n');
    offsets[i] = pos; parts.push(head, body, tail);
    pos += head.length + body.length + tail.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  parts.push(S(xref));
  return Buffer.concat(parts);
}
