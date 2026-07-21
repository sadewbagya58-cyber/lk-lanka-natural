'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface CategoryItem {
  id: string;
  name: string;
}

interface BrandItem {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [catRes, brandRes, productRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch(`/api/admin/products?id=${id}`),
        ]);

        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const productData = await productRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);

        if (productData.product) {
          const p = productData.product;
          setName(p.name || '');
          setSlug(p.slug || '');
          setDescription(p.description || '');
          setShortDescription(p.shortDescription || '');
          setPrice(p.price ? p.price.toString() : '');
          setOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
          setBadge(p.badge || '');
          setStockQuantity(p.stockQuantity ? p.stockQuantity.toString() : '100');
          setCategoryId(p.categoryId || '');
          setBrandId(p.brandId || '');
          setIsFeatured(Boolean(p.isFeatured));
          setIsBestSeller(Boolean(p.isBestSeller));
          setIsNewArrival(Boolean(p.isNewArrival));

          if (p.images && p.images.length > 0) {
            const primary = p.images.find((img: { isPrimary?: boolean; url: string }) => img.isPrimary) || p.images[0];
            setImageUrl(primary.url || '');
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product edit data:', err);
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !slug || !price || !categoryId) {
      setError('Name, slug, price, and category are required.');
      return;
    }

    setSubmitting(true);

    try {
      const images = imageUrl ? [{ url: imageUrl, alt: name, isPrimary: true }] : [];

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          slug,
          description,
          shortDescription,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          badge,
          stockQuantity: parseInt(stockQuantity),
          totalStock: parseInt(stockQuantity),
          inStock: parseInt(stockQuantity) > 0,
          categoryId,
          brandId: brandId || null,
          images,
          isFeatured,
          isBestSeller,
          isNewArrival,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update product.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <Link
          href="/admin/products"
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Admin Control</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Edit Product</h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Product updated successfully! Redirecting to products list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Organic Moringa Powder"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="organic-moringa-powder"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>
        </div>

        {/* Category & Brand Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
              required
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Brand (Optional)</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
            >
              <option value="">No Brand (Optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="19.99"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Original Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="24.99"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Image Upload Component */}
        <ImageUpload
          label="Main Product Image"
          value={imageUrl}
          onChange={(url) => setImageUrl(url)}
          folder="products"
        />

        {/* Badge */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Badge (Optional)</label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Popular / Organic / Best Seller"
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Descriptions */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Short Description</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief product description for grid cards..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed product description..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-28"
          />
        </div>

        {/* Checkbox Flags */}
        <div className="flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Best Seller</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>New Arrival</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 transition-all active:scale-95 disabled:opacity-50 mt-4"
        >
          {submitting ? 'Updating Product...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
