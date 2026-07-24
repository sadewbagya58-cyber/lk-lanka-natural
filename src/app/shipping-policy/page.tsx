import React from 'react';
import Link from 'next/link';
import { ChevronRight, Truck, Globe, Compass, FileText, Mail, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Shipping & Delivery Policy | KL Lanka Natural',
  description: 'View our shipping and delivery policy including island-wide Sri Lanka delivery, international orders, and Custom Portrait Art timelines.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Shipping Policy</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Policies</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Shipping &amp; Delivery Policy</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Last Updated: July 24, 2026</p>
          </div>

          {/* Section 1: Sri Lanka Delivery */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-emerald-605" />
              <span>1. Delivery Within Sri Lanka</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We offer standard island-wide courier delivery across all provinces and districts in Sri Lanka.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>
                  <strong className="text-slate-800">Standard Delivery Fee:</strong> $4.99 USD.
                </li>
                <li>
                  <strong className="text-slate-800">Free Delivery:</strong> Orders exceeding a subtotal of $50.00 USD qualify for free standard courier delivery.
                </li>
                <li>
                  <strong className="text-slate-800">Delivery Timelines:</strong> Courier partners typically deliver packages within 3 to 7 business days from dispatch.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: International Shipping */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-emerald-605" />
              <span>2. International Shipping</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                We provide international shipping options to select destinations. Because international courier weights, dimensions, and destinations vary widely, shipping costs are calculated on a case-by-case basis.
              </p>
              <p className="mt-1">
                Upon submitting your international order, our support team will calculate the shipping parameters and email you a verified shipping quote at <strong className="text-slate-850">kllankanatural@gmail.com</strong>.
              </p>
            </div>
          </div>

          {/* Section 3: Custom Portrait Art Orders */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-emerald-605" />
              <span>3. Custom Portrait Art Orders</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Products under the <strong className="text-slate-800">Custom Portrait Art</strong> category represent bespoke artist services rather than pre-stocked inventory.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-1.5 text-slate-550">
                <li>
                  <strong className="text-slate-800">Bespoke Production:</strong> Creating custom portrait art requires separate design and painting periods. Delivery times will vary based on artist queues and complexities.
                </li>
                <li>
                  <strong className="text-slate-800">Submission Validation:</strong> Production begins only after a valid reference photo is uploaded during checkout. Timelines will be communicated via email once the reference image is approved.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Order Processing & Timelines */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-605" />
              <span>4. Order Processing</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Standard orders are typically processed and packed within 1 to 2 business days (Monday to Friday, excluding public holidays). Once dispatched, courier hand-off triggers delivery tracking information where available.
              </p>
            </div>
          </div>

          {/* Section 5: Delivery Coordinates and Address Accuracy */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-emerald-655" />
              <span>5. Delivery Address Accuracy</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                Customers are solely responsible for ensuring their delivery addresses and contact phone numbers are entered correctly.
              </p>
              <p className="mt-1">
                We are not responsible for orders that fail to deliver due to incorrect, incomplete, or invalid address credentials entered at checkout. Address redirections post-dispatch may incur surcharge fees.
              </p>
            </div>
          </div>

          {/* Section 6: Delivery Attempts and Support */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-emerald-605" />
              <span>6. Questions and Delivery Support</span>
            </h2>
            <div className="pl-6.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex flex-col gap-2">
              <p>
                If your package experiences unforeseen delays, or if you need to modify delivery notes prior to shipment, please reach out to us at our official help desk email:
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
