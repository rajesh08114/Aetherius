import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { TRIP_PLANNER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';

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
      // Mock streaming response if no API key
      const stream = new ReadableStream({
        async start(controller) {
          const text = "I am a mock AI response since the AI provider is not configured.";
          const words = text.split(" ");
          for (const word of words) {
            controller.enqueue(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
            await new Promise(r => setTimeout(r, 50));
          }
          controller.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    const stream = await aiClient.messages.create({
      max_tokens: 1024,
      system: TRIP_PLANNER_PROMPT,
      messages: [{ role: 'user', content: `${contextString}\nUser: ${prompt}` }],
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
          }
        }
        controller.close();
      }
    });

    return new Response(readableStream, { headers: { 'Content-Type': 'text/event-stream' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
