import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { PACKING_EXPERT_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import { extractJsonObject } from '@/lib/ai/json';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_chk_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { tripId } = body;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await prisma.stop.findMany({ where: { tripId } });
    const tripContext = `Cities: ${stops.map(s => s.cityName).join(', ')}. Month: ${trip.startDate ? new Date(trip.startDate).toLocaleString('default', { month: 'long' }) : 'Unknown'}`;

    let items = [];

    if (!aiClient) {
      items = [
        { label: "Passport", category: "documents", quantity: 1, essential: true, weatherReason: "" },
        { label: "Umbrella", category: "misc", quantity: 1, essential: false, weatherReason: "Expected rain in London" }
      ];
    } else {
      const msg = await aiClient.messages.create({
        max_tokens: 1024,
        stream: false,
        system: PACKING_EXPERT_PROMPT,
        messages: [{ role: 'user', content: tripContext }]
      });

      const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
      const parsed = extractJsonObject(responseText);
      items = Array.isArray(parsed.items) ? parsed.items : [];
    }

    const formattedItems = items.map((item: any) => ({
      id: crypto.randomBytes(8).toString('hex'),
      label: item.label,
      category: item.category,
      quantity: item.quantity || 1,
      packed: false,
      addedByAI: true
    }));

    let checklist = await prisma.checklist.findUnique({
      where: { tripId: trip.id }
    });

    if (!checklist) {
      checklist = await prisma.checklist.create({
        data: {
          tripId: trip.id,
          userId: auth.userId,
          items: []
        }
      });
    }

    const currentItems = Array.isArray(checklist.items) ? checklist.items as any[] : [];
    const newItems = [...currentItems, ...formattedItems];

    checklist = await prisma.checklist.update({
      where: { id: checklist.id },
      data: { items: newItems }
    });

    return NextResponse.json({ success: true, data: checklist.items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
