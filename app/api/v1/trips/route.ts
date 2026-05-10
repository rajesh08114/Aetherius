import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
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

    await connectToDatabase();

    const query: any = { userId: auth.userId };
    if (status && status !== 'all') query.status = status;

    const sortConfig: any = {};
    if (sort === 'createdAt') sortConfig.createdAt = -1;
    else if (sort === 'startDate') sortConfig.startDate = 1;
    else if (sort === 'budget') sortConfig.totalBudget = -1;

    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      Trip.find(query).sort(sortConfig).skip(skip).limit(limit).lean(),
      Trip.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: trips,
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

    await connectToDatabase();

    const shareToken = crypto.randomBytes(32).toString('hex');

    const trip = await Trip.create({
      ...data,
      userId: auth.userId,
      shareToken,
      stops: [],
      collaborators: []
    });

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
