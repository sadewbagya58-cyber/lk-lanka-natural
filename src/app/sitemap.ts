import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kllankanatural.com';

  // 1. Static Indexable Routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/products',
    '/shipping-policy',
    '/returns-refunds',
    '/privacy-policy',
    '/terms-of-service',
    '/track-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/category/${encodeURIComponent(cat.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[Sitemap Generation Error] Categories fetch failed:', err);
  }

  // 3. Dynamic Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
    });
    productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${encodeURIComponent(prod.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[Sitemap Generation Error] Products fetch failed:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
