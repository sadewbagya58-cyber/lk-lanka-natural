'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Minus, Plus, Truck, ShieldCheck, HelpCircle } from 'lucide-react';
import { Product } from '@/data/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      return next > 0 ? (next <= product.inventory.stockQuantity ? next : prev) : 1;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full" role="region" aria-label="Product actions">
      {/* Price Section */}
      <div className="flex items-baseline gap-4 mt-2">
        <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">${product.price.toFixed(2)}</span>
        {product.originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-xl text-slate-400 line-through font-bold">
              ${product.originalPrice.toFixed(2)}
            </span>
            {discountPercent && (
              <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                Save {discountPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-650 text-base leading-relaxed font-light">
        {product.shortDescription || product.description.substring(0, 160) + '...'}
      </p>

      {/* Inventory & Progress Bar */}
      <div className="flex flex-col gap-3 py-4 border-y border-slate-100 bg-slate-50/50 px-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${product.inventory.inStock ? (product.inventory.stockQuantity < product.inventory.lowStockThreshold ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-slate-350'}`} />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            {product.inventory.inStock 
              ? (product.inventory.stockQuantity < product.inventory.lowStockThreshold 
                  ? `Only ${product.inventory.stockQuantity} items left in stock!` 
                  : 'In Stock (Ready to dispatch)') 
              : 'Temporarily Out of Stock'}
          </span>
        </div>
        
        {product.inventory.inStock && product.inventory.stockQuantity < product.inventory.lowStockThreshold && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(product.inventory.stockQuantity / product.inventory.totalStock) * 100}%` }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Variants selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Options</span>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 focus:outline-none ${
                  selectedVariant === v.id
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-650 hover:border-slate-300 hover:text-slate-900'
                }`}
                aria-label={`Select option ${v.name}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions Selector Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end mt-2">
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</span>
          <div className="flex items-center border border-slate-200 rounded-xl h-12 bg-white w-full sm:w-32 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <button
              onClick={() => handleQuantity(-1)}
              className="w-10 h-full flex items-center justify-center text-slate-450 hover:text-slate-800 disabled:opacity-30 transition-colors focus:outline-none"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center font-black text-slate-900 text-sm">{quantity}</span>
            <button
              onClick={() => handleQuantity(1)}
              className="w-10 h-full flex items-center justify-center text-slate-450 hover:text-slate-800 disabled:opacity-30 transition-colors focus:outline-none"
              disabled={!product.inventory.inStock || quantity >= product.inventory.stockQuantity}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inventory.inStock}
          className={`flex-grow h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all select-none focus:outline-none focus:ring-2 focus:ring-emerald-550/40 ${
            isAdded
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:active:scale-100 shadow-md hover:shadow-lg shadow-emerald-600/10'
          }`}
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          <span>{isAdded ? 'Added to Cart' : 'Add to Cart'}</span>
        </button>

        <button
          onClick={handleToggleWishlist}
          className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500 font-rose-550' : ''}`} />
        </button>
      </div>

      {/* Free Shipping & Authenticity trust indicators */}
      <div className="flex flex-col gap-2 mt-4">
        {product.price > 50 && (
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
