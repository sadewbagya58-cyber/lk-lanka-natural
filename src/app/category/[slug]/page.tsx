export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryView from '@/components/CategoryView';
import type { ProductCardData, SubCategoryData } from '@/types/product';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      subCategories: true,
      products: {
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { rating: 'desc' },
      },
    },
  });

  if (!category) notFound();

  const subCategories: SubCategoryData[] = category.subCategories.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    parentCategoryId: s.parentCategoryId || category.id,
    description: s.description ?? undefined,
  }));

  const products: ProductCardData[] = category.products.map((p) => {
    const hasVariants = p.variants.length > 0;
    const isAvailable = hasVariants
      ? p.variants.some((v) => v.stockQuantity > 0)
      : p.stockQuantity > 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      badge: p.badge ?? undefined,
      image: p.images[0]?.url,
      images: p.images.map((img) => img.url),
      category: p.category?.name ?? category.name,
      categorySlug: p.category?.slug ?? category.slug,
      brandName: p.brand?.name ?? '',
      inStock: isAvailable,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      gradient: p.gradient,
      visualSeed: p.visualSeed,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isFlashDeal: p.isFlashDeal,
      stockQuantity: p.stockQuantity,
      totalStock: p.totalStock,
      lowStockThreshold: p.lowStockThreshold,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        originalPrice: v.originalPrice ?? null,
        inStock: v.stockQuantity > 0,
        stockQuantity: v.stockQuantity,
        lowStockThreshold: v.lowStockThreshold,
        imageUrl: v.imageUrl ?? null,
        sortOrder: v.sortOrder,
      })),
    };
  });

  const serializableCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    colorClasses: category.colorClasses ?? 'from-slate-500 to-slate-900',
    image: category.image ?? undefined,
    subCategories,
    featured: category.featured,
    sortOrder: category.sortOrder,
  };

  const iconNode = (
    <span className="text-4xl font-black text-white select-none">
      {category.name.charAt(0)}
    </span>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <CategoryView
        category={serializableCategory}
        products={products}
        iconNode={iconNode}
      />
    </main>
  );
}
