import { Article } from '@/types';

export interface PcrProcessStep {
  id: string;
  title: string;
  summary: string;
}

export interface PcrRoleDefinition {
  id: string;
  title: string;
  responsibilities: string[];
}

export interface PcrQualityGate {
  id: string;
  title: string;
  checks: string[];
}

export interface PcrToolResource {
  id: string;
  title: string;
  description: string;
  articleId?: string;
}

export interface PcrSupportItem {
  title: string;
  details: string[];
}

export const PCR_ARTICLE_IDS = {
  primary: 'pcr-process',
  create: 'pcr-create',
  spw: 'pcr-spw',
  validator: 'pcr-validator',
  rap: 'pcr-rap',
} as const;

export const pcrAudience = [
  'Solution Owners',
  'Architects',
  'Sales',
  'RAP Support',
  'Delivery Leadership',
];

export const pcrKeyPrinciples = [
  'The Solution Owner is the primary owner of PCR generation and execution for changes to existing scope.',
  'The Engagement Architect advises on technical feasibility, delivery impact, and estimate accuracy.',
  'Sales owns customer presentation, signature collection, and booking handoff.',
  'Presales is no longer part of the standard PCR path for scope changes within an existing engagement.',
  'The operating goal is a faster, clearer, delivery-led change process with visible ownership.',
];

export const pcrOverviewIntro =
  'The Solution Owner-driven PCR process is the delivery-led workflow for identifying, drafting, validating, approving, and booking changes on an active engagement.';

export const pcrOverviewBoundary =
  'Use this process for changes to existing scope. A new SOW or Solution Summary still follows a different path.';

export const pcrWhenToUse = [
  'A customer asks for work that changes the current scope, cost, or timeline.',
  'The delivery team identifies new work, dependencies, or effort that is outside the original SOW.',
  'Sales or the account team requests a contractual update tied to an active engagement.',
  'A contract extension, POD adjustment, or burn-rate change needs formal documentation and approval.',
];

export const pcrRecognitionCriteria = [
  'The change impacts scope, cost, timeline, or delivery approach.',
  'The work is not covered under the original SOW.',
  'Additional effort, funding, or timeline movement must be documented and approved.',
  'The request modifies an existing engagement rather than creating a new SOW or Solution Summary.',
];

export const pcrProcessSteps: PcrProcessStep[] = [
  {
    id: 'identify',
    title: 'Identify PCR need',
    summary: 'Recognize the trigger, confirm that the work is a change to existing scope, and frame the request through scope, cost, and time.',
  },
  {
    id: 'draft',
    title: 'Draft PCR and estimate',
    summary: 'The Solution Owner drafts the PCR, assumptions, risks, timeline, and estimate in SPW with Architect input.',
  },
  {
    id: 'refine',
    title: 'Refine with Architect and PCR Validator',
    summary: 'Validate technical accuracy, tighten the narrative, justify margin variance, and use the PCR Validator plus SMEs as needed.',
  },
  {
    id: 'rap',
    title: 'Submit through RAP Support Team',
    summary: 'The RAP Support Team performs readiness checks, submits to RAP, and coordinates questions while the Solution Owner responds quickly.',
  },
  {
    id: 'sales',
    title: 'Sales presents to customer',
    summary: 'Sales opens or updates the opportunity, uses the handoff package to present the PCR, and secures customer signatures.',
  },
  {
    id: 'booking',
    title: 'Signed PCR goes to Booking',
    summary: 'Sales sends the signed PCR to Booking so Ops and Finance can complete the downstream updates.',
  },
  {
    id: 'orders',
    title: 'Booking posts to My Orders',
    summary: 'The approved and signed PCR becomes visible in My Orders and is shared back with the account team for execution continuity.',
  },
];

