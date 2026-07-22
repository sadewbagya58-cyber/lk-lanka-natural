// ─── Shared view-model types for the storefront ───────────────────────────────
// These are the ONLY types allowed to cross the API boundary. Raw Prisma models
// must NEVER be imported into client components.

export interface ProductCardVariantData {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number | null;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  image?: string;
  images?: string[];
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
  variants?: ProductCardVariantData[];
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
