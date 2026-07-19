'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [mockLink, setMockLink] = useState<string | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setMockLink(null);

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'An unexpected error occurred during password recovery.');
          return;
        }

        setSuccess(data.message || 'Password reset link has been dispatched to your email address!');
        if (data.mockLink) {
          setMockLink(data.mockLink);
        }
        setEmail('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during password recovery.');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col gap-6">
          
          {/* Header */}
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Account Recovery</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Reset Your Password</h1>
            <p className="text-xs text-slate-400 font-light mt-1.5">Enter your verified email and we will send you a secure recovery link</p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col gap-2 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
              {mockLink && (
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">Local Test Link:</p>
                  <Link href={mockLink} className="text-emerald-600 hover:text-emerald-700 underline break-all font-medium">
                    Reset Password Now &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-12 bg-emerald-600 hover:bg-emerald-705 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <span>{isPending ? 'Sending Link...' : 'Send Recovery Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Back links */}
          <div className="flex justify-between text-xs font-bold text-slate-500 mt-2 px-1">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              ← Back to Sign In
            </Link>
            <Link href="/register" className="text-emerald-605 hover:text-emerald-705 transition-colors">
              Create New Account
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
