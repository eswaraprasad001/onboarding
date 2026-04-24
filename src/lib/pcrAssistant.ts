import {
  pcrJobAids,
  pcrKeyPrinciples,
  pcrProcessSteps,
  pcrQualityGates,
  pcrRoles,
  pcrTools,
  pcrWhenToUse,
  PCR_ARTICLE_IDS,
  pcrKnowledgeArticles,
} from '@/data/pcrProcess';
import { AssistantSource } from '@/types';
import { getArticleHref } from '@/lib/knowledge';

export interface PcrAssistantAnswer {
  response: string;
  suggestedFollowUps: string[];
  relatedSources: AssistantSource[];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function getArticleSource(articleId: string): AssistantSource {
  const article = pcrKnowledgeArticles.find((item) => item.id === articleId);

  return {
    id: `article-${articleId}`,
    label: article?.title ?? 'Knowledge article',
    href: getArticleHref(articleId),
    kind: 'knowledge',
    description: article?.description,
  };
}

function buildOverviewAnswer(): PcrAssistantAnswer {
  return {
    response: `The Solution Owner-driven PCR process is the operating model for changes to existing scope on an active engagement.\n\nKey points:\n${formatList(
      pcrKeyPrinciples
    )}\n\nAt a high level the flow is: identify the PCR need, draft the PCR and estimate, refine it with the Architect and PCR Validator, submit through RAP Support, let Sales present and secure signature, then send the signed PCR to Booking so it posts to My Orders.`,
    suggestedFollowUps: [
      'When should I create a PCR?',
      'What is the SO role versus Architect and Sales?',
      'What is the Quality Gate?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.primary)],
  };
}

function buildWhenToUseAnswer(): PcrAssistantAnswer {
  return {
    response: `Use the PCR process when a change affects an existing engagement in a way that impacts scope, cost, timeline, or delivery approach.\n\nCommon triggers:\n${formatList(
      pcrWhenToUse
    )}\n\nIf the work is a brand-new SOW or Solution Summary, it stays outside this standard PCR path.`,
    suggestedFollowUps: [
      'What are the required steps before RAP?',
      'How do I create a PCR draft?',
      'What is the Quality Gate?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.primary), getArticleSource(PCR_ARTICLE_IDS.create)],
  };
}

function buildRolesAnswer(): PcrAssistantAnswer {
  const so = pcrRoles.find((role) => role.id === 'solution-owner');
  const architect = pcrRoles.find((role) => role.id === 'architect');
  const sales = pcrRoles.find((role) => role.id === 'sales');

  return {
    response: `Role split in the SO-driven PCR model:\n\n**Solution Owner**\n${formatList(so?.responsibilities ?? [])}\n\n**Architect**\n${formatList(architect?.responsibilities ?? [])}\n\n**Sales**\n${formatList(sales?.responsibilities ?? [])}`,
    suggestedFollowUps: [
      'What are the required steps before RAP?',
      'What tools do I need for PCR creation?',
      'How do I create a PCR?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.primary)],
  };
}

function buildRapPrepAnswer(): PcrAssistantAnswer {
  const stepsBeforeRap = pcrProcessSteps.slice(0, 4).map((step) => step.title);
  const qualityGateChecks = pcrQualityGates.flatMap((gate) => gate.checks).slice(0, 6);

  return {
    response: `Before RAP, make sure the PCR has moved through these readiness steps:\n${formatList(
      stepsBeforeRap
    )}\n\nRAP prep checklist:\n${formatList([
      ...qualityGateChecks,
      'Gather supporting attachments such as logs, screenshots, or diagrams when needed.',
      'Confirm Architect approval and be ready to respond quickly to leadership questions.',
    ])}`,
    suggestedFollowUps: [
      'What is the Quality Gate?',
      'How do I use SPW for PCR work?',
      'What supporting job aids are available?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.rap), getArticleSource(PCR_ARTICLE_IDS.primary)],
  };
}

function buildQualityGateAnswer(): PcrAssistantAnswer {
  return {
    response: `The PCR Quality Gate has four parts:\n\n${pcrQualityGates
      .map((gate) => `**${gate.title}**\n${formatList(gate.checks)}`)
      .join('\n\n')}`,
    suggestedFollowUps: [
      'How do I prepare for RAP?',
      'How do I create a PCR?',
      'What tools do I need for PCR creation?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.primary), getArticleSource(PCR_ARTICLE_IDS.validator)],
  };
}

function buildToolsAnswer(): PcrAssistantAnswer {
  return {
    response: `Core PCR tools and job aids:\n${formatList(
      pcrTools.map((tool) => `${tool.title}: ${tool.description}`)
    )}\n\nDetailed job aids available:\n${formatList(pcrJobAids.map((jobAid) => jobAid.title))}`,
    suggestedFollowUps: [
      'How do I use SPW for PCR work?',
      'How do I create a PCR?',
      'What should I prepare for RAP?',
    ],
    relatedSources: [
      getArticleSource(PCR_ARTICLE_IDS.primary),
      getArticleSource(PCR_ARTICLE_IDS.spw),
      getArticleSource(PCR_ARTICLE_IDS.validator),
    ],
  };
}

function buildSpwAnswer(): PcrAssistantAnswer {
  const spwAid = pcrJobAids.find((jobAid) => jobAid.articleId === PCR_ARTICLE_IDS.spw);

  return {
    response: `Use SPW to build and validate the PCR estimate.\n\nRecommended sequence:\n${formatList(
      spwAid?.bullets ?? []
    )}\n\nThe goal is an estimate that is accurate enough for margin review, RAP readiness, and the customer-facing PCR narrative.`,
    suggestedFollowUps: [
      'What should I prepare for RAP?',
      'How do I create a PCR?',
      'What is the Quality Gate?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.spw), getArticleSource(PCR_ARTICLE_IDS.primary)],
  };
}

function buildValidatorAnswer(): PcrAssistantAnswer {
  const validatorAid = pcrJobAids.find((jobAid) => jobAid.articleId === PCR_ARTICLE_IDS.validator);

  return {
    response: `The PCR Validator is used after the draft and estimate are in place.\n\nHow to use it:\n${formatList(
      validatorAid?.bullets ?? []
    )}\n\nIt supports the language and consistency check, but it does not replace Solution Owner ownership, Architect review, or SPW validation.`,
    suggestedFollowUps: [
      'What is the Quality Gate?',
      'What should I prepare for RAP?',
      'How do I create a PCR?',
    ],
    relatedSources: [getArticleSource(PCR_ARTICLE_IDS.validator), getArticleSource(PCR_ARTICLE_IDS.primary)],
  };
}

function buildJobAidsAnswer(): PcrAssistantAnswer {
  return {
    response: `The current PCR job aids are:\n${formatList(
      pcrJobAids.map((jobAid) => `${jobAid.title}: ${jobAid.description}`)
    )}`,
    suggestedFollowUps: [
      'How do I use SPW for PCR work?',
      'What should I prepare for RAP?',
      'How do I create a PCR?',
    ],
    relatedSources: [
      getArticleSource(PCR_ARTICLE_IDS.primary),
      getArticleSource(PCR_ARTICLE_IDS.create),
      getArticleSource(PCR_ARTICLE_IDS.rap),
    ],
  };
}

export function answerPcrQuestion(userMessage: string): PcrAssistantAnswer {
  const normalized = normalize(userMessage);

  if (/quality gate|completeness check|financial accuracy|technical accuracy|language and consistency/.test(normalized)) {
    return buildQualityGateAnswer();
  }

  if (/prepare for rap|before rap|required steps before rap|rap prep|rap readiness/.test(normalized)) {
    return buildRapPrepAnswer();
  }

  if (/\bspw\b|estimate|rate card|margin/.test(normalized)) {
    return buildSpwAnswer();
  }

  if (/validator|ai studio|clarity check|language check/.test(normalized)) {
    return buildValidatorAnswer();
  }

  if (/job aid|job aids|tool|tools|template|templates|route 66/.test(normalized)) {
    return buildToolsAnswer();
  }

  if (/when should i create|when to use|when do i create|when is it a pcr|use this process/.test(normalized)) {
    return buildWhenToUseAnswer();
  }

  if (/role|responsibil|vs|versus|architect|sales|rap support|booking|my orders/.test(normalized)) {
    return buildRolesAnswer();
  }

  if (/create a pcr|draft a pcr|drafting questions|scope change/.test(normalized)) {
    return {
      response: `To create a PCR, start by confirming the work is a change to existing scope, then draft the PCR package with scope, assumptions, risks, timeline impact, dependencies, and the SPW estimate.\n\nDrafting sequence:\n${formatList(
        pcrJobAids.find((jobAid) => jobAid.articleId === PCR_ARTICLE_IDS.create)?.bullets ?? []
      )}`,
      suggestedFollowUps: [
        'How do I use SPW for PCR work?',
        'What is the Quality Gate?',
        'What should I prepare for RAP?',
      ],
      relatedSources: [getArticleSource(PCR_ARTICLE_IDS.create), getArticleSource(PCR_ARTICLE_IDS.primary)],
    };
  }

  if (/pcr|product change request|change request|solution owner driven pcr/.test(normalized)) {
    return buildOverviewAnswer();
  }

  return buildOverviewAnswer();
}
