'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Pencil, Package } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  inStock: boolean;
  category?: { name: string };
  brand?: { name: string } | null;
  images?: Array<{ url: string }>;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (isMounted && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Products Catalog</h1>
          <p className="text-xs text-slate-400 font-light mt-1">Manage real products stored in Hostinger MySQL</p>
        </div>

        <Link
          href="/admin/products/new"
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
          <Package className="w-12 h-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No products in database yet</h3>
          <p className="text-xs text-slate-500 font-light max-w-sm">
            Click &quot;Add New Product&quot; to add your first real product into Hostinger MySQL.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-2 h-10 px-4 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </Link>
        </div>
      ) : (
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const thumbnail = p.images?.[0]?.url;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {thumbnail ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-slate-200 bg-slate-50">
                          <Image src={thumbnail} alt={p.name} fill className="object-contain p-1" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">{p.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{p.category?.name || 'Uncategorized'}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {p.brand?.name ? (
                        <span>{p.brand.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">No Brand</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {p.inStock ? `${p.stockQuantity} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
