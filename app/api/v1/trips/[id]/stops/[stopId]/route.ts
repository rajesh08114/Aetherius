import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapStop } from '@/lib/db/mappers';
import { UpdateStopSchema } from '@/lib/validations/trip';

export async function PUT(req: Request, { params }: { params: { id: string; stopId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = UpdateStopSchema.parse(body);

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stop = await prisma.stop.update({
      where: { id: params.stopId },
      data,
      include: { activities: true }
    });

    return NextResponse.json({ success: true, data: mapStop(stop) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; stopId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // Cascade delete handled by schema (onDelete: Cascade on activities)
    await prisma.stop.delete({ where: { id: params.stopId } });

    // Reindex remaining stops
    const remainingStops = await prisma.stop.findMany({
      where: { tripId: params.id },
      orderBy: { order: 'asc' }
    });

    await prisma.$transaction(
      remainingStops.map((s, idx) =>
        prisma.stop.update({ where: { id: s.id }, data: { order: idx + 1 } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
