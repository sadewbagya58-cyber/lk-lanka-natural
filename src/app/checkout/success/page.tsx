'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, Calendar, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ItemImage from '@/components/ItemImage';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/currency';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName?: string | null;
  variantName?: string | null;
  productImage?: string | null;
  quantity: number;
  price: number;
  product?: {
    name: string;
    gradient?: string | null;
    visualSeed?: string | null;
    images?: Array<{ url: string }>;
  };
  variant?: {
    name: string;
    imageUrl?: string | null;
  } | null;
}

interface OrderDetails {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  street?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  deliveryNote?: string | null;
  subtotal?: number | null;
  deliveryFee?: number | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  address?: {
    street: string;
    city: string;
    phone: string;
  } | null;
  items: OrderItem[];
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.error('Failed to load success order details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying order confirmation...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Order Confirmed</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your order has been placed successfully! Reference: <span className="font-bold font-mono text-slate-800">{orderId}</span>
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/account" className="inline-flex h-11 items-center justify-center px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all">
            View My Orders
          </Link>
          <Link href="/products" className="inline-flex h-11 items-center justify-center px-5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const displayOrderNumber = order.orderNumber || `KLN-${order.id.substring(0, 8).toUpperCase()}`;
  const street = order.street || order.address?.street || '';
  const city = order.city || order.address?.city || '';
  const district = order.district || '';
  const province = order.province || '';
  const postalCode = order.postalCode || '';
  const country = order.country || 'Sri Lanka';
  const customerName = order.customerName || 'Valued Customer';
  const phone = order.customerPhone || order.address?.phone || '';

  const subtotal = order.subtotal ?? (order.totalAmount >= 50 ? order.totalAmount : order.totalAmount - 4.99);
  const deliveryFee = order.deliveryFee ?? (order.totalAmount >= 50 ? 0 : 4.99);

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Thank you for your order!</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Order Confirmed</h1>
          <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed max-w-md mx-auto">
            Order <span className="font-bold font-mono text-slate-900">{displayOrderNumber}</span> has been received and is being prepared for dispatch.
          </p>
        </div>
      </div>

      {/* Info Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Summary Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Order Summary</span>
          </h3>
          <div className="flex flex-col gap-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Order Number</span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">{displayOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Name</span>
              <span className="font-bold text-slate-800">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Status</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 text-[10px] uppercase">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-bold text-slate-800">
                {order.paymentMethod === 'COD'
                  ? 'Cash on Delivery (COD)'
                  : order.paymentMethod === 'CARD'
                  ? 'Pay Online by Card'
                  : 'Direct Bank Transfer (Legacy)'}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Delivery Address</span>
          </h3>
          <div className="text-xs text-slate-600 flex flex-col gap-1.5 leading-relaxed">
            <p className="font-bold text-slate-800">{street}</p>
            <p className="font-semibold text-slate-700">
              {[city, district, province, postalCode].filter(Boolean).join(', ')}
            </p>
            <p className="font-semibold text-slate-600">{country}</p>
            {phone && (
              <p className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Phone:</span>
                <span className="font-bold text-slate-800">{phone}</span>
              </p>
            )}
            {order.deliveryNote && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-slate-500">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <span className="italic">Note: &quot;{order.deliveryNote}&quot;</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Receipt */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col gap-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5">
          Receipt Items
        </h3>
        <div className="flex flex-col divide-y divide-slate-100 text-xs">
          {order.items.map((item) => {
            const name = item.productName || item.product?.name || 'Product';
            const variantName = item.variantName || item.variant?.name;
            const displayImage = item.productImage || item.variant?.imageUrl || item.product?.images?.[0]?.url;
            return (
              <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ItemImage
                    src={displayImage}
                    alt={name}
                    gradient={item.product?.gradient}
                    visualSeed={item.product?.visualSeed}
                    className="w-11 h-11"
                    iconClassName="w-5.5 h-5.5"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{name}</span>
                    {variantName && (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
                        Option: {variantName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-slate-600 font-medium">
                  <span>{item.quantity} x {formatPrice(item.price)}</span>
                  <span className="font-bold text-slate-900 min-w-[60px] text-right">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 mt-2 flex flex-col gap-2 border-t border-slate-100 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-800">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-100 pt-3">
              <span>Final Total Paid</span>
              <span className="text-lg text-slate-950">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/account" className="w-full sm:w-auto h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow shadow-emerald-600/10">
          <ShoppingBag className="w-4 h-4" />
          <span>View My Orders</span>
        </Link>
        <Link href="/products" className="w-full sm:w-auto h-12 px-6 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading confirmation...</span>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
