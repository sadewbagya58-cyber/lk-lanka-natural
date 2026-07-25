import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error('Admin reviews GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