export const pcrRoles: PcrRoleDefinition[] = [
  {
    id: 'solution-owner',
    title: 'Solution Owner',
    responsibilities: [
      'Identify the PCR trigger and confirm it is a change to existing scope.',
      'Draft the PCR, including scope change, assumptions, risks, impacts, dependencies, and timeline.',
      'Build the estimate in SPW and align it to delivery reality.',
      'Collaborate with the Architect, PCR Validator, and SMEs to refine the package.',
      'Respond to RAP questions and maintain momentum through approval.',
      'Prepare the Sales handoff kit with narrative summary, scope and impact bullets, and FAQs.',
    ],
  },
  {
    id: 'architect',
    title: 'Architect',
    responsibilities: [
      'Advise on technical feasibility and estimate accuracy.',
      'Validate delivery impacts, dependencies, and assumptions.',
      'Review technical language so the PCR stays consistent with the proposed solution path.',
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    responsibilities: [
      'Create or update the opportunity record in SFDC.',
      'Present the PCR narrative to the customer using the Solution Owner handoff materials.',
      'Secure customer signature and send the signed PCR to Booking.',
      'Coordinate the final commercial handoff back into the account flow.',
    ],
  },
  {
    id: 'rap-team',
    title: 'RAP Support Team',
    responsibilities: [
      'Run the readiness pre-check before RAP submission.',
      'Submit the PCR to RAP and monitor leadership questions.',
      'Keep the Solution Owner updated so clarifications are answered quickly.',
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership',
    responsibilities: [
      'Approve the PCR through RAP once the package is ready.',
      'Enforce Quality Gate expectations and escalate gaps that block approval.',
    ],
  },
  {
    id: 'ops-pc',
    title: 'Ops / PC / Booking',
    responsibilities: [
      'Receive the signed PCR from Sales.',
      'Post the approved change into My Orders.',
      'Coordinate downstream system and operational updates after booking.',
    ],
  },
];

export const pcrQualityGates: PcrQualityGate[] = [
  {
    id: 'completeness',
    title: 'Completeness check',
    checks: [
      'Full scope statement is present.',
      'Assumptions, risks, and dependencies are documented.',
      'Timeline impact is clearly described.',
    ],
  },
  {
    id: 'financial',
    title: 'Financial accuracy check',
    checks: [
      'Cost is calculated in SPW.',
      'Rates and formulas are validated.',
      'Margin alignment is confirmed, with justification if it varies from the SOW.',
    ],
  },
  {
    id: 'technical',
    title: 'Technical accuracy check',
    checks: [
      'Architect review is complete.',
      'Delivery impacts and estimate assumptions are technically sound.',
    ],
  },
  {
    id: 'language',
    title: 'Language and consistency check',
    checks: [
      'PCR Validator has been run.',
      'Terms align to the standard library and prior approved PCR patterns.',
      'The final narrative is clear enough for RAP and customer discussion.',
    ],
  },
];

export const pcrTools: PcrToolResource[] = [
  {
    id: 'pcr-template',
    title: 'PCR Template',
    description: 'Primary drafting template for documenting scope change, assumptions, risks, impacts, and customer-facing language.',
    articleId: PCR_ARTICLE_IDS.create,
  },
  {
    id: 'spw',
    title: 'SPW',
    description: 'Estimate workbook used to validate hours, effort distribution, rates, formulas, and margin position.',
    articleId: PCR_ARTICLE_IDS.spw,
  },
  {
    id: 'validator',
    title: 'PCR Validator',
    description: 'AI Studio-based clarity and structure check used before RAP submission.',
    articleId: PCR_ARTICLE_IDS.validator,
  },
  {
    id: 'route-66',
    title: 'Route 66 / reference library',
    description: 'Library for standard assumptions, prior examples, and reference wording.',
  },
  {
    id: 'margin-justification',
    title: 'Margin Justification',
    description: 'Required support when proposed margin varies from the original SOW position.',
  },
  {
    id: 'architect-review',
    title: 'Architect review inputs',
    description: 'Technical feasibility, delivery-impact validation, and estimate review used to tighten the PCR package.',
  },
  {
    id: 'sales-handoff',
    title: 'Sales handoff materials',
    description: 'PCR document, SPW summary, narrative summary, scope-impact bullets, and FAQs used by Sales for customer discussion.',
    articleId: PCR_ARTICLE_IDS.rap,
  },
];

export const pcrTransitionSupport: PcrSupportItem[] = [
  {
    title: 'Office hours',
    details: [
      'Thursday 9:30-10:00 AM EST',
      'Thursday 10:00-11:00 AM IST',
    ],
  },
  {
    title: 'Change champions',
    details: [
      'Rajeev Ramesh',
      'Zeenath Farina',
      'DJ Hall',
      'Mike Hehl',
    ],
  },
  {
    title: 'Process SME',
    details: ['Bryan Allison'],
  },
  {
    title: 'Enablement focus',
    details: [
      'PCR process overview',
      'Drafting a high-quality PCR',
      'SPW deep dive',
      'PCR Validator training',
      'RAP submission expectations',
      'Sales handoff best practices',
    ],
  },
];

export const pcrSuccessMetrics = [
  'PCR cycle time',
  'RAP approval rate',
  'Quality Gate pass rate',
  'Rework percentage',
  'SO satisfaction and workload balance',
  'Sales satisfaction',
  'Customer reaction to PCR clarity',
];

export const pcrJobAids = [
  {
    articleId: PCR_ARTICLE_IDS.create,
    title: 'How to Create a PCR',
    description: 'Step-by-step drafting guide for turning a change trigger into a complete PCR package.',
    bullets: [
      'Identify the trigger and confirm the request is a change to existing scope.',
      'Draft scope, assumptions, risks, and timeline impact.',
      'Build the estimate in SPW.',
      'Collaborate with the Architect for technical accuracy.',
      'Run PCR Validator and refine the narrative.',
      'Prepare the Sales handoff kit and margin justification if needed.',
    ],
    tags: ['PCR', 'Drafting', 'Quality Gate'],
    readTime: '4 min',
  },
  {
    articleId: PCR_ARTICLE_IDS.spw,
    title: 'How to Use SPW',
    description: 'Quick guide to the approved SPW flow for PCR estimates and margin validation.',
    bullets: [
      'Open the approved SPW version.',
      'Select the contract type and update rate cards.',
      'Enter roles, hours, and effort distribution.',
      'Validate formulas and margin output.',
      'Export the summary for PCR attachment.',
    ],
    tags: ['SPW', 'Estimate', 'Margin'],
    readTime: '3 min',
  },
  {
    articleId: PCR_ARTICLE_IDS.validator,
    title: 'PCR Validator How-To',
    description: 'Short job aid for using the PCR Validator in AI Studio before RAP submission.',
    bullets: [
      'Open the Validator in AI Studio.',
      'Paste the PCR text into the tool.',
      'Review clarity, scope, and structure suggestions.',
      'Apply recommended edits and rerun a final pass.',
    ],
    tags: ['PCR Validator', 'AI Studio', 'Quality Gate'],
    readTime: '3 min',
  },
  {
    articleId: PCR_ARTICLE_IDS.rap,
    title: 'How to Prepare for RAP',
    description: 'Readiness checklist for getting a PCR through RAP with fewer follow-up loops.',
    bullets: [
      'Confirm the Quality Gate is complete.',
      'Validate SPW, margin, dependencies, and Architect approval.',
      'Gather supporting attachments such as screenshots, logs, or diagrams.',
      'Submit through the RAP Support Team and respond quickly to review questions.',
    ],
    tags: ['RAP', 'Approval', 'Readiness'],
    readTime: '3 min',
  },
];

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function numberedSteps(items: PcrProcessStep[]) {
  return items.map((item, index) => `${index + 1}. **${item.title}**: ${item.summary}`).join('\n');
}

function buildPrimaryArticleContent() {
  return `# Solution Owner-Driven PCR Process

## Overview

The Solution Owner-driven PCR model shifts primary ownership of PCR generation and execution to the Solution Owner so change requests move faster and stay closer to delivery reality.

This operating model is designed for **changes to existing scope**. It does **not** replace the Presales path for a brand-new SOW or Solution Summary.

### Why this model exists

${bullets(pcrKeyPrinciples)}

### Audience

${bullets(pcrAudience)}

## When to Use This Process

### Typical triggers

${bullets(pcrWhenToUse)}

### Use the PCR path when

${bullets(pcrRecognitionCriteria)}

## Process at a Glance

${numberedSteps(pcrProcessSteps)}

## Roles and Responsibilities

${pcrRoles.map((role) => `### ${role.title}\n\n${bullets(role.responsibilities)}`).join('\n\n')}

## Quality Gate

Every PCR should pass these checks before RAP:

${pcrQualityGates.map((gate) => `### ${gate.title}\n\n${bullets(gate.checks)}`).join('\n\n')}

## Tools, Templates, and Job Aids

${pcrTools.map((tool) => `- **${tool.title}**: ${tool.description}`).join('\n')}

## Related Job Aids

${pcrJobAids.map((jobAid) => `- **${jobAid.title}**: ${jobAid.description}`).join('\n')}

Open the related articles below for the detailed step-by-step job aids.

## Transition Support and Enablement

${pcrTransitionSupport.map((item) => `### ${item.title}\n\n${bullets(item.details)}`).join('\n\n')}

## Success Metrics

${bullets(pcrSuccessMetrics)}
`;
}

function buildJobAidArticleContent(jobAid: (typeof pcrJobAids)[number], intro: string, closeout: string) {
  return `# ${jobAid.title}

## Overview

${intro}

## Core Steps

${bullets(jobAid.bullets)}

## Keep in Mind

${closeout}

## Related Source

- Review **Solution Owner-Driven PCR Process** for the full end-to-end flow, role boundaries, Quality Gate, and support model.
`;
}

export const pcrKnowledgeArticles: Article[] = [
  {
    id: PCR_ARTICLE_IDS.primary,
    title: 'Solution Owner-Driven PCR Process',
    description: 'End-to-end guide for identifying, drafting, validating, approving, and booking PCRs under the Solution Owner-led operating model.',
    category: 'process',
    readTime: '9 min',
    author: 'Solution Ownership Enablement',
    rating: 5,
    featured: true,
    tags: ['PCR', 'Change Request', 'Solution Owner', 'RAP', 'SPW', 'Sales Handoff', 'Governance'],
    relatedArticleIds: [
      PCR_ARTICLE_IDS.create,
      PCR_ARTICLE_IDS.spw,
      PCR_ARTICLE_IDS.validator,
      PCR_ARTICLE_IDS.rap,
    ],
    content: buildPrimaryArticleContent(),
  },
  {
    id: PCR_ARTICLE_IDS.create,
    title: 'How to Create a PCR',
    description: 'Drafting checklist for Solution Owners building PCR content, estimate inputs, and Sales handoff materials.',
    category: 'process',
    readTime: '4 min',
    author: 'Solution Ownership Enablement',
    rating: 4.9,
    tags: ['PCR', 'Drafting', 'Solution Owner', 'Quality Gate'],
    listVisibility: 'supporting',
    relatedArticleIds: [PCR_ARTICLE_IDS.primary, PCR_ARTICLE_IDS.spw, PCR_ARTICLE_IDS.validator],
    content: buildJobAidArticleContent(
      pcrJobAids[0],
      'Use this guide when you already know a PCR is needed and need to build a clean first draft that will survive quality review and customer discussion.',
      'A strong first draft should already reflect scope change, assumptions, risks, timeline impact, dependencies, and any margin discussion before it reaches RAP.'
    ),
  },
  {
    id: PCR_ARTICLE_IDS.spw,
    title: 'How to Use SPW',
    description: 'Quick guide for building PCR estimates, validating margin, and exporting the SPW summary used in the package.',
    category: 'process',
    readTime: '3 min',
    author: 'Solution Ownership Enablement',
    rating: 4.8,
    tags: ['SPW', 'PCR', 'Estimate', 'Margin'],
    listVisibility: 'supporting',
    relatedArticleIds: [PCR_ARTICLE_IDS.primary, PCR_ARTICLE_IDS.create, PCR_ARTICLE_IDS.rap],
    content: buildJobAidArticleContent(
      pcrJobAids[1],
      'SPW is the approved estimate tool in the SO-driven PCR model. This job aid covers the minimum operating sequence for building and validating the estimate before RAP.',
      'The output should be accurate enough to support margin review, RAP readiness, and the customer-facing PCR narrative.'
    ),
  },
  {
    id: PCR_ARTICLE_IDS.validator,
    title: 'PCR Validator How-To',
    description: 'Short how-to for using the PCR Validator in AI Studio to improve clarity, consistency, and submission readiness.',
    category: 'process',
    readTime: '3 min',
    author: 'Solution Ownership Enablement',
    rating: 4.8,
    tags: ['PCR Validator', 'AI Studio', 'PCR', 'Quality Gate'],
    listVisibility: 'supporting',
    relatedArticleIds: [PCR_ARTICLE_IDS.primary, PCR_ARTICLE_IDS.create],
    content: buildJobAidArticleContent(
      pcrJobAids[2],
      'Use the PCR Validator after the draft and estimate are in place. The goal is to tighten clarity, structure, and consistency before the PCR enters RAP.',
      'The Validator supports the language and consistency gate. It does not replace Architect review, SPW validation, or Solution Owner accountability.'
    ),
  },
  {
    id: PCR_ARTICLE_IDS.rap,
    title: 'How to Prepare for RAP',
    description: 'Readiness checklist for getting a PCR through RAP with complete attachments, validated numbers, and fewer review loops.',
    category: 'process',
    readTime: '3 min',
    author: 'Solution Ownership Enablement',
    rating: 4.9,
    tags: ['RAP', 'PCR', 'Approval', 'Readiness'],
    listVisibility: 'supporting',
    relatedArticleIds: [PCR_ARTICLE_IDS.primary, PCR_ARTICLE_IDS.spw, PCR_ARTICLE_IDS.validator],
    content: buildJobAidArticleContent(
      pcrJobAids[3],
      'Use this checklist when the PCR draft is nearly complete and you need to confirm the package is ready for RAP Support Team submission.',
      'Good RAP preparation reduces avoidable follow-up loops. The Solution Owner should be ready to answer leadership questions quickly once the packet is submitted.'
    ),
  },
];
