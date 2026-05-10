import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import Trip from '@/lib/models/Trip';
import Stop from '@/lib/models/Stop';
import Activity from '@/lib/models/Activity';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const trip = await Trip.findOne({ _id: params.id, userId: auth.userId });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const stops = await Stop.find({ tripId: params.id });
    const activities = await Activity.find({ tripId: params.id });

    let transportTotal = 0;
    let accommodationTotal = 0;
    let activitiesTotal = 0;
    let mealsTotal = 0;

    for (const stop of stops) {
      if (stop.transportTo?.cost) transportTotal += stop.transportTo.cost;
      if (stop.accommodation?.cost) accommodationTotal += (stop.accommodation.cost * (stop.nights || 1));
      
      // Rough estimate for meals based on a mid-tier fallback of $40 per day if no city data
      mealsTotal += 40 * (stop.nights || 1);
    }

    for (const act of activities) {
      if (act.cost) activitiesTotal += act.cost;
    }

    const totalEstimated = transportTotal + accommodationTotal + activitiesTotal + mealsTotal;
    const percentUsed = trip.totalBudget ? (totalEstimated / trip.totalBudget) * 100 : 0;

    // By day estimation
    const byDay = [];
    let current = trip.startDate ? new Date(trip.startDate) : new Date();
    const end = trip.endDate ? new Date(trip.endDate) : new Date();
    const tripDays = Math.ceil(Math.abs(end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const dailyLimit = trip.totalBudget ? trip.totalBudget / tripDays : 0;

    const overBudgetDays = [];
    const avgDailyCost = totalEstimated / tripDays;

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
