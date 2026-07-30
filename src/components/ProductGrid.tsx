'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Sparkles, Flame, CheckCircle2, LayoutGrid, Package, RefreshCw, ArrowRight } from 'lucide-react';
import type { ProductCardData } from '@/types/product';

import { fetchWithRetry } from '@/lib/fetcher';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function seededRandom(seed: number) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Deterministic Fisher-Yates Shuffle using 15-minute window seed
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    const r = seededRandom(currentSeed++);
    const j = Math.floor(r * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'bestseller' | 'new'>('all');
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [windowSeed, setWindowSeed] = useState<number>(() => Math.floor(Date.now() / (15 * 60 * 1000)));

  // Update windowSeed every minute to transition seamlessly at 15-minute boundaries
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSeed = Math.floor(Date.now() / (15 * 60 * 1000));
      if (currentSeed !== windowSeed) {
        setWindowSeed(currentSeed);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [windowSeed]);

  const tabs = [
    { id: 'all', label: 'All Products', icon: LayoutGrid },
    { id: 'featured', label: 'Featured Products', icon: Sparkles },
    { id: 'bestseller', label: 'Best Sellers', icon: CheckCircle2 },
    { id: 'new', label: 'New Arrivals', icon: Flame },
  ] as const;

  // Fetch products — wrapped in useCallback so the retry button can call it
  const loadProducts = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetchWithRetry<{ products: ProductCardData[] }>('/api/products')
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
          setLoadError(false);
        } else {
          setLoadError(data === null);
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  // Select up to 45 products deterministically randomized based on the 15-minute window seed
  const randomizedHomepageProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    const shuffled = seededShuffle(allProducts, windowSeed);
    return shuffled.slice(0, 45);
  }, [allProducts, windowSeed]);

  const dataMap: Record<string, ProductCardData[]> = {
    all: randomizedHomepageProducts,
    featured: randomizedHomepageProducts.filter((p) => p.isFeatured),
    bestseller: randomizedHomepageProducts.filter((p) => p.isBestSeller),
    new: randomizedHomepageProducts.filter((p) => p.isNewArrival),
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
          <div className="grid grid-cols-2 md:flex items-center p-1 bg-slate-200/70 border border-slate-200 rounded-2xl w-full md:w-auto gap-1 md:gap-0">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-4 h-80 animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State — API failed */
          <div className="py-16 text-center flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-dashed border-rose-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Unable to load products</h3>
              <p className="text-xs text-slate-400 font-light max-w-sm mt-1">
                We&apos;re having trouble connecting to the store. Please check your internet connection and try again.
              </p>
            </div>
            <button
              onClick={loadProducts}
              className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
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
          /* Product Card Grid & View All Navigation */
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
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

            {/* View All Button */}
            <div className="flex justify-center mt-10">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
