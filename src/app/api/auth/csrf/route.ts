import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  // Set HttpOnly cookie containing the secret that must match the token
  response.cookies.set('csrfSecret', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return response;
}
