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

  const categoryObj = product.category && typeof product.category === 'object' ? product.category as { name?: string | null; slug?: string | null } : null;
  const slug = product.slug || categoryObj?.slug || product.categorySlug || (typeof product.category === 'string' ? product.category : '');
  const name = product.name || categoryObj?.name || product.categoryName || (typeof product.category === 'string' ? product.category : '');

  const cleanSlug = (slug || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();

  return (
    cleanSlug === CUSTOM_PORTRAIT_SLUG ||
    cleanSlug.includes('portrait-art') ||
    cleanSlug.includes('custom-portrait') ||
    cleanName === CUSTOM_PORTRAIT_NAME.toLowerCase() ||
    cleanName.includes('custom portrait')
  );
}
