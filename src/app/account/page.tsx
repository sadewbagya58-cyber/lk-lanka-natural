'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, ShieldCheck, AlertCircle, LogOut, ArrowRight, UserCheck, Key, ShoppingBag } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProfileData {
  name: string;
  phone: string;
  address_street: string;
  address_city: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Valued Customer',
    phone: '',
    address_street: '',
    address_city: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load user profile details from Hostinger MySQL DB via Prisma
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const loadProfile = async () => {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (res.ok) {
            setProfile({
              name: data.name || '',
              phone: data.phone || '',
              address_street: data.address_street || '',
              address_city: data.address_city || '',
            });
          } else {
            setError(data.error || 'Failed to load profile.');
          }
        } catch {
          setError('Error loading account information.');
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }
  }, [status, session, router]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            address_street: profile.address_street,
            address_city: profile.address_city,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to update profile details.');
          return;
        }

        // Trigger session token updates
        await update({
          name: profile.name,
          phone: profile.phone
        });

        setSuccess('Profile information updated successfully!');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      router.push('/');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying Session...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Navigation Menu */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate">{profile.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium truncate">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-xs font-bold text-slate-600">
              <span className="bg-emerald-50 text-emerald-700 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                Profile Settings
              </span>
              <button
                onClick={() => alert('Order details (Hostinger MySQL dynamic sync active)')}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-left focus:outline-none transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-slate-450" />
                Order History
              </button>
              <button
                onClick={() => alert('Security update features ready')}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-left focus:outline-none transition-colors"
              >
                <Key className="w-4 h-4 text-slate-450" />
                Password &amp; Security
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 text-left focus:outline-none mt-2 transition-colors border-t border-slate-100 pt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Account
              </button>
            </nav>
          </div>

          {/* Right Forms Content Area */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Feedback Alerts */}
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

            {/* Profile Fields Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3.5 mb-6">
                Personal Information
              </h2>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pname" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Full Name *
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="pname"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pphone" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Contact Phone *
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="pphone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-405 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Street */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="pstreet" className="text-xs font-black text-slate-505 uppercase tracking-widest">
                    Delivery Address (Street)
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      id="pstreet"
                      type="text"
                      value={profile.address_street}
                      onChange={(e) => setProfile({ ...profile, address_street: e.target.value })}
                      placeholder="124 Galle Road"
                      className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Shipping City */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pcity" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    City / Suburb
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                    <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      id="pcity"
                      type="text"
                      value={profile.address_city}
                      onChange={(e) => setProfile({ ...profile, address_city: e.target.value })}
                      placeholder="Colombo 03"
                      className="w-full px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 h-12 bg-emerald-600 hover:bg-emerald-705 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <span>{isPending ? 'Updating...' : 'Save Profile Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>

            {/* Google Link Status Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Linked OAuth Accounts</h4>
                <p className="text-[10px] text-slate-400 mt-1">Connect your Google profile for one-click access credentials</p>
              </div>
              <button
                onClick={() => alert('OAuth configuration update link requested')}
                className="px-4 py-2.5 border border-slate-200 hover:border-slate-350 bg-white text-slate-700 font-bold text-[11px] rounded-xl flex items-center gap-2 transition-colors focus:outline-none"
              >
                <span>Link Google Account</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
