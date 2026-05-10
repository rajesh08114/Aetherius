import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { RegisterSchema } from '@/lib/validations/auth';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const validatedData = RegisterSchema.parse(body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash
    });

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.refreshTokenHash;

    return NextResponse.json({ success: true, data: { user: userObj, accessToken } });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
