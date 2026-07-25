import { Metadata } from 'next';
import ProductCatalog from '@/components/ProductCatalog';

export const metadata: Metadata = {
  title: 'All Products | KL Lanka Natural',
  description: 'Browse our complete collection of health products, premium perfumes, and handcrafted jewellery.',
  alternates: {
    canonical: '/products',
  },
};

export default function ProductsPage() {
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
        "name": "Products",
        "item": "https://kllankanatural.com/products"
      }
    ]
  };

  return (
    <main className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">All Products</h1>
          <p className="text-slate-600 max-w-2xl text-lg">
            Browse our complete collection of health products, premium perfumes, and handcrafted jewellery.
          </p>
        </div>
        <ProductCatalog />
      </div>
    </main>
  );
}
