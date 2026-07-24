import { getCmsPage, parseMetadata } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('about');
  return {
    title: page?.metaTitle || 'About Us | KL Lanka Natural',
    description: page?.subtitle || "Sri Lanka's premier destination for authentic natural wellness.",
  };
}

export default async function AboutPage() {
  const page = await getCmsPage('about');
  const title = page?.title || 'About KL Lanka Natural';
  const subtitle = page?.subtitle || "Sri Lanka's premier destination for authentic natural wellness, exquisite perfumes, and handcrafted jewellery.";
  const sections = page?.sections ?? [];

  const introSection = sections.find(s => s.sectionType === 'intro');
  const ctaSection = sections.find(s => s.sectionType === 'cta');
  const valuesSection = sections.find(s => s.sectionType === 'values');
  const contentSections = sections.filter(s => s.sectionType === 'content');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-8 right-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-4 left-8 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-sm text-emerald-300 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">About Us</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                <Leaf className="text-emerald-300" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{title}</h1>
              </div>
            </div>
            <p className="text-xl text-emerald-200 max-w-3xl leading-relaxed">{subtitle}</p>
          </div>
        </div>

        {/* Intro + Content Sections */}
        <div className="max-w-5xl mx-auto px-4 py-12">

          {/* If there's an intro section, render it prominently */}
          {introSection && (
            <div className="mb-10 bg-white rounded-3xl border border-emerald-100 shadow-sm p-10">
              {introSection.heading && (
                <h2 className="text-2xl font-black text-slate-900 mb-4">{introSection.heading}</h2>
              )}
              <div className="space-y-4">
                {introSection.content.split('\n\n').map((para, i) => (
                  <p key={i} className="text-slate-600 leading-relaxed text-lg">{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Content sections in a 2-column grid */}
          {contentSections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {contentSections.map((section) => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 hover:shadow-md hover:border-emerald-200 transition-all">
                  {section.heading && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-8 rounded-full bg-emerald-500" />
                      <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
                    </div>
                  )}
                  <div className="space-y-3">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-slate-600 leading-relaxed text-sm">{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Values Section */}
          {valuesSection && (
            <div className="mb-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10">
              {valuesSection.heading && (
                <h2 className="text-2xl font-black text-white mb-8 text-center">{valuesSection.heading}</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {valuesSection.content.split('\n\n').map((item, i) => {
                  const [boldPart, ...rest] = item.split(' — ');
                  return (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-2xl p-5 border border-white/10">
                      <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        {rest.length > 0 ? (
                          <>
                            <span className="font-bold text-white text-sm">{boldPart}</span>
                            <p className="text-slate-400 text-sm mt-1">{rest.join(' — ')}</p>
                          </>
                        ) : (
                          <p className="text-slate-300 text-sm">{item}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA Section */}
          {ctaSection && (() => {
            const meta = parseMetadata(ctaSection.metadata);
            const ctaLink = meta.ctaLink || '/products';
            const ctaText = meta.ctaText || 'Shop Now';
            return (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-center text-white">
                {ctaSection.heading && (
                  <h2 className="text-2xl font-black mb-4">{ctaSection.heading}</h2>
                )}
                <div className="space-y-2 mb-8">
                  {ctaSection.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-emerald-100 leading-relaxed">{para}</p>
                  ))}
                </div>
                <Link
                  href={ctaLink}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-colors text-base shadow-lg"
                >
                  {ctaText} <ArrowRight size={18} />
                </Link>
              </div>
            );
          })()}

          {/* Fallback: render all sections generically if no typed sections found */}
          {sections.length === 0 && (
            <div className="text-center py-12 text-slate-400">Content coming soon.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
