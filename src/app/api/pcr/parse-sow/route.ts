import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_SOW_TEXT = 4000;

interface SOWMetadata {
  projectName?: string;
  clientName?: string;
  sowDate?: string;
  sowId?: string;
}

/**
 * Send the PDF directly to the OpenAI API using the file content type.
 * GPT-4o can read PDF files natively via the Responses API (file input).
 * Falls back to a text-based extraction if that path fails.
 */
async function extractMetadataWithVision(pdfBuffer: Buffer): Promise<SOWMetadata> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');

  const model = process.env.OPENAI_MODEL ?? 'gpt-4o';

  const prompt = `You are extracting structured metadata from a Presidio Statement of Work (SOW) document.

Presidio SOW format:
- Cover page: engagement title above "STATEMENT OF WORK", client short name, "SOW Date: [date]", "Opportunity #: [number]"
- Page 2 contact table: "Client Name:" row has the full legal entity name (e.g. "EDI Health Group DBA DentalXChange")
- Opportunity # on the cover is the SOW ID used in PCR documents
- Signature block (APPROVAL SIGNOFF section): contains the EXECUTION date when both parties signed — this is different from the "SOW Date:" proposal date on the cover. Look for dates next to signature lines or formatted as mm/dd/yyyy.

Extract these four fields:
1. projectName: Full engagement title from the cover (above "STATEMENT OF WORK")
2. clientName: Full legal client name from the "Client Name:" row in the contact table
3. sowDate: The EXECUTION date from the SIGNATURE BLOCK (when both parties signed), NOT the "SOW Date:" on the cover
4. sowId: The Opportunity # from the cover page

Respond ONLY with a valid JSON object. Use null for any field you cannot find. Do not guess.

Example: {"projectName":"2026 Product Engineering & AI-Enabled Delivery Services","clientName":"EDI Health Group DBA DentalXChange","sowDate":"January 28, 2026","sowId":"1001225057968.1"}`;

  // Use the OpenAI Chat Completions API with base64-encoded PDF file input
  // This works with gpt-4o which supports PDF file inputs
  const base64Pdf = pdfBuffer.toString('base64');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'file',
              file: {
                filename: 'sow.pdf',
                file_data: `data:application/pdf;base64,${base64Pdf}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content ?? '';
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return {};

  const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as Record<string, string | null>;
  return {
    projectName: parsed.projectName ?? undefined,
    clientName: parsed.clientName ?? undefined,
    sowDate: parsed.sowDate ?? undefined,
    sowId: parsed.sowId ?? undefined,
  };
}

/**
 * Rough text extraction for narrative context (not metadata).
 * Attempts zlib decompression of PDF streams for unencrypted PDFs.
 * Returns empty string for encrypted PDFs — that's fine, the LLM already
 * read the content for metadata extraction above.
 */
function extractRawText(buffer: Buffer): string {
  const { inflateSync } = require('zlib') as typeof import('zlib');
  const raw = buffer.toString('latin1');
  const chunks: string[] = [];
  const seen = new Set<string>();

  // Try decompressing FlateDecode streams
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let sm: RegExpExecArray | null;
  while ((sm = streamRe.exec(raw)) !== null) {
    try {
      const decompressed = inflateSync(Buffer.from(sm[1], 'binary')).toString('latin1');
      const btRe = /BT([\s\S]*?)ET/g;
      let bt: RegExpExecArray | null;
      while ((bt = btRe.exec(decompressed)) !== null) {
        const parenRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
        let p: RegExpExecArray | null;
        while ((p = parenRe.exec(bt[1])) !== null) {
          const t = p[1].replace(/\\n/g, ' ').replace(/[\x00-\x1f]/g, '').trim();
          if (t.length > 1 && !seen.has(t)) { seen.add(t); chunks.push(t); }
        }
      }
    } catch { /* skip compressed/encrypted streams */ }
  }

  // Also try raw BT/ET scanning for uncompressed streams
  const btRe = /BT([\s\S]*?)ET/g;
  let bt: RegExpExecArray | null;
  while ((bt = btRe.exec(raw)) !== null) {
    const parenRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let p: RegExpExecArray | null;
    while ((p = parenRe.exec(bt[1])) !== null) {
      const t = p[1].replace(/\\n/g, ' ').replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
      if (t.length > 1 && !seen.has(t)) { seen.add(t); chunks.push(t); }
    }
  }

  return chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes
    if (!buffer.slice(0, 5).toString('ascii').startsWith('%PDF')) {
      return NextResponse.json({ error: 'Uploaded file is not a valid PDF.' }, { status: 400 });
    }

    // Extract metadata by sending the PDF directly to the LLM
    const metadata = await extractMetadataWithVision(buffer);

    // Extract raw text for narrative context (best-effort, empty for encrypted PDFs)
    const rawText = extractRawText(buffer);
    const sowText = rawText.slice(0, MAX_SOW_TEXT);

    return NextResponse.json({
      text: sowText,
      metadata,
      charCount: rawText.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
