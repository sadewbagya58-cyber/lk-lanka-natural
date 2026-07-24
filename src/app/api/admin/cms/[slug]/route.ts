import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  const { slug } = await params;
  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (err) {
    console.error('Admin CMS GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  const { slug } = await params;
  try {
    const body = await req.json();
    const { title, subtitle, metaTitle, status } = body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    const page = await prisma.cmsPage.upsert({
      where: { slug },
      create: {
        slug,
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        status: status || 'PUBLISHED',
      },
      update: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        status: status || 'PUBLISHED',
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, page });
  } catch (err) {
    console.error('Admin CMS PUT error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
