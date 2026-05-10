import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapNote } from '@/lib/db/mappers';
import { NoteSchema } from '@/lib/validations/note';

export async function PUT(req: Request, { params }: { params: { id: string; noteId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = NoteSchema.partial().parse(body);

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const existing = await prisma.note.findFirst({
      where: { id: params.noteId, tripId: params.id, userId: auth.userId }
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });

    const note = await prisma.note.update({
      where: { id: params.noteId },
      data
    });

    return NextResponse.json({ success: true, data: mapNote(note) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; noteId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const existing = await prisma.note.findFirst({
      where: { id: params.noteId, tripId: params.id, userId: auth.userId }
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });

    await prisma.note.delete({ where: { id: params.noteId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
