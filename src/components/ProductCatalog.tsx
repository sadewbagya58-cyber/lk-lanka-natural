'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductCardData, CategoryData, BrandData, SortOption } from '@/types/product';
import ProductCard from './ProductCard';

const PAGE_SIZE = 12;

function applyFilters(
  products: ProductCardData[],
  search: string,
  categorySlug: string | null,
  brandIds: string[],
  inStockOnly: boolean,
  sort: SortOption
): ProductCardData[] {
  let filtered = [...products];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q)
    );
  }
  if (categorySlug) {
    filtered = filtered.filter((p) => p.categorySlug === categorySlug);
  }
  if (brandIds.length > 0) {
    filtered = filtered.filter((p) => brandIds.includes(p.brandName));
  }
  if (inStockOnly) {
    filtered = filtered.filter((p) => p.inStock);
  }

  switch (sort) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'newest': filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0)); break;
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: break;
  }
  return filtered;
}

export default function ProductCatalog() {
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/brands').then((r) => r.json()),
    ])
      .then(([prodData, catData, brandData]) => {
        setAllProducts(prodData.products ?? []);
        setCategories(catData.categories ?? []);
        setBrands(brandData.brands ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => applyFilters(allProducts, searchQuery, selectedCategory, selectedBrands, inStockOnly, sortOption),
    [allProducts, searchQuery, selectedCategory, selectedBrands, inStockOnly, sortOption]
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setCurrentPage(1);

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
    resetPage();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSortOption('relevance');
    setInStockOnly(false);
    resetPage();
  };

  const hasActiveFilters = !!selectedCategory || selectedBrands.length > 0 || inStockOnly || !!searchQuery;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);

  // Filter sidebar content
  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Categories</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setSelectedCategory(null); resetPage(); }}
            className={`text-left text-sm py-2 px-3 rounded-lg transition-all font-medium ${!selectedCategory ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug ?? null); resetPage(); }}
              className={`text-left text-sm py-2 px-3 rounded-lg transition-all font-medium ${selectedCategory === cat.slug ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Brands</h3>
        <div className="flex flex-col gap-1">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2.5 text-sm py-1.5 px-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleBrand(brand.name)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className={`font-medium ${selectedBrands.includes(brand.name) ? 'text-emerald-700' : 'text-slate-600'}`}>
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div>
        <label className="flex items-center gap-3 text-sm cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
          <div
            onClick={() => { setInStockOnly(!inStockOnly); resetPage(); }}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${inStockOnly ? 'bg-emerald-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="font-medium text-slate-700">In Stock Only</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm font-bold text-rose-600 hover:text-rose-700 py-2 px-3 rounded-lg hover:bg-rose-50 transition-colors text-left"
        >
          ✕ Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 flex border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <div className="flex items-center px-4">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name, tag, or keyword..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full px-2 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); resetPage(); }} className="px-3 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 lg:hidden">
          {selectedCategory && (
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
              {categories.find((c) => c.slug === selectedCategory)?.name}
              <button onClick={() => { setSelectedCategory(null); resetPage(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBrands.map((name) => (
            <span key={name} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
              {name}
              <button onClick={() => toggleBrand(name)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {inStockOnly && (
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
              In Stock
              <button onClick={() => { setInStockOnly(false); resetPage(); }}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-xs bg-white p-6 overflow-y-auto shadow-2xl lg:hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-1.5 hover:bg-slate-50 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-28">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">Filters</h2>
            {filterContent}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort + Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 font-medium">
              {loading ? 'Loading…' : total > 0 ? `Showing ${startItem}–${endItem} of ${total} products` : 'No products found'}
            </p>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value as SortOption); resetPage(); }}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
              </select>
            </div>
          </div>

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 max-w-md text-sm mb-6">
                {total === 0 && !hasActiveFilters
                  ? 'No products have been added yet. Visit the Admin Panel to create your first product.'
                  : 'Try adjusting your search or filters to find what you\'re looking for.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Product Grid */}
          {items.length > 0 && (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((product) => (
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${num === page ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
