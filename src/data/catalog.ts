// ============================================================
// CATALOG QUERY ENGINE
// ============================================================
// This module provides all filtering, sorting, search, and
// pagination logic. Components should call these functions
// instead of filtering products inline.
//
// When a real database is wired up, replace the implementations
// here with API calls. The signatures stay the same.
// ============================================================

import type { Product, ProductCardData, ProductFilters, PaginatedResult, SortOption } from './types';
import { products } from './products';
import { getCategoryById, getAllSubCategories, categories } from './categories';
import { getBrandById, brands } from './brands';

// ─── PRODUCT QUERY ──────────────────────────────────────────

/** Full product by slug */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Full product by ID or Slug */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id || p.slug === id);
}

/** All products (unfiltered) */
export function getAllProducts(): Product[] {
  return products;
}

// ─── CARD-LEVEL DATA TRANSFORM ──────────────────────────────

/** Convert a full Product into lightweight ProductCardData for grid rendering */
export function toCardData(product: Product): ProductCardData {
  const category = getCategoryById(product.categoryId);
  const brand = getBrandById(product.brandId);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice,
    badge: product.badge,
    category: category?.name ?? 'Uncategorized',
    categorySlug: category?.slug ?? '',
    brandName: brand?.name ?? 'Unknown',
    inStock: product.inventory.inStock,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    gradient: product.gradient,
    visualSeed: product.visualSeed,
  };
}

// ─── HOMEPAGE SECTION HELPERS ───────────────────────────────

export function getFeaturedProducts(limit = 8): ProductCardData[] {
  return products
    .filter((p) => p.isFeatured)
    .slice(0, limit)
    .map(toCardData);
}

export function getBestSellers(limit = 8): ProductCardData[] {
  return products
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, limit)
    .map(toCardData);
}

export function getNewArrivals(limit = 8): ProductCardData[] {
  return products
    .filter((p) => p.isNewArrival)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(toCardData);
}

export function getFlashDeals(limit = 8): ProductCardData[] {
  return products
    .filter((p) => p.isFlashDeal && p.flashDealEndsAt)
    .slice(0, limit)
    .map(toCardData);
}

export function getFlashDealProducts(limit = 8): (Product & { flashDealEndsAt: string })[] {
  return products
    .filter((p): p is Product & { flashDealEndsAt: string } =>
      p.isFlashDeal && typeof p.flashDealEndsAt === 'string'
    )
    .slice(0, limit);
}

// ─── CATEGORY/BRAND QUERY ───────────────────────────────────

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductsByCategorySlug(slug: string): Product[] {
  const found = categories.find((c) => c.slug === slug);
  return found ? products.filter((p) => p.categoryId === found.id) : [];
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter((p) => p.brandId === brandId);
}

// ─── SEARCH ─────────────────────────────────────────────────

function searchProducts(items: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  return items.filter((p) => {
    const searchable = [
      p.name,
      p.description,
      p.shortDescription ?? '',
      ...p.tags,
      p.badge ?? '',
    ].join(' ').toLowerCase();
    return searchable.includes(q);
  });
}

// ─── SORTING ────────────────────────────────────────────────

function sortProducts(items: Product[], sort: SortOption): Product[] {
  const sorted = [...items];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'relevance':
    default:
      return sorted;
  }
}

// ─── FULL QUERY ENGINE ──────────────────────────────────────

export function queryProducts(filters: ProductFilters = {}): PaginatedResult<ProductCardData> {
  let result = [...products];

  // Category filter
  if (filters.categorySlug) {
    const cat = categories.find((c) => c.slug === filters.categorySlug);
    if (cat) {
      result = result.filter((p) => p.categoryId === cat.id);
    }
  }

  // SubCategory filter
  if (filters.subCategorySlug) {
    const allSubs = getAllSubCategories();
    const sub = allSubs.find((s) => s.slug === filters.subCategorySlug);
    if (sub) {
      result = result.filter((p) => p.subCategoryId === sub.id);
    }
  }

  // Brand filter
  if (filters.brandSlugs && filters.brandSlugs.length > 0) {
    const brandIds = brands
      .filter((b) => filters.brandSlugs!.includes(b.slug))
      .map((b) => b.id);
    result = result.filter((p) => brandIds.includes(p.brandId));
  }

  // Price range
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  // In stock only
  if (filters.inStockOnly) {
    result = result.filter((p) => p.inventory.inStock);
  }

  // Search
  if (filters.search) {
    result = searchProducts(result, filters.search);
  }

  // Sort
  result = sortProducts(result, filters.sort ?? 'relevance');

  // Pagination
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const total = result.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = result.slice(start, start + pageSize);

  return {
    items: paged.map(toCardData),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ─── RELATED PRODUCTS ───────────────────────────────────────

export function getRelatedProducts(product: Product, limit = 4): ProductCardData[] {
  return products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, limit)
    .map(toCardData);
}
