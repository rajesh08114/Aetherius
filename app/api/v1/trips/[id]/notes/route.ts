import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Note from '@/lib/models/Note';
import { NoteSchema } from '@/lib/validations/note';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const notes = await Note.find({ tripId: params.id, userId: auth.userId })
      .sort({ pinned: -1, date: -1 })
      .lean();

    return NextResponse.json({ success: true, data: notes });
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

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });

    const note = await Note.create({
      tripId: params.id,
      stopId: data.stopId,
      userId: auth.userId,
      title: data.title,
      content: data.content || '',
      pinned: data.pinned || false
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

