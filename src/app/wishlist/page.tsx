'use client';

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import Link from 'next/link';
import { Heart, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { ProductCardData } from '@/types/product';

export default function WishlistPage() {
  const { wishlistIds, clearWishlist } = useWishlistStore();
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (wishlistIds.length === 0) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: { products: ProductCardData[] }) => setAllProducts(data.products ?? []))
      .catch(console.error);
  }, [wishlistIds.length]);

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2" />
          <span className="text-slate-800">My Wishlist</span>
        </nav>

        {/* Title Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Saved Wishlist</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Keep track of your favorite organic natural products</p>
          </div>
          {wishlistProducts.length > 0 && (
            <button onClick={() => clearWishlist()} className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline focus:outline-none">
              Remove All
            </button>
          )}
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlistProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <Heart className="w-9 h-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
              Explore our premium marketplace and click the heart icon on any product to save it to your wishlist.
            </p>
            <Link href="/products" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-widest focus:outline-none">
              Discover Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
