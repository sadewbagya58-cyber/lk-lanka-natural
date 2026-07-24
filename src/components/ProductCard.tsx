'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ProductCardData } from '@/types/product';
import ProductIllustration from './ProductIllustration';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';
import { isCustomPortraitArt } from '@/lib/custom-portrait';

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);
  const setBuyNowItem = useBuyNowStore((state) => state.setBuyNowItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const isCustomPortrait = isCustomPortraitArt(product);
  const hasVariants = !isCustomPortrait && product.variants && product.variants.length > 0;
  
  // Calculate availability and stock
  const stock = isCustomPortrait
    ? 999
    : hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.stockQuantity, 0)
    : (product.stockQuantity ?? 0);
  
  const threshold = product.lowStockThreshold ?? 5;
  const isOut = isCustomPortrait
    ? false
    : hasVariants
    ? (product.variants!.length > 0 && product.variants!.every((v) => v.stockQuantity <= 0))
    : (stock <= 0);

  const isLow = isCustomPortrait
    ? false
    : hasVariants
    ? false
    : (!isOut && stock <= threshold);

  // Discount percentage based on min variant price or single price
  const activePrice = hasVariants ? Math.min(...product.variants!.map(v => v.price)) : product.price;
  const activeOriginal = hasVariants 
    ? Math.min(...product.variants!.map(v => v.originalPrice).filter((p): p is number => p !== null && p !== undefined))
    : product.originalPrice;

  const discountPercent = activeOriginal
    ? Math.round(((activeOriginal - activePrice) / activeOriginal) * 100)
    : null;

  const displayImage = product.image || (product.images && product.images[0]) || null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCustomPortrait) return;
    if (hasVariants) {
      router.push(`/products/${product.slug}`);
      return;
    }
    if (isOut) return;
    addToCart(product.id, 1, null, product.price, displayImage);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      router.push(`/products/${product.slug}?buyNow=true`);
      return;
    }
    if (isOut && !isCustomPortrait) return;
    setBuyNowItem({
      productId: product.id,
      variantId: null,
      quantity: 1,
      unitPrice: product.price,
      image: displayImage,
    });
    router.push('/checkout?buyNow=true');
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 p-2.5 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 relative h-full focus-within:ring-2 focus-within:ring-emerald-500/20"
      role="group"
      aria-label={`Product card for ${product.name}`}
    >
      <div className="flex flex-col flex-1">
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 pointer-events-none max-w-[70%]">
          {isCustomPortrait ? (
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase bg-purple-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm w-fit">
              Custom Service
            </span>
          ) : (
            <>
              {product.badge && (
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase bg-emerald-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm truncate">
                  {product.badge}
                </span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase bg-rose-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm w-fit">
                  -{discountPercent}%
                </span>
              )}
              {isOut ? (
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase bg-slate-900 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm w-fit">
                  Out of Stock
                </span>
              ) : isLow ? (
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase bg-amber-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm w-fit truncate">
                  Low Stock ({stock})
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <motion.div
            animate={{ scale: isWishlisted ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.div>
        </button>

        {/* Product Image Link */}
        <Link href={`/products/${product.slug}`} className="block relative mb-2.5 sm:mb-4 select-none focus:outline-none">
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
                <div className={`absolute inset-0 bg-gradient-to-tr ${product.gradient || 'from-emerald-500/10 to-teal-500/20'} opacity-20 group-hover:scale-105 transition-transform duration-500`} />
                <div className="w-1/2 h-1/2 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                  <ProductIllustration type={product.visualSeed} className="w-full h-full text-slate-700/70" />
                </div>
              </>
            )}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Link>

        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-1">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-50 border border-amber-100/50 px-1 sm:px-1.5 py-0.5 rounded-lg text-amber-700 font-bold text-[9px] sm:text-[10px] shrink-0">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" strokeWidth={1} />
            <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            <span className="text-slate-400 font-medium hidden sm:inline">({product.reviewsCount ?? 12})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="focus:outline-none focus:underline mb-1.5 sm:mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight sm:leading-snug hover:text-emerald-600 focus:text-emerald-600 transition-colors duration-200 min-h-[32px] sm:min-h-[40px]">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-50">
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          {hasVariants ? (
            <span className="text-sm sm:text-base font-black text-slate-900">From ${activePrice.toFixed(2)}</span>
          ) : (
            <span className="text-sm sm:text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
          )}
          {!hasVariants && product.originalPrice && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Grid */}
        {isCustomPortrait ? (
          <button
            onClick={handleBuyNow}
            className="w-full h-8 sm:h-9 px-2.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-sm hover:shadow transition-all"
          >
            <Zap className="w-3.5 h-3.5 shrink-0 fill-current" />
            <span>Buy Now</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOut}
              className={`h-8 sm:h-9 px-2 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all select-none focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${
                isOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{isOut ? 'Out' : hasVariants ? 'Options' : isAdded ? 'Added' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOut}
              className={`h-8 sm:h-9 px-2 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                isOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-sm hover:shadow'
              }`}
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
