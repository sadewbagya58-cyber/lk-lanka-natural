import React from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw, AlertTriangle, ShieldCheck, Mail, FileCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Returns & Refunds Policy | KL Lanka Natural',
  description: 'View our returns and refunds policy for natural products, Ayurvedic items, perfumes, and Custom Portrait Art services.',
};

export default function ReturnsRefundsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Returns &amp; Refunds</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Policies</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Returns &amp; Refunds Policy</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Last Updated: July 24, 2026</p>
          </div>

          {/* Introduction */}
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            At KL Lanka Natural, we take pride in the quality of our wellness, perfume, jewellery, and custom artwork products. If you receive an item that is damaged, defective, or incorrect, please read our return guidelines below to initiate a resolution.
          </p>

          {/* Section 1: Damaged or Incorrect Products */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-emerald-605" />
              <span>1. Damaged, Defective, or Incorrect Products</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                If your order arrives damaged, defective, or if you receive the wrong item, please notify us immediately.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>
                  <strong className="text-slate-850">Notification Period:</strong> Please report the issue within a reasonable period from the delivery date.
                </li>
                <li>
                  <strong className="text-slate-850">Required Evidence:</strong> You must email clear photos of the damaged or incorrect product, along with your order number, to our support desk.
                </li>
                <li>
                  <strong className="text-slate-850">Resolution:</strong> Upon verification, we will coordinate a replacement or issue an appropriate refund.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Custom Portrait Art & Personalized Products */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4.5 h-4.5 text-emerald-605" />
              <span>2. Custom Portrait Art Orders</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Because Custom Portrait Art items represent personalized, bespoke services painted specifically based on customer reference photos, they are subject to different terms:
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>
                  Once work on your custom artwork has commenced or the illustration has been finalized, we cannot cancel or refund the order due to change of mind.
                </li>
                <li>
                  If the physical print, frame, or canvas arrives damaged during courier transport, please submit photographic evidence to our help desk for a complimentary replacement.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Non-Returnable Items */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4.5 h-4.5 text-emerald-605" />
              <span>3. Non-Returnable Items</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Due to health, hygiene, and product safety regulations, certain types of items cannot be returned under any conditions:
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>Opened cosmetics, skin creams, essential wellness oils, or personal care products.</li>
                <li>Herbal nutrients or organic food items with broken security seals.</li>
                <li>Clearance items or promotional gift purchases.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Refund Process */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-605" />
              <span>4. Refund Process</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Approved refunds are processed through the original method of payment or via bank transfer for Cash on Delivery orders. Please allow a standard processing window for the funds to reflect in your account.
              </p>
            </div>
          </div>

          {/* Section 5: Support Desk */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 mt-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-emerald-605" />
              <span>5. Contact Support</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                To initiate a return or verify your refund status, please send a message directly to our verified support inbox:
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 mt-1 flex items-center gap-3 w-fit">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <a href="mailto:kllankanatural@gmail.com" className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-650 hover:underline">
                  kllankanatural@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
