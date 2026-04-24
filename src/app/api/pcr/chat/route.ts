import { NextRequest } from 'next/server';
import { streamLLM } from '@/lib/llm';
import { PCR_SYSTEM_PROMPT, buildExtractionPrompt, buildNarrativePrompt } from '@/lib/pcrPrompts';
import { PCRStructuredData } from '@/types/pcr';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      sowText?: string;
      mode: 'extract' | 'narrate' | 'converse';
      confirmedData?: PCRStructuredData;
      latestUserInput?: string;
    };

    const { messages, sowText, mode, confirmedData, latestUserInput } = body;

    // Build the message list for the LLM
    let llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: PCR_SYSTEM_PROMPT },
    ];

    if (mode === 'extract' && latestUserInput) {
      // First extraction — parse the user's input and SOW context
      llmMessages = [
        { role: 'system', content: PCR_SYSTEM_PROMPT },
        { role: 'user', content: buildExtractionPrompt(latestUserInput, sowText) },
      ];
    } else if (mode === 'narrate' && confirmedData) {
      // Confirmed data — generate narrative slots.
      // Pass the conversation history as context to buildNarrativePrompt so the LLM
      // can draw on the SO's full description when writing each narrative slot.
      llmMessages = [
        { role: 'system', content: PCR_SYSTEM_PROMPT },
        { role: 'user', content: buildNarrativePrompt(confirmedData, messages) },
      ];
    } else {
      // Conversational mode — pass full history
      llmMessages = [
        { role: 'system', content: PCR_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Narrative generation needs more tokens to produce all four slots with full detail
          const maxTok = mode === 'narrate' ? 4000 : 2000;
          for await (const chunk of streamLLM({ messages: llmMessages, temperature: 0.2, maxTokens: maxTok })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
