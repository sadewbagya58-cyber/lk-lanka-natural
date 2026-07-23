'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { signIn } from '@/components/AuthProvider';
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
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white p-0.5 border border-slate-200 shadow-md mb-3">
              <Image src="/logo.png" alt="KL Lanka Natural" width={56} height={56} className="w-full h-full object-contain" />
            </div>
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
              className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <span>{isPending ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Sign Up */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold select-none my-1">
              <span className="h-px bg-slate-200 flex-1" />
              <span>OR REGISTER WITH</span>
              <span className="h-px bg-slate-200 flex-1" />
            </div>

            <button
              onClick={() => { window.location.href = '/api/auth/google'; }}
              disabled={isPending}
              className="h-11 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

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
