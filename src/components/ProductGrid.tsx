'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import type { ProductCardData } from '@/types/product';

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState<'featured' | 'bestseller' | 'new'>('featured');

  const tabs = [
    { id: 'featured', label: 'Featured Products', icon: Sparkles },
    { id: 'bestseller', label: 'Best Sellers', icon: CheckCircle2 },
    { id: 'new', label: 'New Arrivals', icon: Flame },
  ] as const;

  // Data-driven: pull from centralized catalog instead of inline arrays
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);

  // Fetch products from API on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setAllProducts(data.products))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  const dataMap: Record<string, ProductCardData[]> = {
    featured: allProducts.filter((p) => p.isFeatured),
    bestseller: allProducts.filter((p) => p.isBestSeller),
    new: allProducts.filter((p) => p.isNewArrival),
  };

  const matched = dataMap[activeTab] || [];
  const filteredProducts = (matched.length > 0 ? matched : allProducts).slice(0, 8);

  if (allProducts.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-16 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Selection Row */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Curated Collections</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">Top Selections For You</h2>
          </div>

          {/* Clean Light-Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 border border-slate-200 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 w-full md:w-auto shrink-0 select-none ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tabSelectorIndicator"
                      className="absolute inset-0 bg-emerald-600 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Card Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((prod) => (
              <motion.div
                key={prod.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={prod} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
