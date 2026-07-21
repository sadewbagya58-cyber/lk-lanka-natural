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
        },
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
    parentCategoryId: s.parentCategoryId || category.id,
    description: s.description ?? undefined,
  }));

  const products: ProductCardData[] = category.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    badge: p.badge ?? undefined,
    image: p.images[0]?.url,
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
