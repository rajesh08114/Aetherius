import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { MOOD_MATCHER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { buildUserContext } from '@/lib/ai/context-builder';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_rec_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { moods } = body;

    await connectToDatabase();
    const user = await User.findById(auth.userId);
    const userContext = user ? buildUserContext(user) : '';

    if (!aiClient) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [
            { cityName: "Kyoto", country: "Japan", matchScore: 95, whyItMatches: "Perfect for spiritual mood", bestFor: "Temples", estimatedDailyBudget: 120, bestMonth: "April", imageQuery: "Kyoto" },
            { cityName: "Bali", country: "Indonesia", matchScore: 90, whyItMatches: "Great for relaxing", bestFor: "Beaches", estimatedDailyBudget: 80, bestMonth: "August", imageQuery: "Bali" }
          ]
        }
      });
    }

    const msg = await aiClient.messages.create({
      max_tokens: 1024,
      system: MOOD_MATCHER_PROMPT,
      messages: [{ role: 'user', content: `${userContext}\nRequested Moods: ${moods.join(', ')}` }]
    });

    const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);
    
    return NextResponse.json({ success: true, data: JSON.parse(jsonString) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
