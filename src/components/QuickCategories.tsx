'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CategoryData } from '@/types/product';

export default function QuickCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="w-full py-10 bg-white border-b border-slate-100" aria-label="Quick Category navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Quick Shop</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">Explore Categories</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-2 py-1 rounded-lg"
          >
            View All →
          </Link>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 select-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`snap-start shrink-0 flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 min-w-[110px] sm:min-w-[120px] rounded-2xl border transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${cat.colorClasses ?? 'bg-slate-50 border-slate-100'}`}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100/80 overflow-hidden flex items-center justify-center relative p-1">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-lg p-0.5"
                    unoptimized
                  />
                ) : (
                  <span className="text-base font-black text-emerald-700">{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap text-center">
                {cat.name}
              </span>
              {cat.subCategories && cat.subCategories.length > 0 && (
                <span className="text-[9px] font-semibold text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-100">
                  {cat.subCategories.length} Options
                </span>
              )}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
