'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[KL Lanka Natural] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        {/* Error icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-xl">
          <span className="text-3xl text-white font-black">!</span>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-black text-slate-900">Something Went Wrong</h1>
          <p className="text-sm text-slate-500 font-light leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please try again
            or return to the homepage.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 py-3 px-6 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors text-center"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
