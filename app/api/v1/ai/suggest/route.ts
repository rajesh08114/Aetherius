import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { TRIP_PLANNER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';

const encoder = new TextEncoder();

function ssePayload(text: string) {
  return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`);
}

function buildFallbackStream(text: string) {
  return new ReadableStream({
    async start(controller) {
      const words = text.split(' ');
      for (const word of words) {
        controller.enqueue(ssePayload(`${word} `));
        await new Promise((r) => setTimeout(r, 40));
      }
      controller.close();
    }
  });
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { prompt, tripContext } = body;

    let contextString = '';
    if (tripContext) {
      contextString = `\nContext:\n${JSON.stringify(tripContext)}\n`;
    }

    if (!aiClient) {
      const stream = buildFallbackStream('AI provider is not configured yet, but your app is working. Add API credentials to enable smart suggestions.');
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    let stream: AsyncGenerator<any>;
    try {
      stream = await aiClient.messages.create({
        max_tokens: 1024,
        system: TRIP_PLANNER_PROMPT,
        messages: [{ role: 'user', content: `${contextString}\nUser: ${prompt}` }],
        stream: true,
      });
    } catch {
      const fallback = buildFallbackStream('AI service is temporarily unavailable. Please retry in a moment.');
      return new Response(fallback, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let emittedAnyChunk = false;
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              emittedAnyChunk = true;
              controller.enqueue(ssePayload(chunk.delta.text));
            }
          }

          if (!emittedAnyChunk) {
            controller.enqueue(ssePayload('AI response is currently unavailable. Please try again.'));
          }
        } catch (error: any) {
          const message = String(error?.message || '');
          const fallbackText = message.includes('model_not_supported')
            ? 'Configured AI model is not available on your provider. Update HF_MODEL_ID in .env to a supported model.'
            : 'AI service is temporarily unavailable. Please retry in a moment.';
          controller.enqueue(ssePayload(fallbackText));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error: any) {
    const message = String(error?.message || 'Unknown error');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
