import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';

const UpdateRoleSchema = z.object({
  role: z.enum(['user', 'admin'])
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { role } = UpdateRoleSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, email: true }
    });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (targetUser.id === auth.userId && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'You cannot demote your own admin account.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: role as UserRole },
      select: { id: true, name: true, email: true, role: true, updatedAt: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update user role.' }, { status: 400 });
  }
}
