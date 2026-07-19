import type { Category, SubCategory } from './types';
import { HeartPulse, Flame, Gem } from 'lucide-react';

// ============================================================
// CATEGORIES DATA
// ============================================================
// Currently shipping: Health Products, Perfumes, Jewellery
// To add a category: just add an entry here. UI renders automatically.
// ============================================================

export const categories: Category[] = [
  {
    id: 'cat-health',
    name: 'Health Products',
    slug: 'health-products',
    description: 'Premium natural health supplements, herbal remedies, vitamins, and wellness essentials sourced from trusted producers.',
    icon: HeartPulse,
    colorClasses: 'bg-teal-50 text-teal-600 border-teal-100',
    featured: true,
    sortOrder: 1,
    subCategories: [
      { id: 'sub-herbal', name: 'Herbal', slug: 'herbal', parentCategoryId: 'cat-health', description: 'Traditional herbal remedies and botanical supplements.' },
      { id: 'sub-vitamins', name: 'Vitamins', slug: 'vitamins', parentCategoryId: 'cat-health', description: 'Essential vitamins and mineral complexes.' },
      { id: 'sub-supplements', name: 'Supplements', slug: 'supplements', parentCategoryId: 'cat-health', description: 'Dietary supplements for daily wellness.' },
    ],
  },
  {
    id: 'cat-perfumes',
    name: 'Perfumes & Fragrances',
    slug: 'perfumes',
    description: 'Exquisite signature fragrances, essential oil blends, and luxury perfumes for men and women.',
    icon: Flame,
    colorClasses: 'bg-purple-50 text-purple-600 border-purple-100',
    featured: true,
    sortOrder: 2,
    subCategories: [
      { id: 'sub-men', name: 'Men', slug: 'men', parentCategoryId: 'cat-perfumes', description: 'Bold and refined fragrances for men.' },
      { id: 'sub-women', name: 'Women', slug: 'women', parentCategoryId: 'cat-perfumes', description: 'Elegant and captivating scents for women.' },
      { id: 'sub-unisex', name: 'Unisex', slug: 'unisex', parentCategoryId: 'cat-perfumes', description: 'Universal fragrances for all.' },
    ],
  },
  {
    id: 'cat-jewellery',
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Handcrafted rings, necklaces, bracelets, and statement pieces made with premium metals and gemstones.',
    icon: Gem,
    colorClasses: 'bg-amber-50 text-amber-600 border-amber-100',
    featured: true,
    sortOrder: 3,
    subCategories: [
      { id: 'sub-rings', name: 'Rings', slug: 'rings', parentCategoryId: 'cat-jewellery', description: 'Statement rings and engagement bands.' },
      { id: 'sub-necklaces', name: 'Necklaces', slug: 'necklaces', parentCategoryId: 'cat-jewellery', description: 'Elegant chains and pendant necklaces.' },
      { id: 'sub-bracelets', name: 'Bracelets', slug: 'bracelets', parentCategoryId: 'cat-jewellery', description: 'Premium bangles and charm bracelets.' },
    ],
  },
];

// ============================================================
// HELPER FUNCTIONS
// Replace these with API calls when integrating a database.
// ============================================================

export function getAllCategories(): Category[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getFeaturedCategories(): Category[] {
  return getAllCategories().filter((c) => c.featured);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getSubCategoryBySlug(categorySlug: string, subSlug: string): SubCategory | undefined {
  const cat = getCategoryBySlug(categorySlug);
  return cat?.subCategories.find((sc) => sc.slug === subSlug);
}

export function getAllSubCategories(): SubCategory[] {
  return categories.flatMap((c) => c.subCategories);
}

/** Builds category names for navbar/search dropdowns automatically. */
export function getCategoryNames(): string[] {
  return getAllCategories().map((c) => c.name);
}
