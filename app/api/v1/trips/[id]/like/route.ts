import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!trip || trip.visibility !== 'public') {
      return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 });
    }

    const existingLike = await prisma.tripLike.findUnique({
      where: { userId_tripId: { userId: auth.userId, tripId: params.id } }
    });

    if (existingLike) {
      await prisma.tripLike.delete({ where: { id: existingLike.id } });
      await prisma.trip.update({ where: { id: params.id }, data: { likesCount: { decrement: 1 } } });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await prisma.tripLike.create({ data: { tripId: params.id, userId: auth.userId } });
      await prisma.trip.update({ where: { id: params.id }, data: { likesCount: { increment: 1 } } });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
