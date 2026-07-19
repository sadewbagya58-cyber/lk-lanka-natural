import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PromotionalBanner() {
  return (
    <section className="w-full py-10 md:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-850 p-8 md:p-12 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Decorative graphic patterns */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="absolute left-[30%] top-[-20%] w-64 h-64 bg-white/5 rounded-full blur-2xl" />

          <div className="flex flex-col gap-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full self-start text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Special Campaign Offer
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Get an Extra 10% Off Health Products Above $40!
            </h2>
            <p className="text-xs md:text-sm text-slate-100 font-light leading-relaxed">
              Stock up on premium herbal supplements, vitamins, and natural wellness essentials. Use coupon code <strong className="font-bold text-white bg-slate-900/40 px-2 py-0.5 rounded border border-white/10">KLNATURAL</strong> at checkout.
            </p>
          </div>

          <div className="shrink-0 z-10">
            <Link
              href="/category/health-products"
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-xs md:text-sm shadow-md"
            >
              <span>Explore Health Products</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

