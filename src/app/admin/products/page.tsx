'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Star,
  ExternalLink,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Upload,
  RefreshCw,
  Database,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminProductsPage() {
  const { refreshData } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(50000);
  const [formStock, setFormStock] = useState(50);
  const [formStudentName, setFormStudentName] = useState('');
  const [formJurusan, setFormJurusan] = useState('D4 Teknik Informatika');
  const [formNim, setFormNim] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch pure data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/admin/products', { cache: 'no-store' }),
        fetch('/api/admin/categories', { cache: 'no-store' }),
      ]);

      if (prodsRes.ok) {
        const prodsJson = await prodsRes.json();
        setProducts(prodsJson.data || []);
      }
      if (catsRes.ok) {
        const catsJson = await catsRes.json();
        setCategories(catsJson.data || []);
      }
    } catch (err) {
      console.error('[AdminProducts] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const openAddModal = () => {
    setFormTitle('');
    setFormCategory(categories[0]?.id || '');
    setFormDescription('');
    setFormPrice(50000);
    setFormStock(50);
    setFormStudentName('Mahasiswa Polsri');
    setFormJurusan('D4 Teknik Informatika');
    setFormNim('062140832099');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setFormIsFeatured(false);
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormCategory(prod.category_id || categories[0]?.id || '');
    setFormDescription(prod.description);
    setFormPrice(prod.price);
    setFormStock(prod.stock);
    setFormStudentName(prod.student_name);
    setFormJurusan(prod.jurusan);
    setFormNim(prod.nim || '');
    setFormImageUrl(prod.images?.[0] || '');
    setFormIsFeatured(prod.is_featured);
    setFormIsActive(prod.is_active);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormImageUrl(data.url);
        showToast('Foto berhasil diunggah ke Supabase Storage');
      } else {
        showToast(data.error || 'Gagal mengunggah foto', 'error');
      }
    } catch (err: any) {
      showToast('Gagal mengunggah foto ke storage', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        category_id: formCategory || null,
        description: formDescription,
        price: Number(formPrice),
        stock: Number(formStock),
        student_name: formStudentName,
        jurusan: formJurusan,
        nim: formNim,
        images: formImageUrl ? [formImageUrl] : [],
        is_featured: formIsFeatured,
        is_active: formIsActive,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan produk ke Supabase');

      showToast('Produk berhasil disimpan ke database Supabase');
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
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingProduct.id,
        title: formTitle,
        category_id: formCategory || null,
        description: formDescription,
        price: Number(formPrice),
        stock: Number(formStock),
        student_name: formStudentName,
        jurusan: formJurusan,
        nim: formNim,
        images: formImageUrl ? [formImageUrl] : [],
        is_featured: formIsFeatured,
        is_active: formIsActive,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui produk di Supabase');

      showToast('Perubahan produk disimpan ke Supabase');
      setEditingProduct(null);
      await loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (prod: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prod.id,
          is_active: !prod.is_active,
        }),
      });
      if (res.ok) {
        showToast(`Produk sekarang ${!prod.is_active ? 'Aktif' : 'Nonaktif'}`);
        await loadData();
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus produk');

      showToast('Produk berhasil dihapus dari database Supabase');
      setDeletingProduct(null);
      await loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchSearch =
      searchTerm.trim() === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jurusan.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kelola Produk Mahasiswa PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data terhubung murni langsung ke tabel <code className="text-polsri-700 bg-polsri-50 px-1 py-0.5 rounded font-mono">public.products</code> Supabase
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs btn-press"
            title="Sinkronkan dengan database Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkronkan Supabase</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-polsri-600/30 transition-all hover-lift btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan judul, nama mahasiswa, atau jurusan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-polsri-500"
          >
            <option value="all">Semua Kategori ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Produk & Inovasi</th>
                <th className="p-4">Mahasiswa Pembuat</th>
                <th className="p-4 text-right">Harga</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4 text-center">Terjual</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-polsri-600 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Memuat data produk dari Supabase...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan kriteria pencarian di Supabase.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const categoryName =
                    p.category?.name ||
                    categories.find((c) => c.id === p.category_id)?.name ||
                    'Karya Mahasiswa';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.images?.[0] ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-polsri-600 font-medium">
                              {categoryName}
                            </span>
                            {p.is_featured && (
                              <span className="inline-block ml-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                Unggulan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{p.student_name}</span>
                        <span className="text-[11px] text-slate-500">{p.jurusan}</span>
                      </td>

                      <td className="p-4 text-right font-bold text-slate-900">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            p.stock <= 10
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : p.stock <= 30
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {p.stock} pcs
                        </span>
                      </td>

                      <td className="p-4 text-center font-medium text-slate-600">
                        {p.sold_count}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all btn-press ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-polsri-600 hover:bg-polsri-50 transition-colors btn-press"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors btn-press"
                            title="Hapus Produk"
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
      </div>

      {/* Modal Add Product */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tambah Produk Baru</h3>
                  <p className="text-xs text-slate-500">
                    Produk akan disimpan langsung ke tabel Supabase
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama / Judul Produk *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Pempek Palembang Frozen Vakum"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Harga (IDR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Stok Awal (pcs) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mahasiswa Pembuat</label>
                    <input
                      type="text"
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      placeholder="Nama Ketua / Tim"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">NIM Mahasiswa</label>
                    <input
                      type="text"
                      value={formNim}
                      onChange={(e) => setFormNim(e.target.value)}
                      placeholder="0621..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jurusan / Program Studi</label>
                  <input
                    type="text"
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value)}
                    placeholder="Contoh: D4 Teknik Informatika"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                {/* Upload Foto to Supabase Storage */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Foto Produk (Supabase Storage)</span>
                    {isUploadingImage && (
                      <span className="text-[11px] text-polsri-600 flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Mengunggah...
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer flex items-center gap-2 shrink-0">
                      <Upload className="w-4 h-4 text-polsri-600" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Atau tempel URL gambar..."
                      className="flex-1 p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500 text-xs"
                    />
                  </div>
                  {formImageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-300"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> URL Foto Aktif
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deskripsi Lengkap *</label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan keunikan produk, bahan, cara pakai, dan nilai inovasinya..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Tampilkan sebagai Produk Unggulan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Aktif (Dapat Dipesan)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                      <span>Simpan Produk</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Product */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Produk PMW</h3>
                  <p className="text-xs text-slate-500">ID: {editingProduct.id}</p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama / Judul Produk *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Harga (IDR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Stok (pcs) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mahasiswa Pembuat</label>
                    <input
                      type="text"
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">NIM</label>
                    <input
                      type="text"
                      value={formNim}
                      onChange={(e) => setFormNim(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jurusan / Program Studi</label>
                  <input
                    type="text"
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                {/* Upload Foto to Supabase Storage */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Foto Produk (Supabase Storage)</span>
                    {isUploadingImage && (
                      <span className="text-[11px] text-polsri-600 flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Mengunggah...
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer flex items-center gap-2 shrink-0">
                      <Upload className="w-4 h-4 text-polsri-600" />
                      <span>Ganti Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Atau tempel URL gambar..."
                      className="flex-1 p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500 text-xs"
                    />
                  </div>
                  {formImageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-300"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Foto Siap Digunakan
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deskripsi Lengkap *</label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-polsri-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Produk Unggulan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Aktif</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
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
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirmation */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Produk dari Supabase?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus <strong>&quot;{deletingProduct.title}&quot;</strong> secara permanen dari database Supabase?
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingProduct(null)}
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
                  <span>Hapus Permanen</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
