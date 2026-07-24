'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, Send, AlertCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Client-side validation
    if (!fullName.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your Email Address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid Email Address.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please enter a Subject.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please enter your Message.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Your message must be at least 10 characters long.');
      return;
    }
    if (message.trim().length > 2000) {
      setFormError('Your message must not exceed 2000 characters.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, subject, message }),
        });

        const data = await res.json();

        if (!res.ok) {
          setFormError(data.error || 'Failed to submit form. Please check input parameters.');
          return;
        }

        setFormSuccess(data.message || 'Your inquiry has been successfully received!');
        // Reset form
        setFullName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } catch {
        setFormError('A network error occurred. Please try again later.');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">Contact Us</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-8 sm:p-12 mb-12 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent)] pointer-events-none" />
          <div className="max-w-xl relative z-10 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full w-fit border border-emerald-500/30">
              Help Center
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-1">
              Contact Support
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-light leading-relaxed mt-2">
              Have questions about your order, payments, delivery, or custom artwork? 
              Reach out to our customer care team and we will respond as soon as possible.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 h-full">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                Official Support Channel
              </h3>
              
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                To guarantee secure and trackable communication, we manage all customer service inquiries exclusively through our confirmed email address.
              </p>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150/80 mt-2">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Support Email</span>
                  <a href="mailto:kllankanatural@gmail.com" className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-600 hover:underline break-all">
                    kllankanatural@gmail.com
                  </a>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-5 flex flex-col gap-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Important Notice
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  We do not offer support over phone, WhatsApp, or third-party messengers. Please submit the contact form or send a direct email.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Send a Message</span>
              </h3>

              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      required
                      disabled={isPending}
                      maxLength={100}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kasun@example.com"
                      required
                      disabled={isPending}
                      maxLength={100}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Subject *
                    </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question about order status"
                    required
                    disabled={isPending}
                    maxLength={150}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="message" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Message *
                    </label>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {message.length} / 2000 Char
                    </span>
                  </div>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or request in detail..."
                    required
                    disabled={isPending}
                    maxLength={2000}
                    rows={6}
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400 h-36"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 text-xs uppercase tracking-wider disabled:bg-slate-100 disabled:text-slate-400 shrink-0"
                  >
                    <span>{isPending ? 'Sending Message...' : 'Send Message'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
