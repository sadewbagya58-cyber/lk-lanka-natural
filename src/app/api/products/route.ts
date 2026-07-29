import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ProductCardData } from '@/types/product';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' }, select: { url: true, isPrimary: true, sortOrder: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data: ProductCardData[] = products.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice ?? undefined,
        badge: p.badge ?? undefined,
        image: primaryImage,
        images: p.images.map((img) => img.url),
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
        isFreeDelivery: p.isFreeDelivery,
        flashDealEndsAt: p.flashDealEndsAt?.toISOString() ?? null,
        stockQuantity: p.stockQuantity,
        totalStock: p.totalStock,
        lowStockThreshold: p.lowStockThreshold,
        moq: p.moq ?? 1,
        description: p.description,
        tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          originalPrice: v.originalPrice ?? null,
          inStock: v.inStock,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold,
          imageUrl: v.imageUrl ?? null,
          sortOrder: v.sortOrder,
        })),
      };
    });

    return new NextResponse(JSON.stringify({ products: data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
