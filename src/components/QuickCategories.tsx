'use client';

import Link from 'next/link';
import { getAllCategories } from '@/data';

export default function QuickCategories() {
  const categories = getAllCategories();

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

        {/* Horizontal Scroll Strip */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 select-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`snap-start shrink-0 flex flex-col items-center justify-center gap-2.5 p-5 min-w-[120px] rounded-2xl border transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${cat.colorClasses}`}
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100/80 transform group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                  {cat.name}
                </span>
                {cat.subCategories.length > 0 && (
                  <span className="text-[9px] font-semibold text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-100">
                    {cat.subCategories.length} Options
                  </span>
                )}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
