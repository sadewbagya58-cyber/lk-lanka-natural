export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  category: string;
  categorySlug: string;
  brandName: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  gradient: string;
  visualSeed: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'name-asc'
  | 'name-desc';
