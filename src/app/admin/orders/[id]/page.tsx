'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, ShoppingBag, ShieldCheck, AlertCircle, Mail, FileText, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import ProductIllustration from '@/components/ProductIllustration';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName?: string | null;
  variantName?: string | null;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
    gradient: string;
    visualSeed: string;
  };
  variant?: {
    name: string;
  } | null;
}

interface OrderDetails {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  altPhone?: string | null;
  street?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  deliveryNote?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  deliveryFee?: number | null;
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  user?: {
    name: string;
    email: string;
  } | null;
  address?: {
    street: string;
    city: string;
    phone: string;
  } | null;
  items: OrderItem[];
}

export default function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('PENDING');

  // Load Order Details
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (!res.ok) {
          setError('Failed to fetch order details.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          setSelectedStatus(data.order.status);
          setSelectedPaymentStatus(data.order.paymentStatus);
        } else {
          setError('Order details not found.');
        }
      } catch (err) {
        console.error('Failed to load admin order:', err);
        setError('Connection failed. Could not load order.');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const confirmCancel = selectedStatus === 'CANCELLED' && order?.status !== 'CANCELLED'
      ? window.confirm('Are you sure you want to CANCEL this order? This action will automatically restore the product/variant inventory stock levels in the database.')
      : true;

    if (!confirmCancel) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: selectedStatus,
            paymentStatus: selectedPaymentStatus
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to update order status');
          return;
        }

        setSuccess('Order status updated successfully!');
        setOrder(prev => prev ? { ...prev, status: selectedStatus, paymentStatus: selectedPaymentStatus } : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    });
  };

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'DELIVERED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'SHIPPED':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'PROCESSING':
        return 'text-indigo-700 bg-indigo-50 border-indigo-100';
      case 'CONFIRMED':
        return 'text-cyan-700 bg-cyan-50 border-cyan-100';
      case 'CANCELLED':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-100';
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">Loading order details...</span>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">{error}</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline">
            Back to Orders Tracker
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const displayOrderNumber = order.orderNumber || `KLN-${order.id.substring(0, 8).toUpperCase()}`;
  const customerName = order.customerName || order.user?.name || 'Customer';
  const customerEmail = order.customerEmail || order.user?.email || 'N/A';
  const customerPhone = order.customerPhone || order.address?.phone || 'N/A';
  const street = order.street || order.address?.street || '';
  const city = order.city || order.address?.city || '';
  const district = order.district || '';
  const province = order.province || '';
  const postalCode = order.postalCode || '';
  const country = order.country || 'Sri Lanka';

  const subtotal = order.subtotal ?? (order.totalAmount >= 50 ? order.totalAmount : order.totalAmount - 4.99);
  const deliveryFee = order.deliveryFee ?? (order.totalAmount >= 50 ? 0 : 4.99);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200/80 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Order Management</span>
            <h1 className="text-lg font-black text-slate-900 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Order</span>
              <span className="font-mono text-emerald-700 font-bold">{displayOrderNumber}</span>
            </h1>
            <p className="text-xs text-slate-450 font-light mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span className={`px-3.5 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Invoice details & Address info */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Order Items list */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
              Items Ordered
            </h3>
            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              {order.items.map((item) => {
                const name = item.productName || item.product?.name || 'Product';
                const variantName = item.variantName || item.variant?.name;
                return (
                  <div key={item.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="relative w-11 h-11 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center shrink-0">
                        <div className={`absolute inset-0 bg-gradient-to-tr ${item.product?.gradient || 'from-slate-100 to-slate-200'} opacity-10`} />
                        <ProductIllustration type={item.product?.visualSeed || 'leaf'} className="w-5.5 h-5.5 text-slate-700/60" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{name}</span>
                        {variantName && (
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
                            Option: {variantName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 text-slate-550 font-medium">
                      <span>{item.quantity} x {formatPrice(item.price)}</span>
                      <span className="font-bold text-slate-900 min-w-[60px] text-right">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                );
              })}
              
              {/* Calculations summary */}
              <div className="pt-4 flex flex-col gap-2.5 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-800">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-100 pt-3 mt-1">
                  <span>Final Order Total</span>
                  <span className="text-lg text-slate-950">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Customer details cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Customer info card */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer Information</span>
              </h4>
              <div className="text-xs flex flex-col gap-1.5 leading-relaxed">
                <p className="font-bold text-slate-800">{customerName}</p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customerEmail}</span>
                </p>
                <p className="text-slate-700 flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customerPhone}</span>
                </p>
                {order.altPhone && (
                  <p className="text-slate-500 text-[11px]">Alt Phone: {order.altPhone}</p>
                )}
              </div>
            </div>

            {/* Shipping address card */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Delivery Address</span>
              </h4>
              <div className="text-xs flex flex-col gap-1.5 leading-relaxed">
                <p className="font-bold text-slate-800">{street}</p>
                <p className="font-semibold text-slate-700">
                  {[city, district, province, postalCode].filter(Boolean).join(', ')}
                </p>
                <p className="font-semibold text-slate-600">{country}</p>
                {order.deliveryNote && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-slate-500">
                    <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span className="italic">Note: &quot;{order.deliveryNote}&quot;</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Status updates control panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
              Manage Status
            </h3>

            <form onSubmit={handleUpdateOrder} className="flex flex-col gap-4">
              
              {/* Fulfillment Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white font-bold"
                >
                  <option value="PENDING">Pending (Created)</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing (Packing)</option>
                  <option value="SHIPPED">Shipped (Dispatched)</option>
                  <option value="DELIVERED">Delivered (Completed)</option>
                  <option value="CANCELLED">Cancelled (Restore Stock)</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Status</label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white font-bold"
                >
                  <option value="PENDING">Pending Payment</option>
                  <option value="PAID">Paid / Settled</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Submit update */}
              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isPending ? 'Updating...' : 'Update Status'}</span>
              </button>

            </form>

            <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 flex flex-col gap-2">
              <div className="flex gap-2">
                <CreditCard className="w-4 h-4 shrink-0 text-slate-350" />
                <p>Payment Mode: <span className="font-bold text-slate-800 uppercase">{order.paymentMethod.replace('_', ' ')} (COD)</span></p>
              </div>
              <div className="flex gap-2">
                <Truck className="w-4 h-4 shrink-0 text-slate-350" />
                <p>Delivery: <span className="font-bold text-slate-800 uppercase">{order.deliveryMethod}</span></p>
              </div>
              <div className="flex gap-2">
                <ShoppingBag className="w-4 h-4 shrink-0 text-slate-350" />
                <p>Status: <span className="font-bold text-slate-800">{order.status}</span>, Payment: <span className="font-bold text-slate-800">{order.paymentStatus}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
