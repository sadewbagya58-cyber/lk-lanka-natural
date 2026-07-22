'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Tag, 
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Brands', href: '/admin/brands', icon: Tag },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 py-8 gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm h-fit">
          <div className="px-3 py-2 border-b border-slate-100 mb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
              <h2 className="text-base font-black text-slate-900">Admin Control</h2>
            </div>
            <Link 
              href="/" 
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              title="Back to Public Site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Admin Content Viewport */}
        <main className="flex-1 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
