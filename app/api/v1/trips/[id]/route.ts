import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapTrip, toDbVisibility } from '@/lib/db/mappers';
import { UpdateTripSchema } from '@/lib/validations/trip';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId: auth.userId },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              orderBy: { scheduledTime: 'asc' }
            }
          }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: mapTrip(trip) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = UpdateTripSchema.parse(body);

    const existingTrip = await prisma.trip.findFirst({
      where: { id: params.id, userId: auth.userId },
      select: { id: true }
    });
    if (!existingTrip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.coverPhoto !== undefined) updateData.coverPhoto = data.coverPhoto;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.totalBudget !== undefined) updateData.totalBudget = data.totalBudget;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.visibility !== undefined) updateData.visibility = toDbVisibility(data.visibility);

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: { activities: true }
        },
        collaborators: true
      }
    });

    return NextResponse.json({ success: true, data: mapTrip(trip) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId: auth.userId },
      select: { id: true }
    });
    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.trip.delete({ where: { id: trip.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
