import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { MOOD_MATCHER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import { extractJsonObject } from '@/lib/ai/json';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { buildUserContext } from '@/lib/ai/context-builder';

const fallbackRecommendations = [
  { cityName: 'Kyoto', country: 'Japan', matchScore: 95, whyItMatches: 'Great balance of calm temples and culture-rich neighborhoods.', bestFor: 'Temples and tea houses', estimatedDailyBudget: 120, bestMonth: 'April', imageQuery: 'Kyoto skyline' },
  { cityName: 'Bali', country: 'Indonesia', matchScore: 90, whyItMatches: 'Excellent for relaxing days, scenic nature, and wellness routines.', bestFor: 'Beaches and retreats', estimatedDailyBudget: 80, bestMonth: 'August', imageQuery: 'Bali rice terraces' }
];

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_rec_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const moods = Array.isArray(body?.moods)
      ? body.moods.filter((m: unknown) => typeof m === 'string' && m.trim().length > 0)
      : [];

    if (moods.length === 0) {
      return NextResponse.json({ success: true, data: { recommendations: fallbackRecommendations } });
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId);
    const userContext = user ? buildUserContext(user) : '';

    if (!aiClient) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: fallbackRecommendations
        }
      });
    }

    const msg = await aiClient.messages.create({
      max_tokens: 1024,
      stream: false,
      system: MOOD_MATCHER_PROMPT,
      messages: [{ role: 'user', content: `${userContext}\nRequested Moods: ${moods.join(', ')}` }]
    });

    const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const parsed = extractJsonObject(responseText);
    const hasRecommendations = Array.isArray(parsed?.recommendations) && parsed.recommendations.length > 0;
    const data = hasRecommendations ? parsed : { recommendations: fallbackRecommendations };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
