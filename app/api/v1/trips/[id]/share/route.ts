import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const visibility = body.visibility;

    if (!['private', 'link-only', 'public'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });
    }

    await connectToDatabase();
    
    const trip = await Trip.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: { visibility } },
      { new: true }
    );

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${trip.shareToken}`;

    return NextResponse.json({ success: true, data: { shareUrl, visibility: trip.visibility } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
