import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  try {
    const pages = await prisma.cmsPage.findMany({
      include: {
        sections: { select: { id: true, isVisible: true } },
      },
      orderBy: { slug: 'asc' },
    });
    return NextResponse.json({ success: true, pages });
  } catch (err) {
    console.error('Admin CMS list error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
