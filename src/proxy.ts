import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 "proxy.ts" (replaces deprecated middleware.ts)
 * Pass-through handler for server pre-processing.
 * Authentication checks are handled dynamically by NextAuth session context (useSession).
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
