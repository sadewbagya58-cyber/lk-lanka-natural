'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, MapPin, Phone, RefreshCw, ChevronDown, Menu, X, Globe, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import CartDrawer from './CartDrawer';
import { formatPrice } from '@/lib/currency';
import { useAuth } from './AuthProvider';
import { fetchWithRetry } from '@/lib/fetcher';
import type { CategoryData } from '@/types/product';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const { user, isLoading: authLoading } = useAuth();

  const cartItems = useCartStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = useCartStore((state) => state.getCartSubtotal());

  const wishlistIds = useWishlistStore((state) => state.wishlistIds);
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    fetchWithRetry<{ categories: CategoryData[] }>('/api/categories')
      .then((data) => {
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(console.error);
  }, []);

  const categoryNames = ['All Categories', ...categories.map((c) => c.name)];

  return (
    <>
      <header className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100 backdrop-blur-md bg-white/95">
        {/* Top bar (Desktop & Tablet only to save mobile vertical space) */}
        <div className="hidden md:block w-full bg-slate-900 text-slate-350 text-xs py-2 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Hotline: +94 11 234 5678
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Customer Support
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/track-order" className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none focus:underline">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Track Order
              </Link>
              <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>English (USD)</span>
              </div>
              <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer select-none">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deliver to: Colombo, LK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="w-full py-2 sm:py-3.5 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo & Brand Title */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 focus:outline-none group">
              <div className="relative h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200/80 shadow-sm group-hover:border-emerald-500/40 transition-all shrink-0">
                <Image
                  src="/logo.png"
                  alt="KL Lanka Natural Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 leading-none sm:leading-tight">
                  KL LANKA <span className="text-emerald-600">NATURAL</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mt-0.5">
                  (PVT) LTD
                </span>
              </div>
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-grow max-w-2xl border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-350 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-550/15 transition-all">
              <div className="relative shrink-0 border-r border-slate-100 bg-slate-50 flex items-center px-4 text-xs font-bold text-slate-650 hover:bg-slate-100 cursor-pointer select-none gap-1">
                <span>{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Filter search by category"
                >
                  {categoryNames.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Search health products, perfumes, jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 focus:outline-none bg-white font-medium"
                aria-label="Search items"
              />
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 flex items-center justify-center shrink-0 transition-colors focus:outline-none focus:bg-emerald-700"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Actions (Account, Wishlist, Cart, Mobile Menu) */}
            <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
              
              {/* Account / Login Action */}
              {authLoading ? (
                <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100 animate-pulse flex items-center gap-2" aria-label="Loading account session">
                  <User className="w-4 h-4 text-slate-300" />
                  <div className="hidden lg:flex flex-col text-left">
                    <div className="w-10 h-2 bg-slate-200 rounded mb-1" />
                    <div className="w-12 h-2.5 bg-slate-200 rounded" />
                  </div>
                </div>
              ) : user ? (
                <Link href="/account" className="flex items-center gap-1.5 p-1.5 sm:p-2 text-slate-750 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl" aria-label="My Account">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">My Account</span>
                    <span className="text-xs font-black text-slate-800 leading-none truncate max-w-[80px]">{user.name || 'Profile'}</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-750 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 flex items-center gap-2" aria-label="Sign In">
                  <User className="w-4 h-4" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Welcome</span>
                    <span className="text-xs font-black text-slate-800 leading-none">Sign In</span>
                  </div>
                </Link>
              )}

              {/* Wishlist Icon Action */}
              <Link
                href="/wishlist"
                className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-750 hover:text-emerald-600 transition-all relative focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label={`Wishlist containing ${wishlistCount} items`}
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-rose-550 text-white text-[8px] sm:text-[9px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Action */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl border border-emerald-100/50 text-emerald-700 hover:text-white hover:bg-emerald-600 transition-all relative flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-550/40 cursor-pointer"
                aria-label={`Cart containing ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-105 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[9px] text-emerald-600/70 font-black uppercase tracking-wider leading-none mb-0.5">My Cart</span>
                  <span className="text-xs font-black text-slate-800 leading-none">{formatPrice(cartSubtotal)}</span>
                </div>
              </button>

              {/* Mobile Drawer Trigger Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-50 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Compact Integrated Mobile Search Bar */}
        <div className="w-full px-3 pb-2 pt-0.5 bg-white md:hidden border-t border-slate-100/60">
          <div className="flex border border-slate-200/80 rounded-full overflow-hidden shadow-2xs bg-slate-50/70 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
            <input
              type="text"
              placeholder="Search natural products, perfumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none font-medium placeholder-slate-400 bg-transparent"
              aria-label="Mobile Search items"
            />
            <button className="bg-emerald-600 text-white px-3.5 flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-45 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-sm bg-white p-6 flex flex-col justify-between shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 focus:outline-none">
                    <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200/80 shadow-sm shrink-0">
                      <Image
                        src="/logo.png"
                        alt="KL Lanka Natural Logo"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
                        KL LANKA <span className="text-emerald-600">NATURAL</span>
                      </span>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mt-0.5">
                        (PVT) LTD
                      </span>
                    </div>
                  </Link>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg focus:outline-none" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Shop Categories</h3>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/category/${encodeURIComponent(cat.slug)}`} onClick={() => setIsOpen(false)}
                      className="py-3 px-1.5 text-sm font-semibold text-slate-700 hover:text-emerald-600 border-b border-slate-50 flex items-center justify-between focus:outline-none focus:text-emerald-600"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </Link>
                  ))}
                  <Link href="/products" onClick={() => setIsOpen(false)}
                    className="py-3.5 px-1.5 text-sm font-black text-emerald-600 hover:text-emerald-700 mt-2 flex items-center gap-1.5 focus:outline-none"
                  >
                    View All Products →
                  </Link>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-8">
                <p className="text-xs font-bold text-slate-550">KL Lanka Natural (PVT) LTD</p>
                <p className="text-[11px] text-slate-400 mt-1.5">Galle Road, Colombo 03, Sri Lanka</p>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-750 font-bold bg-emerald-50/50 py-2.5 px-3.5 rounded-lg border border-emerald-100/60">
                  <Phone className="w-3.5 h-3.5" />
                  Hotline: +94 11 234 5678
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
