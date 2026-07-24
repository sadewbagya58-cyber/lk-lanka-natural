'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, ShieldCheck, AlertCircle, LogOut, ArrowRight, UserCheck, Key, ShoppingBag, Calendar, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession, signOut } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductIllustration from '@/components/ProductIllustration';
import { formatPrice } from '@/lib/currency';

interface ProfileData {
  name: string;
  phone: string;
  address_street: string;
  address_city: string;
}

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: {
    name: string;
    slug: string;
    gradient: string;
    visualSeed: string;
  };
  variant?: {
    name: string;
    imageUrl?: string | null;
  } | null;
}

interface Order {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  street?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  customerPhone?: string | null;
  deliveryNote?: string | null;
  address?: {
    street: string;
    city: string;
    phone: string;
  } | null;
  items: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Valued Customer',
    phone: '',
    address_street: '',
    address_city: '',
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load user profile details
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const loadProfile = async () => {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (res.ok) {
            setProfile({
              name: data.name || '',
              phone: data.phone || '',
              address_street: data.address_street || '',
              address_city: data.address_city || '',
            });
          } else {
            setError(data.error || 'Failed to load profile.');
          }
        } catch {
          setError('Error loading account information.');
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }
  }, [status, session, router]);

  // Load user orders history when viewing orders tab
  useEffect(() => {
    if (status !== 'authenticated' || activeTab !== 'orders') return;

    async function loadOrders() {
      setOrdersLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setError('Failed to load order history.');
        }
      } catch {
        setError('Error connecting to order history API.');
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrders();
  }, [status, activeTab]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            address_street: profile.address_street,
            address_city: profile.address_city,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to update profile details.');
          return;
        }

        await update({
          name: profile.name,
          phone: profile.phone
        });

        setSuccess('Profile information updated successfully!');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    });
  };

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      router.push('/');
    }
  };

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'DELIVERED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'SHIPPED':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'PROCESSING':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'CANCELLED':
        return 'text-rose-705 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-150';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying Session...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Navigation Menu */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate">{profile.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => { setActiveTab('profile'); setError(null); setSuccess(null); }}
                className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-left transition-colors focus:outline-none ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}
              >
                <UserCheck className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setError(null); setSuccess(null); }}
                className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-left transition-colors focus:outline-none ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}
              >
                <ShoppingBag className="w-4 h-4 text-slate-450" />
                Order History
              </button>
              <button
                onClick={() => alert('Security features ready')}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-left focus:outline-none transition-colors"
              >
                <Key className="w-4 h-4 text-slate-450" />
                Password &amp; Security
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 text-left focus:outline-none mt-2 transition-colors border-t border-slate-100 pt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Account
              </button>
            </nav>
          </div>

          {/* Right Forms Content Area */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
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

            {activeTab === 'profile' ? (
              /* Profile Fields Card */
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 mb-6">
                  Personal Information
                </h2>

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pname" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Full Name *
                    </label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                      <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="pname"
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pphone" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Contact Phone *
                    </label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                      <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        id="pphone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+94 77 123 4567"
                        className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Street */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="pstreet" className="text-xs font-black text-slate-505 uppercase tracking-widest">
                      Delivery Address (Street)
                    </label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                      <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        id="pstreet"
                        type="text"
                        value={profile.address_street}
                        onChange={(e) => setProfile({ ...profile, address_street: e.target.value })}
                        placeholder="124 Galle Road"
                        className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Shipping City */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pcity" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      City / Suburb
                    </label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                      <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        id="pcity"
                        type="text"
                        value={profile.address_city}
                        onChange={(e) => setProfile({ ...profile, address_city: e.target.value })}
                        placeholder="Colombo 03"
                        className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-6 h-12 bg-emerald-600 hover:bg-emerald-705 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <span>{isPending ? 'Updating...' : 'Save Profile Details'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              /* Order History View Tab */
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5">
                  Order History
                </h2>

                {ordersLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Loading orders history...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center max-w-sm mx-auto flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-7 h-7 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">No Orders Placed Yet</h3>
                      <p className="text-[10px] text-slate-405 leading-relaxed mt-1">Once you place your first order from checkout, your live delivery receipt will be shown here.</p>
                    </div>
                    <Link href="/products" className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all">
                      Browse Store
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <div key={order.id} className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-slate-300 transition-colors">
                          
                          {/* Order Header Summary */}
                          <div
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-4 bg-slate-50/50 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 hover:bg-slate-50 transition-colors select-none"
                          >
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-550 font-medium">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Order Number</span>
                                <span className="font-bold text-slate-900 font-mono text-[11px]">
                                  {order.orderNumber || `KLN-${order.id.substring(0, 8).toUpperCase()}`}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Placed On</span>
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Total Amount</span>
                                <span className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-405" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-405" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-4 text-xs divide-y divide-slate-100">
                              
                              {/* Order items list */}
                              <div className="flex flex-col gap-3">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Items Ordered</span>
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                                    <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center shrink-0">
                                      <div className={`absolute inset-0 bg-gradient-to-tr ${item.product?.gradient || 'from-slate-100 to-slate-200'} opacity-10`} />
                                      <ProductIllustration type={item.product?.visualSeed || 'leaf'} className="w-5 h-5 text-slate-700/60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-slate-900 truncate leading-snug">{item.product?.name || 'Product'}</h4>
                                      {item.variant && (
                                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
                                          Option: {item.variant.name}
                                        </span>
                                      )}
                                      <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-medium">
                                        <span>Qty: {item.quantity} x {formatPrice(item.price)}</span>
                                        <span className="font-bold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Delivery & payment info */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Delivery Address</span>
                                  <p className="font-bold text-slate-800 leading-relaxed">
                                    {order.street || order.address?.street || 'Address'}
                                  </p>
                                  <p className="font-medium text-slate-600 mt-0.5">
                                    {[order.city || order.address?.city, order.district, order.province, order.postalCode].filter(Boolean).join(', ')}
                                  </p>
                                  {(order.customerPhone || order.address?.phone) && (
                                    <p className="text-[10px] text-slate-450 mt-1 font-semibold">Phone: {order.customerPhone || order.address?.phone}</p>
                                  )}
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Payment &amp; Method</span>
                                  <div className="flex flex-col gap-1.5">
                                     <p className="font-bold text-slate-800">Method: <span className="text-slate-900">{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'CARD' ? 'Pay Online by Card' : 'Direct Bank Transfer (Legacy)'}</span></p>
                                    <p className="font-bold text-slate-800">
                                      Payment Status:{' '}
                                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black border ${order.paymentStatus === 'PAID' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-600 bg-slate-50 border-slate-150'}`}>
                                        {order.paymentStatus}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Google Link Status Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Linked OAuth Accounts</h4>
                <p className="text-[10px] text-slate-400 mt-1">Connect your Google profile for one-click access credentials</p>
              </div>
              <button
                onClick={() => alert('OAuth configuration update link requested')}
                className="px-4 py-2.5 border border-slate-200 hover:border-slate-355 bg-white text-slate-700 font-bold text-[11px] rounded-xl flex items-center gap-2 transition-colors focus:outline-none"
              >
                <span>Link Google Account</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
