'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Info, HelpCircle, Truck, RotateCcw, Shield, Scale, MapPin, Settings, ChevronRight, Eye, EyeOff, MessageSquare, RefreshCcw
} from 'lucide-react';

interface PageSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  status: string;
  updatedAt: string;
  sections: { id: string; isVisible: boolean }[];
}

const PAGE_META: Record<string, { icon: React.ReactNode; label: string; description: string; color: string }> = {
  about: {
    icon: <Info size={22} />,
    label: 'About Us',
    description: 'Company story, mission, vision, core values, and CTA.',
    color: 'from-violet-500 to-purple-600',
  },
  contact: {
    icon: <MessageSquare size={22} />,
    label: 'Help Center / Contact',
    description: 'Support intro, contact details, and policy text.',
    color: 'from-blue-500 to-cyan-600',
  },
  faq: {
    icon: <HelpCircle size={22} />,
    label: 'FAQ',
    description: 'Frequently asked questions grouped by category.',
    color: 'from-amber-500 to-orange-600',
  },
  'shipping-policy': {
    icon: <Truck size={22} />,
    label: 'Shipping & Delivery',
    description: 'Delivery zones, fees, timelines, and customs info.',
    color: 'from-emerald-500 to-green-600',
  },
  'returns-refunds': {
    icon: <RotateCcw size={22} />,
    label: 'Returns & Refunds',
    description: 'Return eligibility, refund process, and exclusions.',
    color: 'from-rose-500 to-red-600',
  },
  'privacy-policy': {
    icon: <Shield size={22} />,
    label: 'Privacy Policy',
    description: 'Data collection, usage, cookies, and user rights.',
    color: 'from-indigo-500 to-blue-600',
  },
  'terms-of-service': {
    icon: <Scale size={22} />,
    label: 'Terms of Service',
    description: 'Usage terms, liability, and legal agreements.',
    color: 'from-slate-500 to-gray-600',
  },
  'track-order': {
    icon: <MapPin size={22} />,
    label: 'Track Order',
    description: 'Order tracking instructions and coming soon notice.',
    color: 'from-teal-500 to-cyan-600',
  },
};

export default function ContentDashboard() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/cms');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      } else {
        setError('Failed to load pages.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPages(); }, []);

  const slugOrder = ['about', 'contact', 'faq', 'shipping-policy', 'returns-refunds', 'privacy-policy', 'terms-of-service', 'track-order'];

  const sortedPages = [...pages].sort((a, b) => {
    return slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug);
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          <ChevronRight size={14} />
          <span className="text-white">Content Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Content Management</h1>
            <p className="text-gray-400 mt-1">Manage the text content of all public pages.</p>
          </div>
          <button
            onClick={loadPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-all"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Footer Settings Link */}
      <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white">
            <Settings size={18} />
          </div>
          <div>
            <p className="font-medium text-white">Footer & Site Settings</p>
            <p className="text-sm text-gray-400">Company address, social links, help links, newsletter content.</p>
          </div>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-white transition-colors"
        >
          Edit Settings <ChevronRight size={14} />
        </Link>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slugOrder.map(slug => (
            <div key={slug} className="rounded-xl bg-gray-800/40 border border-gray-700 p-5 animate-pulse h-40" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm">
          {error}{' '}
          <button onClick={loadPages} className="underline ml-1">Retry</button>
        </div>
      )}

      {/* Page Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slugOrder.map(slug => {
            const meta = PAGE_META[slug];
            const page = sortedPages.find(p => p.slug === slug);
            const visibleCount = page?.sections.filter(s => s.isVisible).length ?? 0;
            const totalCount = page?.sections.length ?? 0;
            const isFaq = slug === 'faq';

            return (
              <div
                key={slug}
                className="rounded-xl bg-gray-800/40 border border-gray-700 hover:border-gray-500 transition-all group overflow-hidden"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.color}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      !page || page.status === 'PUBLISHED'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                    }`}>
                      {page?.status ?? 'Not set'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{meta.label}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{meta.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {isFaq ? (
                        <span className="flex items-center gap-1">
                          <HelpCircle size={11} /> FAQ items managed separately
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {visibleCount < totalCount ? <EyeOff size={11} /> : <Eye size={11} />}
                          {visibleCount}/{totalCount} sections visible
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/content/${slug}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${meta.color} text-white text-xs font-medium hover:opacity-90 transition-opacity`}
                    >
                      Edit <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
