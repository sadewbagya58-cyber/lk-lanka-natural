/**
 * Helper utilities for detecting Custom Portrait Art products and category matching.
 */

export const CUSTOM_PORTRAIT_SLUG = 'custom-portrait-art';
export const CUSTOM_PORTRAIT_NAME = 'Custom Portrait Art';

export function isCustomPortraitArt(product?: {
  slug?: string | null;
  name?: string | null;
  category?: string | { name?: string | null; slug?: string | null } | null;
  categorySlug?: string | null;
  categoryName?: string | null;
} | null): boolean {
  if (!product) return false;

  // 1. Check categorySlug directly (most reliable — comes from DB category relation)
  const catSlug = (product.categorySlug || '').toLowerCase().trim();
  if (catSlug === CUSTOM_PORTRAIT_SLUG || catSlug.includes('portrait-art') || catSlug.includes('custom-portrait')) {
    return true;
  }

  // 2. Check categoryName directly
  const catName = (product.categoryName || '').toLowerCase().trim();
  if (catName === CUSTOM_PORTRAIT_NAME.toLowerCase() || catName.includes('custom portrait')) {
    return true;
  }

  // 3. Check nested category object
  const categoryObj = product.category && typeof product.category === 'object'
    ? product.category as { name?: string | null; slug?: string | null }
    : null;
  if (categoryObj?.slug) {
    const s = (categoryObj.slug || '').toLowerCase().trim();
    if (s === CUSTOM_PORTRAIT_SLUG || s.includes('portrait-art') || s.includes('custom-portrait')) return true;
  }
  if (categoryObj?.name) {
    const n = (categoryObj.name || '').toLowerCase().trim();
    if (n === CUSTOM_PORTRAIT_NAME.toLowerCase() || n.includes('custom portrait')) return true;
  }

  // 4. Fallback: check product name (least reliable but catches edge cases)
  const productName = (product.name || '').toLowerCase().trim();
  if (productName.includes('custom portrait')) return true;

  return false;
}
