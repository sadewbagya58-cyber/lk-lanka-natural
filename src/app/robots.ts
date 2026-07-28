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
        // NOTE: /uploads/* is intentionally NOT disallowed — product images
        // served from /uploads/[folder]/[filename] must be crawlable by Google.
      ],
    },
    sitemap: 'https://kllankanatural.com/sitemap.xml',
  };
}
