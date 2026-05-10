import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import TripComment from '@/lib/models/TripComment';
import Trip from '@/lib/models/Trip';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const comments = await TripComment.find({ tripId: params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar')
      .lean();
    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { content } = body;

    if (!content || content.length > 500) {
      return NextResponse.json({ error: 'Invalid comment content' }, { status: 400 });
    }

    await connectToDatabase();
    
    const trip = await Trip.findById(params.id);
    if (!trip || trip.visibility !== 'public') {
      return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 });
    }

    const comment = await TripComment.create({
      tripId: params.id,
      userId: auth.userId,
      content
    });

    await Trip.findByIdAndUpdate(params.id, { $inc: { commentsCount: 1 } });

    const populatedComment = await TripComment.findById(comment._id).populate('userId', 'name avatar').lean();

    return NextResponse.json({ success: true, data: populatedComment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
