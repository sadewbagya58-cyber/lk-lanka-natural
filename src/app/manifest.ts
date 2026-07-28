import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KL Lanka Natural (PVT) LTD',
    short_name: 'KL Lanka Natural',
    description: 'Premium online marketplace for natural, Ayurvedic, and wellness products in Sri Lanka.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f2419',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
