'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Layers, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string;
  colorClasses?: string;
  _count?: { products: number };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setError(null);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = Boolean(editingCategory);
      const url = '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { id: editingCategory?.id, name, slug, description, image }
        : { name, slug, description, image };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} category.`);
        return;
      }

      setShowModal(false);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Store Management</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Categories</h1>
          <p className="text-xs text-slate-400 font-light mt-1">Manage product categories for store classification</p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Health & Wellness"
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
                  placeholder="health-wellness"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                label="Category Banner / Image"
                value={image}
                onChange={(url) => setImage(url)}
                folder="categories"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium h-20"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update Category' : 'Save Category')}
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
      ) : categories.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Layers className="w-10 h-10 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No categories found</h3>
          <p className="text-xs text-slate-400 font-light">Create your first category to start organizing products.</p>
        </div>
      ) : (
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    {cat.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-slate-200 bg-slate-50">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-600 font-semibold">{cat._count?.products || 0} products</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="Edit category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete category"
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
      )}
    </div>
  );
}
