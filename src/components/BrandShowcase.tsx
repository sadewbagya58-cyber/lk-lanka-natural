'use client';

import { Award, Leaf, Shield, Heart, Sparkles, Star, Gem, Flame } from 'lucide-react';
import { getFeaturedBrands } from '@/data';

// Fallback icon mapping for brands that don't have a logoUrl yet
const BRAND_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'brand-ceylon-naturals': Leaf,
  'brand-ayur-vedic': Shield,
  'brand-tropic-essence': Flame,
  'brand-island-gems': Gem,
  'brand-spice-isle': Sparkles,
  'brand-pearl-coast': Heart,
  'brand-vita-boost': Award,
  'brand-aura-luxe': Star,
};

export default function BrandShowcase() {
  const brands = getFeaturedBrands();

  return (
    <section className="w-full py-10 md:py-16 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Authorized Distributor</span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Our Partner Brands</h2>
          <p className="text-xs text-slate-500 font-light mt-1">We bring you certified organic and authentic brands globally</p>
        </div>

        {/* Scrolling row */}
        <div className="relative w-full flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {brands.map((brand) => {
              const Icon = BRAND_ICON_MAP[brand.id] || Award;
              return (
                <div
                  key={brand.id}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors py-3 px-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm select-none"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black tracking-wider uppercase">{brand.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
