import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import City from '@/lib/models/City';
import { getCache, setCache } from '@/lib/db/redis';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cacheKey = `city:${params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });

    await connectToDatabase();
    const city = await City.findById(params.id).lean();
    if (!city) return NextResponse.json({ error: 'City not found' }, { status: 404 });

    await setCache(cacheKey, city, 3600 * 24); // 24h

    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
