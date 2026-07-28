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
        '/signup',
        '/forgot-password',
        '/auth/*',
        '/api/*',
        '/uploads/*',
      ],
    },
    sitemap: 'https://kllankanatural.com/sitemap.xml',
  };
}
