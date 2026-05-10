import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { calculateCarbonKg, getCarbonGrade, getGreenAlternative } from '@/lib/carbon/calculator';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    if (!tripId) return NextResponse.json({ error: 'Missing tripId' }, { status: 400 });

    const stops = await prisma.stop.findMany({
      where: { tripId },
      orderBy: { order: 'asc' }
    });

    let totalCarbon = 0;
    const breakdown = stops.map(s => {
      const transport = s.transportTo as { mode?: string; distanceKm?: number } | null;
      const mode = transport?.mode || 'flight';
      const distance = transport?.distanceKm || 0;
      const kg = s.carbonKg || calculateCarbonKg(mode as any, distance);
      totalCarbon += kg;

      return {
        stopId: s.id,
        cityName: s.cityName,
        mode,
        distance,
        kg,
        alternative: getGreenAlternative(mode as any, distance)
      };
    });

    const grade = getCarbonGrade(totalCarbon);

    return NextResponse.json({
      success: true,
      data: {
        totalCarbon,
        grade,
        breakdown,
        offsetCostEstUSD: Math.round(totalCarbon * 0.015) // Rough offset est: $15 per ton
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
