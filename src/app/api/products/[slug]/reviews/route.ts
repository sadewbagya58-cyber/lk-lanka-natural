import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        status: 'APPROVED'
      },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        authorName: r.user?.name ?? 'Anonymous',
        createdAt: r.createdAt.toISOString()
      }))
    });
  } catch (err) {
    console.error('Reviews GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to write a review.' }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: user.id
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 400 });
    }

    const body = await req.json();
    const { rating, title, comment } = body;

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5.' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Comment must be at least 5 characters long.' }, { status: 400 });
    }

    // Check if user has purchased the product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: user.id
        }
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'You can only review products you have purchased.' }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: ratingVal,
        title: title?.trim() || null,
        comment: comment.trim(),
        verified: true,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will appear on the site once approved by moderation.',
      review
    }, { status: 201 });
  } catch (err) {
    console.error('Review POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
