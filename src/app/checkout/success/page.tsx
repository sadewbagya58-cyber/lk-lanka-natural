'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/components/AuthProvider';
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, Calendar, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/currency';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
  variant?: {
    name: string;
  } | null;
}

interface OrderDetails {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  address: {
    street: string;
    city: string;
    phone: string;
  };
  items: OrderItem[];
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders`);
        if (res.ok) {
          const data = await res.json();
          const found = data.orders?.find((o: OrderDetails) => o.id === orderId);
          if (found) {
            setOrder(found);
          }
        }
      } catch (err) {
        console.error('Failed to load success order details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadOrder();
    }
  }, [status, orderId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying order status...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="text-lg font-black text-slate-900 mb-2">Order Confirmed</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your order has been placed successfully. Order reference: <span className="font-bold text-slate-800">{orderId}</span>
        </p>
        <Link href="/" className="inline-flex h-11 items-center justify-center px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-650">Thank you for your order!</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Order Confirmed</h1>
          <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed max-w-sm mx-auto">
            We have received your order details and are preparing it for delivery. A confirmation details list is shown below.
          </p>
        </div>
      </div>

      {/* Info Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Summary Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Order Summary</span>
          </h3>
          <div className="flex flex-col gap-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Order ID</span>
              <span className="font-bold text-slate-900 font-mono text-[10px]">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment Status</span>
              <span className="font-extrabold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 text-[10px] uppercase">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-bold text-slate-900 uppercase">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Shipping Address</span>
          </h3>
          <div className="text-xs text-slate-600 flex flex-col gap-1.5 leading-relaxed">
            <p className="font-bold text-slate-800">{order.address.street}</p>
            <p className="font-semibold text-slate-700">{order.address.city}</p>
            <p className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Phone:</span>
              <span className="font-bold text-slate-800">{order.address.phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details instructions if BANK_TRANSFER */}
      {order.paymentMethod === 'BANK_TRANSFER' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <CreditCard className="w-6 h-6 text-blue-650 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <h4 className="font-bold uppercase tracking-wider mb-1">Direct Bank Transfer Instructions</h4>
            <p className="mb-2">Please make a deposit or bank transfer to our corporate account. Use your Order ID <span className="font-bold font-mono text-[11px] bg-blue-100 px-1 rounded">{order.id}</span> as the payment reference code.</p>
            <div className="bg-white/80 rounded-xl p-3 border border-blue-150 inline-block font-semibold">
              <p>Bank: <span className="font-black text-slate-850">Lanka Natural Bank</span></p>
              <p>Account Name: <span className="font-black text-slate-850">KL Lanka Natural (Pvt) Ltd</span></p>
              <p>Account Number: <span className="font-black text-slate-850">123456789012</span></p>
              <p>Branch: <span className="font-black text-slate-850">Colombo Fort Branch</span></p>
            </div>
            <p className="mt-2 text-[10px] text-blue-700 font-medium">Once payment is completed, we will process and ship your order immediately.</p>
          </div>
        </div>
      )}

      {/* Order Items Receipt */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col gap-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5">
          Receipt Items
        </h3>
        <div className="flex flex-col divide-y divide-slate-100 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <span className="font-bold text-slate-905 block truncate">{item.product.name}</span>
                {item.variant && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
                    {item.variant.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 shrink-0 text-slate-600 font-medium">
                <span>{item.quantity} x {formatPrice(item.price)}</span>
                <span className="font-bold text-slate-900 min-w-[60px] text-right">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
          <div className="pt-4 mt-2 flex justify-between font-black text-slate-900 text-sm">
            <span>Total Amount Paid</span>
            <span className="text-lg text-slate-950">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/account" className="w-full sm:w-auto h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow shadow-emerald-600/10">
          <ShoppingBag className="w-4 h-4" />
          <span>Go to My Orders</span>
        </Link>
        <Link href="/products" className="w-full sm:w-auto h-12 px-6 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading...</span>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
