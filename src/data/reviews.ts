import type { ProductReview } from './types';

// ============================================================
// REVIEWS DATA
// ============================================================

export const reviews: ProductReview[] = [
  {
    id: 'rev-01',
    productId: 'prod-01',
    authorName: 'Nimal Perera',
    authorLocation: 'Colombo, Sri Lanka',
    rating: 5,
    title: 'Amazing quality moringa!',
    comment: 'I have been taking these for 3 months now and my energy levels have improved dramatically. Truly premium quality product from Ceylon Naturals.',
    verified: true,
    createdAt: '2025-06-15T10:30:00Z',
  },
  {
    id: 'rev-02',
    productId: 'prod-05',
    authorName: 'Sarah Ahmed',
    authorLocation: 'Kandy, Sri Lanka',
    rating: 5,
    title: 'Best oud fragrance I\'ve ever worn',
    comment: 'The Oud Royale is absolutely magnificent. The scent lasts all day and I receive compliments wherever I go. Worth every penny for the quality.',
    verified: true,
    createdAt: '2025-05-20T14:15:00Z',
  },
  {
    id: 'rev-03',
    productId: 'prod-09',
    authorName: 'Kumari Silva',
    authorLocation: 'Galle, Sri Lanka',
    rating: 5,
    title: 'Breathtaking sapphire ring',
    comment: 'The sapphire is absolutely stunning with incredible depth of colour. The craftsmanship is impeccable and it came with full certification. My husband surprised me with this and I couldn\'t be happier!',
    verified: true,
    createdAt: '2025-07-01T09:00:00Z',
  },
  {
    id: 'rev-04',
    productId: 'prod-02',
    authorName: 'Rajesh Kumar',
    authorLocation: 'Jaffna, Sri Lanka',
    rating: 4,
    title: 'Great supplement, fast shipping',
    comment: 'The turmeric complex works wonderfully for my joint pain. I noticed improvement within 2 weeks. Shipping was fast and packaging was secure.',
    verified: true,
    createdAt: '2025-06-28T16:45:00Z',
  },
  {
    id: 'rev-05',
    productId: 'prod-06',
    authorName: 'Amaya Fernando',
    authorLocation: 'Negombo, Sri Lanka',
    rating: 5,
    title: 'My signature scent now!',
    comment: 'Midnight Rose is absolutely divine. The floral notes are perfectly balanced and it transitions beautifully throughout the day. I have already ordered a second bottle.',
    verified: true,
    createdAt: '2025-04-10T11:30:00Z',
  },
  {
    id: 'rev-06',
    productId: 'prod-10',
    authorName: 'Dinesh Rathnayake',
    authorLocation: 'Matara, Sri Lanka',
    rating: 5,
    title: 'Perfect gift for my wife',
    comment: 'The moonstone pendant is gorgeous. The blue sheen is magical in sunlight. My wife absolutely loves it. Beautiful gift box included. Highly recommend!',
    verified: true,
    createdAt: '2025-06-02T13:20:00Z',
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getReviewsByProductId(productId: string): ProductReview[] {
  return reviews.filter((r) => r.productId === productId);
}

export function getFeaturedReviews(limit = 6): ProductReview[] {
  return reviews
    .filter((r) => r.verified && r.rating >= 4)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getAverageRating(productId: string): number {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return 0;
  return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
}
