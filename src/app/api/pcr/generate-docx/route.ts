import { NextRequest, NextResponse } from 'next/server';
import { inflateRawSync, deflateRawSync } from 'zlib';
import path from 'path';
import fs from 'fs';
import { PCRDocument } from '@/types/pcr';

export const runtime = 'nodejs';

// ─── Minimal ZIP reader/writer (pure Node.js, no dependencies) ───────────────

interface ZipEntry {
  name: string;
  data: Buffer;
  compression: number; // 0 = stored, 8 = deflated
  crc32: number;
  originalCompressedSize: number;
  originalOffset: number;
}

function crc32(buf: Buffer): number {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crcTable: number[] | null = null;
function makeCrcTable(): number[] {
  if (_crcTable) return _crcTable;
  _crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    _crcTable[n] = c;
  }
  return _crcTable;
}

function readZip(buf: Buffer): ZipEntry[] {
  const entries: ZipEntry[] = [];
  let offset = 0;
  while (offset < buf.length - 4) {
    if (buf[offset] === 0x50 && buf[offset + 1] === 0x4b && buf[offset + 2] === 0x03 && buf[offset + 3] === 0x04) {
      const compression = buf.readUInt16LE(offset + 8);
      const crc = buf.readUInt32LE(offset + 14);
      const compSize = buf.readUInt32LE(offset + 18);
      const uncompSize = buf.readUInt32LE(offset + 22);
      const nameLen = buf.readUInt16LE(offset + 26);
      const extraLen = buf.readUInt16LE(offset + 28);
      const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
      const dataOffset = offset + 30 + nameLen + extraLen;
      const compressed = buf.slice(dataOffset, dataOffset + compSize);
      let data: Buffer;
      try {
        data = compression === 8 ? inflateRawSync(compressed) : compressed;
      } catch {
        data = compressed;
      }
      void uncompSize;
      entries.push({ name, data, compression, crc32: crc, originalCompressedSize: compSize, originalOffset: offset });
      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }
  return entries;
}

function writeZip(entries: ZipEntry[]): Buffer {
  const parts: Buffer[] = [];
  const centralDir: Buffer[] = [];
  const offsets: number[] = [];
  let pos = 0;

  for (const entry of entries) {
    offsets.push(pos);
    const nameBuf = Buffer.from(entry.name, 'utf8');
    // Always store as deflated (compression=8) for non-empty entries
    const compressed = entry.data.length > 0 ? deflateRawSync(entry.data) : entry.data;
    const compression = entry.data.length > 0 ? 8 : 0;
    const crc = crc32(entry.data);
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);   // version needed
    local.writeUInt16LE(0, 6);    // flags
    local.writeUInt16LE(compression, 8);
    local.writeUInt16LE(0, 10);   // mod time
    local.writeUInt16LE(0, 12);   // mod date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);   // extra length
    nameBuf.copy(local, 30);
    parts.push(local);
    parts.push(compressed);
    pos += local.length + compressed.length;

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);    // version made by
    cd.writeUInt16LE(20, 6);    // version needed
    cd.writeUInt16LE(0, 8);     // flags
    cd.writeUInt16LE(compression, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressed.length, 20);
    cd.writeUInt32LE(entry.data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offsets[offsets.length - 1], 42);
    nameBuf.copy(cd, 46);
    centralDir.push(cd);
  }

  const cdBuf = Buffer.concat(centralDir);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(pos, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, cdBuf, eocd]);
}

