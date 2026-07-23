'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/currency';
import { useSession } from '@/components/AuthProvider';
import { ShieldCheck, ChevronRight, AlertCircle, MapPin, Phone, User, Mail, Truck, Banknote, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductIllustration from '@/components/ProductIllustration';
import type { ProductCardData } from '@/types/product';

const SRI_LANKAN_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, getCartSubtotal, clearCart } = useCartStore();

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    altPhone: '',
  });

  // Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    country: 'Sri Lanka',
    deliveryNote: '',
  });

  // Method Selections
  const [deliveryMethod, setDeliveryMethod] = useState('COD');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [productMap, setProductMap] = useState<Record<string, ProductCardData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = getCartSubtotal();
  const shippingCost = subtotal >= 50.0 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  // 1. Fetch User Saved Profile Address & Product Display Data
  useEffect(() => {
    // Redirect to cart if empty
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    async function loadCheckoutData() {
      try {
        const [profileRes, productsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/products')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCustomerInfo((prev) => ({
            ...prev,
            fullName: profileData.name || session?.user?.name || '',
            email: session?.user?.email || '',
            phone: profileData.phone || '',
          }));

          setDeliveryAddress((prev) => ({
            ...prev,
            street: profileData.address_street || '',
            city: profileData.address_city || '',
          }));
        } else if (session?.user) {
          setCustomerInfo((prev) => ({
            ...prev,
            fullName: session.user?.name || '',
            email: session.user?.email || '',
          }));
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const map: Record<string, ProductCardData> = {};
          (productsData.products || []).forEach((p: ProductCardData) => { map[p.id] = p; });
          setProductMap(map);
        }
      } catch (err) {
        console.error('Failed to load checkout details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      loadCheckoutData();
    }
  }, [status, session, cartItems.length, router]);

  // 2. Validate & Handle Order Placement
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Required Fields
    if (!customerInfo.fullName.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!customerInfo.email.trim()) {
      setError('Please enter your Email Address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email.trim())) {
      setError('Please enter a valid Email Address.');
      return;
    }
    if (!customerInfo.phone.trim()) {
      setError('Please enter your Phone Number.');
      return;
    }
    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!phoneRegex.test(customerInfo.phone.trim())) {
      setError('Please enter a valid Phone Number.');
      return;
    }

    if (!deliveryAddress.street.trim()) {
      setError('Please enter your Address / Street / Village.');
      return;
    }
    if (!deliveryAddress.city.trim()) {
      setError('Please enter your City / Town.');
      return;
    }
    if (!deliveryAddress.district.trim()) {
      setError('Please enter your District.');
      return;
    }
    if (!deliveryAddress.province.trim()) {
      setError('Please enter your Province.');
      return;
    }
    if (!deliveryAddress.postalCode.trim()) {
      setError('Please enter your Postal / ZIP Code.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerInfo,
            deliveryAddress,
            deliveryMethod,
            paymentMethod,
            items: cartItems.map((item) => ({
              productId: item.productId,
              selectedVariantId: item.selectedVariantId,
              quantity: item.quantity,
            }))
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to place order. Please check stock and details.');
          return;
        }

        // Clear local storage cart store upon successful order transaction
        clearCart();

        // Redirect to Order Success Confirmation page
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'A network connection error occurred. Please try again.');
      }
    });
  };

  if (loading || status === 'loading') {
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link href="/cart" className="hover:text-emerald-600 transition-colors">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2" />
          <span className="text-slate-800">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Checkout &amp; Order Placement</h1>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold mb-6">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Customer Information Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Customer Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="kasun@example.com"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Alternative Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alt Phone (Optional)</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <Phone className="w-4 h-4 text-slate-350" />
                    </span>
                    <input
                      type="tel"
                      value={customerInfo.altPhone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, altPhone: e.target.value })}
                      placeholder="+94 11 234 5678"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Street / Village */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Address / Street / Village *</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder="124 Galle Road, Bambalapitiya"
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* City / Town */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City / Town *</label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    placeholder="Colombo 04"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* District */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">District *</label>
                  <input
                    type="text"
                    value={deliveryAddress.district}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, district: e.target.value })}
                    placeholder="Colombo"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* Province */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Province *</label>
                  <select
                    value={deliveryAddress.province}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, province: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
                    required
                  >
                    <option value="">Select Province</option>
                    {SRI_LANKAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Postal Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    placeholder="00400"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Country *</label>
                  <input
                    type="text"
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                    placeholder="Sri Lanka"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-slate-50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Additional Delivery Information Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>3. Delivery Note / Special Instructions (Optional)</span>
              </h2>
              <textarea
                value={deliveryAddress.deliveryNote}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryNote: e.target.value })}
                placeholder="e.g. Leave package with security guard or call upon arrival."
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-24"
              />
            </div>

            {/* 4. Delivery Method Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>4. Delivery Method</span>
              </h2>

              <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${deliveryMethod === 'STANDARD_COURIER' || deliveryMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="STANDARD_COURIER"
                    checked={deliveryMethod === 'STANDARD_COURIER' || deliveryMethod === 'COD'}
                    onChange={() => setDeliveryMethod('STANDARD_COURIER')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Standard Courier Delivery (Island-wide)</span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Delivered safely to your doorstep within 2-4 business days.</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </label>
            </div>

            {/* 5. Payment Method Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>5. Payment Method *</span>
              </h2>

              <div className="flex flex-col gap-3">
                <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
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
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Pay cash to courier when order arrives. Safe and hassle-free.</span>
                    </div>
                  </div>
                </label>

                <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
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
                      <span className="text-xs font-bold text-slate-900 block">Direct Bank Transfer</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Transfer directly into our bank account. Instructions provided below.</span>
                    </div>
                  </div>
                </label>

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col gap-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Bank Transfer Details</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Please deposit or transfer the order total to our bank account below. Use your <strong>Order Number</strong> as the transfer reference.
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100/80 font-mono text-[11px] flex flex-col gap-1 text-slate-800">
                      <div><span className="text-slate-400">Bank:</span> Commercial Bank of Ceylon</div>
                      <div><span className="text-slate-400">Account Name:</span> KL Lanka Natural (Pvt) Ltd</div>
                      <div><span className="text-slate-400">Account No:</span> 1000 4829 1948</div>
                      <div><span className="text-slate-400">Branch:</span> Colombo Main Branch</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium italic">
                      Note: Your order status will remain PENDING until your bank payment is verified.
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="flex flex-col gap-4 divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const product = productMap[item.productId];
                  const name = product?.name ?? 'Loading…';
                  const gradient = product?.gradient ?? 'from-slate-100 to-slate-200';
                  const visualSeed = product?.visualSeed ?? 'leaf';
                  const variant = product?.variants?.find((v) => v.id === item.selectedVariantId);

                  const effectiveUnitPrice = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) && item.unitPrice > 0
                    ? item.unitPrice
                    : (variant?.price ?? product?.price ?? 0);

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
                            Option: {variant.name}
                          </span>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} x {formatPrice(effectiveUnitPrice)}</span>
                          <span className="text-xs font-bold text-slate-900">{formatPrice(effectiveUnitPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-800">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-3 mt-1">
                  <span>Final Total</span>
                  <span className="text-lg font-black text-slate-950">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>{isPending ? 'Placing Order...' : 'Place Order'}</span>
              </button>

              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
                  All prices and inventory stock levels are securely validated on our server before order confirmation.
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
