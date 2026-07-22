'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/currency';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, ChevronRight, ShieldCheck, RefreshCw } from 'lucide-react';
import ProductIllustration from '@/components/ProductIllustration';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { ProductCardData } from '@/types/product';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, clearCart } = useCartStore();
  const [productMap, setProductMap] = useState<Record<string, ProductCardData>>({});

  const subtotal = getCartSubtotal();
  const shippingCost = subtotal >= 50.0 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  // Fetch product display data for cart items
  useEffect(() => {
    if (cartItems.length === 0) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: { products: ProductCardData[] }) => {
        const map: Record<string, ProductCardData> = {};
        data.products.forEach((p) => { map[p.id] = p; });
        setProductMap(map);
      })
      .catch(console.error);
  }, [cartItems.length]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2" />
          <span className="text-slate-800">Shopping Cart</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Your Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col gap-6">
                {cartItems.map((item) => {
                  const product = productMap[item.productId];
                  const displayPrice = item.unitPrice;
                  const name = product?.name ?? 'Loading…';
                  const gradient = product?.gradient ?? 'from-slate-100 to-slate-200';
                  const visualSeed = product?.visualSeed ?? 'leaf';
                  const slug = product?.slug ?? '#';
                  const category = product?.category ?? '';
                  const inStock = product?.inStock ?? true;

                  const variant = product?.variants?.find((v) => v.id === item.selectedVariantId);
                  const variantName = variant?.name;

                  return (
                    <div
                      key={`${item.productId}-${item.selectedVariantId || ''}`}
                      className="flex flex-col sm:flex-row gap-4 py-6 border-b border-slate-100 last:border-0 last:pb-0 relative group"
                    >
                      {/* Product Visual */}
                      <div className="relative w-20 h-20 rounded-xl bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center shrink-0">
                        <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-10`} />
                        <ProductIllustration type={visualSeed} className="w-10 h-10 text-slate-700/60" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{category}</span>
                            <Link href={`/products/${slug}`}>
                              <h3 className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors mt-0.5 leading-snug">{name}</h3>
                            </Link>
                            {variantName && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                                Option: {variantName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                              {inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center sm:items-end justify-between sm:flex-col gap-4">
                          <span className="text-lg font-black text-slate-900">{formatPrice(displayPrice)}</span>
                          <div className="flex items-center gap-4">
                            {/* Quantity switcher */}
                            <div className="flex items-center border border-slate-200 rounded-lg h-9 bg-white shadow-sm overflow-hidden">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariantId)}
                                className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
                                aria-label="Decrease quantity">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center text-xs font-black text-slate-950">{item.quantity}</span>
                              <button onClick={() => updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.selectedVariantId,
                                variant ? variant.stockQuantity : product?.stockQuantity
                              )}
                                className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
                                aria-label="Increase quantity">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Remove */}
                            <button onClick={() => removeFromCart(item.productId, item.selectedVariantId)}
                              className="p-2 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-xl transition-colors focus:outline-none"
                              aria-label="Remove item">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Keep Shopping */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm mt-4">
                <Link href="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none flex items-center gap-1.5">
                  ← Continue Shopping
                </Link>
                <button onClick={() => clearCart()} className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline focus:outline-none">
                  Clear Entire Cart
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">Order Summary</h2>
                <div className="flex flex-col gap-2.5 text-sm border-b border-slate-100 pb-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-slate-800">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Order Total</span>
                  <span className="text-xl font-black text-slate-950">{formatPrice(total)}</span>
                </div>
                <button
                  className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all mt-4 focus:outline-none shadow-md hover:shadow-lg shadow-emerald-600/10"
                  onClick={() => alert('Proceeding to checkout…')}
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>

              {/* Guarantee */}
              <div className="bg-slate-100/50 rounded-2xl border border-slate-200/50 p-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">100% Payment Security</h4>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed">Your transaction details are encrypted using banking-grade security protocols.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ethical Source Guarantee</h4>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed">Products are direct, genuine, organic, and ethically sourced.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <ShoppingBag className="w-9 h-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
              Looks like you haven&apos;t added any items to your shopping cart yet. Let&apos;s discover our premium offerings.
            </p>
            <Link href="/products" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-widest focus:outline-none">
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
