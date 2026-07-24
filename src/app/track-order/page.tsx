import React from 'react';
import Link from 'next/link';
import { ChevronRight, Compass, Mail, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Order Tracking | KL Lanka Natural',
  description: 'Track your order status with KL Lanka Natural. Order tracking feature is coming soon.',
};

export default function TrackOrderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Track Order</span>
        </nav>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-2xl mx-auto mt-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-600">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit mx-auto border border-amber-200/50">
              Feature Coming Soon
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Order Tracking</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
              We are currently finalizing our automated real-time order tracking dashboard. 
              This premium feature will be online shortly.
            </p>
          </div>

          <div className="w-full border-t border-slate-100 my-2" />

          <div className="flex flex-col gap-4 text-left w-full bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>How to check your status today</span>
            </h3>
            <p className="text-xs text-slate-655 font-medium leading-relaxed">
              If you have placed an order and would like an update on its packing or delivery status, please send an email to our dedicated help desk.
            </p>
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60 mt-1">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Support Email</span>
                <a href="mailto:kllankanatural@gmail.com" className="text-sm font-bold text-slate-900 hover:text-emerald-600 hover:underline">
                  kllankanatural@gmail.com
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-450 italic mt-1">
              Please include your **Order Number** (e.g., KLN-XXXXXX) or the email address used during checkout for a faster response.
            </p>
          </div>

          <Link
            href="/products"
            className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-600/10 text-xs uppercase tracking-wider"
          >
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
