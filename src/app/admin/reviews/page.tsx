'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetcher';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  status: string;
  createdAt: string;
  product: {
    name: string;
    slug: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithRetry<{ success: boolean; reviews: ReviewItem[] }>('/api/admin/reviews');
      if (data && data.success) {
        setReviews(data.reviews);
      } else {
        setError('Failed to fetch reviews.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Review successfully ${newStatus.toLowerCase()}.`);
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        setError(data.error || 'Failed to update review status.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Review deleted successfully.');
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        setError(data.error || 'Failed to delete review.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>Product Reviews Moderation</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Approve, reject, or delete user-submitted product reviews and feedback.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2.5">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filterStatus === status
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350'
            }`}
          >
            {status === 'ALL' ? 'All Reviews' : status} (
            {status === 'ALL' ? reviews.length : reviews.filter((r) => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading Reviews...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-2xs flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No reviews found</h3>
          <p className="text-xs text-slate-400 max-w-sm font-light">
            There are no reviews matching the selected filter status in the database.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Rating & Content</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-medium">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">{review.product.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">/{review.product.slug}</span>
                    </td>

                    {/* Reviewer */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">{review.user.name}</span>
                      <span className="text-[10px] text-slate-400 block">{review.user.email}</span>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Rating & Content */}
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-center gap-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                        {review.verified && (
                          <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 ml-1">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      {review.title && <span className="font-bold text-slate-900 block mb-1">{review.title}</span>}
                      <p className="text-slate-600 leading-relaxed font-light whitespace-pre-wrap">{review.comment}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          review.status === 'APPROVED'
                            ? 'bg-emerald-105 text-emerald-800'
                            : review.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {review.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Approve Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 bg-slate-105 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
