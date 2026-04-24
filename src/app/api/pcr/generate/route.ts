import { NextRequest, NextResponse } from 'next/server';
import { PCRDocument } from '@/types/pcr';

export const runtime = 'nodejs';

// Section header constant matching the PCR template exactly
const PCR_LEGAL_HEADER = (projectName: string, sowId: string, clientName: string, sowDate: string, priorPcrs: string[]) => {
  const priorPcrText = priorPcrs.length > 0
    ? priorPcrs.map((d, i) => `, PCR${i + 1} executed on ${d}`).join('')
    : '';
  return `Project Name: ${projectName}    SOW ID: ${sowId}

This Project Change Request ("PCR") is made by and between Presidio Networked Solutions LLC ("Presidio") for the provision of certain professional services at ${clientName} ("Client") as more fully described herein. Presidio expressly acknowledges and agrees that this PCR is incorporated by reference into and made a part of the Statement of Work executed on ${sowDate}${priorPcrText}, (the "Agreement"). In the event of conflict, the terms of the Agreement shall control unless otherwise expressly provided herein.`;
};

const PCR_ACCEPTANCE_BLOCK = (clientName: string) => `4. ACCEPTANCE OF SERVICE:

We appreciate the opportunity to be of service to you and look forward to continuing our partnership with you on this project. Please indicate your approval of these arrangements by signing and returning all pages of this PCR and via Adobe signature request from Presidio or to your Presidio Account Manager.

By the signatures of their duly authorized representatives below, Presidio and Client, intending to be legally bound, agree to the provisions of this PCR as of the dates set forth below.

${clientName.toUpperCase()}                    PRESIDIO NETWORKED SOLUTIONS LLC

Signature: _____________________         Signature: _____________________

Name (please print): _______________     Name (please print): _______________

Title (please print): _______________    Title (please print): _______________

Date: __________________________         Date: __________________________

PO: ____________________________         OPPORTUNITY ID: ________________`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { document: PCRDocument };
    const { document: pcrDoc } = body;
    const { structuredData: data, narrative } = pcrDoc;

    // Guard against missing required fields that would cause runtime errors below
    if (!data) {
      return NextResponse.json({ error: 'Missing structuredData in request body.' }, { status: 400 });
    }

    // Normalize fields that may be missing/undefined due to partial wizard state
    const projectName = data.projectName ?? 'Untitled Project';
    const clientName = data.clientName ?? 'Client';
    const sowDate = data.sowDate ?? '';
    const sowId = data.sowId ?? '';
    const priorPcrDates: string[] = Array.isArray(data.priorPcrDates) ? data.priorPcrDates : [];
    const changeTypes = Array.isArray(data.changeTypes) ? data.changeTypes : [];
    const resources = Array.isArray(data.resources) ? data.resources : [];
    const pricingChange = data.pricingChange ?? { isZeroCost: true };

    // Build the PCR document as plain text matching the template structure exactly.
    // This is assembled server-side — the LLM only contributed the narrative slots.
    const sections: string[] = [];

    // Header
    sections.push(PCR_LEGAL_HEADER(
      projectName,
      sowId,
      clientName,
      sowDate,
      priorPcrDates,
    ));

    sections.push('');

    // Section 1: Change Summary
    sections.push('1. CHANGE SUMMARY');
    sections.push('');
    sections.push('Client requests the following changes…');
    sections.push('');
    sections.push(narrative?.changeSummary ?? '');
    sections.push('');

    // Section 2: Proposed Changes
    sections.push('2. PROPOSED CHANGES AND RATIONALE');
    sections.push('');

    if (narrative?.solutionApproachChanges || changeTypes.includes('scope')) {
      sections.push('Changes for Section 1.2 (Solution Approach and Overview)');
      sections.push(narrative?.solutionApproachChanges ?? '');
      sections.push('');
    }

    if (narrative?.scopeChanges || changeTypes.includes('timeline')) {
      sections.push('Changes for Section 2.1 (Project Detailed Scope, Activities, or Schedule)');
      sections.push(narrative?.scopeChanges ?? '');
      sections.push('');

      if (data.timelineExtensionDays) {
        sections.push(`Schedule change: ${data.timelineExtensionDays}-day extension${data.newEndDate ? `, new end date: ${data.newEndDate}` : ''}.`);
        sections.push('');
      }
    }

    if (resources.length > 0) {
      sections.push('Changes for Section 3.1 (Resource Changes)');
      sections.push('');
      if (narrative?.resourceRationale) {
        sections.push(narrative.resourceRationale);
        sections.push('');
      }
      sections.push('Resource Allocation Changes');
      sections.push('The following table replaces the resource assignment or allocation table from the SOW.');
      sections.push('');
      sections.push('Role\t\t\t\tOriginal Allocation\t\tNew Allocation\t\tChange');
      sections.push('─'.repeat(80));
      for (const r of resources) {
        sections.push(`${r.role}\t\t\t\t${r.originalAllocation || '—'}\t\t\t${r.newAllocation}\t\t\t${r.action}`);
      }
      sections.push('');
    }

    if (narrative?.assumptionChanges || changeTypes.includes('assumptions')) {
      sections.push('Changes for Section 6.0 (Assumptions)');
      sections.push(narrative?.assumptionChanges ?? '');
      sections.push('');
    }

    // Section 3: Pricing
    sections.push('3. PRICING CHANGES');
    sections.push('');
    if (pricingChange.isZeroCost) {
      sections.push('☐ This PCR is a Zero Cost ($0) Change. The Pricing for the project is unchanged.');
    } else {
      sections.push('☐ This PCR changes the price for this project based on the following table.');
      sections.push('');
      if (pricingChange.originalTotal || pricingChange.newTotal) {
        sections.push(`Original Total: ${pricingChange.originalTotal ?? '—'}`);
        sections.push(`New Total: ${pricingChange.newTotal ?? '—'}`);
      }
      if (pricingChange.notes) {
        sections.push('');
        sections.push(pricingChange.notes);
      }
    }
    sections.push('');

    // Section 4: Acceptance
    sections.push(PCR_ACCEPTANCE_BLOCK(clientName));

    const fullText = sections.join('\n');

    // Return as a plain-text file download.
    // The user opens this in Word, which reads it correctly for XAIT submission.
    const safeProjectName = projectName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '');
    return new NextResponse(fullText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="PCR-${safeProjectName}-${new Date().toISOString().slice(0, 10)}.txt"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
