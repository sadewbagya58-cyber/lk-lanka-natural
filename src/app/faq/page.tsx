import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | KL Lanka Natural',
  description: 'Find answers to the most common questions about shopping, orders, delivery, custom portrait art, and natural wellness products.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kllankanatural.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Frequently Asked Questions",
        "item": "https://kllankanatural.com/faq"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FaqClient />
    </>
  );
}
