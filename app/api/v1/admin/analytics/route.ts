import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

function buildDailySeries(raw: Array<{ date: string; count: number }>, days: number) {
  const byDay = new Map(raw.map((row) => [row.date, row.count]));
  const data: Array<{ date: string; count: number }> = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = date.toISOString().slice(0, 10);
    data.push({ date: key, count: byDay.get(key) ?? 0 });
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

    const trendDays = 30;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (trendDays - 1));

    // Run all independent queries in parallel
    const [
      totalUsers,
      totalTrips,
      totalActivities,
      totalStops,
      totalLikes,
      totalComments,
      activeUsers30,
      tripsByStatus,
      viewAgg,
      recentTrips,
      recentUsers,
      topActivityTypes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.activity.count(),
      prisma.stop.count(),
      prisma.tripLike.count(),
      prisma.tripComment.count(),
      prisma.user.count({ where: { updatedAt: { gte: since } } }),
      prisma.trip.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.trip.aggregate({ _sum: { viewCount: true, forkCount: true }, _avg: { viewCount: true } }),
      prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, name: true, status: true, visibility: true, createdAt: true,
          updatedAt: true, likesCount: true, viewCount: true, forkCount: true,
          totalBudget: true, currency: true, user: { select: { name: true, email: true } }
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, followersCount: true, followingCount: true }
      }),
      prisma.activity.groupBy({
        by: ['type'],
        _count: { _all: true },
        _avg: { cost: true }
      }),
    ]);

    // Date-bucketed trend queries (requires raw SQL for date truncation)
    type DayRow = { date: string; count: bigint };
    const [tripsTrendRaw, usersTrendRaw, topCitiesRaw] = await Promise.all([
      prisma.$queryRaw<DayRow[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
        FROM "Trip"
        WHERE "createdAt" >= ${since}
        GROUP BY date ORDER BY date ASC`,
      prisma.$queryRaw<DayRow[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" >= ${since}
        GROUP BY date ORDER BY date ASC`,
      prisma.$queryRaw<{ cityName: string; country: string; stopsCount: number; tripsCount: number }[]>`
        SELECT "cityName", country,
               COUNT(*)::int AS "stopsCount",
               COUNT(DISTINCT "tripId")::int AS "tripsCount"
        FROM "Stop"
        GROUP BY "cityName", country
        ORDER BY "tripsCount" DESC, "stopsCount" DESC
        LIMIT 8`,
    ]);

    // Trip counts per user for recent users table
    const userIds = recentUsers.map((u: { id: any; }) => u.id);
    const tripCountsRaw = userIds.length
      ? await prisma.trip.groupBy({ by: ['userId'], where: { userId: { in: userIds } }, _count: { _all: true } })
      : [];
    const tripCountsByUser = new Map(tripCountsRaw.map((r: { userId: any; _count: { _all: any; }; }) => [r.userId, r._count._all]));

    // Shape response
    const tripStatusDistribution = ['planning', 'ongoing', 'completed'].map(status => {
      const found = tripsByStatus.find((r: { status: string; }) => r.status === status);
      return { status, count: found?._count._all ?? 0 };
    });

    const tripCreationTrend = buildDailySeries(
      tripsTrendRaw.map((r: { date: any; count: any; }) => ({ date: r.date, count: Number(r.count) })),
      trendDays
    );
    const userGrowthTrend = buildDailySeries(
      usersTrendRaw.map((r: { date: any; count: any; }) => ({ date: r.date, count: Number(r.count) })),
      trendDays
    );

    const topActivities = topActivityTypes.map((r: { type: any; _count: { _all: any; }; _avg: { cost: any; }; }) => ({
      type: r.type,
      count: r._count._all,
      avgCost: Math.round((r._avg.cost ?? 0) * 100) / 100
    }));

    const data = {
      overview: {
        totalUsers,
        totalTrips,
        totalActivities,
        totalStops,
        activeUsers30,
        engagement: {
          totalLikes,
          totalComments,
          totalViews: viewAgg._sum.viewCount ?? 0,
          totalForks: viewAgg._sum.forkCount ?? 0,
          avgViewsPerTrip: Number((viewAgg._avg.viewCount ?? 0).toFixed(2))
        }
      },
      tripStatusDistribution,
      tripCreationTrend,
      userGrowthTrend,
      topCities: topCitiesRaw,
      topActivities,
      recentTrips: recentTrips.map((trip: { id: any; name: any; status: any; visibility: any; createdAt: any; updatedAt: any; likesCount: any; viewCount: any; forkCount: any; totalBudget: any; currency: any; user: { name: any; email: any; }; }) => ({
        _id: trip.id,
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
        ownerName: trip.user?.name ?? 'Unknown',
        ownerEmail: trip.user?.email ?? ''
      })),
      users: recentUsers.map((u: { id: unknown; name: any; email: any; role: any; createdAt: any; updatedAt: any; followersCount: any; followingCount: any; }) => ({
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        followersCount: u.followersCount ?? 0,
        followingCount: u.followingCount ?? 0,
        tripsCount: tripCountsByUser.get(u.id) ?? 0
      }))
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load admin analytics.' }, { status: 500 });
  }
}
