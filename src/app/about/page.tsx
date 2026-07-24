import React from 'react';
import Link from 'next/link';
import { ChevronRight, Leaf, Shield, Award, Heart, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About Us | KL Lanka Natural',
  description: 'Learn about KL Lanka Natural (PVT) LTD, our mission, vision, core values, and our dedication to premium health, herbal, and natural products.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">About Us</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-8 sm:p-12 md:p-16 mb-12 shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
          <div className="max-w-2xl relative z-10 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full w-fit border border-emerald-500/30">
              Our Journey
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mt-1">
              KL Lanka Natural
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-light leading-relaxed max-w-xl mt-3">
              We are dedicated to bringing you the finest selection of premium natural wellness solutions, herbal products, exquisite perfumes, and handcrafted jewellery.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 md:p-10 shadow-sm flex flex-col gap-6">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Who We Are</span>
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              KL Lanka Natural (PVT) LTD is a premier online marketplace specializing in high-quality wellness, beauty, and artisan products. We curate authentic selections of Ayurvedic &amp; herbal products, pure essential wellness items, elegant perfumes, and handcrafted jewellery.
            </p>
            <p className="text-slate-750 text-sm leading-relaxed font-medium">
              Our products are ethically sourced, reflecting our respect for traditional wisdom and the environment. We strive to support local creators and suppliers, ensuring that every product ordered is genuine, fresh, and meets our strict quality standards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Our Mission</span>
                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  To make premium, authentic natural wellness and holistic lifestyle products accessible to everyone across Sri Lanka and globally, while upholding the highest ethical sourcing standards.
                </p>
              </div>
              <div className="p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Our Vision</span>
                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  To become a trusted global bridge for authentic natural lifestyle products, recognized for our commitment to purity, customer-first service, and sustainable practices.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Trust Badges */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                Why Shop With Us
              </h3>
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Authentic</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    We strictly vet our sources to provide completely genuine products.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Premium Quality</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Carefully stored and dispatched under rigorous quality controls.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Customer-First</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Dedicated support through our official email helpline at all times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Our Foundation</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Our Core Values</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              These simple guidelines direct how we operate, how we source our products, and how we treat our valued community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">1</span>
              <h3 className="text-sm font-bold text-slate-900">Absolute Purity</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                We prioritize organic, natural, and authentic formulations. No shortcuts, no fake products, only clean and pure options.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">2</span>
              <h3 className="text-sm font-bold text-slate-900">Ethical Sourcing</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                We work alongside local artisans, growers, and trusted brands who value fair labor and practice conscious harvesting.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">3</span>
              <h3 className="text-sm font-bold text-slate-900">Total Transparency</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                From stock levels to checkout parameters and customer feedback, we strive to build trust through transparent communications.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
          <div className="max-w-md mx-auto flex flex-col items-center gap-4 relative z-10">
            <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black">Experience Natural Purity</h2>
            <p className="text-xs text-slate-350 font-medium leading-relaxed">
              Browse our diverse collection of premium Ayurvedic formulations, essential herbal nutrients, authentic scents, and artistic jewellery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link
                href="/products"
                className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center transition-all active:scale-95 text-xs uppercase tracking-wider"
              >
                Explore All Products
              </Link>
              <Link
                href="/contact"
                className="px-6 h-12 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center transition-all active:scale-95 text-xs uppercase tracking-wider"
              >
                Contact Help Center
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
