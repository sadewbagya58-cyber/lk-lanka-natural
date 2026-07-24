'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Minus, Plus, Truck, ShieldCheck, HelpCircle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  shortDescription?: string | null;
  description: string;
  badge?: string | null;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  totalStock: number;
  rating: number;
  reviewsCount: number;
  gradient: string;
  visualSeed: string;
  tags?: string[];
  variants?: ProductVariant[];
  brandName?: string;
}

interface ProductDetailProps {
  product: ProductDetailData;
  selectedVariant?: ProductVariant | null;
  setSelectedVariant?: (variant: ProductVariant | null) => void;
}

export default function ProductDetail({
  product,
  selectedVariant: propSelectedVariant,
  setSelectedVariant: propSetSelectedVariant,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const [localSelectedVariant, setLocalSelectedVariant] = useState<ProductVariant | null>(null);
  
  const selectedVariant = propSelectedVariant !== undefined ? propSelectedVariant : localSelectedVariant;
  const setSelectedVariant = propSetSelectedVariant !== undefined ? propSetSelectedVariant : setLocalSelectedVariant;

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const hasVariants = product.variants && product.variants.length > 0;
  
  // Calculate price ranges
  const prices = hasVariants ? product.variants!.map(v => v.price) : [product.price];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const originalPrices = hasVariants 
    ? product.variants!.map(v => v.originalPrice).filter((p): p is number => p !== null && p !== undefined)
    : (product.originalPrice ? [product.originalPrice] : []);
  
  const minOriginal = originalPrices.length > 0 ? Math.min(...originalPrices) : null;
  const maxOriginal = originalPrices.length > 0 ? Math.max(...originalPrices) : null;

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeOriginal = selectedVariant ? selectedVariant.originalPrice : (product.originalPrice ?? null);
  const discountPercent = activeOriginal && activePrice
    ? Math.round(((activeOriginal - activePrice) / activeOriginal) * 100)
    : null;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : (hasVariants ? 0 : product.stockQuantity);
  const threshold = selectedVariant ? (selectedVariant.lowStockThreshold ?? 5) : (product.lowStockThreshold ?? 5);
  
  // If variant product:
  // - If variant is selected, isOut/isLow based on variant
  // - If no variant is selected, it's not out of stock yet (unless all variants are 0 stock)
  const isOut = selectedVariant
    ? (selectedVariant.stockQuantity <= 0)
    : (hasVariants 
        ? product.variants!.every((v) => v.stockQuantity <= 0) 
        : (product.stockQuantity <= 0));

  const isLow = selectedVariant
    ? (!isOut && currentStock <= threshold)
    : (hasVariants 
        ? false 
        : (!isOut && product.stockQuantity <= threshold));

  const canAdd = !isOut && (!hasVariants || selectedVariant !== null);

  const setBuyNowItem = useBuyNowStore((state) => state.setBuyNowItem);
  const router = useRouter();

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart(product.id, quantity, selectedVariant?.id ?? null, activePrice);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    setBuyNowItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
      unitPrice: activePrice,
    });
    router.push('/checkout?buyNow=true');
  };

  const handleQuantity = (delta: number) => {
    if (isOut) return;
    setQuantity((prev) => {
      const next = prev + delta;
      const maxQty = selectedVariant ? currentStock : (hasVariants ? 99 : product.stockQuantity);
      return next > 0 ? Math.min(next, maxQty) : 1;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full" role="region" aria-label="Product actions">
      {/* Price Section */}
      <div className="flex items-baseline gap-4 mt-2">
        {selectedVariant ? (
          <>
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">${activePrice.toFixed(2)}</span>
            {activeOriginal && (
              <div className="flex items-center gap-2">
                <span className="text-xl text-slate-400 line-through font-bold">${activeOriginal.toFixed(2)}</span>
                {discountPercent && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`}
            </span>
            {minOriginal !== null && maxOriginal !== null && (
              <span className="text-xl text-slate-400 line-through font-bold">
                {minOriginal === maxOriginal ? `$${minOriginal.toFixed(2)}` : `$${minOriginal.toFixed(2)} - $${maxOriginal.toFixed(2)}`}
              </span>
            )}
          </>
        )}
      </div>

      <p className="text-slate-650 text-base leading-relaxed font-light">
        {product.shortDescription || product.description.substring(0, 160) + '…'}
      </p>

      {/* Inventory & Progress Bar */}
      <div className="flex flex-col gap-3 py-4 border-y border-slate-100 bg-slate-50/50 px-4 rounded-2xl">
        <div className="flex items-center gap-2">
          {selectedVariant ? (
            isOut ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-600">
                  Out of Stock (Currently unavailable)
                </span>
              </>
            ) : isLow ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700">
                  Low Stock — Only {currentStock} items left!
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  In Stock ({currentStock} available - Ready to dispatch)
                </span>
              </>
            )
          ) : hasVariants ? (
            isOut ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-600">
                  Out of Stock (All options sold out)
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 animate-pulse">
                  Multiple Options Available ({product.variants!.reduce((sum, v) => sum + v.stockQuantity, 0)} units total)
                </span>
              </>
            )
          ) : (
            isOut ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-600">
                  Out of Stock (Currently unavailable)
                </span>
              </>
            ) : isLow ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700">
                  Low Stock — Only {product.stockQuantity} items left!
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  In Stock ({product.stockQuantity} available - Ready to dispatch)
                </span>
              </>
            )
          )}
        </div>
        {((selectedVariant && isLow) || (!hasVariants && isLow)) && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(10, (currentStock / (product.totalStock || 100)) * 100))}%` }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Variant Selection */}
      {hasVariants && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Options</span>
          <div className="flex flex-wrap gap-2.5">
            {product.variants!.map((v) => {
              const isOptionOut = v.stockQuantity <= 0;
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  disabled={isOptionOut}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 focus:outline-none ${
                    isOptionOut
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                      : isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-650 hover:border-slate-350 hover:text-slate-900'
                  }`}
                  aria-label={`Select option ${v.name}${isOptionOut ? ' (Out of stock)' : ''}`}
                >
                  {v.name} {isOptionOut ? '(Out of Stock)' : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mt-2">
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</span>
          <div className="flex items-center border border-slate-200 rounded-xl h-12 bg-white w-full sm:w-32 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <button
              onClick={() => handleQuantity(-1)}
              disabled={isOut || quantity <= 1 || (hasVariants && !selectedVariant)}
              className="w-10 h-full flex items-center justify-center text-slate-450 hover:text-slate-800 disabled:opacity-30 transition-colors focus:outline-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center font-black text-slate-900 text-sm">{(isOut || (hasVariants && !selectedVariant)) ? 0 : quantity}</span>
            <button
              onClick={() => handleQuantity(1)}
              disabled={isOut || (hasVariants && !selectedVariant) || quantity >= (selectedVariant ? currentStock : product.stockQuantity)}
              className="w-10 h-full flex items-center justify-center text-slate-450 hover:text-slate-800 disabled:opacity-30 transition-colors focus:outline-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all select-none focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${
              !canAdd
                ? 'bg-slate-100 text-slate-450 border border-slate-200 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-md hover:shadow-lg'
            }`}
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span className="truncate">
              {hasVariants && !selectedVariant
                ? 'Select Option'
                : isOut
                ? 'Out of Stock'
                : isAdded
                ? 'Added'
                : 'Add to Cart'}
            </span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!canAdd}
            className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              !canAdd
                ? 'bg-slate-100 text-slate-450 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 hover:shadow-lg'
            }`}
          >
            <Zap className="w-5 h-5 shrink-0 fill-current" />
            <span className="truncate">
              {hasVariants && !selectedVariant
                ? 'Select Option'
                : isOut
                ? 'Out of Stock'
                : 'Buy Now'}
            </span>
          </button>

          <button
            onClick={() => toggleWishlist(product.id)}
            className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-col gap-2 mt-4">
        {activePrice > 50 && (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50/50 rounded-xl text-emerald-800 border border-emerald-100/50">
            <Truck className="w-4.5 h-4.5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Eligible for FREE Shipping</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3.5 mt-2">
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase text-slate-600">100% Genuine product</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl select-none">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase text-slate-600">Easy 7-day returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
