import React from 'react';
import Link from 'next/link';
import { ChevronRight, Shield, Database, Lock, Eye, Mail, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | KL Lanka Natural',
  description: 'Learn how KL Lanka Natural collects, uses, protects, and handles your personal data and uploaded reference images.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Privacy Policy</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Privacy &amp; Security</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Last Updated: July 24, 2026</p>
          </div>

          {/* Section 1: Information Collected */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-emerald-605" />
              <span>1. Information We Collect</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We collect personal information necessary to fulfill your purchases, manage your customer account, and provide customer support. This includes:
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li><strong className="text-slate-800">Account details:</strong> Full Name, Email Address, and Password hash.</li>
                <li><strong className="text-slate-800">Delivery coordinates:</strong> Delivery address (Street, City, District, Province, Postal Code, Country) and contact phone number.</li>
                <li><strong className="text-slate-850">Order history:</strong> Selected products, variant choices, payment status, and order totals.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Custom Portrait Art Uploads */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-emerald-605" />
              <span>2. Custom Portrait Art Reference Images</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                For orders containing Custom Portrait Art, we collect the reference photo you upload during checkout.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>Uploaded reference images are associated directly with your specific order.</li>
                <li>These images are accessed solely by our design team and professional artists to create the custom portrait.</li>
                <li>We protect uploaded files and do not publish or distribute your reference photos publicly without explicit consent.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Payment Data Security */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-emerald-605" />
              <span>3. Payment Information Handling</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We do not store raw card numbers, CVVs, or credit card PIN codes on our servers. 
              </p>
              <p className="mt-1">
                While online card payments are currently in preparation, once activated, card transactions will be securely handled through third-party payment processors.
              </p>
            </div>
          </div>

          {/* Section 4: Google Sign-in */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-emerald-605" />
              <span>4. Google Sign-In &amp; Authentication</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                If you authenticate using Google Sign-In, we receive basic profile info (Name, Email Address, and Avatar URL) from Google. This data is used solely to construct your customer session and link your orders securely.
              </p>
            </div>
          </div>

          {/* Section 5: Cookies and Local Storage */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-emerald-655" />
              <span>5. Cookies and Local Storage</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We utilize browser cookies and local storage (such as Zustand stores) to maintain your active shopping cart state, wishlist preferences, Buy Now selections, and authentication sessions. No tracking cookies are used.
              </p>
            </div>
          </div>

          {/* Section 6: Support contact */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 mt-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-emerald-605" />
              <span>6. Privacy Questions and Requests</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                If you would like to request deletion of your account, details regarding your stored information, or have any other privacy-related concerns, please reach out to us at our verified support inbox:
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 mt-1 flex items-center gap-3 w-fit">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <a href="mailto:kllankanatural@gmail.com" className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-655 hover:underline">
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
