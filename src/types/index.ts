export type Role = 'BA' | 'SO';
export type StepStatus = 'not_started' | 'in_progress' | 'completed';
export type ViewId = 'dashboard' | 'onboarding' | 'templates' | 'knowledge' | 'playbook' | 'pcr-writer';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  link?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  duration: string;
  category: 'access' | 'learning' | 'practice' | 'assessment' | 'tools';
  subTasks: SubTask[];
  requiredDocuments?: string[];
  teamsChannels?: string[];
  documentTags?: string[];
  roleSpecific?: {
    BA?: Partial<Pick<OnboardingStep, 'title' | 'description' | 'subTasks' | 'requiredDocuments'>>;
    SO?: Partial<Pick<OnboardingStep, 'title' | 'description' | 'subTasks' | 'requiredDocuments'>>;
  };
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  format: 'PowerPoint' | 'Word' | 'Excel' | 'PDF' | 'Video' | 'Mixed';
  lastUpdated: string;
  author: string;
  downloads: number;
  rating: number;
  featured?: boolean;
  cardType?: 'artifact' | 'collection';
  client?: string;
  tags?: string[];
  recommendedForSteps?: string[];
  featuredForOnboarding?: boolean;
  onboardingPriority?: number;
  resourceUrl?: string;
  resourceType?: 'file' | 'folder';
  resourceLabel?: string;
  syncSource?: 'templates-and-samples';
  sourcePathSegments?: string[];
  discoveredFromSharePoint?: boolean;
  preview?: TemplatePreviewMetadata;
}

export interface TemplatePreviewResource {
  id: string;
  label: string;
  description?: string;
  href?: string;
  kind: 'template' | 'knowledge' | 'workflow' | 'external';
  external?: boolean;
}

export interface TemplatePreviewMetadata {
  artifactType: string;
  summary: string;
  whenToUse?: string;
  workflowContext?: string;
  keyContents?: string[];
  relatedResources?: TemplatePreviewResource[];
  sourceUrl?: string;
  downloadUrl?: string;
  relatedArticleUrl?: string;
  hasPreview?: boolean;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  author: string;
  rating: number;
  tags: string[];
  featured?: boolean;
  relatedArticleIds?: string[];
  listVisibility?: 'visible' | 'supporting';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  feedback?: 'positive' | 'negative' | null;
  relatedSources?: AssistantSource[];
}

export interface AssistantSource {
  id: string;
  label: string;
  href: string;
  kind: 'playbook' | 'knowledge' | 'route';
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  requirement: string;
}

export interface GameState {
  xp: number;
  level: number;
  badges: Badge[];
  milestonesReached: string[];
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ActivityItem {
  id: string;
  type: 'step_complete' | 'subtask_complete' | 'badge_earned' | 'article_read' | 'template_viewed' | 'xp_earned';
  description: string;
  timestamp: string;
}
