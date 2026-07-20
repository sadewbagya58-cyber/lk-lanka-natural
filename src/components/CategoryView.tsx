"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowDownUp, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductCardData, SubCategoryData, SortOption } from '@/types/product';
import ProductCard from './ProductCard';

interface SerializableCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  colorClasses: string;
  image?: string;
  subCategories: SubCategoryData[];
  featured: boolean;
  sortOrder: number;
}

interface CategoryViewProps {
  category: SerializableCategory;
  products: ProductCardData[];
  iconNode: React.ReactNode;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Newest Arrivals', value: 'newest' },
];

function sortProducts(products: ProductCardData[], sort: SortOption): ProductCardData[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc': return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'newest': return arr.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    default: return arr;
  }
}

export default function CategoryView({ category, products, iconNode }: CategoryViewProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const filteredProducts = useMemo(() => {
    const base = activeSubCategory
      ? products.filter((p) => p.categorySlug === activeSubCategory)
      : products;
    return sortProducts(base, sortBy);
  }, [products, activeSubCategory, sortBy]);

  return (
    <div className="pb-24">
      {/* Hero Banner */}
      <div className={`w-full py-16 px-6 lg:px-12 bg-gradient-to-br ${category.colorClasses} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/30 text-white">
            {iconNode}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-sm">
            {category.name}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl font-medium drop-shadow-sm">
            {category.description}
          </p>
          <div className="mt-8 flex items-center text-sm font-medium text-white/80 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-60" />
            <span className="text-white">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          {/* SubCategories Tabs */}
          <div className="flex-1 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubCategory(null)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeSubCategory === null ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                All Products
              </button>
              {category.subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubCategory(sub.slug)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeSubCategory === sub.slug ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <ArrowDownUp className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer pr-4"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 max-w-md">
              We couldn&apos;t find any products in this subcategory. Try selecting a different filter or checking back later.
            </p>
            <button
              onClick={() => { setActiveSubCategory(null); setSortBy('relevance'); }}
              className="mt-8 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-sm"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
