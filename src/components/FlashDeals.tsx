'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Star, Flame, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ProductCardData } from '@/types/product';
import { fetchWithRetry } from '@/lib/fetcher';
import ProductIllustration from './ProductIllustration';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';

export default function FlashDeals() {
  const [flashProducts, setFlashProducts] = useState<ProductCardData[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 45, seconds: 30 });
  const router = useRouter();

  const addToCart = useCartStore((state) => state.addToCart);
  const setBuyNowItem = useBuyNowStore((state) => state.setBuyNowItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  useEffect(() => {
    fetchWithRetry<{ products: ProductCardData[] }>('/api/products')
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const deals = data.products
            .filter((p) => p.isFlashDeal)
            .slice(0, 4);
          if (deals.length > 0) {
            setFlashProducts(deals);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 11, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, '0');

  const handleAddToCart = (prod: ProductCardData, e: React.MouseEvent) => {
    e.preventDefault();
    const displayImage = prod.image || (prod.images && prod.images[0]) || null;
    addToCart(prod.id, 1, null, prod.price, displayImage);
    setAddedIds((prev) => [...prev, prod.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== prod.id)), 2000);
  };

  const handleBuyNow = (prod: ProductCardData, e: React.MouseEvent) => {
    e.preventDefault();
    const hasVariants = prod.variants && prod.variants.length > 0;
    if (hasVariants) {
      router.push(`/products/${prod.slug}?buyNow=true`);
      return;
    }
    const displayImage = prod.image || (prod.images && prod.images[0]) || null;
    setBuyNowItem({
      productId: prod.id,
      variantId: null,
      quantity: 1,
      unitPrice: prod.price,
      image: displayImage,
    });
    router.push('/checkout?buyNow=true');
  };

  if (flashProducts.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-16 bg-slate-50 border-b border-slate-100" aria-label="Flash deals shelf">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Flash Deals Header Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-rose-600">
              <Flame className="w-6 h-6 fill-rose-600 animate-pulse text-rose-600" />
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Flash Deals</h2>
            </div>

            {/* Live Clock Timer */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-white">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">Ends In:</span>
              <div className="flex items-center gap-1 font-mono text-sm font-black">
                <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">{fmt(timeLeft.hours)}</span>
                <span className="text-slate-500">:</span>
                <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">{fmt(timeLeft.minutes)}</span>
                <span className="text-slate-500">:</span>
                <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">{fmt(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          <Link href="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline select-none focus:outline-none">
            View All Deals
          </Link>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pb-3">
          {flashProducts.map((prod) => {
            const stockLeft = prod.stockQuantity ?? 0;
            const totalStock = prod.totalStock ?? 100;
            const pct = totalStock > 0 ? Math.round((stockLeft / totalStock) * 100) : 0;
            const discountPercent = prod.originalPrice
              ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
              : 0;
            const isWish = isInWishlist(prod.id);
            const isAdded = addedIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-auto bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 relative focus-within:ring-2 focus-within:ring-emerald-500/20"
                role="group"
                aria-label={`Deal for ${prod.name}`}
              >
                <div className="flex flex-col flex-1">
                  {/* Badges */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 pointer-events-none">
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-black tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-md shadow shadow-rose-600/20">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(prod.id); }}
                    className="absolute top-5 right-5 z-10 p-2 rounded-xl bg-white/95 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
                    aria-label={`Add ${prod.name} to wishlist`}
                  >
                    <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Product Image */}
                  <Link href={`/products/${prod.slug}`} className="block relative mb-4 select-none focus:outline-none">
                    <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      {prod.image ? (
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="object-contain p-2 hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-tr ${prod.gradient} opacity-20`} />
                          <div className="w-1/2 h-1/2 flex items-center justify-center">
                            <ProductIllustration type={prod.visualSeed} className="w-full h-full text-slate-700/70" />
                          </div>
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Category & Rating */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{prod.category}</span>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded-lg text-amber-700 font-bold text-[10px]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" strokeWidth={1} />
                      <span>{prod.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <Link href={`/products/${prod.slug}`} className="focus:outline-none">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug hover:text-emerald-600 transition-colors min-h-[40px] mb-2">
                      {prod.name}
                    </h3>
                  </Link>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-50">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-rose-600">${prod.price.toFixed(2)}</span>
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-semibold">${prod.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Stock Level Progress */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Stock Left: <strong className="text-rose-600">{stockLeft}</strong></span>
                      <span>{pct}% Remaining</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      className={`h-9 sm:h-10 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400/20 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{isAdded ? 'Added' : 'Add to Cart'}</span>
                    </button>
                    <button
                      onClick={(e) => handleBuyNow(prod, e)}
                      className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0 fill-current" />
                      <span className="truncate">Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
