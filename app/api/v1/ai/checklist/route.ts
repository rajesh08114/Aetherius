import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/db/redis';
import { PACKING_EXPERT_PROMPT } from '@/lib/ai/prompts';
import { aiClient } from '@/lib/ai/client';
import { extractJsonObject } from '@/lib/ai/json';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';
import Checklist from '@/lib/models/Checklist';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowed } = await checkRateLimit(`rl_ai_chk_${auth.userId}`, 20, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const { tripId } = body;

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: tripId, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await Stop.find({ tripId });
    const tripContext = `Cities: ${stops.map(s => s.cityName).join(', ')}. Month: ${new Date(trip.startDate!).toLocaleString('default', { month: 'long' })}`;

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

    const checklist = await Checklist.findOneAndUpdate(
      { tripId: trip._id },
      { $setOnInsert: { userId: auth.userId, items: [] } },
      { upsert: true, new: true }
    );

    checklist.items.push(...formattedItems);
    await checklist.save();

    return NextResponse.json({ success: true, data: checklist.items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
