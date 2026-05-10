import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import City from '@/lib/models/City';
import { getCache, setCache } from '@/lib/db/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const region = searchParams.get('region');
    const popularity = searchParams.get('popular');

    const cacheKey = `cities:${query}:${region}:${popularity}`;
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });

    await connectToDatabase();

    const dbQuery: any = {};
    if (query) dbQuery.name = { $regex: query, $options: 'i' };
    if (region) dbQuery.region = region;

    let citiesQuery = City.find(dbQuery);
    if (popularity === 'true') {
      citiesQuery = citiesQuery.sort({ popularity: -1 }).limit(20);
    } else {
      citiesQuery = citiesQuery.limit(10);
    }

    const cities = await citiesQuery.lean();

    await setCache(cacheKey, cities, 3600 * 24); // 24h

    return NextResponse.json({ success: true, data: cities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
