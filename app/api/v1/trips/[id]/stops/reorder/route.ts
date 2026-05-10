import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { ReorderStopsSchema } from '@/lib/validations/trip';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { stops } = ReorderStopsSchema.parse(body);

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // Bulk update in a transaction
    await prisma.$transaction(
      stops.map(stop =>
        prisma.stop.update({
          where: { id: stop.id },
          data: { order: stop.order }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
