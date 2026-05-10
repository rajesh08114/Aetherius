import { verifyAccessToken } from './jwt';
import { isTokenBlacklisted } from '../db/redis';

export async function verifyAuth(request: Request): Promise<{ userId: string; role: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    
    // Check if token is blacklisted in Redis
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
