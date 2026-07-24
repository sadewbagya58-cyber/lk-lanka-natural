'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Save, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Edit3, X, Check, AlertTriangle, HelpCircle, ArrowLeft, RefreshCcw, GripVertical
} from 'lucide-react';

interface CmsSection {
  id: string;
  heading: string | null;
  content: string;
  sectionType: string;
  sortOrder: number;
  isVisible: boolean;
  metadata: string | null;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
}

interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  metaTitle: string | null;
  status: string;
  sections: CmsSection[];
}

const SECTION_TYPES = [
  { value: 'content', label: 'Content' },
  { value: 'intro', label: 'Introduction' },
  { value: 'hero', label: 'Hero' },
  { value: 'values', label: 'Values / List' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'contact_info', label: 'Contact Info' },
];

const TYPE_BADGE: Record<string, string> = {
  content: 'bg-blue-900/60 text-blue-300',
  intro: 'bg-purple-900/60 text-purple-300',
  hero: 'bg-amber-900/60 text-amber-300',
  values: 'bg-green-900/60 text-green-300',
  cta: 'bg-pink-900/60 text-pink-300',
  contact_info: 'bg-cyan-900/60 text-cyan-300',
};

const PAGE_LABELS: Record<string, string> = {
  about: 'About Us',
  contact: 'Help Center / Contact',
  faq: 'FAQ',
  'shipping-policy': 'Shipping & Delivery',
  'returns-refunds': 'Returns & Refunds',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'track-order': 'Track Order',
};

// ─── FAQ Editor ─────────────────────────────────────────────────────────────

