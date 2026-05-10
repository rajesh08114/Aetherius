import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';
import Activity from '@/lib/models/Activity';
import TripLike from '@/lib/models/TripLike';
import TripComment from '@/lib/models/TripComment';

function buildDailySeries(raw: Array<{ _id: string; count: number }>, days: number) {
  const byDay = new Map(raw.map((row) => [row._id, row.count]));
  const data: Array<{ date: string; count: number }> = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = date.toISOString().slice(0, 10);
    data.push({
      date: key,
      count: byDay.get(key) ?? 0
    });
  }

  return data;
}

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const trendDays = 30;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (trendDays - 1));

    const [
      totalUsers,
      totalTrips,
      totalActivities,
      totalLikes,
      totalComments,
      tripsByStatusRaw,
      tripsTrendRaw,
      usersTrendRaw,
      topCities,
      topActivities,
      viewAgg,
      recentTrips,
      recentUsers,
      activeUsers30
    ] = await Promise.all([
      User.countDocuments({}),
      Trip.countDocuments({}),
      Activity.countDocuments({}),
      TripLike.countDocuments({}),
      TripComment.countDocuments({}),
      Trip.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
      ]),
      Trip.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Stop.aggregate([
        {
          $group: {
            _id: {
              cityName: { $ifNull: ['$cityName', 'Unknown City'] },
              country: { $ifNull: ['$country', 'Unknown'] }
            },
            stopsCount: { $sum: 1 },
            tripIds: { $addToSet: '$tripId' }
          }
        },
        {
          $project: {
            _id: 0,
            cityName: '$_id.cityName',
            country: '$_id.country',
            stopsCount: 1,
            tripsCount: { $size: '$tripIds' }
          }
        },
        { $sort: { tripsCount: -1, stopsCount: -1 } },
        { $limit: 8 }
      ]),
      Activity.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgCost: { $avg: '$cost' }
          }
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            count: 1,
            avgCost: { $round: ['$avgCost', 2] }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Trip.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$viewCount' },
            avgViewsPerTrip: { $avg: '$viewCount' },
            totalForks: { $sum: '$forkCount' }
          }
        }
      ]),
      Trip.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('name status visibility createdAt updatedAt likesCount viewCount forkCount totalBudget currency userId')
        .lean(),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(25)
        .select('name email role createdAt updatedAt followersCount followingCount')
        .lean(),
      User.countDocuments({ updatedAt: { $gte: since } })
    ]);

    const userIds = recentUsers.map((u: any) => u._id);
    const tripCountsRaw = userIds.length
      ? await Trip.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } }
        ])
      : [];

    const tripCountsByUser = new Map(tripCountsRaw.map((row: any) => [String(row._id), row.count]));

    const users = recentUsers.map((u: any) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      followersCount: u.followersCount ?? 0,
      followingCount: u.followingCount ?? 0,
      tripsCount: tripCountsByUser.get(String(u._id)) ?? 0
    }));

    const viewSummary = viewAgg[0] || { totalViews: 0, avgViewsPerTrip: 0, totalForks: 0 };
    const tripStatusDistribution = [
      { status: 'planning', count: 0 },
      { status: 'ongoing', count: 0 },
      { status: 'completed', count: 0 }
    ].map((base) => {
      const found = tripsByStatusRaw.find((item: any) => item.status === base.status);
      return { ...base, count: found?.count ?? 0 };
    });

    const data = {
      overview: {
        totalUsers,
        totalTrips,
        totalActivities,
        totalStops: await Stop.countDocuments({}),
        activeUsers30,
        engagement: {
          totalLikes,
          totalComments,
          totalViews: viewSummary.totalViews ?? 0,
          totalForks: viewSummary.totalForks ?? 0,
          avgViewsPerTrip: Number((viewSummary.avgViewsPerTrip ?? 0).toFixed(2))
        }
      },
      tripStatusDistribution,
      tripCreationTrend: buildDailySeries(tripsTrendRaw as Array<{ _id: string; count: number }>, trendDays),
      userGrowthTrend: buildDailySeries(usersTrendRaw as Array<{ _id: string; count: number }>, trendDays),
      topCities,
      topActivities,
      recentTrips: recentTrips.map((trip: any) => ({
        _id: String(trip._id),
        name: trip.name,
        status: trip.status,
        visibility: trip.visibility,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        likesCount: trip.likesCount ?? 0,
        viewCount: trip.viewCount ?? 0,
        forkCount: trip.forkCount ?? 0,
        totalBudget: trip.totalBudget ?? null,
        currency: trip.currency ?? 'USD',
        ownerName: trip.userId?.name ?? 'Unknown',
        ownerEmail: trip.userId?.email ?? ''
      })),
      users
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load admin analytics.' }, { status: 500 });
  }
}
