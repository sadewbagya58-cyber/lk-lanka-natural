'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Settings, Save, AlertCircle, ShieldCheck, RefreshCw, Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetcher';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyAddress: '',
    phoneNumber: '',
    supportEmail: 'kllankanatural@gmail.com',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    newsletterTitle: '',
    newsletterDescription: '',
    helpLink_trackOrder: '',
    helpLink_shippingPolicy: '',
    helpLink_returnsRefunds: '',
    helpLink_faq: '',
    helpLink_helpCenter: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchWithRetry<{ success: boolean; settings: Record<string, string> }>('/api/admin/settings')
      .then((data) => {
        if (data && data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setError('Failed to load website settings from database.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.supportEmail.trim())) {
      setError('Please enter a valid support email address.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to update website settings.');
          return;
        }

        setSuccess('Website settings saved successfully!');
      } catch (err) {
        console.error('Failed to save settings:', err);
        setError('A network error occurred while saving website settings.');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
        <h1 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Website Settings</span>
        </h1>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-805 text-xs font-semibold">
          <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-8">
        
        {/* Card 1: Headquarters Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>1. Contact &amp; Headquarters Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Support Email */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="supportEmail" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Support Email Address *
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </span>
                <input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="kllankanatural@gmail.com"
                  required
                  maxLength={100}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none font-medium"
                />
              </div>
              <span className="text-[9px] text-slate-450 font-medium">Default: kllankanatural@gmail.com</span>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="companyAddress" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Company Headquarters Address
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </span>
                <input
                  id="companyAddress"
                  type="text"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  placeholder="e.g. No. 124, Galle Road, Colombo 03, Sri Lanka"
                  maxLength={200}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="phoneNumber" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Hotline Phone Number
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                <span className="flex items-center px-3.5 text-slate-400 border-r border-slate-100 bg-slate-50">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </span>
                <input
                  id="phoneNumber"
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  placeholder="e.g. +94 11 234 5678"
                  maxLength={50}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Help Navigation URLs */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>2. Customer Help Navigation Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Track Order */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="trackOrder" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Track Order Route
              </label>
              <input
                id="trackOrder"
                type="text"
                value={settings.helpLink_trackOrder}
                onChange={(e) => setSettings({ ...settings, helpLink_trackOrder: e.target.value })}
                placeholder="/track-order"
                maxLength={100}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Shipping Policy */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shippingPolicy" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Shipping Policy Route
              </label>
              <input
                id="shippingPolicy"
                type="text"
                value={settings.helpLink_shippingPolicy}
                onChange={(e) => setSettings({ ...settings, helpLink_shippingPolicy: e.target.value })}
                placeholder="/shipping-policy"
                maxLength={100}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Returns Refunds */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="returnsRefunds" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Returns &amp; Refunds Route
              </label>
              <input
                id="returnsRefunds"
                type="text"
                value={settings.helpLink_returnsRefunds}
                onChange={(e) => setSettings({ ...settings, helpLink_returnsRefunds: e.target.value })}
                placeholder="/returns-refunds"
                maxLength={100}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* FAQ */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="faq" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                FAQs Route
              </label>
              <input
                id="faq"
                type="text"
                value={settings.helpLink_faq}
                onChange={(e) => setSettings({ ...settings, helpLink_faq: e.target.value })}
                placeholder="/faq"
                maxLength={100}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Help Center */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="helpCenter" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Help Center / Contact Us Route
              </label>
              <input
                id="helpCenter"
                type="text"
                value={settings.helpLink_helpCenter}
                onChange={(e) => setSettings({ ...settings, helpLink_helpCenter: e.target.value })}
                placeholder="/contact"
                maxLength={100}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Social Medias */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>3. Social Channels</span>
          </h3>

          <div className="flex flex-col gap-4">
            {/* Facebook */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="facebookUrl" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Facebook Link
              </label>
              <input
                id="facebookUrl"
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/kllankanatural"
                maxLength={200}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Instagram */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="instagramUrl" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Instagram Link
              </label>
              <input
                id="instagramUrl"
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/kllankanatural"
                maxLength={200}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* LinkedIn */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="linkedinUrl" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                LinkedIn Link
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={settings.linkedinUrl}
                onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/company/kllankanatural"
                maxLength={200}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Newsletter details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>4. Newsletter Customization</span>
          </h3>

          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newsletterTitle" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Newsletter Header Title
              </label>
              <input
                id="newsletterTitle"
                type="text"
                value={settings.newsletterTitle}
                onChange={(e) => setSettings({ ...settings, newsletterTitle: e.target.value })}
                placeholder="Subscribe to our Newsletter"
                maxLength={150}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newsletterDescription" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Newsletter Paragraph Subtitle
              </label>
              <textarea
                id="newsletterDescription"
                value={settings.newsletterDescription}
                onChange={(e) => setSettings({ ...settings, newsletterDescription: e.target.value })}
                placeholder="Get updates on natural products and premium collections..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-20"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10 text-xs uppercase tracking-wider disabled:bg-slate-100 disabled:text-slate-400 shrink-0"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving website settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
