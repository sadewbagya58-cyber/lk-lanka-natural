'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import MultiImageUpload, { MultiImageItem } from '@/components/admin/MultiImageUpload';
import ImageUpload from '@/components/admin/ImageUpload';

interface AdminVariantItem {
  id?: string;
  name: string;
  sku: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  imageUrl: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface BrandItem {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();

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
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [images, setImages] = useState<MultiImageItem[]>([]);

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<AdminVariantItem[]>([]);

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);

        if (catData.categories?.length > 0) setCategoryId(catData.categories[0].id);
      } catch (err) {
        console.error('Failed to load form options:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFormOptions();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !slug || !price || !categoryId) {
      setError('Name, slug, price, and category are required.');
      return;
    }

    if (hasVariants) {
      if (variants.length === 0) {
        setError('At least one variant is required when variants are enabled.');
        return;
      }
      for (const [idx, v] of variants.entries()) {
        if (!v.name) {
          setError(`Variant #${idx + 1} name is required.`);
          return;
        }
        if (!v.price || parseFloat(v.price) <= 0) {
          setError(`Variant #${idx + 1} price must be a positive number.`);
          return;
        }
        const vStock = parseInt(v.stockQuantity);
        if (isNaN(vStock) || vStock < 0) {
          setError(`Variant #${idx + 1} stock quantity must be a non-negative integer.`);
          return;
        }
      }
    } else {
      const parsedStock = parseInt(stockQuantity) || 0;
      if (parsedStock < 0) {
        setError('Stock quantity cannot be negative.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          shortDescription,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          badge,
          stockQuantity: hasVariants ? 0 : (parseInt(stockQuantity) || 0),
          lowStockThreshold: hasVariants ? 5 : (parseInt(lowStockThreshold) || 5),
          totalStock: hasVariants ? 0 : (parseInt(stockQuantity) || 0),
          inStock: hasVariants ? false : (parseInt(stockQuantity) > 0),
          categoryId,
          brandId: brandId || null,
          images: images.map((img, index) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: index,
          })),
          variants: hasVariants ? variants.map((v) => ({
            name: v.name.trim(),
            sku: v.sku.trim() || undefined,
            price: parseFloat(v.price),
            originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
            stockQuantity: parseInt(v.stockQuantity) || 0,
            lowStockThreshold: parseInt(v.lowStockThreshold) || 5,
            imageUrl: v.imageUrl || null,
          })) : [],
          isFeatured,
          isBestSeller,
          isNewArrival,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create product.');
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating product.');
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
          <h1 className="text-2xl font-black text-slate-900 mt-1">Create Product</h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
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
                <option value="">No categories (Create one first)</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              min="0"
              value={stockQuantity}
              disabled={hasVariants}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium disabled:opacity-50"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Low Stock Limit</label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              disabled={hasVariants}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium disabled:opacity-50"
            />
          </div>
        </div>

        {/* Product Variants Uploader Section */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-4 shadow-sm">
          <label className="flex items-center gap-3 font-bold text-slate-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-wider">This product has variants</span>
              <span className="text-[10px] text-slate-400 font-medium normal-case">Enable to add options like sizes, volumes, weights, or dimensions</span>
            </div>
          </label>

          {hasVariants && (
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Variants List</span>
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { name: '', sku: '', price: '', originalPrice: '', stockQuantity: '10', lowStockThreshold: '5', imageUrl: '' }])}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow flex items-center gap-1.5"
                >
                  + Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-slate-400 italic">
                  No variants added yet. Click &apos;+ Add Variant&apos; to begin.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {variants.map((v, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-4 relative group">
                      {/* Title & Delete */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Variant #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {/* Reordering */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...variants];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setVariants(updated);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={idx === variants.length - 1}
                            onClick={() => {
                              const updated = [...variants];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setVariants(updated);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Form grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Option Name (e.g. 100g)</label>
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].name = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="100g / 250ml / Medium"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SKU (Unique)</label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].sku = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="TEA-100"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={v.price}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].price = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="15.00"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Original Price (Optional)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={v.originalPrice}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].originalPrice = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="18.00"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock Qty</label>
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].stockQuantity = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="20"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Low Stock Limit</label>
                          <input
                            type="number"
                            min="1"
                            value={v.lowStockThreshold}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].lowStockThreshold = e.target.value;
                              setVariants(updated);
                            }}
                            placeholder="5"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                          />
                        </div>
                      </div>

                      {/* Variant Image Uploader */}
                      <div className="w-full max-w-xs">
                        <ImageUpload
                          label="Variant Image (Optional)"
                          value={v.imageUrl}
                          onChange={(url) => {
                            const updated = [...variants];
                            updated[idx].imageUrl = url;
                            setVariants(updated);
                          }}
                          folder="variants"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Gallery Upload Component */}
        <MultiImageUpload
          label="Product Image Gallery (MAIN and ADDITIONAL images)"
          value={images}
          onChange={(items) => setImages(items)}
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
          {submitting ? 'Creating Product...' : 'Save & Publish Product'}
        </button>
      </form>
    </div>
  );
}
