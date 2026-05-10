import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { toDbVisibility, fromDbVisibility } from '@/lib/db/mappers';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const visibility = body.visibility;

    if (!['private', 'link-only', 'public'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });
    }

    const dbVisibility = toDbVisibility(visibility);
    if (!dbVisibility) return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });

    const existing = await prisma.trip.findFirst({ where: { id: params.id, userId: auth.userId } });
    if (!existing) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: { visibility: dbVisibility }
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${trip.shareToken}`;

    return NextResponse.json({ success: true, data: { shareUrl, visibility: fromDbVisibility(trip.visibility) } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
