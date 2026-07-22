export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { type ProductDetailData } from '@/components/ProductDetail';
import ProductCard from '@/components/ProductCard';
import ProductStorefrontContainer from '@/components/ProductStorefrontContainer';
import type { ProductCardData } from '@/types/product';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, select: { name: true, metaDescription: true, shortDescription: true, description: true } });
  if (!p) return { title: 'Product Not Found' };
  return {
    title: `${p.name} | KL Lanka Natural`,
    description: p.metaDescription || p.shortDescription || p.description.substring(0, 160),
  };
}



export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { subCategories: true } },
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!p) notFound();

  // Build the view-model for ProductDetail
  const product: ProductDetailData = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    shortDescription: p.shortDescription,
    description: p.description,
    badge: p.badge,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    totalStock: p.totalStock,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    gradient: p.gradient,
    visualSeed: p.visualSeed,
    tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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

  // Fetch related products (same category, excluding this one)
  const relatedRaw = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: p.id } },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
    take: 4,
    orderBy: { rating: 'desc' },
  });

  const relatedProducts: ProductCardData[] = relatedRaw.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: r.price,
    originalPrice: r.originalPrice ?? undefined,
    badge: r.badge ?? undefined,
    image: r.images[0]?.url,
    category: r.category?.name ?? '',
    categorySlug: r.category?.slug ?? '',
    brandName: r.brand?.name ?? '',
    inStock: r.inStock,
    rating: r.rating,
    reviewsCount: r.reviewsCount,
    gradient: r.gradient,
    visualSeed: r.visualSeed,
    isFeatured: r.isFeatured,
    isBestSeller: r.isBestSeller,
    isNewArrival: r.isNewArrival,
    variants: r.variants.map((v) => ({
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
  }));

  const reviews = p.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title ?? null,
    comment: r.comment,
    verified: r.verified,
    authorName: r.user?.name ?? 'Anonymous',
    createdAt: r.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  }));


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-6">
      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-700 transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {p.category && (
            <>
              <Link href={`/category/${p.category.slug}`} className="hover:text-slate-700 transition-colors">
                {p.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{p.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ProductStorefrontContainer
          product={product}
          initialImages={p.images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          }))}
          brand={p.brand}
          rating={p.rating}
          reviewsCount={p.reviewsCount}
        />

        {/* Full Description & Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-slate-200">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-2xl font-black text-slate-900">Product Description</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-light">
              <p>{p.description}</p>
            </div>

            {/* Reviews list */}
            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col gap-6">
              <h3 className="text-xl font-black text-slate-900">Customer Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400 font-light italic">No reviews yet for this product.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{r.authorName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{r.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                      </div>
                      {r.title && <h4 className="text-xs font-bold text-slate-800">{r.title}</h4>}
                      <p className="text-xs text-slate-600 font-light">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products Sidebar */}
          {relatedProducts.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-black text-slate-900">Related Products</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
