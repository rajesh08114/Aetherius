import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';
import Activity from '@/lib/models/Activity';
import Checklist from '@/lib/models/Checklist';
import Note from '@/lib/models/Note';
import TripLike from '@/lib/models/TripLike';
import TripComment from '@/lib/models/TripComment';
import { UpdateTripSchema } from '@/lib/validations/trip';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId })
      .populate({ path: 'stops', options: { sort: { order: 1 } } })
      .lean();

    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = UpdateTripSchema.parse(body);

    await connectToDatabase();
    const trip = await Trip.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: data },
      { new: true }
    );

    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cascade delete
    await Promise.all([
      Stop.deleteMany({ tripId: trip._id }),
      Activity.deleteMany({ tripId: trip._id }),
      Checklist.deleteMany({ tripId: trip._id }),
      Note.deleteMany({ tripId: trip._id }),
      TripLike.deleteMany({ tripId: trip._id }),
      TripComment.deleteMany({ tripId: trip._id }),
      Trip.deleteOne({ _id: trip._id })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
