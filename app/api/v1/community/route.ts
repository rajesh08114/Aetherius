import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapTrip } from '@/lib/db/mappers';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const skip = (page - 1) * limit;
    const orderBy: any = sort === 'popular'
      ? [{ likesCount: 'desc' }, { createdAt: 'desc' }]
      : { createdAt: 'desc' };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: { visibility: 'public' },
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, avatar: true } } }
      }),
      prisma.trip.count({ where: { visibility: 'public' } })
    ]);

    let likedTripIds = new Set<string>();
    if (auth) {
      const tripIds = trips.map((t: { id: any; }) => t.id);
      const userLikes = await prisma.tripLike.findMany({
        where: { userId: auth.userId, tripId: { in: tripIds } }
      });
      likedTripIds = new Set(userLikes.map((l: { tripId: any; }) => l.tripId));
    }

    const data = trips.map((t: any) => ({
      ...mapTrip(t),
      author: t.user,
      isLiked: likedTripIds.has(t.id)
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
