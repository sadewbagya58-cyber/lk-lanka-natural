import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kllankanatural.com';

  // 1. Static Indexable Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/returns-refunds`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // 2. Dynamic Categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
      orderBy: { sortOrder: 'asc' },
    });
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[Sitemap Generation Error] Categories fetch failed:', err);
  }

  // 3. Dynamic Products — only include products that are in stock or have variants
  // This avoids dead/empty product pages appearing in Google's index.
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      // Include all products (stock status is managed via inStock field on the page itself)
      orderBy: { updatedAt: 'desc' },
    });
    productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[Sitemap Generation Error] Products fetch failed:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