function FaqEditor() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: '', isVisible: true });
  const [addForm, setAddForm] = useState({ question: '', answer: '', category: 'General Shopping' });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/cms/faq');
    const data = await res.json();
    if (data.success) setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setEditForm({ question: item.question, answer: item.answer, category: item.category, isVisible: item.isVisible });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/cms/faq/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (data.success) { flash('ok', 'Saved.'); setEditingId(null); load(); }
    else flash('err', data.error || 'Save failed');
    setSaving(false);
  };

  const toggleVisible = async (item: FaqItem) => {
    await fetch(`/api/admin/cms/faq/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !item.isVisible }),
    });
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    await fetch(`/api/admin/cms/faq/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    flash('ok', 'Deleted.');
    load();
    setSaving(false);
  };

  const move = async (id: string, direction: 'up' | 'down') => {
    await fetch(`/api/admin/cms/faq/${id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    load();
  };

  const addItem = async () => {
    if (!addForm.question.trim() || !addForm.answer.trim()) return;
    setSaving(true);
    const res = await fetch('/api/admin/cms/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    if (data.success) { flash('ok', 'Added.'); setShowAdd(false); setAddForm({ question: '', answer: '', category: 'General Shopping' }); load(); }
    else flash('err', data.error || 'Add failed');
    setSaving(false);
  };

  // Group items by category
  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Flash */}
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-700 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm flex-1">Delete this FAQ item permanently?</span>
          <button onClick={confirmDelete} disabled={saving} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg">Delete</button>
          <button onClick={() => setDeleteId(null)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">Cancel</button>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading FAQ items...</div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="rounded-xl bg-gray-800/40 border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 bg-gray-800/80 border-b border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                {cat}
                <span className="text-xs text-gray-400 font-normal ml-auto">{catItems.length} item(s)</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-700/50">
              {catItems.map((item, idx) => (
                <div key={item.id} className={`p-4 ${!item.isVisible ? 'opacity-50' : ''}`}>
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Question</label>
                        <input
                          value={editForm.question}
                          onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Answer</label>
                        <textarea
                          value={editForm.answer}
                          onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))}
                          rows={4}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Category</label>
                        <input
                          value={editForm.category}
                          onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg">
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg">
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <GripVertical size={14} className="text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-1">{item.question}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{item.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => move(item.id, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => move(item.id, 'down')} disabled={idx === catItems.length - 1} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <ChevronDown size={12} />
                        </button>
                        <button onClick={() => toggleVisible(item)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                          {item.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button onClick={() => startEdit(item)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add new FAQ item */}
      {showAdd ? (
        <div className="rounded-xl bg-gray-800/60 border border-violet-700/50 p-5 space-y-3">
          <h4 className="text-sm font-semibold text-white">Add New FAQ Item</h4>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <input
              value={addForm.category}
              onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
              placeholder="e.g. General Shopping"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Question</label>
            <input
              value={addForm.question}
              onChange={e => setAddForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Enter the question..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Answer</label>
            <textarea
              value={addForm.answer}
              onChange={e => setAddForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Enter the answer..."
              rows={4}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addItem} disabled={saving || !addForm.question.trim() || !addForm.answer.trim()} className="flex items-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg">
              <Plus size={14} /> Add Item
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-600 hover:border-violet-500 text-gray-400 hover:text-violet-400 text-sm transition-colors">
          <Plus size={16} /> Add New FAQ Item
        </button>
      )}
    </div>
  );
}

// ─── Main Page Editor ────────────────────────────────────────────────────────

export default function ContentEditor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const isFaq = slug === 'faq';

  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaForm, setMetaForm] = useState({ title: '', subtitle: '', metaTitle: '', status: 'PUBLISHED' });
  const [metaDirty, setMetaDirty] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ heading: '', content: '', sectionType: 'content', metadata: '', isVisible: true });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ heading: '', content: '', sectionType: 'content', metadata: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms/${slug}`);
      const data = await res.json();
      if (data.success) {
        setPage(data.page);
        setMetaForm({
          title: data.page.title || '',
          subtitle: data.page.subtitle || '',
          metaTitle: data.page.metaTitle || '',
          status: data.page.status || 'PUBLISHED',
        });
        setMetaDirty(false);
      }
    } catch {
      flash('err', 'Failed to load page data.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const saveMeta = async () => {
    if (!metaForm.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaForm),
      });
      const data = await res.json();
      if (data.success) { flash('ok', 'Page settings saved.'); setMetaDirty(false); loadPage(); }
      else flash('err', data.error || 'Save failed');
    } catch {
      flash('err', 'Network error');
    }
    setSaving(false);
  };

  const startEdit = (sec: CmsSection) => {
    setEditingId(sec.id);
    setEditForm({
      heading: sec.heading || '',
      content: sec.content,
      sectionType: sec.sectionType,
      metadata: sec.metadata || '',
      isVisible: sec.isVisible,
    });
  };

  const saveSection = async () => {
    if (!editingId || !editForm.content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/cms/sections/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (data.success) { flash('ok', 'Section saved.'); setEditingId(null); loadPage(); }
    else flash('err', data.error || 'Save failed');
    setSaving(false);
  };

  const toggleSectionVisible = async (sec: CmsSection) => {
    await fetch(`/api/admin/cms/sections/${sec.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !sec.isVisible }),
    });
    loadPage();
  };

  const confirmDeleteSection = async () => {
    if (!deleteId) return;
    setSaving(true);
    await fetch(`/api/admin/cms/sections/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    flash('ok', 'Section deleted.');
    loadPage();
    setSaving(false);
  };

  const moveSection = async (id: string, direction: 'up' | 'down') => {
    await fetch(`/api/admin/cms/sections/${id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    loadPage();
  };

  const addSection = async () => {
    if (!addForm.content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/cms/${slug}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    if (data.success) { flash('ok', 'Section added.'); setShowAdd(false); setAddForm({ heading: '', content: '', sectionType: 'content', metadata: '' }); loadPage(); }
    else flash('err', data.error || 'Add failed');
    setSaving(false);
  };

  const sections = page?.sections ?? [];

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
        <ChevronRight size={14} />
        <Link href="/admin/content" className="hover:text-white transition-colors">Content</Link>
        <ChevronRight size={14} />
        <span className="text-white">{PAGE_LABELS[slug] ?? slug}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{PAGE_LABELS[slug] ?? slug}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isFaq ? 'Manage FAQ questions and answers grouped by category.' : 'Edit page settings and content sections.'}
          </p>
        </div>
        <button onClick={loadPage} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all">
          <RefreshCcw size={14} />
        </button>
        <Link
          href={`/${slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-all"
        >
          <Eye size={14} /> Preview
        </Link>
      </div>

      {/* Flash Message */}
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-gray-800/40 border border-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page Metadata Card */}
          <div className="rounded-xl bg-gray-800/40 border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Page Settings</h2>
              {metaDirty && (
                <span className="text-xs text-amber-400">Unsaved changes</span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Page Title *</label>
                  <input
                    value={metaForm.title}
                    onChange={e => { setMetaForm(f => ({ ...f, title: e.target.value })); setMetaDirty(true); }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Meta Title (SEO)</label>
                  <input
                    value={metaForm.metaTitle}
                    onChange={e => { setMetaForm(f => ({ ...f, metaTitle: e.target.value })); setMetaDirty(true); }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                    placeholder="Title | KL Lanka Natural"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Subtitle / Intro</label>
                <textarea
                  value={metaForm.subtitle}
                  onChange={e => { setMetaForm(f => ({ ...f, subtitle: e.target.value })); setMetaDirty(true); }}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-y"
                  placeholder="Page subtitle shown under the main title"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
                  <select
                    value={metaForm.status}
                    onChange={e => { setMetaForm(f => ({ ...f, status: e.target.value })); setMetaDirty(true); }}
                    className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div className="pt-5">
                  <button
                    onClick={saveMeta}
                    disabled={saving || !metaDirty || !metaForm.title.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                  >
                    <Save size={14} /> Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ or Sections */}
          {isFaq ? (
            <div className="rounded-xl bg-gray-800/40 border border-gray-700 overflow-hidden">
              <div className="px-5 py-3 bg-gray-800/80 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-white">FAQ Items</h2>
              </div>
              <div className="p-5">
                <FaqEditor />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-gray-800/40 border border-gray-700 overflow-hidden">
                <div className="px-5 py-3 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Content Sections</h2>
                  <span className="text-xs text-gray-400">{sections.length} section(s)</span>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {sections.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">No sections yet. Add your first section below.</div>
                  )}

                  {/* Delete Confirmation Banner */}
                  {deleteId && (
                    <div className="m-4 p-4 rounded-xl bg-red-900/30 border border-red-700 flex items-center gap-3">
                      <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-sm flex-1">Delete this section permanently?</span>
                      <button onClick={confirmDeleteSection} disabled={saving} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg">Delete</button>
                      <button onClick={() => setDeleteId(null)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">Cancel</button>
                    </div>
                  )}

                  {sections.map((sec, idx) => (
                    <div key={sec.id} className={`${!sec.isVisible ? 'opacity-50' : ''}`}>
                      {editingId === sec.id ? (
                        <div className="p-5 space-y-4 bg-gray-800/60">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">Heading</label>
                              <input
                                value={editForm.heading}
                                onChange={e => setEditForm(f => ({ ...f, heading: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                                placeholder="Section heading (optional)"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">Section Type</label>
                              <select
                                value={editForm.sectionType}
                                onChange={e => setEditForm(f => ({ ...f, sectionType: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                              >
                                {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">Content *</label>
                            <textarea
                              value={editForm.content}
                              onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                              rows={8}
                              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-y font-mono"
                              placeholder="Section content. Separate paragraphs with a blank line."
                            />
                            <p className="text-xs text-gray-500 mt-1">Use blank lines to separate paragraphs.</p>
                          </div>
                          {editForm.sectionType === 'cta' && (
                            <div>
                              <label className="text-xs text-gray-400 mb-1.5 block">Metadata (JSON, for CTA)</label>
                              <input
                                value={editForm.metadata}
                                onChange={e => setEditForm(f => ({ ...f, metadata: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 font-mono"
                                placeholder='{"ctaText":"Shop Now","ctaLink":"/products"}'
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.isVisible}
                                onChange={e => setEditForm(f => ({ ...f, isVisible: e.target.checked }))}
                                className="rounded"
                              />
                              Visible on public page
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={saveSection} disabled={saving || !editForm.content.trim()} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm rounded-lg">
                              <Check size={14} /> Save Section
                            </button>
                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-start gap-3 hover:bg-gray-800/30 transition-colors">
                          <GripVertical size={14} className="text-gray-600 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {sec.heading && <span className="font-medium text-white text-sm">{sec.heading}</span>}
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${TYPE_BADGE[sec.sectionType] ?? 'bg-gray-700 text-gray-300'}`}>
                                {sec.sectionType}
                              </span>
                              {!sec.isVisible && <span className="text-xs text-amber-400 flex items-center gap-1"><EyeOff size={10} /> hidden</span>}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">{sec.content}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => moveSection(sec.id, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                              <ChevronUp size={13} />
                            </button>
                            <button onClick={() => moveSection(sec.id, 'down')} disabled={idx === sections.length - 1} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                              <ChevronDown size={13} />
                            </button>
                            <button onClick={() => toggleSectionVisible(sec)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title={sec.isVisible ? 'Hide section' : 'Show section'}>
                              {sec.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            <button onClick={() => startEdit(sec)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => setDeleteId(sec.id)} className="p-1.5 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Section */}
              {showAdd ? (
                <div className="rounded-xl bg-gray-800/60 border border-violet-700/50 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Add New Section</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Heading</label>
                      <input
                        value={addForm.heading}
                        onChange={e => setAddForm(f => ({ ...f, heading: e.target.value }))}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                        placeholder="Section heading (optional)"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Section Type</label>
                      <select
                        value={addForm.sectionType}
                        onChange={e => setAddForm(f => ({ ...f, sectionType: e.target.value }))}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                      >
                        {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Content *</label>
                    <textarea
                      value={addForm.content}
                      onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))}
                      rows={6}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-y font-mono"
                      placeholder="Section content. Separate paragraphs with a blank line."
                    />
                    <p className="text-xs text-gray-500 mt-1">Use blank lines to separate paragraphs.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={addSection} disabled={saving || !addForm.content.trim()} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg">
                      <Plus size={14} /> Add Section
                    </button>
                    <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-600 hover:border-violet-500 text-gray-400 hover:text-violet-400 text-sm transition-colors">
                  <Plus size={16} /> Add New Section
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
