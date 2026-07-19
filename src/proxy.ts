import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 "proxy.ts" (replaces deprecated middleware.ts)
 * Runs code on the server before requests are completed.
 * Protects client-side user account pages by redirecting to /login if no session token is active.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/account')) {
    // NextAuth session token cookie keys
    const sessionToken = 
      request.cookies.get('next-auth.session-token')?.value || 
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
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
