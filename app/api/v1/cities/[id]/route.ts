import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { mapCity } from '@/lib/db/mappers';
import { getCache, setCache } from '@/lib/db/redis';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cacheKey = `city:${params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });

    const city = await prisma.city.findUnique({ where: { id: params.id } });
    if (!city) return NextResponse.json({ error: 'City not found' }, { status: 404 });

    const mapped = mapCity(city);
    await setCache(cacheKey, mapped, 3600 * 24); // 24h

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
