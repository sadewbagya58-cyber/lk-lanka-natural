import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Page Not Found | KL Lanka Natural',
  description: 'The page you are looking for does not exist. Browse our premium natural products at KL Lanka Natural.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-md w-full flex flex-col items-center gap-6">
          {/* 404 visual */}
          <div className="relative">
            <span className="text-[120px] font-black leading-none text-slate-100 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-xl">
                <span className="text-3xl text-white font-black">KL</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
            <p className="text-sm text-slate-500 font-light leading-relaxed">
              The page you are looking for may have been moved, deleted, or might never have existed.
              Let us help you find what you need.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="flex-1 py-3 px-6 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors text-center"
            >
              Go to Homepage
            </Link>
            <Link
              href="/products"
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors text-center"
            >
              Browse Products
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {[
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
              { href: '/faq', label: 'FAQ' },
              { href: '/track-order', label: 'Track Order' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-400 hover:text-emerald-600 transition-colors font-medium underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
