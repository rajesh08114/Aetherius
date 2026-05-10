import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import TripLike from '@/lib/models/TripLike';
import Trip from '@/lib/models/Trip';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const trip = await Trip.findById(params.id);
    if (!trip || trip.visibility !== 'public') {
      return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 });
    }

    const existingLike = await TripLike.findOne({ tripId: params.id, userId: auth.userId });

    if (existingLike) {
      await TripLike.deleteOne({ _id: existingLike._id });
      await Trip.findByIdAndUpdate(params.id, { $inc: { likesCount: -1 } });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await TripLike.create({ tripId: params.id, userId: auth.userId });
      await Trip.findByIdAndUpdate(params.id, { $inc: { likesCount: 1 } });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
