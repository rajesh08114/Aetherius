import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await prisma.stop.findMany({
      where: { tripId: params.id },
      include: { activities: true }
    });

    let transportTotal = 0;
    let accommodationTotal = 0;
    let activitiesTotal = 0;
    let mealsTotal = 0;

    for (const stop of stops) {
      const transport = stop.transportTo as { cost?: number } | null;
      const accommodation = stop.accommodation as { cost?: number } | null;

      const arrivalDate = stop.arrivalDate ? new Date(stop.arrivalDate) : null;
      const departureDate = stop.departureDate ? new Date(stop.departureDate) : null;
      const nights = arrivalDate && departureDate
        ? Math.ceil(Math.abs(departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
        : 1;

      if (transport?.cost) transportTotal += transport.cost;
      if (accommodation?.cost) accommodationTotal += accommodation.cost * nights;

      // Rough estimate for meals based on $40/day
      mealsTotal += 40 * nights;

      for (const act of stop.activities) {
        if (act.cost) activitiesTotal += act.cost;
      }
    }

    const totalEstimated = transportTotal + accommodationTotal + activitiesTotal + mealsTotal;
    const percentUsed = trip.totalBudget ? (totalEstimated / trip.totalBudget) * 100 : 0;

    // By day estimation
    const current = trip.startDate ? new Date(trip.startDate) : new Date();
    const end = trip.endDate ? new Date(trip.endDate) : new Date();
    const tripDays = Math.ceil(Math.abs(end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const dailyLimit = trip.totalBudget ? trip.totalBudget / tripDays : 0;
    const avgDailyCost = totalEstimated / tripDays;

    const byDay = [];
    const overBudgetDays = [];
    for (let i = 0; i < tripDays; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      byDay.push({ date: d, cost: avgDailyCost });
      if (avgDailyCost > dailyLimit) {
        overBudgetDays.push({ date: d, cost: avgDailyCost });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalEstimated,
        breakdown: {
          transport: transportTotal,
          accommodation: accommodationTotal,
          activities: activitiesTotal,
          meals: mealsTotal
        },
        byDay,
        overBudgetDays,
        percentUsed,
        currency: trip.currency,
        budgetLimit: trip.totalBudget
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
