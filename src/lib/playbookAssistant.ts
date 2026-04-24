import {
  PlaybookCheckpoint,
  PlaybookPhase,
  TableStake,
  playbookCheckpoints,
  playbookPhases,
  tableStakes,
} from '@/data/playbook';
import { AssistantSource } from '@/types';
import { getPlaybookSourcesForQuestion, getRelatedSourcesForQuestion } from '@/lib/assistantSources';

export interface PlaybookAssistantAnswer {
  response: string;
  suggestedFollowUps: string[];
  relatedSources: AssistantSource[];
}

const phaseAliases: Record<PlaybookPhase['id'], string[]> = {
  'initiate-engagement': ['initiate engagement', 'initiate', 'engagement initiation'],
  'vision-alignment': ['vision alignment', 'vision', 'alignment'],
  'mobilize-delivery': ['mobilize delivery', 'mobilize', 'delivery readiness', 'before sprint 1'],
  'drive-execution': ['drive execution', 'execution', 'delivery execution'],
  'govern-and-evolve': ['govern and evolve', 'govern', 'evolve', 'governance and evolution'],
};

const checkpointAliases: Record<PlaybookCheckpoint['id'], string[]> = {
  cp1: ['internal kickoff completed', 'internal kickoff', 'iko'],
  cp2: ['stakeholders identified', 'stakeholders', 'stakeholder identification'],
  cp3: ['access requests submitted', 'access requests', 'access requested', 'access'],
  cp4: ['client kickoff executed', 'client kickoff', 'cko'],
  cp5: ['mvp defined', 'mvp'],
  cp6: ['raid log created', 'raid log', 'raid'],
  cp7: ['sprint zero planning', 'sprint 0 planning', 'sprint zero', 'sprint 0', 'before sprint 1'],
  cp8: ['ceremonies scheduled', 'ceremonies', 'agile ceremonies'],
  cp9: ['backlog groomed and ready', 'backlog ready', 'backlog groomed', 'backlog readiness'],
  cp10: ['tooling and environment confirmed', 'tooling confirmed', 'environment confirmed', 'tooling and environment'],
  cp11: ['working agreement finalized', 'working agreement'],
  cp12: ['first increment delivered', 'first increment'],
  cp13: ['retros and demos executed', 'retros and demos', 'retros', 'demos'],
  cp14: ['velocity metrics baseline', 'metrics baseline', 'velocity baseline'],
  cp15: ['transition plan completed', 'transition plan'],
  cp16: ['lessons learned captured', 'lessons learned'],
  cp17: ['governance framework finalized', 'governance framework'],
  cp18: ['continuous improvement plan', 'ci plan', 'improvement plan'],
};

const tableStakeAliases: Record<TableStake['id'], string[]> = {
  'engagement-kickoff-alignment': ['engagement kickoff', 'kickoff and alignment', 'kickoff alignment'],
  'communication-cadence': ['communication cadence', 'cadence', 'communication rhythm'],
  'discovery-scope-control': ['discovery and scope control', 'scope control', 'discovery'],
  'engagement-artifacts-documentation': ['engagement artifacts', 'documentation', 'artifacts and documentation'],
  'financial-delivery-governance': ['financial and delivery governance', 'financial governance', 'delivery governance'],
  'engagement-closeout': ['engagement closeout', 'closeout'],
  'leadership-expectation': ['leadership expectation', 'leadership expectations'],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function findPhase(message: string) {
  const normalized = normalize(message);

  for (const phase of playbookPhases) {
    const aliases = [phase.title, phase.id.replace(/-/g, ' '), ...(phaseAliases[phase.id] ?? [])];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return phase;
    }
  }

  return null;
}

function findCheckpoint(message: string) {
  const normalized = normalize(message);

  for (const checkpoint of playbookCheckpoints) {
    const aliases = [checkpoint.title, ...(checkpointAliases[checkpoint.id] ?? [])];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return checkpoint;
    }
  }

  return null;
}

function findTableStake(message: string) {
  const normalized = normalize(message);

  for (const tableStake of tableStakes) {
    const aliases = [tableStake.title, ...(tableStakeAliases[tableStake.id] ?? [])];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return tableStake;
    }
  }

  return null;
}

function getPhaseById(phaseId: string) {
  return playbookPhases.find((phase) => phase.id === phaseId) ?? null;
}

function getCheckpointsForPhase(phaseId: string) {
  return playbookCheckpoints.filter((checkpoint) => checkpoint.phaseId === phaseId);
}

