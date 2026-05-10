import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Follow from '@/lib/models/Follow';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetUserId } = body;

    if (auth.userId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    await connectToDatabase();

    const existingFollow = await Follow.findOne({ followerId: auth.userId, followingId: targetUserId });

    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      return NextResponse.json({ success: true, following: false });
    } else {
      await Follow.create({ followerId: auth.userId, followingId: targetUserId });
      return NextResponse.json({ success: true, following: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
