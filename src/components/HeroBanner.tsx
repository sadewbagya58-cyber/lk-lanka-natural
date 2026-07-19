'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Percent, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAllCategories } from '@/data';

const PROMO_SLIDES = [
  {
    id: 1,
    title: 'Premium Health & Wellness',
    subtitle: 'UP TO 50% OFF',
    desc: 'Supercharge your wellness with natural supplements, herbal capsules, and premium vitamins. Shop authentic botanical health essentials.',
    bgClass: 'from-emerald-700 to-teal-900',
    tag: 'Health Sale',
    ctaText: 'Shop Health Products',
    href: '/category/health-products',
  },
  {
    id: 2,
    title: 'Exquisite Signature Fragrances',
    subtitle: 'NEW ARRIVALS DEBUT',
    desc: 'Experience pure elegance of natural scents. Premium oud, attar, and botanical perfumes handcrafted for distinction.',
    bgClass: 'from-purple-700 to-indigo-900',
    tag: 'New Scents',
    ctaText: 'Discover Perfumes',
    href: '/category/perfumes',
  },
  {
    id: 3,
    title: 'Handcrafted Luxury Jewellery',
    subtitle: 'CEYLON GEMSTONE COLLECTION',
    desc: 'Discover Sri Lanka\'s finest sapphires, moonstones, and garnets set in premium gold and silver. Each piece certified authentic.',
    bgClass: 'from-amber-700 to-orange-950',
    tag: 'Exclusive Rings',
    ctaText: 'Explore Jewellery',
    href: '/category/jewellery',
  },
];

const SIDE_OFFERS = [
  {
    id: 'so1',
    title: 'Ceylon Gemstone Specials',
    tag: 'Up to 40% Off',
    desc: 'Authentic Sri Lankan sapphires and moonstones at exceptional prices.',
    icon: Percent,
    bgClass: 'bg-gradient-to-br from-amber-50 to-orange-100/70 border-amber-200/50',
    textColor: 'text-amber-800',
    tagBg: 'bg-amber-600 text-white',
    href: '/category/jewellery',
  },
  {
    id: 'so2',
    title: 'Free Delivery Storewide',
    tag: 'Free Shipping',
    desc: 'On all orders above $50. No promo code needed.',
    icon: Truck,
    bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-100/70 border-emerald-200/50',
    textColor: 'text-emerald-800',
    tagBg: 'bg-emerald-600 text-white',
    href: '/products',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const categories = getAllCategories();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  return (
    <section className="w-full bg-slate-50 py-4 sm:py-6" aria-label="Hero Showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* DESKTOP LEFT SIDE: Categories Menu */}
        <div className="hidden lg:flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 h-[460px]">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3.5 mb-2.5">
            All Categories
          </h3>
          <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto hide-scrollbar">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-all flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <cat.icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-600" />
                <span>{cat.name}</span>
              </Link>
            ))}
            <Link
              href="/products"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 py-3 px-3 rounded-lg transition-all mt-auto border-t border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              View All Products →
            </Link>
          </nav>
        </div>

        {/* CENTER COLUMN: Large Promotional Auto-Slider */}
        <div className="lg:col-span-2 relative h-[360px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={PROMO_SLIDES[current].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-br ${PROMO_SLIDES[current].bgClass} p-6 sm:p-10 md:p-12 flex flex-col justify-between text-white`}
            >
              {/* Decorative graphic patterns */}
              <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
              <div className="absolute right-[5%] top-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

              <div className="flex flex-col gap-2.5 md:gap-3.5 max-w-lg z-10">
                <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full self-start shadow-sm">
                  {PROMO_SLIDES[current].tag}
                </span>
                <span className="text-[9px] md:text-xs font-bold tracking-[0.25em] text-emerald-300 uppercase">
                  {PROMO_SLIDES[current].subtitle}
                </span>
                <h1 className="text-2xl sm:text-3.5xl md:text-4.5xl font-black tracking-tight leading-tight md:leading-[1.15]">
                  {PROMO_SLIDES[current].title}
                </h1>
                <p className="text-xs md:text-sm text-slate-100/90 font-light leading-relaxed max-w-sm sm:max-w-md">
                  {PROMO_SLIDES[current].desc}
                </p>
              </div>

              <div className="z-10 mt-4 sm:mt-6">
                <Link
                  href={PROMO_SLIDES[current].href}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-3 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-xs md:text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/55"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>{PROMO_SLIDES[current].ctaText}</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/15 hover:bg-black/30 active:scale-90 text-white backdrop-blur-sm transition-all z-20 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/15 hover:bg-black/30 active:scale-90 text-white backdrop-blur-sm transition-all z-20 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {PROMO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP RIGHT COLUMN: 2 Promotional Cards (Matching Slider Height exactly on Desktop) */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-6 lg:h-[460px] justify-between">
          {SIDE_OFFERS.map((offer) => {
            const Icon = offer.icon;
            return (
              <div
                key={offer.id}
                className={`flex-1 flex flex-col justify-between p-6 rounded-2xl border ${offer.bgClass} shadow-sm transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                      <Icon className={`w-5 h-5 ${offer.textColor}`} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${offer.tagBg}`}>
                      {offer.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">{offer.title}</h4>
                    <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">{offer.desc}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={offer.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
