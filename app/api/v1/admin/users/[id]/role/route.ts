import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';

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

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid user id.' }, { status: 400 });
    }

    const body = await req.json();
    const { role } = UpdateRoleSchema.parse(body);

    await connectToDatabase();

    const targetUser = (await User.findById(params.id).select('_id role email')) as any;
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (String(targetUser._id) === auth.userId && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'You cannot demote your own admin account.' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true, runValidators: true }
    ).select('_id name email role updatedAt');

    return NextResponse.json({
      success: true,
      data: {
        _id: String(updated?._id),
        name: updated?.name,
        email: updated?.email,
        role: updated?.role,
        updatedAt: updated?.updatedAt
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update user role.' }, { status: 400 });
  }
}
