'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ProductCardData } from '@/types/product';
import ProductIllustration from './ProductIllustration';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const hasVariants = product.variants && product.variants.length > 0;
  
  // Calculate availability and stock
  const stock = hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.stockQuantity, 0)
    : (product.stockQuantity ?? 0);
  
  const threshold = product.lowStockThreshold ?? 5;
  const isOut = hasVariants
    ? product.variants!.every(v => v.stockQuantity === 0)
    : (stock === 0 || !product.inStock);

  const isLow = hasVariants
    ? false // Variant low stock is handled per option inside details page
    : (!isOut && stock <= threshold);

  // Discount percentage based on min variant price or single price
  const activePrice = hasVariants ? Math.min(...product.variants!.map(v => v.price)) : product.price;
  const activeOriginal = hasVariants 
    ? Math.min(...product.variants!.map(v => v.originalPrice).filter((p): p is number => p !== null && p !== undefined))
    : product.originalPrice;

  const discountPercent = activeOriginal
    ? Math.round(((activeOriginal - activePrice) / activeOriginal) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      router.push(`/products/${product.slug}`);
      return;
    }
    if (isOut) return;
    addToCart(product.id, 1, null, product.price);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 relative h-full focus-within:ring-2 focus-within:ring-emerald-500/20"
      role="group"
      aria-label={`Product card for ${product.name}`}
    >
      <div className="flex flex-col flex-1">
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="text-[9px] font-black tracking-wider uppercase bg-emerald-600 text-white px-2 py-1 rounded shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="text-[9px] font-black tracking-wider uppercase bg-rose-600 text-white px-2 py-1 rounded shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {isOut ? (
            <span className="text-[9px] font-black tracking-wider uppercase bg-slate-900 text-white px-2 py-1 rounded shadow-sm">
              Out of Stock
            </span>
          ) : isLow ? (
            <span className="text-[9px] font-black tracking-wider uppercase bg-amber-500 text-white px-2 py-1 rounded shadow-sm">
              Low Stock ({stock} left)
            </span>
          ) : null}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <motion.div
            animate={{ scale: isWishlisted ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.div>
        </button>

        {/* Product Image Link */}
        <Link href={`/products/${product.slug}`} className="block relative mb-4 select-none focus:outline-none">
          <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <>
                <div className={`absolute inset-0 bg-gradient-to-tr ${product.gradient} opacity-20 group-hover:scale-105 transition-transform duration-500`} />
                <div className="w-1/2 h-1/2 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                  <ProductIllustration type={product.visualSeed} className="w-full h-full text-slate-700/70" />
                </div>
              </>
            )}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Link>

        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded-lg text-amber-700 font-bold text-[10px]">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" strokeWidth={1} />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-medium">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="focus:outline-none focus:underline mb-2">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug hover:text-emerald-600 focus:text-emerald-600 transition-colors duration-200 min-h-[40px]">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-50">
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          {hasVariants ? (
            <span className="text-lg font-black text-slate-900">From ${activePrice.toFixed(2)}</span>
          ) : (
            <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
          )}
          {!hasVariants && product.originalPrice && (
            <span className="text-xs text-slate-400 line-through font-semibold">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="flex items-center gap-1.5">
          {isOut ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-rose-600 font-bold tracking-wide uppercase">
                Out of Stock
              </span>
            </>
          ) : hasVariants ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase">
                Options Available
              </span>
            </>
          ) : isLow ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] text-amber-700 font-bold tracking-wide uppercase">
                Low Stock — Only {stock} left
              </span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">
                In Stock ({stock})
              </span>
            </>
          )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          <button
            onClick={handleAddToCart}
            disabled={isOut}
            className={`col-span-4 h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              isOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : hasVariants
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{isOut ? 'Out of Stock' : hasVariants ? 'Select Options' : isAdded ? 'Added' : 'Add to Cart'}</span>
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="col-span-1 h-10 rounded-xl bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-400/40"
            aria-label={`Quick View detail of ${product.name}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
