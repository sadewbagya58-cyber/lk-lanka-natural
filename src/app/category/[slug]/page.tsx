export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
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
        include: { category: true, brand: true },
        where: { inStock: true },
        orderBy: { rating: 'desc' },
      },
    },
  });

  if (!category) notFound();

  const subCategories: SubCategoryData[] = category.subCategories.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    parentCategoryId: s.categoryId,
    description: s.description ?? undefined,
  }));

  const products: ProductCardData[] = category.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    badge: p.badge ?? undefined,
    category: p.category?.name ?? category.name,
    categorySlug: p.category?.slug ?? category.slug,
    brandName: p.brand?.name ?? '',
    inStock: p.inStock,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    gradient: p.gradient,
    visualSeed: p.visualSeed,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
  }));

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

  // Build an icon node — since we can't pass React component instances from Prisma,
  // we use a simple text badge fallback for the hero icon.
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
