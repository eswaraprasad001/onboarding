import { NextRequest, NextResponse } from 'next/server';
import { inflateRawSync } from 'zlib';
import { PCRResource } from '@/types/pcr';

export const runtime = 'nodejs';

// ─── Pure-JS XLSX parser (no external dependencies) ──────────────────────────
// XLSX is an Office Open XML file, which is a ZIP of XML files.
// We decompress entries using Node's built-in zlib and parse XML with regex.

interface ZipEntries {
  [name: string]: Buffer;
}

function readZipEntries(buf: Buffer): ZipEntries {
  const files: ZipEntries = {};
  let offset = 0;
  while (offset < buf.length - 4) {
    // PK local file header signature: 0x04034B50
    if (buf[offset] === 0x50 && buf[offset + 1] === 0x4B &&
        buf[offset + 2] === 0x03 && buf[offset + 3] === 0x04) {
      const compression = buf.readUInt16LE(offset + 8);
      const compSize = buf.readUInt32LE(offset + 18);
      const nameLen = buf.readUInt16LE(offset + 26);
      const extraLen = buf.readUInt16LE(offset + 28);
      const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
      const dataOffset = offset + 30 + nameLen + extraLen;
      const compressed = buf.slice(dataOffset, dataOffset + compSize);
      try {
        files[name] = compression === 8 ? inflateRawSync(compressed) : compressed;
      } catch { /* skip unreadable entries */ }
      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }
  return files;
}

function xmlDecode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const parts = m[1].match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? [];
    strings.push(parts.map((t) => xmlDecode(t.replace(/<[^>]+>/g, ''))).join(''));
  }
  return strings;
}

function parseWorkbookRels(xml: string): Record<string, string> {
  const rels: Record<string, string> = {};
  const re = /Id="([^"]+)"[^>]+Target="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) rels[m[1]] = m[2];
  return rels;
}

function parseWorkbook(xml: string): Array<{ name: string; rId: string }> {
  const sheets: Array<{ name: string; rId: string }> = [];
  const re = /<sheet[^>]+name="([^"]+)"[^>]+r:id="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    sheets.push({ name: xmlDecode(m[1]), rId: m[2] });
  }
  return sheets;
}

type CellValue = string | number | null;
type SheetData = Record<number, Record<string, CellValue>>;

function parseSheetXml(xml: string, sharedStrings: string[]): SheetData {
  const rows: SheetData = {};
  const rowRe = /<row[^>]+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rowM: RegExpExecArray | null;
  while ((rowM = rowRe.exec(xml)) !== null) {
    const rowNum = parseInt(rowM[1]);
    const cells: Record<string, CellValue> = {};
    // Cell address: column letters only (strip row number)
    const cellRe = /<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g;
    let cM: RegExpExecArray | null;
    while ((cM = cellRe.exec(rowM[2])) !== null) {
      const col = cM[1];
      const attrs = cM[2];
      const inner = cM[3];
      const vM = inner.match(/<v>([\s\S]*?)<\/v>/);
      if (vM) {
        const raw = vM[1];
        const isSharedStr = attrs.includes('t="s"');
        if (isSharedStr) {
          cells[col] = sharedStrings[parseInt(raw)] ?? raw;
        } else {
          const n = Number(raw);
          cells[col] = isNaN(n) ? raw : n;
        }
      }
    }
    rows[rowNum] = cells;
  }
  return rows;
}

// ─── SPW-specific parsing ─────────────────────────────────────────────────────

interface SPWParseResult {
  resources: PCRResource[];
  isZeroCost: boolean;
  serviceType: string;
  warnings: string[];
}

