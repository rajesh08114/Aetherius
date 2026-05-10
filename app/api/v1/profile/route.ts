import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { UpdateProfileSchema } from '@/lib/validations/profile';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(auth.userId).select('-passwordHash -refreshTokenHash');
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
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

    await connectToDatabase();

    if (data.email) {
      const existing = await User.findOne({ email: data.email, _id: { $ne: auth.userId } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      }
    }

    const updated = await User.findByIdAndUpdate(
      auth.userId,
      { $set: data },
      { new: true }
    ).select('-passwordHash -refreshTokenHash');

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

