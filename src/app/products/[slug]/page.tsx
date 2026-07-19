import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';

import {
  getProductBySlug,
  getRelatedProducts,
  getCategoryById,
  getBrandById,
  getReviewsByProductId,
  getAllProducts,
} from '@/data';
import ProductDetail from '@/components/ProductDetail';
import ProductCard from '@/components/ProductCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.name} | KL Lanka Natural`,
    description: product.metaDescription || product.shortDescription || product.description,
  };
}

import ProductIllustration from '@/components/ProductIllustration';

function ProductVisual({ visualSeed, gradient }: { visualSeed: string; gradient: string }) {
  return (
    <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
      <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-20`} />
      
      <div className="w-2/3 h-2/3 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
        <ProductIllustration type={visualSeed} className="w-full h-full text-slate-700/70" />
      </div>
      
      {/* Ambient Glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryById(product.categoryId);
  const brand = getBrandById(product.brandId);
  const reviews = getReviewsByProductId(product.id);
  const relatedProducts = getRelatedProducts(product, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-emerald-600 transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
            </>
          )}
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Top Section: Visual & Main Details */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16">
          
          {/* Left: Product Visual */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-24">
              <ProductVisual visualSeed={product.visualSeed} gradient={product.gradient} />
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-4">
              {product.badge && (
                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-md shadow-sm">
                  {product.badge}
                </span>
              )}
              {brand && (
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                  {brand.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-500 font-medium">({product.reviewsCount} reviews)</span>
            </div>

            {/* Client Interactive Component */}
            <ProductDetail product={product} />
          </div>
        </div>

        {/* Full Description Section */}
        <div className="border-t border-slate-100 py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Product Information</h2>
            <div className="prose prose-slate prose-emerald max-w-none">
              <p className="text-slate-600 leading-loose text-lg">
                {product.description}
              </p>
              {/* Optional attributes like tags could go here */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">{review.title}</h4>
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
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
