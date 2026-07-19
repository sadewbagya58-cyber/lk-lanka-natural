import type { Brand } from './types';

// ============================================================
// BRANDS DATA
// ============================================================
// All brand entries are centralized here.
// Components should import brands from this file, not hardcode.
// ============================================================

export const brands: Brand[] = [
  { id: 'brand-ceylon-naturals', name: 'Ceylon Naturals', slug: 'ceylon-naturals', description: 'Authentic Sri Lankan herbal wellness products.', featured: true },
  { id: 'brand-ayur-vedic', name: 'AyurVedic Heritage', slug: 'ayurvedic-heritage', description: 'Traditional Ayurvedic remedies and supplements.', featured: true },
  { id: 'brand-tropic-essence', name: 'Tropic Essence', slug: 'tropic-essence', description: 'Premium tropical fragrance house.', featured: true },
  { id: 'brand-island-gems', name: 'Island Gems', slug: 'island-gems', description: 'Handcrafted Sri Lankan gemstone jewellery.', featured: true },
  { id: 'brand-spice-isle', name: 'Spice Isle', slug: 'spice-isle', description: 'Organic spices and superfoods.', featured: true },
  { id: 'brand-pearl-coast', name: 'Pearl Coast', slug: 'pearl-coast', description: 'Premium pearl and silver jewellery.', featured: true },
  { id: 'brand-vita-boost', name: 'VitaBoost', slug: 'vitaboost', description: 'Advanced daily vitamin supplements.', featured: true },
  { id: 'brand-aura-luxe', name: 'Aura Luxe', slug: 'aura-luxe', description: 'Luxury unisex fragrances.', featured: true },
];

// ============================================================
// HELPERS
// ============================================================

export function getAllBrands(): Brand[] {
  return brands;
}

export function getFeaturedBrands(): Brand[] {
  return brands.filter((b) => b.featured);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}
