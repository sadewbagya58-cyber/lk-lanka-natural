'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Tag, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  _count?: { products: number };
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.brands) {
        setBrands(data.brands);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('');
    setDescription('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (b: BrandItem) => {
    setEditingBrand(b);
    setName(b.name || '');
    setSlug(b.slug || '');
    setLogo(b.logoUrl || '');
    setDescription(b.description || '');
    setError(null);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingBrand) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = Boolean(editingBrand);
      const url = '/api/admin/brands';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { id: editingBrand?.id, name, slug, logo, description }
        : { name, slug, logo, description };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} brand.`);
        return;
      }

      setShowModal(false);
      loadBrands();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadBrands();
      }
    } catch (err) {
      console.error('Failed to delete brand:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Brands</h1>
          <p className="text-xs text-slate-400 font-light mt-1">Manage store brands and manufacturer logos</p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900">
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h2>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveBrand} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Brand Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ceylon Naturals"
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
                  placeholder="ceylon-naturals"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              {/* Image Upload Component for Logo */}
              <ImageUpload
                label="Brand Logo"
                value={logo}
                onChange={(url) => setLogo(url)}
                folder="brands"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brand description..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-20"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? (editingBrand ? 'Updating...' : 'Creating...') : (editingBrand ? 'Update Brand' : 'Save Brand')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Tag className="w-10 h-10 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No brands found</h3>
          <p className="text-xs text-slate-400 font-light">Create your first brand to organize products.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="flex flex-col gap-3 md:hidden">
            {brands.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {b.logoUrl ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-50 shrink-0">
                      <Image src={b.logoUrl} alt={b.name} fill className="object-contain p-1" unoptimized />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                      {b.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-slate-900 text-sm truncate">{b.name}</span>
                    <span className="text-xs font-mono text-slate-400 truncate">{b.slug}</span>
                    <span className="text-xs text-emerald-600 font-semibold">{b._count?.products || 0} products</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(b)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-100 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Brand Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {b.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-slate-200 bg-slate-50">
                          <Image src={b.logoUrl} alt={b.name} fill className="object-contain p-1" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {b.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{b.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{b.slug}</td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{b._count?.products || 0} products</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit brand"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(b.id, b.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete brand"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