function buildPhasesOverview(): PlaybookAssistantAnswer {
  return {
    response: `The Solution Owner framework has five phases:\n${formatList(
      playbookPhases.map((phase) => `${phase.order}. ${phase.title} - ${phase.tagline}`)
    )}`,
    suggestedFollowUps: [
      'What happens in Initiate Engagement?',
      'What checkpoints are in Mobilize Delivery?',
      'What are the non-negotiable Table Stakes?',
    ],
    relatedSources: getPlaybookSourcesForQuestion('solution owner framework five phases'),
  };
}

function buildTableStakesOverview(): PlaybookAssistantAnswer {
  return {
    response: `The 7 SO Table Stakes are:\n${formatList(
      tableStakes.map((stake) => stake.title)
    )}`,
    suggestedFollowUps: [
      'Which Table Stakes does RAID Log Created support?',
      'What does Leadership Expectation mean?',
      'What checkpoints reinforce Engagement Closeout?',
    ],
    relatedSources: getPlaybookSourcesForQuestion('so table stakes'),
  };
}

function buildTableStakeDetail(tableStake: TableStake): PlaybookAssistantAnswer {
  return {
    response: `${tableStake.title} is a non-negotiable baseline expectation.\n\n${tableStake.summary}\n\nKey expectations:\n${formatList(
      tableStake.bullets
    )}`,
    suggestedFollowUps: [
      'What are the non-negotiable Table Stakes?',
      'Which checkpoints reinforce this Table Stake?',
      'What happens in Govern and Evolve?',
    ],
    relatedSources: getPlaybookSourcesForQuestion(tableStake.title),
  };
}

function buildPhaseDetail(phase: PlaybookPhase): PlaybookAssistantAnswer {
  const checkpoints = getCheckpointsForPhase(phase.id);

  return {
    response: `${phase.title} focuses on ${phase.summary}\n\nCheckpoints in this phase:\n${formatList(
      checkpoints.map((checkpoint) => checkpoint.title)
    )}\n\nIf you are starting here, begin with "${checkpoints[0]?.title}" and use the rest of the checkpoints to build readiness through the phase.`,
    suggestedFollowUps: [
      `What checkpoints are in ${phase.title}?`,
      `What artifacts are required for ${checkpoints[0]?.title}?`,
      'What are the non-negotiable Table Stakes?',
    ],
    relatedSources: getPlaybookSourcesForQuestion(phase.title),
  };
}

function buildPhaseCheckpointList(phase: PlaybookPhase): PlaybookAssistantAnswer {
  const checkpoints = getCheckpointsForPhase(phase.id);

  return {
    response: `${phase.title} includes ${checkpoints.length} checkpoints:\n${formatList(
      checkpoints.map((checkpoint) => checkpoint.title)
    )}`,
    suggestedFollowUps: [
      `What happens in ${phase.title}?`,
      `What artifacts are required for ${checkpoints[0]?.title}?`,
      `Which Table Stakes does ${checkpoints[0]?.title} support?`,
    ],
    relatedSources: getPlaybookSourcesForQuestion(phase.title),
  };
}

function buildCheckpointOutcomes(checkpoint: PlaybookCheckpoint): PlaybookAssistantAnswer {
  return {
    response: `Desired outcomes for "${checkpoint.title}":\n${formatList(checkpoint.desiredOutcomes)}`,
    suggestedFollowUps: [
      `What artifacts are required for ${checkpoint.title}?`,
      `Which Table Stakes does ${checkpoint.title} support?`,
      `What phase is ${checkpoint.title} in?`,
    ],
    relatedSources: getRelatedSourcesForQuestion(checkpoint.title, 'playbook'),
  };
}

function buildCheckpointArtifacts(checkpoint: PlaybookCheckpoint): PlaybookAssistantAnswer {
  const sections = [
    `Required artifacts for "${checkpoint.title}":\n${formatList(checkpoint.requiredArtifacts ?? ['No required artifacts listed.'])}`,
  ];

  if (checkpoint.supportingArtifacts?.length) {
    sections.push(`Supporting artifacts:\n${formatList(checkpoint.supportingArtifacts)}`);
  }

  return {
    response: sections.join('\n\n'),
    suggestedFollowUps: [
      `What are the desired outcomes for ${checkpoint.title}?`,
      `Which Table Stakes does ${checkpoint.title} support?`,
      `What phase is ${checkpoint.title} in?`,
    ],
    relatedSources: getRelatedSourcesForQuestion(checkpoint.title, 'playbook'),
  };
}

function buildCheckpointTableStakes(checkpoint: PlaybookCheckpoint): PlaybookAssistantAnswer {
  const reinforced = checkpoint.reinforcedTableStakeIds
    .map((id) => tableStakes.find((stake) => stake.id === id)?.title)
    .filter((title): title is string => Boolean(title));

  return {
    response: `"${checkpoint.title}" reinforces these Table Stakes:\n${formatList(reinforced)}`,
    suggestedFollowUps: [
      `What are the desired outcomes for ${checkpoint.title}?`,
      `What artifacts are required for ${checkpoint.title}?`,
      'What are the non-negotiable Table Stakes?',
    ],
    relatedSources: getRelatedSourcesForQuestion(checkpoint.title, 'playbook'),
  };
}

