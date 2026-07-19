import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getAllCategories, queryProducts } from '@/data';
import CategoryView from '@/components/CategoryView';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found | KL Lanka Natural',
    };
  }

  return {
    title: `${category.name} | KL Lanka Natural`,
    description: category.description,
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Get products for this category
  const paginatedProducts = queryProducts({ categorySlug: slug, pageSize: 100 });
  const products = paginatedProducts.items;

  const { icon: Icon, ...serializableCategory } = category;

  return (
    <main className="min-h-screen bg-slate-50">
      <CategoryView 
        category={serializableCategory} 
        products={products}
        iconNode={<Icon className="w-12 h-12 text-white" />} 
      />
    </main>
  );
}
