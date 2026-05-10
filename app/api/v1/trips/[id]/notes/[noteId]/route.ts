import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Note from '@/lib/models/Note';
import { NoteSchema } from '@/lib/validations/note';

export async function PUT(req: Request, { params }: { params: { id: string; noteId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = NoteSchema.partial().parse(body);

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const note = await Note.findOneAndUpdate(
      { _id: params.noteId, tripId: params.id, userId: auth.userId },
      { $set: data },
      { new: true }
    );
    if (!note) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: note });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; noteId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const deleted = await Note.findOneAndDelete({ _id: params.noteId, tripId: params.id, userId: auth.userId });
    if (!deleted) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