function buildCheckpointPhase(checkpoint: PlaybookCheckpoint): PlaybookAssistantAnswer {
  const phase = getPhaseById(checkpoint.phaseId);

  return {
    response: `"${checkpoint.title}" belongs to ${phase?.title ?? 'the playbook'}.\n\n${checkpoint.summary}`,
    suggestedFollowUps: [
      `What checkpoints are in ${phase?.title ?? 'that phase'}?`,
      `What artifacts are required for ${checkpoint.title}?`,
      `What are the desired outcomes for ${checkpoint.title}?`,
    ],
    relatedSources: getRelatedSourcesForQuestion(checkpoint.title, 'playbook'),
  };
}

function buildSprintOneReadiness(): PlaybookAssistantAnswer {
  const readinessCheckpoints = ['cp7', 'cp8', 'cp9', 'cp10', 'cp11']
    .map((id) => playbookCheckpoints.find((checkpoint) => checkpoint.id === id))
    .filter((checkpoint): checkpoint is PlaybookCheckpoint => Boolean(checkpoint));

  return {
    response: `Before Sprint 1, focus on the Mobilize Delivery checkpoints that create execution readiness:\n${formatList(
      readinessCheckpoints.map((checkpoint) => checkpoint.title)
    )}\n\nThat means you should have Sprint 0 planned, ceremonies scheduled, the backlog ready, tooling confirmed, and the working agreement finalized.`,
    suggestedFollowUps: [
      'What checkpoints are in Mobilize Delivery?',
      'What artifacts are required for Sprint Zero Planning?',
      'What artifacts are required for Working Agreement Finalized?',
    ],
    relatedSources: getRelatedSourcesForQuestion('before sprint 1 mobilize delivery backlog readiness', 'playbook'),
  };
}

export function answerPlaybookQuestion(userMessage: string): PlaybookAssistantAnswer {
  const normalized = normalize(userMessage);
  const matchedPhase = findPhase(normalized);
  const matchedCheckpoint = findCheckpoint(normalized);
  const matchedTableStake = findTableStake(normalized);

  if (/before sprint 1|ready before sprint 1|ready for sprint 1|before sprint one/.test(normalized)) {
    return buildSprintOneReadiness();
  }

  if (/five phases|framework phases|what are the phases|what phases/.test(normalized)) {
    return buildPhasesOverview();
  }

  if (/table stakes|non negotiable|non negotiable table stakes/.test(normalized) && !matchedCheckpoint && !matchedTableStake) {
    return buildTableStakesOverview();
  }

  if (matchedCheckpoint && /artifact|artifacts|required|supporting|need ready|have ready/.test(normalized)) {
    return buildCheckpointArtifacts(matchedCheckpoint);
  }

  if (matchedCheckpoint && /desired outcome|desired outcomes|outcome|outcomes/.test(normalized)) {
    return buildCheckpointOutcomes(matchedCheckpoint);
  }

  if (matchedCheckpoint && /table stake|table stakes|reinforce|reinforced|support/.test(normalized)) {
    return buildCheckpointTableStakes(matchedCheckpoint);
  }

  if (matchedCheckpoint && /phase|belongs to|what is .* in/.test(normalized)) {
    return buildCheckpointPhase(matchedCheckpoint);
  }

  if (matchedPhase && /checkpoint|checkpoints/.test(normalized)) {
    return buildPhaseCheckpointList(matchedPhase);
  }

  if (matchedPhase && /what happens|cover|summary|where should i start|start|what does/.test(normalized)) {
    return buildPhaseDetail(matchedPhase);
  }

  if (matchedTableStake) {
    return buildTableStakeDetail(matchedTableStake);
  }

  if (matchedCheckpoint) {
    return buildCheckpointPhase(matchedCheckpoint);
  }

  if (matchedPhase) {
    return buildPhaseDetail(matchedPhase);
  }

  return {
    response: 'The Solution Owner Playbook is organized into five phases and 18 checkpoints. I can help with phase overviews, checkpoint outcomes, required artifacts, supporting artifacts, and which SO Table Stakes are reinforced.',
    suggestedFollowUps: [
      'What are the five phases of the Solution Owner framework?',
      'What are the non-negotiable Table Stakes?',
      'What checkpoints are in Mobilize Delivery?',
    ],
    relatedSources: getPlaybookSourcesForQuestion('solution owner playbook'),
  };
}
