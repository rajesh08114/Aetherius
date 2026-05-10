import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const refreshToken = cookies().get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token' }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.refreshTokenHash) {
      cookies().delete('refreshToken');
      return NextResponse.json({ success: false, error: 'Invalid user or token' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      cookies().delete('refreshToken');
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });

    return NextResponse.json({ success: true, data: { accessToken } });

  } catch (error: any) {
    cookies().delete('refreshToken');
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
