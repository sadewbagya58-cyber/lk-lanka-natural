'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithRetry } from '@/lib/fetcher';
import type { CategoryData } from '@/types/product';

export default function QuickCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetchWithRetry<{ categories: CategoryData[] }>('/api/categories')
      .then((data) => {
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="w-full py-6 sm:py-10 bg-white border-b border-slate-100" aria-label="Quick Category navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-4 sm:mb-8 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Quick Shop</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mt-0.5">Explore Categories</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-2 py-1 rounded-lg"
          >
            View All →
          </Link>
        </div>

        {/* Responsive Compact Categories Grid: 4-cols on mobile, 6 on sm, 8 on lg */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${encodeURIComponent(cat.slug)}`}
              className="group flex flex-col items-center justify-center gap-1.5 p-2 sm:p-3 rounded-2xl border border-slate-100/80 bg-slate-50/60 hover:bg-white hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center relative p-1 group-hover:scale-105 transition-transform">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-lg p-0.5"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm sm:text-base font-black text-emerald-700">{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 text-center line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
