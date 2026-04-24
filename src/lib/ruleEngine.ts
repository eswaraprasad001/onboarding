import { AssistantSource, Role, ViewId } from '@/types';

export interface ChatRule {
  id: string;
  patterns: RegExp[];
  keywords: string[];
  contextConditions?: {
    currentView?: ViewId[];
    role?: Role[];
  };
  weight: number;
  response: string | ((context: ChatContext, userMessage: string) => string);
  suggestedFollowUps?: string[] | ((context: ChatContext, userMessage: string) => string[]);
  relatedSources?: AssistantSource[] | ((context: ChatContext, userMessage: string) => AssistantSource[]);
  category: 'navigation' | 'role' | 'template' | 'article' | 'process' | 'tool' | 'general' | 'playbook';
}

export interface ChatContext {
  role: Role | null;
  currentView: ViewId;
  stepsCompleted: number;
  totalSteps: number;
  currentStepTitle: string | null;
  completedSubTasks: number;
  totalSubTasks: number;
  progressPercentage: number;
}

const FALLBACK_RESPONSES = [
  "I'm not sure about that specific topic. You can try asking about your onboarding steps, templates, knowledge articles, or the Solution Owner Playbook.",
  "I don't have information on that yet. Try asking me about navigation, your current progress, playbook checkpoints, or available resources.",
  "Hmm, I'm not sure about that. I can help you with onboarding steps, templates, knowledge articles, playbook phases, and navigating the app.",
  "That's outside what I can help with right now. Try asking about your progress, templates, the Knowledge Hub, or the Solution Owner framework.",
  "I'm here to help with your onboarding! Ask me about steps, templates, articles, playbook checkpoints, or how to navigate the platform.",
];

const DEFAULT_SUGGESTIONS = [
  'What step should I work on next?',
  'What are the five phases of the Solution Owner framework?',
  'How do I use the Knowledge Hub?',
];

export class RuleEngine {
  private rules: ChatRule[];

  constructor(rules: ChatRule[]) {
    this.rules = rules;
  }

  evaluate(userMessage: string, context: ChatContext): {
    response: string;
    suggestedQuestions: string[];
    confidence: number;
    relatedSources: AssistantSource[];
  } {
    const normalized = userMessage.toLowerCase().trim();

    // Filter by context conditions
    const eligible = this.rules.filter(rule => {
      if (rule.contextConditions?.currentView && !rule.contextConditions.currentView.includes(context.currentView)) {
        return false;
      }
      if (rule.contextConditions?.role && context.role && !rule.contextConditions.role.includes(context.role)) {
        return false;
      }
      return true;
    });

    // Score each rule
    const scored = eligible.map(rule => {
      let score = rule.weight;

      // Pattern match
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          score += 30;
          break;
        }
      }

      // Keyword overlap
      for (const keyword of rule.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      return { rule, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best && best.score > 15) {
      const response = typeof best.rule.response === 'function'
        ? best.rule.response(context, userMessage)
        : best.rule.response;
      const suggestedQuestions = typeof best.rule.suggestedFollowUps === 'function'
        ? best.rule.suggestedFollowUps(context, userMessage)
        : best.rule.suggestedFollowUps ?? DEFAULT_SUGGESTIONS;
      const relatedSources = typeof best.rule.relatedSources === 'function'
        ? best.rule.relatedSources(context, userMessage)
        : best.rule.relatedSources ?? [];

      return {
        response,
        suggestedQuestions,
        confidence: Math.min(1, best.score / 60),
        relatedSources,
      };
    }

    // Fallback
    return {
      response: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)],
      suggestedQuestions: DEFAULT_SUGGESTIONS,
      confidence: 0,
      relatedSources: [],
    };
  }
}
