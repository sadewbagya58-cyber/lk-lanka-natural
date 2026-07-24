import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Scale, UserCheck, ShoppingBag, ShieldCheck, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | KL Lanka Natural',
  description: 'View the terms of service governing the use of the KL Lanka Natural (PVT) LTD e-commerce website and purchase workflows.',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Terms of Service</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Legal Agreement</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Terms of Service</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Last Updated: July 24, 2026</p>
          </div>

          {/* Section 1: Acceptance */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-emerald-605" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
              <p>
                By accessing, browsing, or purchasing from KL Lanka Natural (PVT) LTD, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the website.
              </p>
            </div>
          </div>

          {/* Section 2: Website Usage */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-605" />
              <span>2. Website Usage</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
              <p>
                You represent that you are of legal age to form a binding contract and that all customer information you provide (delivery address, name, email) is accurate, current, and complete.
              </p>
            </div>
          </div>

          {/* Section 3: Customer Accounts */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-emerald-605" />
              <span>3. Customer Accounts</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
              <p>
                When creating an account, you are responsible for maintaining the confidentiality of your login credentials and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </div>
          </div>

          {/* Section 4: Product Information and Availability */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-emerald-605" />
              <span>4. Products, Pricing &amp; Stock Availability</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We describe natural products, ingredients, perfumes, and jewellery as accurately as possible. However:
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1 text-slate-550">
                <li>We do not guarantee that product descriptions are entirely error-free. Natural formulations may have minor batch variances.</li>
                <li>Prices are displayed in USD and are subject to change. Delivery fees apply and are calculated during checkout.</li>
                <li>We reserve the right to limit order quantities or cancel orders if items become out of stock.</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Payments */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-605" />
              <span>5. Payment Methods and Order Fulfillments</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We support Cash on Delivery (COD) for eligible deliveries within Sri Lanka.
              </p>
              <p className="mt-1">
                Online card payment architecture is integrated but is currently <strong className="text-slate-800">in preparation and temporarily unavailable</strong> until our merchant payment gateway is fully connected.
              </p>
            </div>
          </div>

          {/* Section 6: Custom Portrait Art */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-605" />
              <span>6. Custom Portrait Art Uploads and Responsibilities</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                If you purchase a Custom Portrait Art item:
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1 text-slate-550">
                <li>You must upload a reference photo. By uploading, you confirm that you own the copyrights or have permission to submit the photo.</li>
                <li>We reserve the right to cancel and refund your custom order if the uploaded reference photo is deemed inappropriate or of insufficient quality for our artists.</li>
                <li>Customized goods cannot be returned or cancelled once production has started, except in cases of shipping damage.</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Limitation of Liability */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-emerald-605" />
              <span>7. Limitation of Liability</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-655 leading-relaxed font-medium">
              <p>
                KL Lanka Natural (PVT) LTD and its directors are not liable for any indirect, incidental, or consequential damages arising from the purchase or use of any product, or from the inability to use this website.
              </p>
            </div>
          </div>

          {/* Section 8: Support contact */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 mt-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-emerald-605" />
              <span>8. Support and Contact Details</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                For questions regarding these Terms of Service or to resolve any legal concerns, please write to us at:
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
