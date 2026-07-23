'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Trash2, Minus, Plus, Truck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/currency';
import ProductIllustration from './ProductIllustration';
import type { ProductCardData } from '@/types/product';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, clearCart } = useCartStore();
  const [productMap, setProductMap] = useState<Record<string, ProductCardData>>({});

  const subtotal = getCartSubtotal();
  const shippingThreshold = 50.0;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100);

  // Fetch product details for all items in the cart
  useEffect(() => {
    if (!isOpen || cartItems.length === 0) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: { products: ProductCardData[] }) => {
        const map: Record<string, ProductCardData> = {};
        data.products.forEach((p) => { map[p.id] = p; });
        setProductMap(map);
      })
      .catch(console.error);
   
  }, [isOpen, cartItems.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col justify-between"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">Your Shopping Cart</h2>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-emerald-50/40 border-b border-emerald-100/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-650" />
                {isFreeShipping
                  ? 'Congratulations!'
                  : `Add ${formatPrice(shippingThreshold - subtotal)} more for free shipping`}
              </span>
              <span className="text-emerald-700 font-black">
                {isFreeShipping ? 'FREE SHIPPING ACTIVE' : `${Math.round(shippingProgress)}%`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const product = productMap[item.productId];
              const displayPrice = item.unitPrice;
              const name = product?.name ?? 'Loading…';
              const gradient = product?.gradient ?? 'from-slate-100 to-slate-200';
              const visualSeed = product?.visualSeed ?? 'leaf';

              const variant = product?.variants?.find((v) => v.id === item.selectedVariantId);
              const variantName = variant?.name;

              return (
                <div
                  key={`${item.productId}-${item.selectedVariantId || ''}`}
                  className="flex gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl relative group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-150 overflow-hidden flex items-center justify-center shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-10`} />
                    <ProductIllustration type={visualSeed} className="w-9 h-9 text-slate-700/60" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{name}</h4>
                      {variantName && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                          Option: {variantName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-slate-900">{formatPrice(displayPrice)}</span>
                      {/* Quantity switcher */}
                      <div className="flex items-center border border-slate-200 rounded-lg h-8 bg-white overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariantId)}
                          className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedVariantId,
                            variant ? variant.stockQuantity : product?.stockQuantity
                          )}
                          className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedVariantId)}
                    className="absolute top-3.5 right-3.5 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors focus:outline-none"
                    aria-label={`Remove ${name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-grow">
              <div className="w-16 h-16 bg-slate-150 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                Looks like you haven&apos;t added anything to your cart yet. Let&apos;s discover our premium items.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-605 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl shadow-sm transition-all focus:outline-none"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shipping</span>
                <span className="font-bold">{isFreeShipping ? 'FREE' : formatPrice(4.99)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-200/50 pt-2">
                <span>Estimated Subtotal</span>
                <span className="text-lg font-black">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-50 transition-colors focus:outline-none"
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all focus:outline-none shadow-sm hover:shadow"
              >
                <CreditCard className="w-4 h-4" />
                Checkout
              </Link>
            </div>
            <button
              onClick={() => clearCart()}
              className="text-[10px] text-slate-450 hover:text-rose-600 hover:underline text-center mt-1 focus:outline-none font-bold"
            >
              Clear Entire Cart
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
