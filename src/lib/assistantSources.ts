import { articles } from '@/data/articles';
import {
  getPlaybookPhase,
  getPlaybookPhaseHref,
  playbookCheckpoints,
  playbookPhases,
  tableStakes,
} from '@/data/playbook';
import { Article, AssistantSource } from '@/types';
import { getArticleHref } from '@/lib/knowledge';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const phaseAliases: Record<string, string[]> = {
  'initiate-engagement': ['initiate engagement', 'initiate', 'engagement initiation'],
  'vision-alignment': ['vision alignment', 'vision', 'alignment'],
  'mobilize-delivery': ['mobilize delivery', 'mobilize', 'delivery readiness', 'before sprint 1'],
  'drive-execution': ['drive execution', 'execution', 'delivery execution'],
  'govern-and-evolve': ['govern and evolve', 'govern', 'evolve', 'governance and evolution'],
};

const checkpointAliases: Record<string, string[]> = {
  cp1: ['internal kickoff completed', 'internal kickoff', 'iko'],
  cp2: ['stakeholders identified', 'stakeholders', 'stakeholder identification'],
  cp3: ['access requests submitted', 'access requests', 'access requested'],
  cp4: ['client kickoff executed', 'client kickoff', 'cko'],
  cp5: ['mvp defined', 'mvp'],
  cp6: ['raid log created', 'raid log', 'raid'],
  cp7: ['sprint zero planning', 'sprint 0 planning', 'sprint zero', 'sprint 0'],
  cp8: ['ceremonies scheduled', 'ceremonies', 'agile ceremonies'],
  cp9: ['backlog groomed and ready', 'backlog ready', 'backlog readiness', 'backlog groomed'],
  cp10: ['tooling and environment confirmed', 'tooling confirmed', 'environment confirmed'],
  cp11: ['working agreement finalized', 'working agreement'],
  cp12: ['first increment delivered', 'first increment'],
  cp13: ['retros and demos executed', 'retros and demos', 'retrospectives and demos'],
  cp14: ['velocity metrics baseline', 'metrics baseline', 'velocity baseline'],
  cp15: ['transition plan completed', 'transition plan'],
  cp16: ['lessons learned captured', 'lessons learned'],
  cp17: ['governance framework finalized', 'governance framework'],
  cp18: ['continuous improvement plan', 'ci plan', 'improvement plan'],
};

const tableStakeAliases: Record<string, string[]> = {
  'engagement-kickoff-alignment': ['engagement kickoff', 'kickoff and alignment', 'kickoff alignment'],
  'communication-cadence': ['communication cadence', 'cadence', 'communication rhythm'],
  'discovery-scope-control': ['discovery and scope control', 'scope control', 'discovery'],
  'engagement-artifacts-documentation': ['engagement artifacts', 'artifacts and documentation', 'documentation'],
  'financial-delivery-governance': ['financial and delivery governance', 'financial governance', 'delivery governance'],
  'engagement-closeout': ['engagement closeout', 'closeout'],
  'leadership-expectation': ['leadership expectation', 'leadership expectations'],
};

function dedupeSources(sources: AssistantSource[], limit = 3) {
  const seen = new Set<string>();
  const result: AssistantSource[] = [];

  for (const source of sources) {
    if (seen.has(source.href)) continue;
    seen.add(source.href);
    result.push(source);
    if (result.length >= limit) break;
  }

  return result;
}

function findPlaybookPhase(message: string) {
  const normalized = normalize(message);

  for (const phase of playbookPhases) {
    const aliases = [phase.title, phase.id.replace(/-/g, ' '), ...(phaseAliases[phase.id] ?? [])];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return phase;
    }
  }

  return null;
}

function findPlaybookCheckpoint(message: string) {
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

  for (const stake of tableStakes) {
    const aliases = [stake.title, ...(tableStakeAliases[stake.id] ?? [])];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return stake;
    }
  }

  return null;
}

function getPlaybookLandingSource(): AssistantSource {
  return {
    id: 'playbook-landing',
    label: 'Solution Owner Playbook',
    href: '/app/playbook',
    kind: 'playbook',
    description: 'Framework landing page with phases and SO Table Stakes.',
  };
}

