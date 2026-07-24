import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  try {
    const items = await prisma.faqItem.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('Admin FAQ GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }
  try {
    const body = await req.json();
    const { question, answer, category } = body;
    if (!question?.trim()) {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }
    if (!answer?.trim()) {
      return NextResponse.json({ success: false, error: 'Answer is required' }, { status: 400 });
    }
    const maxItem = await prisma.faqItem.findFirst({
      where: { category: category || 'General' },
      orderBy: { sortOrder: 'desc' },
    });
    const nextSortOrder = maxItem ? maxItem.sortOrder + 1 : 0;
    const item = await prisma.faqItem.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || 'General',
        sortOrder: nextSortOrder,
        isVisible: true,
      },
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err) {
    console.error('Admin FAQ POST error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
