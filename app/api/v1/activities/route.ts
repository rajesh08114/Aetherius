import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapActivity } from '@/lib/db/mappers';
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

    const where: any = {};
    if (stopId) where.stopId = stopId;
    if (type) where.type = type;
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (maxCost) where.cost = { lte: Number(maxCost) };
    if (maxDuration) where.duration = { lte: Number(maxDuration) };

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({ where, skip, take: limit }),
      prisma.activity.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: activities.map(mapActivity),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
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

    const activity = await prisma.activity.create({
      data: { ...data, stopId, tripId }
    });

    return NextResponse.json({ success: true, data: mapActivity(activity) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
