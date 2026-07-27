'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  productSlug: string;
}

export default function ReviewForm({ productSlug }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please write a review comment (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setRating(0);
        setTitle('');
        setComment('');
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        <span className="text-sm font-bold text-emerald-800">Review Submitted Successfully!</span>
        <p className="text-xs text-emerald-700 font-light">
          Your review is pending moderation and will appear here once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <h4 className="text-sm font-black text-slate-900">Write a Review</h4>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Star Rating Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating *</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs font-bold text-amber-700 ml-1">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest" htmlFor="review-title">
          Review Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Summarise your experience..."
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
        />
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest" htmlFor="review-comment">
          Your Review *
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
          required
        />
        <span className="text-[9px] text-slate-350 font-medium self-end">{comment.length}/2000</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </button>
      <p className="text-[9px] text-slate-400 font-medium text-center">
        Only verified purchasers can submit reviews. Reviews are moderated before appearing publicly.
      </p>
    </form>
  );
}
