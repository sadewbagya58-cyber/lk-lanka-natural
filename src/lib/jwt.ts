import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role?: string;
  phone?: string | null;
}

export function signJwt(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
