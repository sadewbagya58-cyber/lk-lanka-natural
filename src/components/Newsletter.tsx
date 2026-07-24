'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Lock, ArrowRight, Mail } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetcher';

const TRUST_BADGES = [
  {
    title: '100% Authentic Products',
    desc: 'Dermatologist tested & genuine import guarantee',
    icon: ShieldCheck,
  },
  {
    title: 'Fast Sri Lankan Delivery',
    desc: 'Island-wide secure dispatch within 2-3 business days',
    icon: Truck,
  },
  {
    title: 'Secure Payments',
    desc: 'Multiple verified checkout pathways for safety',
    icon: Lock,
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState({
    newsletterTitle: 'Subscribe to the KL Lanka Natural Newsletter',
    newsletterDescription: 'Get notified of new natural arrivals, exclusive flash sales, and botanical collection launches in Sri Lanka.',
  });

  useEffect(() => {
    fetchWithRetry<{ success: boolean; settings: Record<string, string> }>('/api/settings')
      .then((data) => {
        if (data && data.success && data.settings) {
          setSettings({
            newsletterTitle: data.settings.newsletterTitle || 'Subscribe to the KL Lanka Natural Newsletter',
            newsletterDescription: data.settings.newsletterDescription || 'Get notified of new natural arrivals, exclusive flash sales, and botanical collection launches in Sri Lanka.',
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="w-full bg-slate-50 py-10 md:py-16 relative overflow-hidden border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Trust Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {TRUST_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5.5 h-5.5 text-emerald-600" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide">{badge.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Newsletter Registration Box */}
        <div className="w-full rounded-[2rem] border border-slate-100 bg-white p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden">
          {/* Subtle glow circle overlay */}
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-lg flex flex-col gap-2 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-emerald-600">
              <Mail className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exclusive Updates</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              {settings.newsletterTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed">
              {settings.newsletterDescription}
            </p>
          </div>

          <div className="w-full lg:w-auto relative z-10">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-[420px]">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 flex-grow"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all text-xs shrink-0 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 select-none"
              >
                {subscribed ? (
                  <span>Subscribed!</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center lg:text-left mt-2">
              We care about your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
