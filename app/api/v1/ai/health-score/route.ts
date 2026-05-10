import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { ITINERARY_HEALTH_PROMPT, CONFLICT_DETECTOR_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import { extractJsonObject } from '@/lib/ai/json';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_hlt_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { tripId } = body;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await prisma.stop.findMany({ where: { tripId }, orderBy: { order: 'asc' } });
    const itinerary = stops.map(s => `${s.cityName} (Arrival: ${s.arrivalDate}, Departure: ${s.departureDate})`).join(' -> ');

    if (!aiClient) {
      const mockResult = {
        score: 85,
        issues: [{ type: "pacing", severity: "medium", description: "Only 1 night in Paris is rushed", suggestion: "Add 1 more night" }],
        strengths: ["Good logical geographical progression"],
        overallFeedback: "Solid trip but slightly rushed.",
        conflicts: [],
        isClean: true
      };
      await prisma.trip.update({ where: { id: trip.id }, data: { aiHealthScore: mockResult.score } });
      return NextResponse.json({ success: true, data: mockResult });
    }

    const msgHealth = await aiClient.messages.create({
      max_tokens: 1024,
      stream: false,
      system: ITINERARY_HEALTH_PROMPT,
      messages: [{ role: 'user', content: `Itinerary: ${itinerary}` }]
    });

    const msgConflict = await aiClient.messages.create({
      max_tokens: 1024,
      stream: false,
      system: CONFLICT_DETECTOR_PROMPT,
      messages: [{ role: 'user', content: `Itinerary: ${itinerary}` }]
    });

    const getJson = (msg: any) => {
      const txt = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
      return extractJsonObject(txt);
    };

    const health = getJson(msgHealth);
    const conflicts = getJson(msgConflict);

    const result = { ...health, ...conflicts };
    await prisma.trip.update({ where: { id: trip.id }, data: { aiHealthScore: result.score || 0 } });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
