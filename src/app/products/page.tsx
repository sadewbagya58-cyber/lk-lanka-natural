import { Metadata } from 'next';
import ProductCatalog from '@/components/ProductCatalog';

export const metadata: Metadata = {
  title: 'All Products | KL Lanka Natural',
  description: 'Browse our complete collection of health products, premium perfumes, and handcrafted jewellery.',
};

export default function ProductsPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-8 lg:py-12">
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
