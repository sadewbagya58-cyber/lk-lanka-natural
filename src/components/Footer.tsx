'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, CreditCard } from 'lucide-react';
import type { CategoryData } from '@/types/product';

export default function Footer() {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(console.error);
  }, []);

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 pt-16 pb-10 text-slate-400" aria-label="Global marketplace footer">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-slate-800">

        {/* Company Identity */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
            <span className="text-xl font-black tracking-tight text-white">
              KL LANKA <span className="text-emerald-500">NATURAL</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 font-light pr-2">
            KL Lanka Natural (PVT) LTD is Sri Lanka&apos;s leading premium marketplace for health products, exquisite perfumes, and handcrafted jewellery. Sourced ethically, delivered safely.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="p-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 rounded-xl text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Follow KL Lanka Natural on Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="p-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 rounded-xl text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Follow KL Lanka Natural on Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="p-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 rounded-xl text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Follow KL Lanka Natural on LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Categories Sitemap */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Shop Categories</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="text-emerald-500 font-bold hover:underline transition-colors focus:outline-none">
                All Products →
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Help */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Customer Help</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/track-order" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">Track Your Order</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">Shipping &amp; Delivery</Link></li>
            <li><Link href="/returns-refunds" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">Returns &amp; Refunds</Link></li>
            <li><Link href="/faq" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">Frequently Asked FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">Help Center</Link></li>
          </ul>
        </div>

        {/* Head Office */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Headquarters</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">No. 124, Galle Road, Colombo 03, Sri Lanka</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
              <a href="tel:+94112345678" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">+94 11 234 5678</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
              <a href="mailto:support@kllankanatural.lk" className="hover:text-emerald-500 hover:underline transition-colors focus:outline-none">support@kllankanatural.lk</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} KL Lanka Natural (PVT) LTD. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-350 hover:underline transition-colors focus:outline-none">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-slate-350 hover:underline transition-colors focus:outline-none">Terms of Service</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Certified Merchant
          </span>
          <div className="flex items-center gap-2 text-slate-400 bg-slate-800 p-2 rounded-lg border border-slate-700 select-none">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold">COD | Visa | Mastercard | Amex</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
