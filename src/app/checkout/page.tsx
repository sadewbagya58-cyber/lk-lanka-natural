'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';
import { formatPrice } from '@/lib/currency';
import { useSession } from '@/components/AuthProvider';
import {
  MapPin,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  User,
  Phone,
  Mail,
  FileText,
  RefreshCw,
  Globe,
  AlertCircle,
  Upload,
  Zap,
  Banknote,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ItemImage from '@/components/ItemImage';
import { fetchWithRetry } from '@/lib/fetcher';
import { isCustomPortraitArt } from '@/lib/custom-portrait';
import type { ProductCardData } from '@/types/product';
import {
  COUNTRIES,
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS_BY_PROVINCE,
  ALL_SRI_LANKA_DISTRICTS,
} from '@/lib/countries';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNowQuery = searchParams.get('buyNow') === 'true';

  const { data: session, status } = useSession();
  const { cartItems, getCartSubtotal, clearCart } = useCartStore();
  const { buyNowItem, clearBuyNowItem } = useBuyNowStore();

  const isBuyNow = isBuyNowQuery && Boolean(buyNowItem);

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
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka',
    deliveryNote: '',
  });

  // Method Selections
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD_COURIER');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [productMap, setProductMap] = useState<Record<string, ProductCardData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Custom Portrait Art reference photo upload state
  const [referencePhotoUrl, setReferencePhotoUrl] = useState<string | null>(null);
  const [referencePhotoUploading, setReferencePhotoUploading] = useState(false);
  const [referencePhotoFile, setReferencePhotoFile] = useState<File | null>(null);
  const [referencePhotoError, setReferencePhotoError] = useState<string | null>(null);

  const isSriLanka = deliveryAddress.country === 'Sri Lanka';

  // District options filtered by province
  const availableDistricts = useMemo(() => {
    if (!deliveryAddress.province) return ALL_SRI_LANKA_DISTRICTS;
    return SRI_LANKA_DISTRICTS_BY_PROVINCE[deliveryAddress.province] || ALL_SRI_LANKA_DISTRICTS;
  }, [deliveryAddress.province]);

  // Handle Country Change
  const handleCountryChange = (newCountry: string) => {
    const switchingToSL = newCountry === 'Sri Lanka';
    setDeliveryAddress((prev) => ({
      ...prev,
      country: newCountry,
      district: switchingToSL ? prev.district : '',
      province: switchingToSL ? prev.province : '',
      state: !switchingToSL ? prev.state : '',
    }));

    if (!switchingToSL) {
      setDeliveryMethod('INTERNATIONAL_SHIPPING');
      setPaymentMethod('CARD');
    } else {
      setDeliveryMethod('STANDARD_COURIER');
      setPaymentMethod('COD');
    }
  };

  // Handle Province Change
  const handleProvinceChange = (newProvince: string) => {
    setDeliveryAddress((prev) => {
      const districtsForNewProv = SRI_LANKA_DISTRICTS_BY_PROVINCE[newProvince] || [];
      const isCurrentDistrictValid = districtsForNewProv.includes(prev.district);
      return {
        ...prev,
        province: newProvince,
        district: isCurrentDistrictValid ? prev.district : (districtsForNewProv[0] || ''),
      };
    });
  };

  // Compute Subtotal & Totals
  const currentItems = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      return [
        {
          productId: buyNowItem.productId,
          selectedVariantId: buyNowItem.variantId,
          quantity: buyNowItem.quantity,
          unitPrice: buyNowItem.unitPrice,
        },
      ];
    }
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const hasCustomPortraitArt = useMemo(() => {
    return currentItems.some((item) => {
      const prod = productMap[item.productId];
      return isCustomPortraitArt(prod);
    });
  }, [currentItems, productMap]);

  const handlePhotoSelect = async (file: File) => {
    setReferencePhotoError(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setReferencePhotoError('Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setReferencePhotoError('File size exceeds maximum limit of 10MB.');
      return;
    }

    setReferencePhotoFile(file);
    setReferencePhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/reference', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setReferencePhotoUrl(data.url);
      } else {
        const data = await res.json();
        setReferencePhotoError(data.error || 'Failed to upload reference photo.');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setReferencePhotoError('Network error uploading photo. Please try again.');
    } finally {
      setReferencePhotoUploading(false);
    }
  };

  const subtotal = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      const prod = productMap[buyNowItem.productId];
      const variant = prod?.variants?.find((v) => v.id === buyNowItem.variantId);
      const price = typeof buyNowItem.unitPrice === 'number' && !isNaN(buyNowItem.unitPrice) && buyNowItem.unitPrice > 0
        ? buyNowItem.unitPrice
        : (variant?.price ?? prod?.price ?? 0);
      return price * buyNowItem.quantity;
    }
    return getCartSubtotal();
  }, [isBuyNow, buyNowItem, productMap, getCartSubtotal]);

  // Delivery fee logic: Sri Lanka = $4.99 or FREE for $50+. International = FREE / Quote Pending.
  const shippingCost = isSriLanka ? (subtotal >= 50.0 ? 0 : 4.99) : 0;
  const total = subtotal + shippingCost;

  // Load User Saved Profile Address & Product Display Data
  useEffect(() => {
    if (!isBuyNow && cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    async function loadCheckoutData() {
      try {
        const [profileRes, productsRes] = await Promise.allSettled([
          fetch('/api/profile'),
          fetchWithRetry<{ products: ProductCardData[] }>('/api/products'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const profileData = await profileRes.value.json();
          setCustomerInfo((prev) => ({
            ...prev,
            fullName: profileData.name || session?.user?.name || '',
            email: session?.user?.email || '',
            phone: profileData.phone || '',
          }));

          setDeliveryAddress((prev) => ({
            ...prev,
            street: profileData.address_street || prev.street,
            city: profileData.address_city || prev.city,
            country: profileData.address_country || prev.country,
            postalCode: profileData.address_postalCode || prev.postalCode,
          }));
        }

        if (productsRes.status === 'fulfilled' && productsRes.value?.products?.length) {
          const map: Record<string, ProductCardData> = {};
          productsRes.value.products.forEach((p: ProductCardData) => {
            map[p.id] = p;
          });
          setProductMap(map);
        }
      } catch (err) {
        console.error('Checkout data load warning:', err);
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      loadCheckoutData();
    }
  }, [status, session, cartItems.length, isBuyNow, router]);

  // Form Submit Handler
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Customer Fields
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

    // Validate Address Fields based on Country
    if (!deliveryAddress.street.trim()) {
      setError(isSriLanka ? 'Please enter your Address / Street / Village.' : 'Please enter Address Line 1.');
      return;
    }
    if (!deliveryAddress.city.trim()) {
      setError('Please enter your City / Town.');
      return;
    }

    if (isSriLanka) {
      if (!deliveryAddress.province.trim()) {
        setError('Please select a Sri Lankan Province.');
        return;
      }
      if (!deliveryAddress.district.trim()) {
        setError('Please select a Sri Lankan District.');
        return;
      }
    }

    if (!deliveryAddress.postalCode.trim()) {
      setError('Please enter your Postal / ZIP Code.');
      return;
    }

    if (!isSriLanka && paymentMethod === 'COD') {
      setError('Cash on Delivery (COD) is only available for Sri Lanka orders.');
      return;
    }

    if (paymentMethod === 'CARD') {
      setError(
        isSriLanka
          ? 'Online card payments are currently unavailable. Please select Cash on Delivery.'
          : 'Online card payment is currently unavailable for international orders. Please check back soon.'
      );
      return;
    }

    if (hasCustomPortraitArt && !referencePhotoUrl) {
      setError('Please upload your reference photo for the Custom Portrait Art before placing your order.');
      const el = document.getElementById('reference-photo-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
            deliveryMethod: isSriLanka ? deliveryMethod : 'INTERNATIONAL_SHIPPING',
            paymentMethod: isSriLanka ? paymentMethod : 'CARD',
            isBuyNow,
            items: currentItems.map((item) => {
              const prod = productMap[item.productId];
              const isCustom = isCustomPortraitArt(prod);
              return {
                productId: item.productId,
                selectedVariantId: item.selectedVariantId || null,
                quantity: item.quantity,
                image: (item as { image?: string | null }).image || prod?.image || null,
                customUploadImage: isCustom ? referencePhotoUrl : null,
              };
            }),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to place order. Please check stock and details.');
          return;
        }

        // Clear appropriate store upon successful order transaction
        if (isBuyNow) {
          clearBuyNowItem();
        } else {
          clearCart();
        }

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

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Checkout &amp; Order Placement</h1>
          {isBuyNow && (
            <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>Direct Buy Now Mode</span>
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold mb-6">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* 1. Country Selection Card (FIRST STEP) */}
            <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                Step 1
              </div>

              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>1. Select Country / Delivery Destination *</span>
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Country *</label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                  <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50">
                    <Globe className="w-4 h-4 text-emerald-600" />
                  </span>
                  <select
                    value={deliveryAddress.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none bg-white cursor-pointer"
                    required
                  >
                    <option value="Sri Lanka">🇱🇰 Sri Lanka (Island-wide Delivery)</option>
                    <optgroup label="International Destinations">
                      {COUNTRIES.filter((c) => c !== 'Sri Lanka').map((c) => (
                        <option key={c} value={c}>
                          🌐 {c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {isSriLanka ? (
                    <span className="text-emerald-700 font-semibold">
                      ✓ Island-wide courier delivery available across all 9 provinces with COD support.
                    </span>
                  ) : (
                    <span className="text-slate-600 font-semibold">
                      🌐 International shipping to {deliveryAddress.country}. Shipping quotes confirmed after order placement via Bank Transfer.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 2. Customer Information Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>2. Customer Information</span>
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
                      placeholder={isSriLanka ? "+94 77 123 4567" : "+1 555 123 4567"}
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
                      placeholder={isSriLanka ? "+94 11 234 5678" : "+1 555 987 6543"}
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery Address Card (Dynamic) */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>3. Delivery Address ({deliveryAddress.country})</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {isSriLanka ? 'Sri Lanka Address' : 'International Address'}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Street / Address Line 1 */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {isSriLanka ? 'Address / Street / Village *' : 'Address Line 1 *'}
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder={isSriLanka ? '124 Galle Road, Bambalapitiya' : '123 Main Street'}
                      className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Address Line 2 (For International) */}
                {!isSriLanka && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Address Line 2 (Apartment / Suite / Unit - Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine2}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, addressLine2: e.target.value })}
                      placeholder="Apt 4B, Building 2"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                )}

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City / Town *</label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    placeholder={isSriLanka ? 'Colombo 04' : 'London / New York'}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* Conditional Fields for Sri Lanka: Province & District */}
                {isSriLanka ? (
                  <>
                    {/* Province Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Province *</label>
                      <select
                        value={deliveryAddress.province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
                        required
                      >
                        <option value="">Select Province</option>
                        {SRI_LANKA_PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Dropdown (Filtered) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">District *</label>
                      <select
                        value={deliveryAddress.district}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, district: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
                        required
                      >
                        <option value="">Select District</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  /* State / Province / Region (For International) */
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      State / Province / Region (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      placeholder="e.g. California / Greater London"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                )}

                {/* Postal Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    placeholder={isSriLanka ? '00400' : '90210 / EC1A 1BB'}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Custom Portrait Art Reference Photo Card */}
            {hasCustomPortraitArt && (
              <div id="reference-photo-section" className="bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-3.5">
                  <h2 className="text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Customer Reference Photo (Required) *</span>
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    Custom Artwork Order
                  </span>
                </div>

                <p className="text-xs text-purple-900 font-medium">
                  Please upload the reference photo you would like our artist to use to create your Custom Portrait Art.
                </p>

                {referencePhotoError && (
                  <div className="bg-rose-100 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-bold">
                    {referencePhotoError}
                  </div>
                )}

                {referencePhotoUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-purple-200">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                      <Image
                        src={referencePhotoUrl}
                        alt="Uploaded Reference Photo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-center sm:text-left flex-1">
                      <span className="text-xs font-bold text-slate-800">
                        {referencePhotoFile?.name || 'Uploaded Reference Photo'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reference Photo Uploaded Successfully
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReferencePhotoUrl(null);
                        setReferencePhotoFile(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-purple-300 rounded-xl bg-white hover:bg-purple-50/50 transition-colors cursor-pointer text-center relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoSelect(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      aria-label="Upload reference photo"
                    />
                    {referencePhotoUploading ? (
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-xs py-4">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                        <span>Uploading reference photo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-purple-500" />
                        <span className="text-xs font-bold text-slate-800">
                          Click or drag & drop to upload reference photo *
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Allowed formats: JPG, JPEG, PNG, WEBP (Max size: 10MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Delivery Note Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>4. Delivery Note / Instructions (Optional)</span>
              </h2>
              <textarea
                value={deliveryAddress.deliveryNote}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryNote: e.target.value })}
                placeholder="e.g. Special courier instructions, leave at front desk, call upon arrival."
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-20"
              />
            </div>

            {/* 5. Delivery Method Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>5. Delivery Method</span>
              </h2>

              {isSriLanka ? (
                <label className="p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all border-emerald-500 bg-emerald-50/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="STANDARD_COURIER"
                      checked={true}
                      readOnly
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Standard Courier Delivery (Island-wide)</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Delivered safely to your doorstep within 2-4 business days.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </label>
              ) : (
                <div className="p-4 border border-emerald-500 bg-emerald-50/40 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>International Shipping ({deliveryAddress.country})</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Quote Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    International shipping charges will be calculated based on your destination country and order details after order submission.
                  </p>
                </div>
              )}
            </div>

            {/* 6. Payment Method Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>6. Payment Method *</span>
              </h2>

              <div className="flex flex-col gap-3">
                {/* Cash on Delivery (COD) - Only available for Sri Lanka */}
                {isSriLanka && (
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
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Pay cash to courier upon arrival anywhere in Sri Lanka.</span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Pay Online by Card */}
                <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 block">Pay Online by Card</span>
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Online card payment — Coming Soon
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        Securely pay using Visa, Mastercard, or other cards supported by our payment gateway.
                      </span>
                    </div>
                  </div>
                </label>

                {!isSriLanka && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Notice for International Customers
                    </span>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      Online card payment is currently unavailable for international orders. Please check back soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  Order Summary
                </h2>
                {isBuyNow && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    1 Product (Buy Now)
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-4 divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
                {currentItems.map((item) => {
                  const product = productMap[item.productId];
                  const name = product?.name ?? 'Loading…';
                  const gradient = product?.gradient ?? 'from-slate-100 to-slate-200';
                  const visualSeed = product?.visualSeed ?? 'leaf';
                  const variant = product?.variants?.find((v) => v.id === item.selectedVariantId);
                  const displayImage = variant?.imageUrl || (isBuyNow ? buyNowItem?.image : item.image) || product?.image;

                  const effectiveUnitPrice = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) && item.unitPrice > 0
                    ? item.unitPrice
                    : (variant?.price ?? product?.price ?? 0);

                  return (
                    <div key={`${item.productId}-${item.selectedVariantId || ''}`} className="flex gap-3 pt-4 first:pt-0">
                      <ItemImage
                        src={displayImage}
                        alt={name}
                        gradient={gradient}
                        visualSeed={visualSeed}
                        className="w-12 h-12"
                        iconClassName="w-6 h-6"
                      />
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
                    {isSriLanka ? (shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)) : 'Quote Pending'}
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
                  All prices, stock availability, and delivery settings are verified on our server before order creation.
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

function CheckoutFallback() {
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

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </React.Suspense>
  );
}
