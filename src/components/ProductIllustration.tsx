'use client';

interface ProductIllustrationProps {
  type: string;
  className?: string;
}

export default function ProductIllustration({ type, className = "w-full h-full text-slate-700/60" }: ProductIllustrationProps) {
  switch (type) {
    case 'perfume':
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Glass Bottle Body */}
          <rect x="28" y="36" width="44" height="46" rx="10" ry="10" className="stroke-slate-700" />
          {/* Scent/liquid level line */}
          <path d="M28 52h44" className="stroke-slate-300" strokeDasharray="1 2" />
          <path d="M28 64h44" className="stroke-slate-300" strokeDasharray="1 2" />
          
          {/* Premium Label */}
          <rect x="36" y="46" width="28" height="24" rx="2" className="fill-white stroke-slate-500" strokeWidth="1" />
          {/* Label markings */}
          <line x1="42" y1="53" x2="58" y2="53" strokeWidth="1" className="stroke-emerald-600" />
          <line x1="44" y1="58" x2="56" y2="58" strokeWidth="1.2" className="stroke-slate-600" />
          <line x1="46" y1="63" x2="54" y2="63" strokeWidth="0.8" className="stroke-slate-400" />
          
          {/* Gold Spray Collar */}
          <rect x="42" y="28" width="16" height="8" rx="1" className="fill-amber-100 stroke-amber-600" strokeWidth="1.2" />
          
          {/* Atomizer Spray Cap */}
          <path d="M46 28v-6h8v6" className="stroke-slate-700" />
          <circle cx="50" cy="18" r="2.5" className="fill-amber-200 stroke-amber-600" />
          
          {/* Subtle reflection curves */}
          <path d="M34 42c-2 4-2 10 0 14" className="stroke-white" strokeWidth="1" />
          <path d="M66 74c2-4 2-10 0-14" className="stroke-slate-200" strokeWidth="1" />
        </svg>
      );

    case 'cosmetic':
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Pump Lotion Bottle */}
          <path d="M32 38c0-4 4-8 10-8h16c6 0 10 4 10 8v40a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V38z" className="stroke-slate-700" />
          
          {/* Decorative Leaf Print on Bottle */}
          <path d="M50 48c0 0-4 4-4 8s4 6 4 6 4-2 4-6-4-8-4-8z" className="stroke-emerald-600 fill-emerald-50" strokeWidth="1" />
          <line x1="50" y1="48" x2="50" y2="62" strokeWidth="1" className="stroke-emerald-600" />
          
          {/* Pump Mechanism neck */}
          <rect x="45" y="24" width="10" height="6" className="fill-slate-100 stroke-slate-600" />
          
          {/* Pump Cap */}
          <path d="M42 24v-4c0-2 2-3 4-3h12l2 2" className="stroke-slate-700" strokeWidth="1.8" />
          <path d="M42 20h20" className="stroke-slate-700" />
          
          {/* Product Label strip */}
          <line x1="32" y1="68" x2="68" y2="68" className="stroke-slate-200" />
          <line x1="36" y1="72" x2="64" y2="72" strokeWidth="0.8" className="stroke-slate-400" />
        </svg>
      );

    case 'food':
    case 'health':
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Amber Supplement/Honey Jar */}
          <rect x="30" y="36" width="40" height="44" rx="8" className="stroke-slate-700 fill-amber-500/5" />
          
          {/* Jar Neck */}
          <path d="M36 36v-6h28v6" className="stroke-slate-700" />
          
          {/* Screw Cap */}
          <rect x="33" y="24" width="34" height="7" rx="2" className="fill-emerald-800 stroke-emerald-600" strokeWidth="1.2" />
          <line x1="38" y1="24" x2="38" y2="31" className="stroke-emerald-700" />
          <line x1="44" y1="24" x2="44" y2="31" className="stroke-emerald-700" />
          <line x1="50" y1="24" x2="50" y2="31" className="stroke-emerald-700" />
          <line x1="56" y1="24" x2="56" y2="31" className="stroke-emerald-700" />
          <line x1="62" y1="24" x2="62" y2="31" className="stroke-emerald-700" />
          
          {/* Organic Label */}
          <rect x="34" y="44" width="32" height="26" rx="2" className="fill-white stroke-slate-200" strokeWidth="1" />
          
          {/* Organic Leaf Graphic */}
          <path d="M50 49c-3 0-5 3-5 5s5 6 5 6 5-4 5-6-2-5-5-5z" className="stroke-emerald-600 fill-emerald-100/50" strokeWidth="1" />
          <path d="M47 56c2 1 4 0 5-2" className="stroke-emerald-600" strokeWidth="0.8" />
          
          {/* Label Typography */}
          <line x1="38" y1="64" x2="62" y2="64" strokeWidth="1" className="stroke-slate-800" />
          
          {/* Dynamic gloss highlight */}
          <path d="M34 40v32" strokeWidth="0.8" className="stroke-white" />
        </svg>
      );

    case 'jewellery':
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Ring Stand/Display Pad */}
          <ellipse cx="50" cy="74" rx="28" ry="10" className="fill-slate-100 stroke-slate-300" />
          <ellipse cx="50" cy="74" rx="22" ry="7" className="fill-white stroke-slate-200" strokeWidth="1" />
          
          {/* Ring Shank (Metal Band) */}
          <circle cx="50" cy="46" r="16" className="stroke-amber-600" strokeWidth="2.2" />
          <circle cx="50" cy="46" r="13" className="stroke-amber-100" strokeWidth="1" />
          
          {/* Prongs Setting */}
          <path d="M44 32l3-6h6l3 6" className="stroke-amber-600" strokeWidth="1.5" />
          
          {/* Ceylon Sapphire Faceted Gem */}
          <polygon 
            points="50,16 59,23 56,31 44,31 41,23" 
            className="fill-blue-500 stroke-blue-700" 
            strokeWidth="1.5"
          />
          <line x1="50" y1="16" x2="50" y2="31" className="stroke-blue-200" strokeWidth="0.8" />
          <line x1="41" y1="23" x2="59" y2="23" className="stroke-blue-200" strokeWidth="0.8" />
          
          {/* Reflections */}
          <path d="M34 22l-4-4M66 22l4-4M50 10V4" className="stroke-amber-400" strokeWidth="1" />
        </svg>
      );

    case 'generic':
    default:
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Giftbox packaging */}
          <polygon points="50,18 84,33 50,48 16,33" className="fill-slate-100 stroke-slate-700" />
          <polygon points="16,33 50,48 50,82 16,67" className="fill-slate-50 stroke-slate-700" />
          <polygon points="50,48 84,33 84,67 50,82" className="fill-slate-100/50 stroke-slate-700" />
          
          {/* Stamp on face */}
          <circle cx="33" cy="58" r="6" className="stroke-emerald-600 fill-emerald-50" strokeWidth="1" />
          <path d="M33 56c0 1.5-1.5 2-1.5 2s1.5.5 1.5 2" className="stroke-emerald-600" strokeWidth="0.8" />
        </svg>
      );
  }
}
