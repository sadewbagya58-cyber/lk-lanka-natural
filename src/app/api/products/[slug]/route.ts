import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ProductCardData } from '@/types/product';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { include: { subCategories: true } },
        subCategory: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const card: ProductCardData = {
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
    };

    const product = {
      ...card,
      description: p.description,
      shortDescription: p.shortDescription ?? null,
      tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      metaTitle: p.metaTitle ?? null,
      metaDescription: p.metaDescription ?? null,
      images: p.images,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        originalPrice: v.originalPrice ?? null,
        inStock: v.inStock,
        stockQuantity: v.stockQuantity,
      })),
      reviews: p.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title ?? null,
        comment: r.comment,
        verified: r.verified,
        authorName: r.user?.name ?? 'Anonymous',
        createdAt: r.createdAt.toISOString(),
      })),
      category: {
        id: p.category?.id,
        name: p.category?.name ?? '',
        slug: p.category?.slug ?? '',
        subCategories: (p.category?.subCategories ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
        })),
      },
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
