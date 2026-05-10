import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapStop } from '@/lib/db/mappers';
import { CreateStopSchema } from '@/lib/validations/trip';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const stops = await prisma.stop.findMany({
      where: { tripId: params.id },
      orderBy: { order: 'asc' },
      include: { activities: true }
    });

    return NextResponse.json({ success: true, data: stops.map(mapStop) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateStopSchema.parse(body);

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const lastStop = await prisma.stop.findFirst({
      where: { tripId: trip.id },
      orderBy: { order: 'desc' }
    });
    const order = lastStop ? lastStop.order + 1 : 1;

    const stop = await prisma.stop.create({
      data: { ...data, tripId: trip.id, order },
      include: { activities: true }
    });

    return NextResponse.json({ success: true, data: mapStop(stop) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
