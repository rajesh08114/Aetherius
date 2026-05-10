import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

export function signAccessToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, accessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { userId: string; role: string } {
  return jwt.verify(token, accessSecret) as { userId: string; role: string };
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, refreshSecret) as { userId: string };
}
