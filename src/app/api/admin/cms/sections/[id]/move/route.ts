import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const direction: 'up' | 'down' = body.direction;
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ success: false, error: 'direction must be up or down' }, { status: 400 });
    }
    const section = await prisma.cmsSection.findUnique({ where: { id } });
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    // Find adjacent section
    const adjacent = await prisma.cmsSection.findFirst({
      where: {
        pageId: section.pageId,
        sortOrder: direction === 'up'
          ? { lt: section.sortOrder }
          : { gt: section.sortOrder },
      },
      orderBy: {
        sortOrder: direction === 'up' ? 'desc' : 'asc',
      },
    });
    if (!adjacent) {
      return NextResponse.json({ success: false, error: 'Already at boundary' }, { status: 400 });
    }
    // Swap sortOrders
    await prisma.$transaction([
      prisma.cmsSection.update({ where: { id: section.id }, data: { sortOrder: adjacent.sortOrder, updatedAt: new Date() } }),
      prisma.cmsSection.update({ where: { id: adjacent.id }, data: { sortOrder: section.sortOrder, updatedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin CMS section move error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
