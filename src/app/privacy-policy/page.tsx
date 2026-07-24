import { getCmsPage } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('privacy-policy');
  return {
    title: page?.metaTitle || 'Privacy Policy | KL Lanka Natural',
    description: page?.subtitle || 'How we collect, use, and protect your personal information.',
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getCmsPage('privacy-policy');
  const title = page?.title || 'Privacy Policy';
  const subtitle = page?.subtitle || 'How we collect, use, and protect your personal information.';
  const sections = page?.sections ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">{title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="text-indigo-300" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{title}</h1>
                <p className="text-indigo-200 text-base max-w-2xl">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((section, idx) => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      {section.heading && (
                        <h2 className="text-lg font-bold text-slate-900 mb-3">{section.heading}</h2>
                      )}
                      <div className="space-y-3">
                        {section.content.split('\n\n').map((para, i) => (
                          <p key={i} className="text-slate-600 leading-relaxed">{para}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12">Content coming soon.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
