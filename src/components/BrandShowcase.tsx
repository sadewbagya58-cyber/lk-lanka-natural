'use client';

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import type { BrandData } from '@/types/product';

export default function BrandShowcase() {
  const [brands, setBrands] = useState<BrandData[]>([]);

  useEffect(() => {
    fetch('/api/brands')
      .then((r) => r.json())
      .then((data) => setBrands((data.brands ?? []).filter((b: BrandData) => b.featured)))
      .catch(console.error);
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-16 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Authorized Distributor</span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Our Partner Brands</h2>
          <p className="text-xs text-slate-500 font-light mt-1">We bring you certified organic and authentic brands globally</p>
        </div>

        {/* Brand grid */}
        <div className="relative w-full flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors py-3 px-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm select-none"
              >
                <Award className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black tracking-wider uppercase">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
