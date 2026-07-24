'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, DollarSign, Clock, Search, ArrowRight, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  country?: string | null;
  user?: {
    name: string;
    email: string;
  } | null;
  address?: {
    phone: string;
  } | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Admin Orders
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const url = new URL('/api/admin/orders', window.location.origin);
        if (filterStatus !== 'ALL') {
          url.searchParams.set('status', filterStatus);
        }
        if (searchQuery) {
          url.searchParams.set('query', searchQuery);
        }

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [filterStatus, searchQuery]);

  // Calculate stats from all orders
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'SHIPPED':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'PROCESSING':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'CANCELLED':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-650 bg-slate-50 border-slate-150';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Orders Tracker</h1>
          <p className="text-xs text-slate-450 font-light mt-1">Process shipments, verify payments, and manage invoices</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Orders */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{loading ? '...' : totalOrdersCount}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Net Revenue</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{loading ? '...' : formatPrice(totalRevenue)}</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">Pending Process</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{loading ? '...' : pendingOrdersCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, email, phone..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-450 shrink-0">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List Viewport */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">Fetching Orders catalog...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
              <p className="text-[10px] text-slate-400 mt-1">There are no orders that match your search or filter configuration.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
          <div className="flex flex-col gap-3 md:hidden p-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-700">
                    {order.orderNumber || `#${order.id.substring(0, 8)}`}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm">
                    {order.customerName || order.user?.name || 'Customer'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {order.customerEmail || order.user?.email}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-black text-slate-900 text-sm">{formatPrice(order.totalAmount)}</span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="h-8 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Manage Order</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-4.5 px-6">Order Number</th>
                  <th className="py-4.5 px-6">Customer</th>
                  <th className="py-4.5 px-6">Date</th>
                  <th className="py-4.5 px-6">Amount</th>
                  <th className="py-4.5 px-6">Payment</th>
                  <th className="py-4.5 px-6">Fulfillment</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] font-bold text-slate-900">
                      {order.orderNumber || `${order.id.substring(0, 8)}...`}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 block">
                        {order.customerName || order.user?.name || 'Customer'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                          {order.customerEmail || order.user?.email}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200/60 shrink-0">
                          {order.country || 'Sri Lanka'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold uppercase block text-slate-700">
                        {order.paymentMethod}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${order.paymentStatus === 'PAID' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-50 border-slate-150'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg items-center gap-1 text-[11px] font-bold transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
