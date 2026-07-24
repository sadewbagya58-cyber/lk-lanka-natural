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
    const { question, answer, category, isVisible } = body;
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'FAQ item not found' }, { status: 404 });
    }
    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        question: question?.trim() || existing.question,
        answer: answer?.trim() || existing.answer,
        category: category?.trim() || existing.category,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : existing.isVisible,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error('Admin FAQ PUT error:', err);
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
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'FAQ item not found' }, { status: 404 });
    }
    await prisma.faqItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin FAQ DELETE error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
