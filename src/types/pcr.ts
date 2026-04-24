export type PCRInputMode = 'conversational' | 'upload';

export type PCRChangeType = 'scope' | 'resources' | 'timeline' | 'assumptions' | 'pricing';

export interface PCRResource {
  role: string;
  discipline?: string;
  resourceLevel?: string;
  deliveryTheatre?: string;
  listRate?: number;
  discountedRate?: number;
  originalAllocation: string;
  newAllocation: string;
  action: 'added' | 'removed' | 'changed';
}

export interface PCRPricingChange {
  isZeroCost: boolean;
  originalTotal?: string;
  newTotal?: string;
  notes?: string;
}

// Structured data extracted from the SO's input and confirmed before generation
export interface PCRStructuredData {
  // Step 1: Engagement basics
  projectName: string;
  clientName: string;
  sowDate: string;
  sowId?: string;
  priorPcrCount: number;
  priorPcrDates: string[];

  // Step 2: Change types selected
  changeTypes: PCRChangeType[];

  // Step 3: Confirmed structured data
  resources: PCRResource[];
  pricingChange: PCRPricingChange;
  timelineExtensionDays?: number;
  newEndDate?: string;

  // SOW context (extracted text from uploaded PDF)
  sowContext?: string;
}

// LLM-generated narrative slots — the only parts the LLM authors
export interface PCRNarrative {
  changeSummary: string;           // Section 1
  solutionApproachChanges?: string; // Section 2.1
  scopeChanges?: string;           // Section 2.1 scope/schedule
  resourceRationale?: string;      // Section 2.1 resource narrative
  assumptionChanges?: string;      // Section 2.1 assumptions
}

// Full PCR document state
export interface PCRDocument {
  structuredData: PCRStructuredData;
  narrative: PCRNarrative;
  generatedAt: string;
}

// Wizard step state
export type PCRWizardStep = 1 | 2 | 3 | 4;

export interface PCRWizardState {
  currentStep: PCRWizardStep;
  sowFile?: File;
  sowText?: string;
  inputMode?: PCRInputMode;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  structuredData?: Partial<PCRStructuredData>;
  confirmedData?: PCRStructuredData;
  narrative?: PCRNarrative;
  isGenerating: boolean;
  error?: string;
}