// ─── XML helpers ──────────────────────────────────────────────────────────────

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build a simple paragraph with plain text, matching template paragraph style
function para(text: string, opts?: { style?: string; bold?: boolean; italic?: boolean; color?: string; indent?: number }): string {
  const pStyle = opts?.style ? `<w:pStyle w:val="${opts.style}"/>` : '';
  const indentEl = opts?.indent !== undefined ? `<w:ind w:left="${opts.indent}"/>` : '';
  const pPr = (pStyle || indentEl) ? `<w:pPr>${pStyle}${indentEl}</w:pPr>` : '';
  const rPr = buildRPr(opts);
  const escaped = xmlEscape(text);
  return `<w:p><w:pPr>${pStyle}${indentEl ? `<w:ind w:left="${opts!.indent}"/>` : ''}</w:pPr><w:r>${rPr}<w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
}

function buildRPr(opts?: { bold?: boolean; italic?: boolean; color?: string }): string {
  if (!opts) return '';
  const parts: string[] = [];
  if (opts.bold) parts.push('<w:b/><w:bCs/>');
  if (opts.italic) parts.push('<w:i/><w:iCs/>');
  if (opts.color) parts.push(`<w:color w:val="${opts.color}"/>`);
  return parts.length > 0 ? `<w:rPr>${parts.join('')}</w:rPr>` : '';
}

// Paragraph that continues the numbered list at level 0 (section items)
function listPara(text: string, level: 0 | 1, numId = '1'): string {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="${level}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function emptyPara(): string {
  return '<w:p/>';
}

// ─── Resource table builder ───────────────────────────────────────────────────

function buildResourceTable(resources: PCRDocument['structuredData']['resources']): string {
  const border = `<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>`;
  const hdrBorder = `<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="4472C4"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>`;

  function cell(text: string, width: number, isHeader = false, shade = false): string {
    const tcBorders = isHeader ? `<w:tcBorders>${hdrBorder}</w:tcBorders>` : `<w:tcBorders>${border}</w:tcBorders>`;
    const shading = shade ? `<w:shd w:val="clear" w:color="auto" w:fill="EBF3FB"/>` : '';
    const rPr = isHeader ? `<w:rPr><w:b/><w:bCs/></w:rPr>` : '';
    return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${tcBorders}${shading}<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p></w:tc>`;
  }

  // Column widths summing to 9360 (content width for letter, 1" margins)
  const cols = [2600, 2000, 2380, 2380];
  const colGrid = cols.map(w => `<w:gridCol w:w="${w}"/>`).join('');

  const headerRow = `<w:tr><w:trPr><w:tblHeader/></w:trPr>${cell('Role / Discipline', cols[0], true)}${cell('Delivery Theatre', cols[1], true)}${cell('Allocation', cols[2], true)}${cell('Rate / Action', cols[3], true)}</w:tr>`;

  const dataRows = resources.map((r, i) => {
    const shade = i % 2 === 0;
    const discipline = r.discipline ? r.discipline.replace(/_/g, ' ') : '';
    const roleText = discipline && discipline !== r.role ? `${r.role}\n${discipline}` : r.role;
    const theatre = r.deliveryTheatre ?? '';

    let rateText = r.action === 'added' ? 'Added' : r.action === 'removed' ? 'Removed' : 'Changed';
    if (r.discountedRate !== undefined && r.discountedRate > 0) {
      rateText = `$${r.discountedRate}/hr | ${rateText}`;
    } else if (r.listRate !== undefined && r.listRate > 0) {
      rateText = `$${r.listRate}/hr (list) | ${rateText}`;
    }

    return `<w:tr>${cell(roleText, cols[0], false, shade)}${cell(theatre, cols[1], false, shade)}${cell(r.newAllocation, cols[2], false, shade)}${cell(rateText, cols[3], false, shade)}</w:tr>`;
  }).join('');

  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders>${border}</w:tblBorders></w:tblPr><w:tblGrid>${colGrid}</w:tblGrid>${headerRow}${dataRows}</w:tbl>`;
}

// ─── Document XML builder ─────────────────────────────────────────────────────

function buildDocumentXml(doc: PCRDocument, originalXml: string): string {
  const { structuredData: data, narrative } = doc;

  const projectName = data.projectName ?? 'Untitled Project';
  const clientName = data.clientName ?? 'Client';
  const sowDate = data.sowDate ?? '';
  const sowId = data.sowId ?? '';
  const priorPcrDates: string[] = Array.isArray(data.priorPcrDates) ? data.priorPcrDates : [];
  const changeTypes = Array.isArray(data.changeTypes) ? data.changeTypes : [];
  const resources = Array.isArray(data.resources) ? data.resources : [];
  const pricingChange = data.pricingChange ?? { isZeroCost: true };

  // Build the prior PCR reference text
  const priorPcrText = priorPcrDates.length > 0
    ? priorPcrDates.map((d, i) => `, PCR${i + 1} executed on ${d}`).join('')
    : '';

  // ── Build the body paragraphs ──────────────────────────────────────────────
  const paragraphs: string[] = [];

  // Header block: Project Name, SOW ID (centered, matching template)
  paragraphs.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Project Name: ${xmlEscape(projectName)}</w:t></w:r></w:p>`);
  paragraphs.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>SOW ID: ${xmlEscape(sowId)}</w:t></w:r></w:p>`);
  paragraphs.push(emptyPara());

  // Legal intro paragraph — same structure as template with inline color runs for filled values
  paragraphs.push(
    `<w:p>` +
    `<w:r><w:t xml:space="preserve">This Project Change Request (&#x201C;PCR&#x201D;) is made by and between Presidio Networked Solutions LLC (&#x201C;Presidio&#x201D;) for the provision of certain professional services at </w:t></w:r>` +
    `<w:r><w:t xml:space="preserve">${xmlEscape(clientName)}</w:t></w:r>` +
    `<w:r><w:t xml:space="preserve"> (&#x201C;Client&#x201D;) as more fully described herein. Presidio expressly acknowledges and agrees that this PCR is incorporated by reference into and made a part of the Statement of Work executed on </w:t></w:r>` +
    `<w:r><w:t xml:space="preserve">${xmlEscape(sowDate)}${xmlEscape(priorPcrText)}, </w:t></w:r>` +
    `<w:r><w:t>(the &#x201C;Agreement&#x201D;). In the event of conflict, the terms of the Agreement shall control unless otherwise expressly provided herein.</w:t></w:r>` +
    `</w:p>`
  );
  paragraphs.push(emptyPara());

  // Section 1: Change Summary
  paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">1. CHANGE SUMMARY </w:t></w:r></w:p>`);
  paragraphs.push(`<w:p><w:r><w:t>Client requests the following changes &#x2026;</w:t></w:r></w:p>`);
  paragraphs.push(emptyPara());

  // Split narrative into paragraphs
  const changeSummaryParas = (narrative?.changeSummary ?? '').split(/\n+/).filter(Boolean);
  for (const line of changeSummaryParas) {
    paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`);
  }
  paragraphs.push(emptyPara());

  // Section 2: Proposed Changes
  paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">2. PROPOSED CHANGES AND RATIONALE </w:t></w:r></w:p>`);

  // Section 1.2 — Solution Approach (prose, 2–3 sentences)
  if (narrative?.solutionApproachChanges || changeTypes.includes('scope')) {
    paragraphs.push(listPara('Changes for Section 1.2 (Solution Approach and Overview)', 0));
    const approachLines = (narrative?.solutionApproachChanges ?? '').split(/\n+/).filter(Boolean);
    for (const line of approachLines) {
      paragraphs.push(listPara(line, 1));
    }
    if (!approachLines.length) paragraphs.push(listPara('Approach or Overview changes', 1));
  }

  // Section 2.1 — Scope / Schedule: phase header + bullet list
  if (narrative?.scopeChanges || changeTypes.includes('timeline') || changeTypes.includes('scope')) {
    paragraphs.push(listPara('Changes for Section 2.1 (Project Detailed Scope, Activities, or schedule)', 0));
    const rawScopeLines = (narrative?.scopeChanges ?? '').split(/\n+/).filter(Boolean);
    for (const line of rawScopeLines) {
      // Lines starting with "•" or "-" or "*" are bulleted deliverables (indent level 1)
      // Phase header lines (no bullet prefix) are rendered at indent level 1 in bold
      const trimmed = line.replace(/^[•\-\*]\s*/, '');
      const isBullet = /^[•\-\*]/.test(line);
      if (isBullet) {
        // Render as indented bullet using the list paragraph style
        paragraphs.push(listPara(trimmed, 1));
      } else {
        // Phase header: render as level-0 list item (bold)
        paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">${xmlEscape(trimmed)}</w:t></w:r></w:p>`);
      }
    }
    // Explicit timeline extension appended after scope bullets
    if (data.timelineExtensionDays) {
      paragraphs.push(listPara(`Schedule change: ${data.timelineExtensionDays}-day extension${data.newEndDate ? `, new end date: ${data.newEndDate}` : ''}.`, 1));
    } else if (data.newEndDate) {
      paragraphs.push(listPara(`Program end date: ${data.newEndDate}.`, 1));
    }
    if (!rawScopeLines.length && !data.timelineExtensionDays && !data.newEndDate) {
      paragraphs.push(listPara('Scope and schedule details as described in the Change Summary above.', 1));
    }
  }

  // Section 3.1 — Resource Changes: matches template structure exactly
  // Template: section header → "Resource Allocation Changes" → intro sentence → table →
  // then structured fields: Resources (Added/Removed), Deliverables, Engagement length
  if (resources.length > 0) {
    paragraphs.push(listPara('Changes for Section 3.1 Resource Changes', 0));
    paragraphs.push(listPara('Resource Allocation Changes', 1));
    paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">The following table replaces the resource assignment or allocation table from the SOW.</w:t></w:r></w:p>`);
    paragraphs.push(emptyPara());
    paragraphs.push(buildResourceTable(resources));
    paragraphs.push(emptyPara());

    // Structured fields matching the template's "Resources / Deliverables / Engagement length" block
    const addedRoles = resources.filter((r) => r.action === 'added');
    const removedRoles = resources.filter((r) => r.action === 'removed' || r.action === 'changed');

    paragraphs.push(`<w:p><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Resources</w:t></w:r></w:p>`);

    if (addedRoles.length > 0) {
      paragraphs.push(`<w:p><w:pPr><w:ind w:left="360"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Added Resources</w:t></w:r></w:p>`);
      for (const r of addedRoles) {
        const discipline = r.discipline ? r.discipline.replace(/_/g, ' ') : '';
        const label = discipline && discipline !== r.role ? `${r.role} (${discipline})` : r.role;
        paragraphs.push(`<w:p><w:pPr><w:ind w:left="720"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(label)} — ${xmlEscape(r.newAllocation)}</w:t></w:r></w:p>`);
      }
    }

    if (removedRoles.length > 0) {
      paragraphs.push(`<w:p><w:pPr><w:ind w:left="360"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Removed or Reduced Resources</w:t></w:r></w:p>`);
      for (const r of removedRoles) {
        paragraphs.push(`<w:p><w:pPr><w:ind w:left="720"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(r.role)} — ${xmlEscape(r.newAllocation)}</w:t></w:r></w:p>`);
      }
    }

    // Deliverables — first sentence of the change summary gives the best concise description
    const deliverablesSummary = (narrative?.changeSummary ?? '').split(/(?<=[.!?])\s+/)[0] ?? '';
    paragraphs.push(emptyPara());
    paragraphs.push(`<w:p><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Deliverables</w:t></w:r></w:p>`);
    if (deliverablesSummary) {
      paragraphs.push(`<w:p><w:pPr><w:ind w:left="360"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(deliverablesSummary)}</w:t></w:r></w:p>`);
    }

    // Engagement length — derive from resource allocation strings
    const engagementMonths = (() => {
      const alloc = resources[0]?.newAllocation ?? '';
      const m = alloc.match(/(\d+)\s*month/i);
      return m ? `${m[1]} Months` : '';
    })();
    paragraphs.push(emptyPara());
    paragraphs.push(`<w:p><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Engagement length</w:t></w:r></w:p>`);
    if (engagementMonths) {
      paragraphs.push(`<w:p><w:pPr><w:ind w:left="360"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(engagementMonths)}</w:t></w:r></w:p>`);
    }
    paragraphs.push(emptyPara());
  }

  // Section 6.0 — Assumptions: bold-label format ("Label: sentence.")
  if (narrative?.assumptionChanges || changeTypes.includes('assumptions')) {
    paragraphs.push(listPara('Changes for Section 6.0 (Assumptions)', 0));
    paragraphs.push(listPara('Added assumptions to support new activities or tools.', 1));
    const assumpLines = (narrative?.assumptionChanges ?? '').split(/\n+/).filter(Boolean);
    for (const line of assumpLines) {
      // Each assumption line is formatted as "Label: sentence."
      // Render the label in bold and the rest in normal weight within the same paragraph.
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 50) {
        const label = line.slice(0, colonIdx).trim();
        const body = line.slice(colonIdx + 1).trim();
        paragraphs.push(
          `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr></w:pPr>` +
          `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">${xmlEscape(label)}: </w:t></w:r>` +
          `<w:r><w:t xml:space="preserve">${xmlEscape(body)}</w:t></w:r>` +
          `</w:p>`
        );
      } else {
        paragraphs.push(listPara(line, 1));
      }
    }
    if (!assumpLines.length) paragraphs.push(listPara('Changed assumptions', 1));
  }

  paragraphs.push(emptyPara());

  // Section 3: Pricing — preserve the checkbox field format from the template
  paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">3. PRICING CHANGES </w:t></w:r></w:p>`);

  // Zero-cost checkbox (pre-checked if isZeroCost, unchecked otherwise)
  const check1Val = pricingChange.isZeroCost ? '1' : '0';
  const check2Val = pricingChange.isZeroCost ? '0' : '1';

  paragraphs.push(
    `<w:p>` +
    `<w:r><w:fldChar w:fldCharType="begin"><w:ffData><w:name w:val="Check1"/><w:enabled/><w:calcOnExit w:val="0"/><w:checkBox><w:sizeAuto/><w:default w:val="${check1Val}"/></w:checkBox></w:ffData></w:fldChar></w:r>` +
    `<w:bookmarkStart w:id="100" w:name="Check1"/>` +
    `<w:r><w:instrText xml:space="preserve"> FORMCHECKBOX </w:instrText><w:fldChar w:fldCharType="separate"/><w:fldChar w:fldCharType="end"/></w:r>` +
    `<w:bookmarkEnd w:id="100"/>` +
    `<w:r><w:t xml:space="preserve">  This PCR is a Zero Cost ($0) Change.  The Pricing for project is unchanged.</w:t></w:r>` +
    `</w:p>`
  );

  paragraphs.push(emptyPara());

  paragraphs.push(
    `<w:p>` +
    `<w:r><w:fldChar w:fldCharType="begin"><w:ffData><w:name w:val="Check2"/><w:enabled/><w:calcOnExit w:val="0"/><w:checkBox><w:sizeAuto/><w:default w:val="${check2Val}"/></w:checkBox></w:ffData></w:fldChar></w:r>` +
    `<w:bookmarkStart w:id="101" w:name="Check2"/>` +
    `<w:r><w:instrText xml:space="preserve"> FORMCHECKBOX </w:instrText><w:fldChar w:fldCharType="separate"/><w:fldChar w:fldCharType="end"/></w:r>` +
    `<w:bookmarkEnd w:id="101"/>` +
    `<w:r><w:t xml:space="preserve">  This PCR changes the price for this project based on the following table.  This information replaces the pricing table and updated invoice schedule in the original SOW section 5 (PRICING).</w:t></w:r>` +
    `</w:p>`
  );

  if (!pricingChange.isZeroCost) {
    paragraphs.push(emptyPara());
    if (pricingChange.originalTotal || pricingChange.newTotal) {
      paragraphs.push(`<w:p><w:r><w:t>Original Total: ${xmlEscape(pricingChange.originalTotal ?? '—')}     New Total: ${xmlEscape(pricingChange.newTotal ?? '—')}</w:t></w:r></w:p>`);
    }
    if (pricingChange.notes) {
      paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEscape(pricingChange.notes)}</w:t></w:r></w:p>`);
    }
  }

  paragraphs.push(emptyPara());

  // Page break before Section 4
  paragraphs.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>[Acceptance of Services and Signature Block on Next Page]</w:t></w:r></w:p>`);
  paragraphs.push(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`);

  // Section 4: Acceptance — preserve the template's acceptance text and signature table
  paragraphs.push(`<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">4. ACCEPTANCE OF SERVICE: </w:t></w:r></w:p>`);
  paragraphs.push(emptyPara());
  paragraphs.push(`<w:p><w:r><w:t>We appreciate the opportunity to be of service to you and look forward to continuing our partnership with you on this project. Please indicate your approval of these arrangements by signing and returning all pages of this PCR and via Adobe signature request from Presidio or to your Presidio Account Manager.</w:t></w:r></w:p>`);
  paragraphs.push(emptyPara());
  paragraphs.push(`<w:p><w:r><w:t>By the signatures of their duly authorized representatives below, Presidio and Client, intending to be legally bound, agree to the provisions of this PCR as of the dates set forth below.</w:t></w:r></w:p>`);
  paragraphs.push(emptyPara());

  // Extract the signature table XML directly from the original template XML so we
  // get the exact formatting, borders, and sizing, then substitute CLIENT NAME.
  const tblMatch = originalXml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/);
  if (tblMatch) {
    const sigTable = tblMatch[0].replace('CLIENT NAME', xmlEscape(clientName.toUpperCase()));
    paragraphs.push(sigTable);
  }

  paragraphs.push(emptyPara());

  // Reconstruct the document XML: keep all the namespaces and sectPr from the original,
  // replace only the body content.
  const bodyContent = paragraphs.join('\n    ');

  // Extract the sectPr (section properties with page size, margins, header ref) from original
  const sectPrMatch = originalXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  const sectPr = sectPrMatch ? sectPrMatch[0] : '';

  // Grab everything up to and including <w:body> from original to preserve all namespaces
  const bodyOpenIdx = originalXml.indexOf('<w:body>');
  const preamble = originalXml.slice(0, bodyOpenIdx + '<w:body>'.length);

  return `${preamble}\n    ${bodyContent}\n    ${sectPr}\n  </w:body>\n</w:document>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { document: PCRDocument };
    const { document: pcrDoc } = body;

    if (!pcrDoc?.structuredData) {
      return NextResponse.json({ error: 'Missing structuredData.' }, { status: 400 });
    }

    // Debug log so we can verify resources and narrative slots are arriving correctly
    const sd = pcrDoc.structuredData;
    console.log('[PCR generate-docx] resources:', (sd.resources ?? []).length, 'changeTypes:', sd.changeTypes, 'narrative keys:', Object.keys(pcrDoc.narrative ?? {}));

    // Load the PCR template dotx (bundled with this route)
    const templatePath = path.join(process.cwd(), 'src/app/api/pcr/generate-docx/pcr-template.dotx');
    const templateBuf = fs.readFileSync(templatePath);

    // Read the ZIP entries
    const entries = readZip(templateBuf);

    // Find and transform document.xml
    const docEntry = entries.find(e => e.name === 'word/document.xml');
    if (!docEntry) {
      return NextResponse.json({ error: 'Template is malformed: missing word/document.xml.' }, { status: 500 });
    }

    const originalXml = docEntry.data.toString('utf8');
    const filledXml = buildDocumentXml(pcrDoc, originalXml);
    docEntry.data = Buffer.from(filledXml, 'utf8');

    // Fix the [Content_Types].xml to declare this as a docx (not dotx)
    const ctEntry = entries.find(e => e.name === '[Content_Types].xml');
    if (ctEntry) {
      const ct = ctEntry.data.toString('utf8')
        .replace(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
        );
      ctEntry.data = Buffer.from(ct, 'utf8');
    }

    const docxBuffer = writeZip(entries);

    const projectName = pcrDoc.structuredData.projectName ?? 'PCR';
    const safeProjectName = projectName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '');
    const filename = `PCR-${safeProjectName}-${new Date().toISOString().slice(0, 10)}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PCR generate-docx]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
