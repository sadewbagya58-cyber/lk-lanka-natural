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
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, sections: page.sections });
  } catch (err) {
    console.error('Admin CMS sections GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const { heading, content, sectionType, metadata } = body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    // Get the next sort order
    const maxSection = await prisma.cmsSection.findFirst({
      where: { pageId: page.id },
      orderBy: { sortOrder: 'desc' },
    });
    const nextSortOrder = maxSection ? maxSection.sortOrder + 1 : 0;
    const section = await prisma.cmsSection.create({
      data: {
        pageId: page.id,
        heading: heading?.trim() || null,
        content: content.trim(),
        sectionType: sectionType || 'content',
        sortOrder: nextSortOrder,
        isVisible: true,
        metadata: metadata?.trim() || null,
      },
    });
    return NextResponse.json({ success: true, section }, { status: 201 });
  } catch (err) {
    console.error('Admin CMS sections POST error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
