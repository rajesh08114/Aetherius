import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { BUDGET_OPTIMIZER_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import { extractJsonObject } from '@/lib/ai/json';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_opt_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { tripId } = body;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await prisma.stop.findMany({ where: { tripId }, include: { activities: true } });

    const tripData = {
      budget: trip.totalBudget,
      currency: trip.currency,
      stops: stops.map(s => {
        const accommodation = s.accommodation as { cost?: number } | null;
        const transport = s.transportTo as { cost?: number } | null;

        const arrivalDate = s.arrivalDate ? new Date(s.arrivalDate) : null;
        const departureDate = s.departureDate ? new Date(s.departureDate) : null;
        const nights = arrivalDate && departureDate
          ? Math.ceil(Math.abs(departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          city: s.cityName,
          nights,
          accommodationCost: accommodation?.cost,
          transportCost: transport?.cost,
          activities: s.activities.map(a => ({ name: a.name, cost: a.cost }))
        };
      })
    };

    if (!aiClient) {
      return NextResponse.json({
        success: true,
        data: {
          savings: [{ item: "Hotel in Paris", currentCost: 300, suggestedAlternative: "Hostel or Airbnb", estimatedSaving: 150, difficulty: "easy" }],
          totalPotentialSaving: 150,
          topTip: "Book trains 2 months in advance"
        }
      });
    }

    const msg = await aiClient.messages.create({
      max_tokens: 1024,
      stream: false,
      system: BUDGET_OPTIMIZER_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(tripData) }]
    });

    const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const parsed = extractJsonObject(responseText);
    const data = Object.keys(parsed).length > 0
      ? parsed
      : {
          savings: [],
          totalPotentialSaving: 0,
          topTip: 'Try adjusting accommodation and transport for better savings.'
        };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
