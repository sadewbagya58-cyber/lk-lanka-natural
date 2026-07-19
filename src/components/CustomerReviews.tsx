import { Star, ShieldCheck } from 'lucide-react';
import { getFeaturedReviews } from '@/data';
import { products } from '@/data';

export default function CustomerReviews() {
  const reviews = getFeaturedReviews(3);

  return (
    <section className="w-full py-10 md:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Client Reviews</span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">What Our Customers Say</h2>
          <p className="text-xs text-slate-500 font-light mt-1">Real ratings and feedback from verified purchasers in Sri Lanka</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => {
            // Build avatar initials from author name
            const initials = rev.authorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            // Find the product name for context
            const product = products.find((p) => p.id === rev.productId);

            return (
              <div
                key={rev.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div className="flex flex-col gap-4">
                  {/* Stars */}
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  
                  {/* Title */}
                  {rev.title && (
                    <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* Product reference */}
                  {product && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Purchased: {product.name}
                    </span>
                  )}
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {rev.authorName}
                      {rev.verified && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </h4>
                    {rev.authorLocation && (
                      <p className="text-[10px] text-slate-400 font-medium">{rev.authorLocation}</p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
