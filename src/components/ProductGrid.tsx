'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Sparkles, Flame, CheckCircle2, LayoutGrid, Package } from 'lucide-react';
import type { ProductCardData } from '@/types/product';

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'bestseller' | 'new'>('all');
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'All Products', icon: LayoutGrid },
    { id: 'featured', label: 'Featured Products', icon: Sparkles },
    { id: 'bestseller', label: 'Best Sellers', icon: CheckCircle2 },
    { id: 'new', label: 'New Arrivals', icon: Flame },
  ] as const;

  // Fetch products from API on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setAllProducts(data.products);
        }
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  const dataMap: Record<string, ProductCardData[]> = {
    all: allProducts,
    featured: allProducts.filter((p) => p.isFeatured),
    bestseller: allProducts.filter((p) => p.isBestSeller),
    new: allProducts.filter((p) => p.isNewArrival),
  };

  const filteredProducts = dataMap[activeTab] || [];

  return (
    <section className="w-full py-10 md:py-16 bg-slate-50 border-b border-slate-100" id="products-catalog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Selection Row */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Our Catalog</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">Explore Our Natural Collection</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 border border-slate-200 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 w-full md:w-auto shrink-0 select-none ${
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

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-4 h-80 animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State for Filtered Collection */
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No products available in this collection.</h3>
            <p className="text-xs text-slate-400 font-light max-w-sm">
              Try selecting the All Products tab or check back later for new inventory additions.
            </p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* Product Card Grid */
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
        )}

      </div>
    </section>
  );
}