function parseSPWFromBuffer(buf: Buffer): SPWParseResult {
  const entries = readZipEntries(buf);
  const warnings: string[] = [];

  const ssXml = entries['xl/sharedStrings.xml']?.toString('utf8') ?? '';
  const sharedStrings = parseSharedStrings(ssXml);

  const wbXml = entries['xl/workbook.xml']?.toString('utf8') ?? '';
  const wbRelsXml = entries['xl/_rels/workbook.xml.rels']?.toString('utf8') ?? '';
  const sheets = parseWorkbook(wbXml);
  const rels = parseWorkbookRels(wbRelsXml);

  // Prefer POD SPW, then T&M SPW, then first sheet
  const preferred = ['POD SPW', 'T&M SPW'];
  let targetSheet = sheets.find((s) => preferred.includes(s.name)) ?? sheets[0];
  const serviceType = targetSheet?.name.includes('T&M') ? 'T&M' : 'POD';

  if (!targetSheet) {
    return { resources: [], isZeroCost: true, serviceType: 'POD', warnings: ['No usable sheet found in SPW.'] };
  }

  const sheetPath = 'xl/' + rels[targetSheet.rId];
  const sheetXml = entries[sheetPath]?.toString('utf8') ?? '';
  const sheetData = parseSheetXml(sheetXml, sharedStrings);

  // Find the header row: look for a row where column A = "Discipline" or "Practice"
  let headerRow = -1;
  for (let r = 1; r <= 50; r++) {
    const val = String(sheetData[r]?.A ?? '').toLowerCase();
    if (val === 'discipline' || val === 'practice') {
      headerRow = r;
      break;
    }
  }

  if (headerRow === -1) {
    warnings.push('Could not find resource header row in SPW.');
    return { resources: [], isZeroCost: true, serviceType, warnings };
  }

  // Build column map from header row
  const header = sheetData[headerRow] ?? {};
  const colMap: Record<string, string> = {};
  for (const [col, val] of Object.entries(header)) {
    if (val) colMap[String(val).toLowerCase().trim()] = col;
  }

  // POD SPW columns (by header label, falling back to known positions)
  // Note: in sparse XML, empty formula cells may shift which columns appear in data rows.
  // We find the column letter from the header row and use that for data rows.
  const disciplineCol = colMap['discipline'] ?? colMap['practice'] ?? 'A';
  const levelCol = colMap['resource level'] ?? 'B';
  const theatreCol = colMap['delivery theatre'] ?? 'C';
  const listRateCol = colMap['list rate'] ?? 'H';
  const discRateCol = colMap['discounted rate'] ?? colMap['extended rate'] ?? 'I';

  // Month columns: find all that look like "month N"
  const monthCols: string[] = [];
  for (const [val, col] of Object.entries(colMap)) {
    if (/^month\s*\d+$/.test(val)) monthCols.push(col);
  }
  monthCols.sort(); // alphabetical sort of column letters works for A-Z

  const totalHoursCol = colMap['total hours'] ?? 'V';

  const resources: PCRResource[] = [];
  let hasNonZeroRate = false;

  for (let r = headerRow + 1; r <= headerRow + 60; r++) {
    const row = sheetData[r];
    if (!row) continue;

    const discipline = String(row[disciplineCol] ?? '').trim();
    const level = String(row[levelCol] ?? '').trim();
    if (!discipline || discipline.toLowerCase() === 'totals') break;

    const theatre = String(row[theatreCol] ?? '').trim();

    // List rate may be in the labeled column OR in a nearby column that has a numeric value.
    // In this SPW, column H is labeled "List Rate" but the actual numeric appears in column F
    // in data rows (because D/E/G columns store formula text that gets skipped in sparse XML).
    // Strategy: check the labeled column first, then scan nearby columns for the first number
    // that looks like a reasonable hourly rate (10-500).
    let listRate: number | undefined;
    let discRate: number | undefined;

    const labeledList = row[listRateCol];
    if (typeof labeledList === 'number' && labeledList > 0) {
      listRate = labeledList;
    } else {
      // Scan columns E through J for the first plausible rate
      for (const scanCol of ['E','F','G','H']) {
        const v = row[scanCol];
        if (typeof v === 'number' && v >= 10 && v <= 1000) {
          listRate = v;
          break;
        }
      }
    }

    const labeledDisc = row[discRateCol];
    if (typeof labeledDisc === 'number') {
      discRate = labeledDisc;
    } else {
      discRate = 0;
    }

    if (discRate && discRate > 0) hasNonZeroRate = true;

    // Count active months.
    // First pass: collect all month cols with positive values.
    const candidateMonthCols = monthCols.filter((c) => {
      const v = row[c];
      return typeof v === 'number' && v > 0;
    });
    // Determine the typical monthly hours (modal value or first value).
    // Filter out any columns whose value is far larger — these are shifted totals
    // (sparse XML drops empty formula cells, causing the pre-summed total to land
    // in a column that the header labeled as a later month).
    const candidateValues = candidateMonthCols.map((c) => row[c] as number);
    const typicalHours = candidateValues.length > 0 ? Math.min(...candidateValues) : 0;
    const activeMonthCols = typicalHours > 0
      ? candidateMonthCols.filter((c) => (row[c] as number) <= typicalHours * 3)
      : candidateMonthCols;
    const hoursPerMonth = activeMonthCols.length > 0
      ? (row[activeMonthCols[0]] as number)
      : 0;
    // Prefer the labeled total-hours column; fall back to summing active month columns.
    const labeledTotal = row[totalHoursCol];
    const totalHours = typeof labeledTotal === 'number' && labeledTotal > 0
      ? labeledTotal
      : activeMonthCols.reduce((sum, c) => sum + (row[c] as number), 0);

    const allocationStr = hoursPerMonth > 0
      ? `${hoursPerMonth} hrs/mo × ${activeMonthCols.length} month${activeMonthCols.length !== 1 ? 's' : ''}`
      : totalHours > 0 ? `${totalHours} total hrs` : 'TBD';

    const roleDisplay = theatre ? `${level} (${theatre})` : level;

    resources.push({
      role: roleDisplay,
      discipline: discipline.replace(/_/g, ' '),
      resourceLevel: level,
      deliveryTheatre: theatre,
      listRate,
      discountedRate: discRate,
      originalAllocation: '',
      newAllocation: allocationStr,
      action: 'added',
    });
  }

  return {
    resources,
    isZeroCost: !hasNonZeroRate,
    serviceType,
    warnings,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate XLSX magic bytes (PK zip: 50 4B 03 04)
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      return NextResponse.json(
        { error: 'Uploaded file does not appear to be a valid Excel (.xlsx) file.' },
        { status: 400 }
      );
    }

    const result = parseSPWFromBuffer(buffer);
    console.log('[parse-spw] resources:', result.resources.length, '| warnings:', result.warnings, '| isZeroCost:', result.isZeroCost);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
