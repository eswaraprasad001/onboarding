export type LLMProvider = 'openai' | 'anthropic' | 'bedrock';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
}

export interface LLMStreamChunk {
  delta: string;
  done: boolean;
}
