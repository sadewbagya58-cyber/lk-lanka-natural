/**
 * Helper utilities for detecting Custom Portrait Art products and category matching.
 */

export const CUSTOM_PORTRAIT_SLUG = 'custom-portrait-art';
export const CUSTOM_PORTRAIT_NAME = 'Custom Portrait Art';

export function isCustomPortraitArt(product?: Record<string, unknown> | null): boolean {
  if (!product) return false;

  const categoryObj = typeof product.category === 'object' && product.category ? product.category : null;
  const slug = categoryObj?.slug || product.categorySlug || (typeof product.category === 'string' ? product.category : '');
  const name = categoryObj?.name || product.categoryName || (typeof product.category === 'string' ? product.category : '');

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
