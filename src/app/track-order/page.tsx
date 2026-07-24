import { getCmsPage } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('track-order');
  return {
    title: page?.metaTitle || 'Track Your Order | KL Lanka Natural',
    description: page?.subtitle || 'Track your order status.',
  };
}

export default async function TrackOrderPage() {
  const page = await getCmsPage('track-order');
  const title = page?.title || 'Track Your Order';
  const subtitle = page?.subtitle || 'Order tracking is currently in development. Contact us for a status update.';
  const sections = page?.sections ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-sm text-teal-300 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">{title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 animate-pulse">
                <MapPin className="text-teal-300" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{title}</h1>
                <p className="text-teal-200 text-base max-w-2xl">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md transition-shadow">
                  {section.heading && (
                    <h2 className="text-lg font-bold text-slate-900 mb-3">{section.heading}</h2>
                  )}
                  <div className="space-y-3">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-slate-600 leading-relaxed whitespace-pre-line">{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-10 text-center">
              <MapPin className="mx-auto mb-4 text-amber-400" size={40} />
              <p className="text-slate-600">Order tracking is coming soon. Please contact us to check your order status.</p>
            </div>
          )}

          {/* Continue Shopping CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
