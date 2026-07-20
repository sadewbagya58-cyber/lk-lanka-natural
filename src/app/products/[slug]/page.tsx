export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductDetail, { type ProductDetailData } from '@/components/ProductDetail';
import ProductCard from '@/components/ProductCard';
import ProductIllustration from '@/components/ProductIllustration';
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

function ProductVisual({ visualSeed, gradient }: { visualSeed: string; gradient: string }) {
  return (
    <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
      <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-20`} />
      <div className="w-2/3 h-2/3 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
        <ProductIllustration type={visualSeed} className="w-full h-full text-slate-700/70" />
      </div>
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
    </div>
  );
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
    })),
  };

  // Fetch related products (same category, excluding this one)
  const relatedRaw = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: p.id } },
    include: { category: true, brand: true },
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
  }));

  const reviews = p.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title ?? null,
    comment: r.comment,
    verified: r.verified,
    authorName: r.user?.name ?? 'Anonymous',
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          {p.category && (
            <>
              <Link href={`/category/${p.category.slug}`} className="hover:text-emerald-600 transition-colors">
                {p.category.name}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
            </>
          )}
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{p.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16">
          {/* Product Visual */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-24">
              <ProductVisual visualSeed={p.visualSeed} gradient={p.gradient} />
            </div>
          </div>

          {/* Details */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-4">
              {p.badge && (
                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-md shadow-sm">
                  {p.badge}
                </span>
              )}
              {p.brand && (
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{p.brand.name}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">{p.name}</h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(p.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{p.rating}</span>
              <span className="text-sm text-slate-500 font-medium">({p.reviewsCount} reviews)</span>
            </div>

            <ProductDetail product={product} />
          </div>
        </div>

        {/* Full Description */}
        <div className="border-t border-slate-100 py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Product Information</h2>
            <p className="text-slate-600 leading-loose text-lg">{p.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {product.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="border-t border-slate-100 py-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                        {review.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{review.authorName}</div>
                        <div className="text-xs text-slate-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.title && <h4 className="font-bold text-slate-800 mb-2">{review.title}</h4>}
                  <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-100 py-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
