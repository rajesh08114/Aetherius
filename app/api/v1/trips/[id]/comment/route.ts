import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapTripComment } from '@/lib/db/mappers';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.tripComment.findMany({
      where: { tripId: params.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });

    return NextResponse.json({ success: true, data: comments.map(mapTripComment) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { content } = body;

    if (!content || content.length > 500) {
      return NextResponse.json({ error: 'Invalid comment content' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!trip || trip.visibility !== 'public') {
      return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 });
    }

    const comment = await prisma.tripComment.create({
      data: { tripId: params.id, userId: auth.userId, content },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });

    return NextResponse.json({ success: true, data: mapTripComment(comment) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
