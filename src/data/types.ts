// ============================================================
// KL Lanka Natural (PVT) LTD — Catalog Type Definitions
// ============================================================
// These types define the shape of the product catalog.
// They are designed for future database/API integration.
// Replace the static data files with API calls when ready.
// ============================================================

import type { LucideIcon } from 'lucide-react';

// ----- Category & SubCategory -----

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string;
  description?: string;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  colorClasses: string;       // Tailwind color classes for the icon badge
  image?: string;             // Optional category hero image
  subCategories: SubCategory[];
  featured: boolean;          // Whether to show on homepage
  sortOrder: number;
}

// ----- Brand -----

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  icon?: LucideIcon;          // Fallback icon if no logo URL
  featured: boolean;
}

// ----- Product Images -----

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ----- Product Variants -----

export interface ProductVariant {
  id: string;
  name: string;              // e.g. "50ml", "100ml", "Gold", "Silver"
  sku: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockQuantity: number;
}

// ----- Inventory -----

export interface InventoryInfo {
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;  // e.g. 5 – show "Only X left!" below this
  totalStock: number;         // for progress bar calculations
}

// ----- Review -----

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorAvatar?: string;       // initials fallback if absent
  authorLocation?: string;
  rating: number;              // 1-5
  title?: string;
  comment: string;
  verified: boolean;
  createdAt: string;           // ISO 8601 date string
}

// ----- Product -----

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;

  // Relations
  categoryId: string;
  subCategoryId?: string;
  brandId: string;

  // Pricing (USD)
  price: number;
  originalPrice?: number;
  currency: string;           // default "USD"

  // Display
  badge?: string;             // "New", "Popular", "Exclusive", etc.
  tags: string[];             // searchable tags
  gradient: string;           // Tailwind gradient for placeholder image
  visualSeed: string;         // SVG visual type: 'perfume' | 'cosmetic' | 'food' | 'jewellery' | 'generic'

  // Inventory
  inventory: InventoryInfo;

  // Media
  images: ProductImage[];

  // Variants (optional)
  variants?: ProductVariant[];

  // Ratings (denormalized for performance)
  rating: number;
  reviewsCount: number;

  // Catalog grouping
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashDeal: boolean;
  flashDealEndsAt?: string;   // ISO 8601

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ----- Display helpers (for components that don't need the full Product) -----

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
}

// ----- Filters & Sorting -----

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'name-asc'
  | 'name-desc';

export interface ProductFilters {
  categorySlug?: string;
  subCategorySlug?: string;
  brandSlugs?: string[];
  search?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
