import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { blacklistToken } from '@/lib/db/redis';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader!.split(' ')[1];

    // TTL 15 minutes in seconds
    await blacklistToken(token, 15 * 60);

    cookies().delete('refreshToken');

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
