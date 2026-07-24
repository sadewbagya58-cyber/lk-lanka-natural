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
    const item = await prisma.faqItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'FAQ item not found' }, { status: 404 });
    }
    const adjacent = await prisma.faqItem.findFirst({
      where: {
        category: item.category,
        sortOrder: direction === 'up'
          ? { lt: item.sortOrder }
          : { gt: item.sortOrder },
      },
      orderBy: {
        sortOrder: direction === 'up' ? 'desc' : 'asc',
      },
    });
    if (!adjacent) {
      return NextResponse.json({ success: false, error: 'Already at boundary' }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.faqItem.update({ where: { id: item.id }, data: { sortOrder: adjacent.sortOrder, updatedAt: new Date() } }),
      prisma.faqItem.update({ where: { id: adjacent.id }, data: { sortOrder: item.sortOrder, updatedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin FAQ move error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
