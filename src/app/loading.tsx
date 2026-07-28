export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-emerald-600/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-xl">
            <span className="text-2xl text-white font-black select-none">KL</span>
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-black text-slate-700 tracking-wider uppercase">
            KL Lanka Natural
          </span>
          <span className="text-xs text-slate-400 font-light">Loading&hellip;</span>
        </div>

        {/* Progress bar */}
        <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
