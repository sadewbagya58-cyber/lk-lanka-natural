import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/account',
        '/account/*',
        '/cart',
        '/checkout',
        '/login',
        '/register',
        '/forgot-password',
        '/auth/*',
        '/api/*',
      ],
    },
    sitemap: 'https://kllankanatural.com/sitemap.xml',
  };
}
