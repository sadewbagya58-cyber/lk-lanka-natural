'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/currency';
import { useSession } from '@/components/AuthProvider';
import { ShieldCheck, ChevronRight, AlertCircle, MapPin, Phone, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductIllustration from '@/components/ProductIllustration';
import type { ProductCardData } from '@/types/product';

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { cartItems, getCartSubtotal, clearCart } = useCartStore();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [productMap, setProductMap] = useState<Record<string, ProductCardData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = getCartSubtotal();
  const shippingCost = subtotal >= 50.0 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  // 1. Session Redirect Guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/checkout');
    }
  }, [status, router]);

  // 2. Fetch User Saved Address & Cart Details
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Redirect to cart if empty
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    async function loadData() {
      try {
        const [profileRes, productsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/products')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setShippingAddress({
            name: profileData.name || '',
            phone: profileData.phone || '',
            street: profileData.address_street || '',
            city: profileData.address_city || '',
          });
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const map: Record<string, ProductCardData> = {};
          productsData.products.forEach((p: ProductCardData) => { map[p.id] = p; });
          setProductMap(map);
        }
      } catch (err) {
        console.error('Failed to load checkout details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status, cartItems.length, router]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
      setError('Please fill in all shipping fields');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod,
            items: cartItems.map(item => ({
              productId: item.productId,
              selectedVariantId: item.selectedVariantId,
              quantity: item.quantity
            }))
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to place order.');
          return;
        }

        // Clear local storage cart store
        clearCart();

        // Redirect to success page
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'A connection error occurred. Please try again.');
      }
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preparing Checkout...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link href="/cart" className="hover:text-emerald-600 transition-colors">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2" />
          <span className="text-slate-800">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Shipping &amp; Checkout</h1>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Delivery address details card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Recipient Name *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Delivery Phone *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Street address */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-slate-505 uppercase tracking-widest">Street Address *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="124 Galle Road"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">City / Suburb *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Colombo 03"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5">
                Payment Method
              </h2>

              <div className="flex flex-col gap-3">
                <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-slate-500 font-light mt-0.5 block">Pay in cash when package is delivered island-wide.</span>
                    </div>
                  </div>
                </label>

                <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Bank Transfer (Offline)</span>
                      <span className="text-[10px] text-slate-500 font-light mt-0.5 block">Transfer directly to our bank account. Details shown after placement.</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5">
                Your Order
              </h2>

              <div className="flex flex-col gap-4 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const product = productMap[item.productId];
                  const name = product?.name ?? 'Loading…';
                  const gradient = product?.gradient ?? 'from-slate-100 to-slate-200';
                  const visualSeed = product?.visualSeed ?? 'leaf';
                  const variant = product?.variants?.find((v) => v.id === item.selectedVariantId);

                  return (
                    <div key={`${item.productId}-${item.selectedVariantId || ''}`} className="flex gap-3 pt-4 first:pt-0">
                      <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center shrink-0">
                        <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-10`} />
                        <ProductIllustration type={visualSeed} className="w-6 h-6 text-slate-700/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{name}</h4>
                        {variant && (
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
                            {variant.name}
                          </span>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</span>
                          <span className="text-xs font-bold text-slate-800">{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total calculations */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-800">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-3 mt-1">
                  <span>Total Amount</span>
                  <span className="text-lg font-black text-slate-950">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2 focus:outline-none shadow-md hover:shadow-lg shadow-emerald-600/10 disabled:opacity-50"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>{isPending ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              </button>
            </div>

            {/* Gurantee Card */}
            <div className="bg-slate-100/50 rounded-2xl border border-slate-200/50 p-5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Secure Checkout Guarantee</h4>
                <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed">
                  Your purchase details are directly synced with our database using SSL encryption. Cash on delivery protects your payments until delivery.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
