import { LLMRequest, LLMResponse } from './types';

// AWS Bedrock implementation.
// Activate by setting:
//   LLM_PROVIDER=bedrock
//   AWS_BEDROCK_REGION=us-east-1
//   AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
//
// AWS credentials are resolved from the standard AWS credential chain:
//   - IAM role (when running on Amplify)
//   - AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY environment variables (local dev)

const DEFAULT_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

async function getAWSSignatureHeaders(
  region: string,
  service: string,
  method: string,
  url: string,
  body: string,
): Promise<Record<string, string>> {
  // Resolve credentials from environment (local dev path).
  // On Amplify with an IAM role, credentials come from the instance metadata service.
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or use an IAM role.');
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const parsedUrl = new URL(url);
  const host = parsedUrl.host;
  const canonicalUri = parsedUrl.pathname;
  const canonicalQueryString = '';

  const bodyHash = await sha256Hex(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n` +
    (sessionToken ? `x-amz-security-token:${sessionToken}\n` : '');
  const signedHeaders = 'content-type;host;x-amz-date' + (sessionToken ? ';x-amz-security-token' : '');

  const canonicalRequest = [method, canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, bodyHash].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256Hex(canonicalRequest)}`;

  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = await hmacHex(signingKey, stringToSign);

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Amz-Date': amzDate,
    Authorization: authorizationHeader,
  };

  if (sessionToken) headers['X-Amz-Security-Token'] = sessionToken;

  return headers;
}

async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

async function hmacHex(key: ArrayBuffer | Uint8Array, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', toArrayBuffer(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacRaw(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', toArrayBuffer(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
}

async function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const kDate = await hmacRaw(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmacRaw(kDate, region);
  const kService = await hmacRaw(kRegion, service);
  return hmacRaw(kService, 'aws4_request');
}

export async function callBedrock(request: LLMRequest): Promise<LLMResponse> {
  const region = process.env.AWS_BEDROCK_REGION ?? 'us-east-1';
  const modelId = process.env.AWS_BEDROCK_MODEL_ID ?? DEFAULT_MODEL_ID;
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/invoke`;

  const systemMessage = request.messages.find((m) => m.role === 'system');
  const conversationMessages = request.messages.filter((m) => m.role !== 'system');

  // Bedrock Anthropic models use the Messages API format
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: request.maxTokens ?? 2000,
    system: systemMessage?.content,
    messages: conversationMessages.map((m) => ({ role: m.role, content: m.content })),
  });

  const headers = await getAWSSignatureHeaders(region, 'bedrock', 'POST', url, body);

  const response = await fetch(url, { method: 'POST', headers, body });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bedrock API error ${response.status}: ${error}`);
  }

  const data = await response.json() as {
    content: Array<{ text: string }>;
  };

  return {
    content: data.content[0].text,
    provider: 'bedrock',
    model: modelId,
  };
}

export async function* streamBedrock(request: LLMRequest): AsyncGenerator<string> {
  // Bedrock streaming uses a different binary protocol (EventStream).
  // For now, fall back to non-streaming and yield the full response as one chunk.
  // Full EventStream streaming can be added when Bedrock credentials are available for testing.
  const result = await callBedrock(request);
  yield result.content;
}
