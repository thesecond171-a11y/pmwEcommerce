'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, Product } from '@/types';
import { Layers, Plus, Edit, Trash2, X, AlertCircle, RefreshCw, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { refreshData } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Sparkles');
  const [formImageUrl, setFormImageUrl] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetch('/api/admin/categories', { cache: 'no-store' }),
        fetch('/api/admin/products', { cache: 'no-store' }),
      ]);

      if (catsRes.ok) {
        const catsJson = await catsRes.json();
        setCategories(catsJson.data || []);
      }
      if (prodsRes.ok) {
        const prodsJson = await prodsRes.json();
        setProducts(prodsJson.data || []);
      }
    } catch (err) {
      console.error('[AdminCategories] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setFormName('');
    setFormDescription('');
    setFormIcon('Sparkles');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');
    setIsAddModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || 'Sparkles');
    setFormImageUrl(cat.image_url || '');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          icon: formIcon,
          image_url: formImageUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan kategori');

      showToast('Kategori baru berhasil ditambahkan ke Supabase');
      setIsAddModalOpen(false);
      await loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          name: formName,
          description: formDescription,
          icon: formIcon,
          image_url: formImageUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui kategori');

      showToast('Kategori berhasil diperbarui di Supabase');
      setEditingCategory(null);
      await loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${deletingCategory.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus kategori');

      showToast('Kategori berhasil dihapus dari Supabase');
      setDeletingCategory(null);
      await loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kelola Kategori Produk PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data kategori terhubung murni langsung ke tabel <code className="text-polsri-700 bg-polsri-50 px-1 py-0.5 rounded font-mono">public.categories</code> Supabase
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs btn-press"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkronkan Supabase</span>
          </button>

          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-polsri-600/30 transition-all btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-4">Kategori</th>
              <th className="p-4">Slug URL</th>
              <th className="p-4">Deskripsi</th>
              <th className="p-4 text-center">Jumlah Produk di Supabase</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-polsri-600 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 font-medium">Memuat kategori dari Supabase...</span>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Belum ada kategori yang tersimpan di Supabase.
                </td>
              </tr>
            ) : (
              categories.map((c) => {
                const count = products.filter((p) => p.category_id === c.id).length;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-polsri-50 text-polsri-700 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{c.slug}</td>
                    <td className="p-4 text-slate-600 max-w-sm truncate">{c.description || '-'}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-polsri-700 bg-polsri-50 px-2.5 py-1 rounded-full">
                        {count} Produk
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-polsri-600 hover:bg-polsri-50 transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingCategory ? 'Perbarui Kategori di Supabase' : 'Tambah Kategori Baru ke Supabase'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingCategory ? handleSaveEdit : handleSaveAdd}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kuliner & Minuman Herbal"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan klasifikasi produk..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-polsri-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Supabase...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Kategori?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Yakin ingin menghapus kategori <strong>&quot;{deletingCategory.name}&quot;</strong> dari Supabase?
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
