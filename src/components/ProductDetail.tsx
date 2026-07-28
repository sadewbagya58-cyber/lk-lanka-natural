'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Minus, Plus, ShieldCheck, HelpCircle, Zap, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';
import Image from 'next/image';
import { useSession } from '@/components/AuthProvider';

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
  categorySlug?: string | null;
  categoryName?: string | null;
  isFreeDelivery?: boolean;
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

import { isCustomPortraitArt } from '@/lib/custom-portrait';

export default function ProductDetail({
  product,
  selectedVariant: propSelectedVariant,
  setSelectedVariant: propSetSelectedVariant,
}: ProductDetailProps) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const [localSelectedVariant, setLocalSelectedVariant] = useState<ProductVariant | null>(null);
  
  const selectedVariant = propSelectedVariant !== undefined ? propSelectedVariant : localSelectedVariant;
  const setSelectedVariant = propSetSelectedVariant !== undefined ? propSetSelectedVariant : setLocalSelectedVariant;

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const isCustomPortrait = isCustomPortraitArt({
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
  });
  const hasVariants = !isCustomPortrait && product.variants && product.variants.length > 0;
  
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

  const currentStock = isCustomPortrait ? 999 : (selectedVariant ? selectedVariant.stockQuantity : (hasVariants ? 0 : product.stockQuantity));
  const threshold = selectedVariant ? (selectedVariant.lowStockThreshold ?? 5) : (product.lowStockThreshold ?? 5);
  
  const isOut = isCustomPortrait
    ? false
    : selectedVariant
    ? (selectedVariant.stockQuantity <= 0)
    : (hasVariants 
        ? product.variants!.every((v) => v.stockQuantity <= 0) 
        : (product.stockQuantity <= 0));

  const isLow = isCustomPortrait
    ? false
    : selectedVariant
    ? (!isOut && currentStock <= threshold)
    : (hasVariants 
        ? false 
        : (!isOut && product.stockQuantity <= threshold));

  const canAdd = isCustomPortrait ? true : (!isOut && (!hasVariants || selectedVariant !== null));

  const setBuyNowItem = useBuyNowStore((state) => state.setBuyNowItem);
  const router = useRouter();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('File size exceeds maximum limit of 10MB.');
      return;
    }
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/reference', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.url);
      } else {
        const data = await res.json();
        setPhotoError(data.error || 'Failed to upload photo.');
      }
    } catch {
      setPhotoError('Network error uploading photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (!canAdd) return;
    const displayImage = selectedVariant?.imageUrl || null;
    addToCart(product.id, quantity, selectedVariant?.id ?? null, activePrice, displayImage);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    if (isCustomPortrait && !photoUrl) {
      setPhotoError('Please upload your reference photo before placing your order.');
      return;
    }
    const displayImage = selectedVariant?.imageUrl || null;
    setBuyNowItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
      unitPrice: activePrice,
      image: photoUrl || displayImage,
      customUploadImage: photoUrl,
    });
    if (!session) {
      router.push(`/signup?redirect=${encodeURIComponent('/checkout?buyNow=true')}`);
    } else {
      router.push('/checkout?buyNow=true');
    }
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

      {isCustomPortrait && (
        <div className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-3.5 mt-2">
          <div className="flex items-center justify-between border-b border-purple-200/50 pb-2.5">
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              Upload Reference Photo *
            </span>
            <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">
              Required
            </span>
          </div>

          {photoError && (
            <div className="bg-rose-105 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-bold">
              {photoError}
            </div>
          )}

          {photoUrl ? (
            <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-purple-150">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <Image src={photoUrl} alt="Preview" fill className="object-cover" unoptimized />
              </div>
              <div className="flex-grow flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-[150px]">Reference ready</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-150 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-purple-300 hover:border-purple-400 bg-white hover:bg-purple-50/30 rounded-xl cursor-pointer text-center relative transition-colors">
              {photoUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="text-[10px] font-black text-purple-900 uppercase">Uploading Photo...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-purple-405" />
                  <span className="text-xs font-bold text-purple-900">Click to upload photo</span>
                  <span className="text-[9px] text-slate-450 font-medium">JPEG, PNG or WEBP (Max 10MB)</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={photoUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload reference photo"
              />
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mt-2">
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</span>
          <div className="flex items-center border border-slate-200 rounded-xl h-12 bg-white w-full sm:w-32 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-550">
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

        <div className="flex flex-grow gap-2.5">
          {isCustomPortrait ? (
            <button
              onClick={handleBuyNow}
              className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all"
            >
              <Zap className="w-5 h-5 shrink-0 fill-current" />
              <span>Buy Now (Order Custom Portrait)</span>
            </button>
          ) : (
            <>
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
            </>
          )}

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
