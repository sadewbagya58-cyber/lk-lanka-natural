'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Layers, Plus, ArrowUpRight, ShoppingBag, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    brandsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, catRes, brandRes, ordersRes] = await Promise.allSettled([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch('/api/admin/orders'),
        ]);

        const prodData = prodRes.status === 'fulfilled' && prodRes.value.ok ? await prodRes.value.json() : {};
        const catData = catRes.status === 'fulfilled' && catRes.value.ok ? await catRes.value.json() : {};
        const brandData = brandRes.status === 'fulfilled' && brandRes.value.ok ? await brandRes.value.json() : {};
        const ordersData = ordersRes.status === 'fulfilled' && ordersRes.value.ok ? await ordersRes.value.json() : {};

        const ordersList: Order[] = ordersData.orders || [];
        const activeOrders = ordersList.filter((o) => o.status !== 'CANCELLED');
        const calculatedRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          productsCount: prodData.products?.length || 0,
          categoriesCount: catData.categories?.length || 0,
          brandsCount: brandData.brands?.length || 0,
          ordersCount: ordersList.length,
          revenue: calculatedRevenue,
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Admin Overview</h1>
          <p className="text-xs text-slate-400 font-light mt-1">Manage catalog items, categories, brands, and tracking orders</p>
        </div>

        <Link
          href="/admin/products/new"
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Revenue */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Net Revenue</span>
          <span className="text-2xl font-black text-slate-900">
            {loading ? '...' : formatPrice(stats.revenue)}
          </span>
          <Link href="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
            <span>Verify Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Orders</span>
          <span className="text-2xl font-black text-slate-900">
            {loading ? '...' : stats.ordersCount}
          </span>
          <Link href="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
            <span>Manage Shipments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Products</span>
          <span className="text-2xl font-black text-slate-900">
            {loading ? '...' : stats.productsCount}
          </span>
          <Link href="/admin/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
            <span>Manage Products</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Catalog Metadata */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Catalog Meta</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${stats.categoriesCount} / ${stats.brandsCount}`}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Cat/Brand</span>
          </div>
          <Link href="/admin/categories" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
            <span>Manage Types</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Setup Actions */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-950">Store Dashboard Fully Connected</h3>
            <p className="text-xs text-emerald-800 font-medium">Use the sidebar navigation tabs to view invoices, configure brands/categories, or update product catalog parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
