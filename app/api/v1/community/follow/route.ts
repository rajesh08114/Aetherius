import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetUserId } = body;

    if (auth.userId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: auth.userId, followingId: targetUserId } }
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return NextResponse.json({ success: true, following: false });
    } else {
      await prisma.follow.create({ data: { followerId: auth.userId, followingId: targetUserId } });
      return NextResponse.json({ success: true, following: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
