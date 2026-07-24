'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MessageSquare, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface CmsSection {
  id: string;
  heading: string | null;
  content: string;
  sectionType: string;
  isVisible: boolean;
}

interface CmsPageData {
  title: string;
  subtitle: string | null;
  sections: CmsSection[];
}

export default function ContactPage() {
  const [cmsPage, setCmsPage] = useState<CmsPageData | null>(null);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch CMS content
  useEffect(() => {
    fetch('/api/cms/contact')
      .then(r => r.json())
      .then(data => { if (data.success) setCmsPage(data.page); })
      .catch(() => {});
  }, []);

  const title = cmsPage?.title || 'Help Center';
  const subtitle = cmsPage?.subtitle || "We're here to help. Reach out to our support team for assistance.";
  const sections = cmsPage?.sections ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }
    if (formData.message.length > 2000) {
      setErrorMsg('Message must be 2000 characters or fewer.');
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMsg('Failed to send message. Please try again.');
        setSubmitStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.');
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-sm text-blue-300 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">{title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <MessageSquare className="text-blue-300" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{title}</h1>
                <p className="text-blue-200 text-base max-w-2xl">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: CMS sections + Support info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Official Support Channel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <h2 className="font-bold text-slate-900">Official Support</h2>
                </div>
                <p className="text-sm text-slate-500 mb-3">Our verified customer support email:</p>
                <a
                  href="mailto:kllankanatural@gmail.com"
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors break-all"
                >
                  <Mail size={14} />
                  kllankanatural@gmail.com
                </a>
              </div>

              {/* CMS-managed sections */}
              {sections.map(section => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  {section.heading && (
                    <h2 className="font-bold text-slate-900 mb-3">{section.heading}</h2>
                  )}
                  <div className="space-y-2">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Send Us a Message</h2>

                {submitStatus === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-500 text-sm mb-6">Thank you for reaching out. We&apos;ll respond as soon as possible.</p>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitStatus === 'error' && errorMsg && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Brief subject of your inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                        required
                        rows={6}
                        maxLength={2000}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Describe your inquiry in detail..."
                      />
                      <p className="text-xs text-slate-400 mt-1">{formData.message.length}/2000 characters</p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitStatus === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
                    >
                      {submitStatus === 'submitting' ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <>
                          <Send size={16} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
