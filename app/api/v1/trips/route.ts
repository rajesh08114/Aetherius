import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { fromDbVisibility, mapTrip, toDbVisibility } from '@/lib/db/mappers';
import { CreateTripSchema } from '@/lib/validations/trip';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = { userId: auth.userId };
    if (status && status !== 'all') where.status = status;

    const orderBy: any =
      sort === 'startDate'
        ? { startDate: 'asc' }
        : sort === 'budget'
          ? { totalBudget: 'desc' }
          : { createdAt: 'desc' };

    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          stops: {
            select: { id: true }
          }
        }
      }),
      prisma.trip.count({ where })
    ]);

    const mappedTrips = trips.map((trip: any) => ({
      ...mapTrip(trip),
      stops: trip.stops.map((s: any) => ({ _id: s.id }))
    }));

    return NextResponse.json({
      success: true,
      data: mappedTrips,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateTripSchema.parse(body);

    const shareToken = crypto.randomBytes(32).toString('hex');

    const trip = await prisma.trip.create({
      data: {
        name: data.name,
        description: data.description,
        coverPhoto: data.coverPhoto,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        totalBudget: data.totalBudget ?? null,
        currency: data.currency ?? 'USD',
        visibility: toDbVisibility(data.visibility) || 'private',
        userId: auth.userId,
        shareToken
      },
      include: {
        stops: true
      }
    });

    return NextResponse.json({ success: true, data: mapTrip({ ...trip, visibility: fromDbVisibility(trip.visibility) }) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
