import { LLMProvider, LLMRequest, LLMResponse } from './types';
import { callOpenAI, streamOpenAI } from './openai';
import { callAnthropic, streamAnthropic } from './anthropic';
import { callBedrock, streamBedrock } from './bedrock';

export type { LLMProvider, LLMRequest, LLMResponse, LLMMessage } from './types';

function getProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER ?? 'openai') as LLMProvider;
  if (!['openai', 'anthropic', 'bedrock'].includes(provider)) {
    throw new Error(`Unknown LLM_PROVIDER: "${provider}". Must be openai, anthropic, or bedrock.`);
  }
  return provider;
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const provider = getProvider();
  switch (provider) {
    case 'openai': return callOpenAI(request);
    case 'anthropic': return callAnthropic(request);
    case 'bedrock': return callBedrock(request);
  }
}

export async function* streamLLM(request: LLMRequest): AsyncGenerator<string> {
  const provider = getProvider();
  switch (provider) {
    case 'openai': yield* streamOpenAI(request); break;
    case 'anthropic': yield* streamAnthropic(request); break;
    case 'bedrock': yield* streamBedrock(request); break;
  }
}