function getPhaseSource(phaseId: string): AssistantSource | null {
  const phase = getPlaybookPhase(phaseId);
  if (!phase) return null;

  return {
    id: `phase-${phase.id}`,
    label: phase.title,
    href: getPlaybookPhaseHref(phase.id),
    kind: 'playbook',
    description: `${phase.checkpointIds.length} checkpoints in this phase.`,
  };
}

function articleScore(article: Article, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const searchable = normalize([
    article.title,
    article.description,
    article.author,
    article.category,
    article.tags.join(' '),
    article.content,
  ].join(' '));

  let score = 0;
  const title = normalize(article.title);

  if (title === normalizedQuery) score += 140;
  if (title.includes(normalizedQuery)) score += 70;
  if (article.tags.some((tag) => normalize(tag) === normalizedQuery)) score += 50;
  if (article.tags.some((tag) => normalize(tag).includes(normalizedQuery))) score += 30;
  if (normalize(article.category).includes(normalizedQuery)) score += 25;
  if (normalize(article.description).includes(normalizedQuery)) score += 20;
  if (normalize(article.author).includes(normalizedQuery)) score += 15;
  if (searchable.includes(normalizedQuery)) score += 8;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const tokenMatches = tokens.filter((token) => token.length > 2 && searchable.includes(token)).length;
  score += tokenMatches * 8;

  return score;
}

function getKnowledgeArticleSources(query: string, limit = 2): AssistantSource[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const ranked = articles
    .map((article) => ({ article, score: articleScore(article, normalizedQuery) }))
    .filter((entry) => entry.score >= 24)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (!!a.article.featured !== !!b.article.featured) return a.article.featured ? -1 : 1;
      if (b.article.rating !== a.article.rating) return b.article.rating - a.article.rating;
      return a.article.title.localeCompare(b.article.title);
    })
    .slice(0, limit);

  return ranked.map(({ article }) => ({
    id: `article-${article.id}`,
    label: article.title,
    href: getArticleHref(article.id),
    kind: 'knowledge',
    description: `${article.readTime} • ${article.author}`,
  }));
}

export function getKnowledgeHubSource(): AssistantSource {
  return {
    id: 'knowledge-hub',
    label: 'Knowledge Hub',
    href: '/app/knowledge',
    kind: 'knowledge',
    description: 'Browse curated articles and reference content.',
  };
}

export function getPlaybookSourcesForQuestion(userMessage: string): AssistantSource[] {
  const sources: AssistantSource[] = [];
  const phase = findPlaybookPhase(userMessage);
  const checkpoint = findPlaybookCheckpoint(userMessage);
  const tableStake = findTableStake(userMessage);
  const normalized = normalize(userMessage);

  if (checkpoint) {
    const checkpointPhase = getPhaseSource(checkpoint.phaseId);
    if (checkpointPhase) {
      checkpointPhase.description = `Includes ${checkpoint.title}.`;
      sources.push(checkpointPhase);
    }
  } else if (phase) {
    const phaseSource = getPhaseSource(phase.id);
    if (phaseSource) {
      sources.push(phaseSource);
    }
  } else if (tableStake || /table stakes|five phases|framework phases|solution owner framework|playbook/.test(normalized)) {
    sources.push(getPlaybookLandingSource());
  }

  if (/before sprint 1|backlog readiness|backlog ready/.test(normalized)) {
    const mobilizeSource = getPhaseSource('mobilize-delivery');
    if (mobilizeSource) {
      sources.unshift(mobilizeSource);
    }
  }

  return dedupeSources(sources, 2);
}

export function getRelatedSourcesForQuestion(userMessage: string, category?: string): AssistantSource[] {
  const normalized = normalize(userMessage);
  const playbookSources = getPlaybookSourcesForQuestion(userMessage);

  if (category === 'playbook') {
    const knowledgeSources = getKnowledgeArticleSources(userMessage, 1);
    return dedupeSources([...playbookSources, ...knowledgeSources], 3);
  }

  if (category === 'article') {
    const knowledgeSources = getKnowledgeArticleSources(userMessage, 2);
    return dedupeSources([...knowledgeSources], 2);
  }

  if (category === 'navigation') {
    if (normalized.includes('knowledge')) return [getKnowledgeHubSource()];
    if (normalized.includes('playbook')) return [getPlaybookLandingSource()];
  }

  const knowledgeSources = getKnowledgeArticleSources(userMessage, playbookSources.length > 0 ? 1 : 2);
  return dedupeSources([...playbookSources, ...knowledgeSources], 3);
}
