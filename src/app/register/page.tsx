'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'An unexpected registration error occurred.');
          return;
        }

        setSuccess('Account created successfully! Signing in...');
        
        // Auto sign-in the user
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl: '/account',
        });

        if (result?.error) {
          setError('Could not automatically sign you in. Redirecting to login page...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          return;
        }

        // Clear fields
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');

        window.location.href = '/account';
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected registration error occurred.');
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
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Join KL Lanka</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Create Your Account</h1>
            <p className="text-xs text-slate-400 font-light mt-1.5">Sign up today for faster checkout, order tracking, and exclusive discounts</p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Full Name *
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Email Address *
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
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-black text-slate-505 uppercase tracking-widest">
                Phone Number (Optional)
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 text-sm text-slate-850 focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Password *
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-450 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-12 bg-emerald-600 hover:bg-emerald-705 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <span>{isPending ? 'Registering Account...' : 'Sign Up Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login link redirect */}
          <p className="text-xs text-slate-500 text-center font-semibold mt-2">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
            >
              Sign In
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
