import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ProductCardData } from '@/types/product';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });

    const data: ProductCardData[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      badge: p.badge ?? undefined,
      category: p.category?.name ?? '',
      categorySlug: p.category?.slug ?? '',
      categoryId: p.categoryId,
      brandName: p.brand?.name ?? '',
      inStock: p.inStock,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      gradient: p.gradient,
      visualSeed: p.visualSeed,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isFlashDeal: p.isFlashDeal,
      flashDealEndsAt: p.flashDealEndsAt?.toISOString() ?? null,
      stockQuantity: p.stockQuantity,
      totalStock: p.totalStock,
      lowStockThreshold: p.lowStockThreshold,
    }));

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
