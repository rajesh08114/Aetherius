import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Activity from '@/lib/models/Activity';
import { CreateActivitySchema } from '@/lib/validations/trip';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stopId = searchParams.get('stopId');
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const maxCost = searchParams.get('maxCost');
    const maxDuration = searchParams.get('maxDuration');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    const query: any = {};
    if (stopId) query.stopId = stopId;
    if (type) query.type = type;
    if (q) query.name = { $regex: q, $options: 'i' };
    if (maxCost) query.cost = { ...(query.cost || {}), $lte: Number(maxCost) };
    if (maxDuration) query.duration = { ...(query.duration || {}), $lte: Number(maxDuration) };

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find(query).skip(skip).limit(limit).lean(),
      Activity.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateActivitySchema.parse(body.activity);
    const stopId = body.stopId;
    const tripId = body.tripId;

    await connectToDatabase();

    const activity = await Activity.create({
      ...data,
      stopId,
      tripId
    });

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
