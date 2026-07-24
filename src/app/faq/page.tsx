'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HelpCircle, Search, Plus, Minus, MessageSquare } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [pageTitle, setPageTitle] = useState('Frequently Asked Questions');
  const [pageSubtitle, setPageSubtitle] = useState('Find answers to the most common questions about shopping, orders, payments, and more.');
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [faqResult, pageResult] = await Promise.allSettled([
        fetch('/api/cms/faq').then(r => r.json()),
        fetch('/api/cms/faq-page').then(r => r.json()),
      ]);
      if (faqResult.status === 'fulfilled' && faqResult.value.success) {
        setFaqItems(faqResult.value.items ?? []);
      }
      if (pageResult.status === 'fulfilled' && pageResult.value.success) {
        const p = pageResult.value.page;
        if (p?.title) setPageTitle(p.title);
        if (p?.subtitle) setPageSubtitle(p.subtitle);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter by search
  const filteredItems = faqItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
  });

  // Group by category
  const grouped = filteredItems.reduce<Record<string, FaqItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-700 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-sm text-amber-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">FAQ</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <HelpCircle className="text-amber-200" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{pageTitle}</h1>
                <p className="text-amber-200 text-base max-w-2xl">{pageSubtitle}</p>
              </div>
            </div>
            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="text-slate-500">
                {searchQuery ? `No results found for "${searchQuery}".` : 'No FAQ items available yet.'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-3 text-amber-600 text-sm underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-amber-200 transition-colors"
                      >
                        <button
                          onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
                          className="w-full flex items-center justify-between px-6 py-5 text-left"
                          aria-expanded={openItem === item.id}
                        >
                          <span className="font-semibold text-slate-900 pr-4 text-sm">{item.question}</span>
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${openItem === item.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {openItem === item.id ? <Minus size={12} /> : <Plus size={12} />}
                          </span>
                        </button>
                        {openItem === item.id && (
                          <div className="px-6 pb-5 border-t border-slate-100">
                            <p className="text-slate-600 text-sm leading-relaxed pt-4">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions? */}
          {!loading && (
            <div className="mt-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 text-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-amber-100 text-sm mb-6">Can&apos;t find what you&apos;re looking for? Contact our support team.</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors text-sm"
              >
                Contact Support
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
