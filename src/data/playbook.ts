export interface TableStake {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface PlaybookPhase {
  id: string;
  order: number;
  title: string;
  tagline: string;
  summary: string;
  checkpointIds: string[];
}

export interface PlaybookCheckpoint {
  id: string;
  phaseId: PlaybookPhase['id'];
  title: string;
  summary: string;
  desiredOutcomes: string[];
  requiredArtifacts?: string[];
  supportingArtifacts?: string[];
  reinforcedTableStakeIds: TableStake['id'][];
}

export const tableStakes: TableStake[] = [
  {
    id: 'engagement-kickoff-alignment',
    title: 'Engagement Kickoff & Alignment',
    summary: 'Internal and client kickoff moments establish shared scope, delivery approach, risks, and financial context before execution accelerates.',
    bullets: [
      'Pre-IKO alignment happens between the Solution Owner, Architect, and Engagement Executive.',
      'Internal Kickoff and Client Kickoff are completed with clear owners and next steps.',
      'Internal stakeholders are aligned on scope, delivery approach, risks, and financials.',
    ],
  },
  {
    id: 'communication-cadence',
    title: 'Communication Cadence',
    summary: 'A healthy engagement runs on a predictable communication rhythm across delivery teams, leadership, and client stakeholders.',
    bullets: [
      'Weekly status reporting is maintained.',
      'Internal leadership syncs stay active and useful.',
      'Steering Committee cadence is established and sustained.',
    ],
  },
  {
    id: 'discovery-scope-control',
    title: 'Discovery & Scope Control',
    summary: 'Discovery decisions, MVP framing, and backlog readiness are all tied back to the statement of work and client expectations.',
    bullets: [
      'Discovery checkpoints happen early enough to influence the delivery path.',
      'Scope is validated against the SOW and client expectations.',
      'Deviations are surfaced and addressed before execution continues.',
    ],
  },
  {
    id: 'engagement-artifacts-documentation',
    title: 'Engagement Artifacts & Documentation',
    summary: 'Critical engagement knowledge belongs in shared working spaces so delivery stays visible, reusable, and leadership-accessible.',
    bullets: [
      'Documents live in the engagement Teams folder or shared workspace.',
      'No critical artifacts are stranded in personal storage.',
      'Leadership can access key engagement artifacts without permission issues.',
    ],
  },
  {
    id: 'financial-delivery-governance',
    title: 'Financial & Delivery Governance',
    summary: 'Every Solution Owner should be able to explain delivery health and commercial health at any time using current governance artifacts.',
    bullets: [
      'Financial tracking is maintained and reviewed regularly.',
      'RAID is created early and kept current.',
      'Delivery health and financial position remain explainable at any point in the engagement.',
    ],
  },
  {
    id: 'engagement-closeout',
    title: 'Engagement Closeout',
    summary: 'Closeout is planned, acknowledged, and archived deliberately so transition and reuse happen cleanly rather than by accident.',
    bullets: [
      'Engagement closeout is completed as a formal activity.',
      'Acknowledgment is obtained from the customer sponsor.',
      'Closeout artifacts are archived in the shared engagement workspace.',
    ],
  },
  {
    id: 'leadership-expectation',
    title: 'Leadership Expectation',
    summary: 'These practices are non-negotiable operating expectations, not optional extras to apply only when convenient.',
    bullets: [
      'Table Stakes are treated as baseline expectations across every phase.',
      'Leaders reinforce the standard through visible operating discipline.',
      'Continuous improvement is part of delivery excellence, not separate process overhead.',
    ],
  },
];

export const playbookPhases: PlaybookPhase[] = [
  {
    id: 'initiate-engagement',
    order: 1,
    title: 'Initiate Engagement',
    tagline: 'Establish foundation through internal alignment and stakeholder identification.',
    summary:
      'This phase sets the operating baseline before delivery momentum builds. The Solution Owner creates internal clarity, maps the client ecosystem, and removes access-related friction so the engagement can start cleanly.',
    checkpointIds: ['cp1', 'cp2', 'cp3'],
  },
  {
    id: 'vision-alignment',
    order: 2,
    title: 'Vision Alignment',
    tagline: 'Achieve shared understanding of goals, scope, and success criteria.',
    summary:
      'Vision Alignment turns early kickoff energy into an agreed delivery direction. The focus is on mutual understanding of what the engagement is trying to achieve, what the MVP really is, and which risks must be managed immediately.',
    checkpointIds: ['cp4', 'cp5', 'cp6'],
  },
  {
    id: 'mobilize-delivery',
    order: 3,
    title: 'Mobilize Delivery',
    tagline: 'Prepare teams, tools, and processes for effective execution.',
    summary:
      'Mobilize Delivery converts alignment into a working engine. The Solution Owner helps the team stand up cadence, backlog readiness, tooling, and working norms so Sprint 1 begins with confidence instead of avoidable scramble.',
    checkpointIds: ['cp7', 'cp8', 'cp9', 'cp10', 'cp11'],
  },
  {
    id: 'drive-execution',
    order: 4,
    title: 'Drive Execution',
    tagline: 'Deliver value through consistent sprint cadence and stakeholder engagement.',
    summary:
      'Drive Execution is where the engagement proves it can deliver predictably. The Solution Owner connects delivery signals, stakeholder feedback, and governance artifacts so progress remains visible and course corrections happen early.',
    checkpointIds: ['cp12', 'cp13', 'cp14'],
  },
  {
    id: 'govern-and-evolve',
    order: 5,
    title: 'Govern and Evolve',
    tagline: 'Ensure sustainability through governance and continuous improvement.',
    summary:
      'Govern and Evolve keeps the engagement healthy as it matures, scales, or closes. The emphasis is on transition readiness, institutional learning, practical governance, and a continuous improvement rhythm that survives beyond the initial launch.',
    checkpointIds: ['cp15', 'cp16', 'cp17', 'cp18'],
  },
];

export const playbookCheckpoints: PlaybookCheckpoint[] = [
  {
    id: 'cp1',
    phaseId: 'initiate-engagement',
    title: 'Internal Kickoff Completed',
    summary:
      'Align the Presidio team on the engagement shape before the client-facing motion starts. This checkpoint turns the SOW into a shared operating understanding across delivery leadership and supporting SMEs.',
    desiredOutcomes: [
      'Internal roles, responsibilities, escalation paths, and delivery expectations are explicit.',
      'The team shares a working understanding of scope, client context, risks, assumptions, and financial posture.',
      'Immediate next steps are clear enough to support client kickoff and early delivery planning.',
    ],
    requiredArtifacts: ['Internal Kickoff Deck', 'Weekly Status Report'],
    supportingArtifacts: [
      'Internal Contact Matrix',
      'Preliminary RAID Log',
      'Access Request Tracker',
      'Engagement One-Pager',
    ],
    reinforcedTableStakeIds: ['engagement-kickoff-alignment'],
  },
  {
    id: 'cp2',
    phaseId: 'initiate-engagement',
    title: 'Stakeholders Identified',
    summary:
      'Map the stakeholder ecosystem early so communication, decision-making, and escalation paths are intentional rather than reactive once delivery pressure starts.',
    desiredOutcomes: [
      'Executive sponsors, product owners, SMEs, and technical contacts are identified with role clarity.',
      'Influence level, decision authority, and preferred engagement style are understood for key stakeholders.',
      'A stakeholder engagement plan exists for Steering Committee touchpoints, demos, and focused working sessions.',
    ],
    requiredArtifacts: [
      'Stakeholder Register',
      'RACI Matrix',
      'Communication Plan or Stakeholder Engagement Plan',
    ],
    supportingArtifacts: ['Client Org Chart', 'SteerCo Meeting Series'],
    reinforcedTableStakeIds: ['communication-cadence'],
  },
  {
    id: 'cp3',
    phaseId: 'initiate-engagement',
    title: 'Access Requests Submitted',
    summary:
      'Prevent Sprint 0 and execution delays by identifying every system, environment, and tool the team needs, then submitting requests with enough lead time to stay ahead of delivery milestones.',
    desiredOutcomes: [
      'Required systems, tools, environments, and credentials are inventoried by role.',
      'Access requests are submitted and tracked before they become schedule blockers.',
      'Escalation paths and timing expectations are clear for any access dependency that threatens delivery readiness.',
    ],
    requiredArtifacts: ['Access Request Tracker'],
    supportingArtifacts: [
      'Submission Receipts or Confirmation Emails',
      'Escalation Path Documentation',
      'Internal Tool Access Checklist',
    ],
    reinforcedTableStakeIds: ['engagement-artifacts-documentation'],
  },
  {
    id: 'cp4',
    phaseId: 'vision-alignment',
    title: 'Client Kickoff Executed',
    summary:
      'Use the client kickoff to convert planning into a shared commitment. The meeting should align scope, approach, governance, and immediate next steps in a way that builds confidence on both sides.',
    desiredOutcomes: [
      'Client and Presidio teams are aligned on objectives, scope, timeline, and success criteria.',
      'Governance cadence, working sessions, and ways of working are communicated and accepted.',
      'Next steps into discovery, Sprint 0, or planning are confirmed with clear ownership.',
    ],
    requiredArtifacts: ['Client Kickoff Deck', 'Communication & Governance Plan', 'Meeting Cadence Schedule'],
    supportingArtifacts: ['Stakeholder Alignment Summary', 'RAID Log', 'Engagement One-Pager'],
    reinforcedTableStakeIds: ['engagement-kickoff-alignment'],
  },
  {
    id: 'cp5',
    phaseId: 'vision-alignment',
    title: 'MVP Defined',
    summary:
      'Define the MVP in terms the client and delivery team can both use. The goal is not just a list of features, but a clear scope frame tied to business outcomes, feasibility, and sequencing.',
    desiredOutcomes: [
      'The MVP is aligned to business outcomes, SOW intent, and practical delivery constraints.',
      'Capabilities are decomposed into features or epics that can guide backlog readiness.',
      'Initial prioritization exists so the team can make informed sequencing and planning decisions.',
    ],
    requiredArtifacts: ['MVP Definition Document or Slide', 'Epic-Level Backlog or Feature Map'],
    supportingArtifacts: [
      'Initial Story Map',
      'MVP-to-Backlog Mapping Table',
      'Updated RAID Log',
      'Backlog Readiness Checklist',
    ],
    reinforcedTableStakeIds: ['discovery-scope-control'],
  },
  {
    id: 'cp6',
    phaseId: 'vision-alignment',
    title: 'RAID Log Created',
    summary:
      'Stand up the RAID log as a living governance artifact early. It should give the team and leadership a shared, current view of risks, assumptions, issues, and dependencies that can influence delivery.',
    desiredOutcomes: [
      'Risks, assumptions, issues, and dependencies are centralized in an accessible format.',
      'Each RAID item has ownership, mitigation thinking, and a review cadence.',
      'Pre-sales assumptions and emerging delivery concerns are tied back to scope, backlog, or readiness decisions.',
    ],
    requiredArtifacts: ['RAID Log'],
    supportingArtifacts: [
      'Risk Mitigation Plan',
      'RAID Review Cadence',
      'Linkage to Backlog Items or Project Plan',
      'Initial Risk Summary',
    ],
    reinforcedTableStakeIds: ['financial-delivery-governance'],
  },
  {
    id: 'cp7',
    phaseId: 'mobilize-delivery',
    title: 'Sprint Zero Planning',
    summary:
      'Use Sprint 0 deliberately to prepare the foundational pieces required for effective Sprint 1 execution. This is where backlog, tooling, cadence, and team expectations converge into a practical readiness plan.',
    desiredOutcomes: [
      'Sprint 0 goals, setup tasks, and expected deliverables are documented and understood.',
      'Solution Owner, Architect, and client product leadership are aligned on what readiness looks like by Sprint 0 completion.',
      'The team understands roles, responsibilities, and working expectations during the readiness window.',
    ],
    requiredArtifacts: ['Sprint 0 Plan or Checklist', 'Sprint 0 Backlog', 'Delivery Calendar'],
    supportingArtifacts: ['Sprint 0 Goals Document', 'Working Agreement Draft'],
    reinforcedTableStakeIds: ['discovery-scope-control'],
  },
  {
    id: 'cp8',
    phaseId: 'mobilize-delivery',
    title: 'Ceremonies Scheduled',
    summary:
      'Establish the full delivery rhythm before execution begins. Ceremonies should feel structured and sustainable, with clear owners, agendas, and stakeholder expectations.',
    desiredOutcomes: [
      'Recurring Agile ceremonies and Steering Committee cadence are scheduled and accepted by participants.',
      'Meeting ownership, facilitation expectations, and logistics are explicit.',
      'The engagement has a predictable rhythm for planning, demos, retrospectives, and escalation.',
    ],
    requiredArtifacts: ['Ceremonies Calendar', 'SteerCo Calendar Invites', 'Meeting Owner Matrix'],
    supportingArtifacts: [
      'Meeting Cadence Summary Sheet',
      'Sample Agendas',
      'Confluence or SharePoint Folders for Notes',
    ],
    reinforcedTableStakeIds: ['communication-cadence'],
  },
  {
    id: 'cp9',
    phaseId: 'mobilize-delivery',
    title: 'Backlog Groomed and Ready',
    summary:
      'Create a backlog that is understandable, prioritized, and ready for real sprint planning. This checkpoint should give the team confidence that they can begin delivery without ambiguity on the next tranche of work.',
    desiredOutcomes: [
      'Epics, features, and stories are broken down with usable acceptance criteria and initial sizing.',
      'Dependencies, blockers, and sequencing assumptions are visible and discussed.',
      'Product and delivery leads share confidence in the initial scope and backlog readiness.',
    ],
    requiredArtifacts: ['Groomed Product Backlog', 'Epic-to-Story Mapping', 'Backlog Readiness Checklist'],
    supportingArtifacts: [
      'Acceptance Criteria Templates',
      'Dependency Tracker',
      'Notes from Backlog Refinement Sessions',
      'Definition of Ready Document',
      'Definition of Done Document',
    ],
    reinforcedTableStakeIds: ['discovery-scope-control'],
  },
  {
    id: 'cp10',
    phaseId: 'mobilize-delivery',
    title: 'Tooling and Environment Confirmed',
    summary:
      'Verify the delivery toolchain end to end so the team knows where work happens, where documentation lives, and how code and changes move through environments.',
    desiredOutcomes: [
      'Core tools, repositories, documentation spaces, and environments are accessible and functioning.',
      'Licensing, provisioning gaps, and environment dependencies are tracked to closure.',
      'The team has explicit guidance on where to work, document, commit, review, and deploy.',
    ],
    requiredArtifacts: ['Tooling & Access Matrix', 'Environment Readiness Checklist'],
    supportingArtifacts: [
      'Tool Usage Guide',
      'Dev/Test/Stage Environment URL Index',
      'Access Confirmation Log',
      'Risk Log Entries for Blocked Tools',
    ],
    reinforcedTableStakeIds: ['engagement-artifacts-documentation'],
  },
  {
    id: 'cp11',
    phaseId: 'mobilize-delivery',
    title: 'Working Agreement Finalized',
    summary:
      'Codify how the team will collaborate so the engagement is not dependent on unspoken assumptions. The working agreement should be practical enough to use during delivery, not just a kickoff artifact.',
    desiredOutcomes: [
      'Team norms for communication, decision-making, quality, and escalation are documented and shared.',
      'Roles, availability expectations, time zone norms, and stakeholder engagement expectations are explicit.',
      'The team acknowledges the agreement and revisits it as part of continuous improvement.',
    ],
    requiredArtifacts: ['Finalized Working Agreement Document', 'Roles & Responsibilities Matrix'],
    supportingArtifacts: [
      'Team Charter',
      'Confluence Link or SharePoint Location',
      'Backlog Reference',
      'Acknowledgment or Sign-Off',
    ],
    reinforcedTableStakeIds: ['communication-cadence', 'engagement-artifacts-documentation'],
  },
  {
    id: 'cp12',
    phaseId: 'drive-execution',
    title: 'First Increment Delivered',
    summary:
      'The first delivered increment proves the team can execute within the agreed cadence. It is the first real evidence that planning, tooling, backlog readiness, and collaboration norms are working together.',
    desiredOutcomes: [
      'The team completes a meaningful first increment aligned to MVP goals.',
      'Stakeholder feedback is gathered through a demo or sprint review and reflected in the backlog.',
      'Initial velocity and execution blockers are visible enough to guide the next sprint decisions.',
    ],
    requiredArtifacts: ['Completed Sprint Board', 'Sprint Review Summary', 'Initial Velocity Metrics'],
    supportingArtifacts: [
      'Client Feedback Log',
      'Sprint Retrospective Notes',
      'Updated Backlog',
      'QA/Test Results',
    ],
    reinforcedTableStakeIds: ['financial-delivery-governance'],
  },
  {
    id: 'cp13',
    phaseId: 'drive-execution',
    title: 'Retros and Demos Executed',
    summary:
      'Make demos and retrospectives reliable operating habits rather than optional ceremonies. They are the feedback loops that sustain stakeholder trust and team learning through the engagement.',
    desiredOutcomes: [
      'Sprint reviews and retrospectives happen consistently with clear follow-through.',
      'Feedback from stakeholders and the delivery team is documented, prioritized, and actioned.',
      'The team can show a visible continuous improvement rhythm, not just isolated discussion.',
    ],
    requiredArtifacts: ['Sprint Review Recordings or Slides', 'Retrospective Notes', 'Demo Feedback Tracker'],
    supportingArtifacts: [
      'Continuous Improvement Log',
      'Facilitator Schedule',
      'Sprint Summary Reports',
    ],
    reinforcedTableStakeIds: ['communication-cadence'],
  },
  {
    id: 'cp14',
    phaseId: 'drive-execution',
    title: 'Velocity Metrics Baseline',
    summary:
      'Move beyond anecdotal delivery conversations by establishing a usable baseline of metrics. The goal is practical visibility for forecasting, health conversations, and improvement decisions.',
    desiredOutcomes: [
      'Velocity and related delivery metrics are captured and trended in a way stakeholders can understand.',
      'Leaders and delivery teams have shared visibility into progress, blockers, and delivery health.',
      'Metrics are contextualized with qualitative explanation so they inform decisions instead of misleading them.',
    ],
    requiredArtifacts: ['Velocity Report', 'Sprint Metrics Dashboard', 'Delivery Health Summary'],
    supportingArtifacts: ['Burndown/Burnup Charts', 'Forecasting Sheet', 'Real-Time Metrics Dashboard'],
    reinforcedTableStakeIds: ['financial-delivery-governance'],
  },
  {
    id: 'cp15',
    phaseId: 'govern-and-evolve',
    title: 'Transition Plan Completed',
    summary:
      'Plan transition and handoff intentionally so the engagement can scale or close without losing continuity. This checkpoint is about leaving the client and internal teams with clarity, not a cliff edge.',
    desiredOutcomes: [
      'A documented transition or scale plan defines continuity of ownership, knowledge, and backlog context.',
      'Post-engagement roles, responsibilities, and knowledge transfer activities are clearly communicated.',
      'Client leaders express confidence in the continuity and health of the program after transition.',
    ],
    requiredArtifacts: ['Transition or Scale Plan Document', 'Knowledge Transfer Schedule', 'Closure Checklist'],
    supportingArtifacts: [
      'Updated RACI with Post-Engagement Roles',
      'Backlog State Snapshot',
      'Final Metrics Summary',
      'Future Roadmap Recommendations',
    ],
    reinforcedTableStakeIds: ['engagement-closeout'],
  },
  {
    id: 'cp16',
    phaseId: 'govern-and-evolve',
    title: 'Lessons Learned Captured',
    summary:
      'Close the loop on the engagement by capturing practical lessons that can improve future work. The emphasis is on structured reflection that leads to reuse, not just retrospective sentiment.',
    desiredOutcomes: [
      'Lessons are documented across planning, communication, technical delivery, and team dynamics.',
      'Client and delivery team feedback is incorporated into a balanced closeout view.',
      'Useful patterns are shared into internal playbooks or knowledge assets for reuse.',
    ],
    requiredArtifacts: ['Lessons Learned Document', 'Client Feedback Summary', 'Improvement Opportunities Tracker'],
    supportingArtifacts: ['Internal Retrospective Notes', 'Leadership Debrief Presentation', 'Recognition Notes'],
    reinforcedTableStakeIds: ['engagement-closeout'],
  },
  {
    id: 'cp17',
    phaseId: 'govern-and-evolve',
    title: 'Governance Framework Finalized',
    summary:
      'Formalize a governance model that creates oversight without unnecessary bureaucracy. The framework should clarify decision rights, escalation paths, reporting expectations, and change control.',
    desiredOutcomes: [
      'A scalable governance model is agreed with client and internal stakeholders.',
      'Decision-making levels, reporting expectations, escalation paths, and change control are documented.',
      'Governance artifacts help the team act faster with clarity rather than adding reporting tax.',
    ],
    requiredArtifacts: ['Governance Framework Document', 'RACI Matrix', 'Status Reporting Templates'],
    supportingArtifacts: [
      'Escalation Path Diagram',
      'Change Control Process',
      'Governance Artifact Repository',
    ],
    reinforcedTableStakeIds: ['communication-cadence', 'financial-delivery-governance'],
  },
  {
    id: 'cp18',
    phaseId: 'govern-and-evolve',
    title: 'Continuous Improvement Plan',
    summary:
      'Create a practical improvement system that survives beyond the initial launch. This checkpoint turns lessons and performance signals into owned, reviewable improvement work.',
    desiredOutcomes: [
      'Improvement opportunities are identified, prioritized, and assigned with clear ownership.',
      'A repeatable review mechanism exists for measuring outcomes and refreshing the plan.',
      'Continuous improvement is treated as part of the operating standard, not as optional extra process.',
    ],
    requiredArtifacts: [
      'Continuous Improvement Plan Document',
      'Improvement Backlog',
      'Periodic Review Schedule',
    ],
    supportingArtifacts: ['Retrospective Action Items', 'Ownership Matrix', 'KPI Dashboard'],
    reinforcedTableStakeIds: ['leadership-expectation'],
  },
];

export const playbookCheckpointCount = playbookCheckpoints.length;

const PLAYBOOK_PHASE_MAP = new Map(playbookPhases.map((phase) => [phase.id, phase]));
const PLAYBOOK_CHECKPOINTS_BY_PHASE = new Map<string, PlaybookCheckpoint[]>(
  playbookPhases.map((phase) => [
    phase.id,
    phase.checkpointIds
      .map((checkpointId) => playbookCheckpoints.find((checkpoint) => checkpoint.id === checkpointId))
      .filter((checkpoint): checkpoint is PlaybookCheckpoint => Boolean(checkpoint)),
  ])
);
const TABLE_STAKE_MAP = new Map(tableStakes.map((item) => [item.id, item]));

export function getPlaybookPhase(phaseId: string) {
  return PLAYBOOK_PHASE_MAP.get(phaseId);
}

export function getPlaybookCheckpointsForPhase(phaseId: string) {
  return PLAYBOOK_CHECKPOINTS_BY_PHASE.get(phaseId) ?? [];
}

export function getTableStake(tableStakeId: string) {
  return TABLE_STAKE_MAP.get(tableStakeId);
}

export function getPlaybookPhaseHref(phaseId: string) {
  return `/app/playbook/${phaseId}`;
}
