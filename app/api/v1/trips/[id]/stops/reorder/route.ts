import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Stop from '@/lib/models/Stop';
import Trip from '@/lib/models/Trip';
import { ReorderStopsSchema } from '@/lib/validations/trip';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { stops } = ReorderStopsSchema.parse(body);

    await connectToDatabase();
    
    // Verify trip ownership
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // Bulk update via Promise.all
    await Promise.all(
      stops.map(stop => 
        Stop.updateOne({ _id: stop.id, tripId: params.id }, { $set: { order: stop.order } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
