import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { mapCity } from '@/lib/db/mappers';
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

    const where: any = {};
    if (query) where.name = { contains: query, mode: 'insensitive' };
    if (region) where.region = region;

    const cities = await prisma.city.findMany({
      where,
      orderBy: popularity === 'true' ? { popularity: 'desc' } : undefined,
      take: popularity === 'true' ? 20 : 10,
    });

    const mapped = cities.map(mapCity);
    await setCache(cacheKey, mapped, 3600 * 24); // 24h

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
