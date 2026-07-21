import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 "proxy.ts" (replaces deprecated middleware.ts)
 * Runs code on the server before requests are completed.
 * Protects client-side user account pages by redirecting to /login if no session token is active.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/account')) {
    // Check for active NextAuth session token cookie (standard or __Secure-)
    const hasSessionToken = request.cookies.getAll().some(
      (c) => c.name.includes('session-token')
    );

    if (!hasSessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
  ],
};
