import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { BUDGET_OPTIMIZER_PROMPT } from '@/lib/ai/prompts';
import { anthropic } from '@/lib/ai/client';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_opt_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { tripId } = body;

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: tripId, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await Stop.find({ tripId }).populate('activities');

    const tripData = {
      budget: trip.totalBudget,
      currency: trip.currency,
      stops: stops.map(s => ({
        city: s.cityName,
        nights: s.nights,
        accommodationCost: s.accommodation?.cost,
        transportCost: s.transportTo?.cost,
        activities: s.activities.map((a: any) => ({ name: a.name, cost: a.cost }))
      }))
    };

    if (!anthropic) {
      return NextResponse.json({
        success: true,
        data: {
          savings: [{ item: "Hotel in Paris", currentCost: 300, suggestedAlternative: "Hostel or Airbnb", estimatedSaving: 150, difficulty: "easy" }],
          totalPotentialSaving: 150,
          topTip: "Book trains 2 months in advance"
        }
      });
    }

    const msg = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: BUDGET_OPTIMIZER_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(tripData) }]
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
