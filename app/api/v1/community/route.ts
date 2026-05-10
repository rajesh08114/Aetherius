import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';
import TripLike from '@/lib/models/TripLike';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    // Let unauthenticated users view public feed too, just don't personalize it
    
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent'; // recent or popular
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    await connectToDatabase();

    const query = { visibility: 'public' };
    const skip = (page - 1) * limit;
    
    let sortConfig: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortConfig = { likesCount: -1, createdAt: -1 };
    }

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar')
        .lean(),
      Trip.countDocuments(query)
    ]);

    // If authenticated, get liked status
    if (auth) {
      const tripIds = trips.map(t => t._id);
      const userLikes = await TripLike.find({ userId: auth.userId, tripId: { $in: tripIds } }).lean();
      const likedTripIds = new Set(userLikes.map(l => l.tripId.toString()));
      
      trips.forEach((t: any) => {
        t.isLiked = likedTripIds.has(t._id.toString());
      });
    }

    return NextResponse.json({
      success: true,
      data: trips,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
