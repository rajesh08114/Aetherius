import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { mapUser } from '@/lib/db/mappers';
import { UpdateProfileSchema } from '@/lib/validations/profile';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      omit: { passwordHash: true, refreshTokenHash: true }
    });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: mapUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = UpdateProfileSchema.parse(body);

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: auth.userId } }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data,
      omit: { passwordHash: true, refreshTokenHash: true }
    });

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: mapUser(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

