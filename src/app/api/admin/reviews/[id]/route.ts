import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function recalculateProductRating(productId: string) {
  try {
    const approvedReviews = await prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      select: { rating: true }
    });
    const count = approvedReviews.length;
    const sum = approvedReviews.reduce((s, r) => s + r.rating, 0);
    const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avg,
        reviewsCount: count
      }
    });
  } catch (err) {
    console.error('Failed to recalculate rating for product:', productId, err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    // Recalculate ratings
    await recalculateProductRating(review.productId);

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (err) {
    console.error('Admin review PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  try {
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await prisma.review.delete({
      where: { id }
    });

    // Recalculate ratings
    await recalculateProductRating(review.productId);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Admin review DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
