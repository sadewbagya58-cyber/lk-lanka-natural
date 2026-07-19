'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Inner component — uses useSearchParams inside a Suspense boundary.
 */
function UpdatePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValidParams = !!(token && email);
  const paramError = !isValidParams ? 'Invalid or missing password recovery credentials.' : null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirm) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'An unexpected error occurred during password update.');
          return;
        }

        setSuccess('Password updated successfully! Redirecting to login page...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Account Security
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Set New Password</h1>
            <p className="text-xs text-slate-400 font-light mt-1.5">
              Choose a strong password to secure your account
            </p>
          </div>

          {/* Alerts */}
          {(paramError || error) && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{paramError || error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {!isValidParams && !error && !success && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400 font-semibold">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Verifying recovery link...
            </div>
          )}

          {/* Form */}
          {isValidParams && !success && (
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  New Password
                </label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                  <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                  <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400 disabled:active:scale-100"
              >
                <span>{isPending ? 'Updating Password...' : 'Update Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Exported page wraps Inner page in Suspense to satisfy searchParams bailout rules
 */
export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <Footer />
        </div>
      }
    >
      <UpdatePasswordInner />
    </Suspense>
  );
}
