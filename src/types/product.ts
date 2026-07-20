// ─── Shared view-model types for the storefront ───────────────────────────────
// These are the ONLY types allowed to cross the API boundary. Raw Prisma models
// must NEVER be imported into client components.

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
  isFlashDeal?: boolean;
  flashDealEndsAt?: string | null;
  stockQuantity?: number;
  totalStock?: number;
  lowStockThreshold?: number;
  categoryId?: string;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'name-asc'
  | 'name-desc';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  colorClasses?: string;
  image?: string;
  featured?: boolean;
  sortOrder?: number;
  subCategories?: SubCategoryData[];
}

export interface SubCategoryData {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string;
  description?: string;
}

export interface BrandData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  featured?: boolean;
}
