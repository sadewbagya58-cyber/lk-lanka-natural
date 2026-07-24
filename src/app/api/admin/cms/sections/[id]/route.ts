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
    const { heading, content, sectionType, isVisible, metadata } = body;
    if (content !== undefined && (typeof content !== 'string' || content.trim().length === 0)) {
      return NextResponse.json({ success: false, error: 'Content cannot be empty' }, { status: 400 });
    }
    const existing = await prisma.cmsSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    const section = await prisma.cmsSection.update({
      where: { id },
      data: {
        heading: heading !== undefined ? (heading?.trim() || null) : existing.heading,
        content: content !== undefined ? content.trim() : existing.content,
        sectionType: sectionType || existing.sectionType,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : existing.isVisible,
        metadata: metadata !== undefined ? (metadata?.trim() || null) : existing.metadata,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, section });
  } catch (err) {
    console.error('Admin CMS section PUT error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  const { id } = await params;
  try {
    const existing = await prisma.cmsSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    await prisma.cmsSection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin CMS section DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
