import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { TRIP_PLANNER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';

const encoder = new TextEncoder();

function ssePayload(text: string) {
  return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`);
}

function sanitizeAiText(raw: string) {
  let text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/^\s*[:;]\s*$/gm, '')
    .replace(/[^\S\r\n]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Collapse repeated adjacent words like "help help" or "trip trip".
  for (let i = 0; i < 3; i += 1) {
    const next = text.replace(/\b([A-Za-z][A-Za-z'-]*)\b(\s+)\1\b/gi, '$1');
    if (next === text) break;
    text = next;
  }

  text = text
    .replace(/([!?.,])\1{1,}/g, '$1')
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .trim();

  return text;
}

function buildFallbackStream(text: string) {
  return new ReadableStream({
    async start(controller) {
      const tokens = text.match(/\S+\s*/g) || [text];
      for (const token of tokens) {
        controller.enqueue(ssePayload(token));
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

    let cleanedResponse = '';
    try {
      const msg = await aiClient.messages.create({
        max_tokens: 900,
        temperature: 0.35,
        top_p: 0.9,
        frequency_penalty: 0.6,
        system: TRIP_PLANNER_PROMPT,
        messages: [{ role: 'user', content: `${contextString}\nUser: ${prompt}` }],
        stream: false
      });

      const responseText = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
      cleanedResponse = sanitizeAiText(responseText);
    } catch (error: any) {
      const message = String(error?.message || '');
      const fallbackText = message.includes('model_not_supported')
        ? 'Configured AI model is not available on your provider. Update HF_MODEL_ID in .env to a supported model.'
        : 'AI service is temporarily unavailable. Please retry in a moment.';
      const fallback = buildFallbackStream(fallbackText);
      return new Response(fallback, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    if (!cleanedResponse) {
      cleanedResponse = 'I could not generate a response right now. Please try again.';
    }

    const readableStream = buildFallbackStream(cleanedResponse);

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
