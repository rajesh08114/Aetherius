import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Stop from '@/lib/models/Stop';
import Trip from '@/lib/models/Trip';
import Activity from '@/lib/models/Activity';
import { UpdateStopSchema } from '@/lib/validations/trip';

export async function PUT(req: Request, { params }: { params: { id: string, stopId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = UpdateStopSchema.parse(body);

    await connectToDatabase();
    
    // Verify trip ownership
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stop = await Stop.findOneAndUpdate(
      { _id: params.stopId, tripId: params.id },
      { $set: data },
      { new: true }
    );

    if (!stop) return NextResponse.json({ error: 'Stop not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: stop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string, stopId: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stop = await Stop.findOneAndDelete({ _id: params.stopId, tripId: params.id });
    if (!stop) return NextResponse.json({ error: 'Stop not found' }, { status: 404 });

    await Activity.deleteMany({ stopId: stop._id });
    await Trip.findByIdAndUpdate(trip._id, { $pull: { stops: stop._id } });

    // Reindex remaining stops
    const remainingStops = await Stop.find({ tripId: params.id }).sort({ order: 1 });
    await Promise.all(remainingStops.map((s, idx) => 
      Stop.findByIdAndUpdate(s._id, { order: idx + 1 })
    ));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
