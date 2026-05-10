import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';
import { CreateStopSchema } from '@/lib/validations/trip';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const stops = await Stop.find({ tripId: params.id }).sort({ order: 1 });
    return NextResponse.json({ success: true, data: stops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateStopSchema.parse(body);

    await connectToDatabase();

    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const lastStop = await Stop.findOne({ tripId: trip._id }).sort({ order: -1 });
    const order = lastStop ? lastStop.order + 1 : 1;

    const stop = await Stop.create({
      ...data,
      tripId: trip._id,
      order,
      activities: []
    });

    await Trip.findByIdAndUpdate(trip._id, { $push: { stops: stop._id } });

    return NextResponse.json({ success: true, data: stop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
