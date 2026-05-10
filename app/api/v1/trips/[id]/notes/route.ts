import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapNote } from '@/lib/db/mappers';
import { NoteSchema } from '@/lib/validations/note';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const notes = await prisma.note.findMany({
      where: { tripId: params.id, userId: auth.userId },
      orderBy: [{ pinned: 'desc' }, { date: 'desc' }]
    });

    return NextResponse.json({ success: true, data: notes.map(mapNote) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = NoteSchema.parse(body);

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const note = await prisma.note.create({
      data: {
        tripId: params.id,
        stopId: data.stopId || null,
        userId: auth.userId,
        title: data.title,
        content: data.content || '',
        pinned: data.pinned || false
      }
    });

    return NextResponse.json({ success: true, data: mapNote(note) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
