'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadProductImageToSupabase } from '@/lib/services/products';
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
  Upload
} from 'lucide-react';

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
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

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      title: formTitle,
      category_id: formCategory,
      description: formDescription,
      price: Number(formPrice),
      stock: Number(formStock),
      student_name: formStudentName,
      jurusan: formJurusan,
      nim: formNim,
      images: [formImageUrl],
      is_featured: formIsFeatured,
      is_active: formIsActive,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      title: formTitle,
      category_id: formCategory,
      description: formDescription,
      price: Number(formPrice),
      stock: Number(formStock),
      student_name: formStudentName,
      jurusan: formJurusan,
      nim: formNim,
      images: [formImageUrl],
      is_featured: formIsFeatured,
      is_active: formIsActive,
    });
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
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
            Kelola Produk Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tambah, perbarui data produk wirausaha, stok, harga, serta kurasi produk unggulan
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-polsri-600/30 transition-all self-start sm:self-auto hover-lift btn-press"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const categoryName =
                    categories.find((c) => c.id === p.category_id)?.name || 'Karya Mahasiswa';

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
                          onClick={() => updateProduct(p.id, { is_active: !p.is_active })}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all btn-press ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
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

      {/* Add / Edit Product Modal with Motion */}
      <AnimatePresence>
        {(isAddModalOpen || editingProduct) && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {editingProduct ? 'Perbarui Data Produk Mahasiswa' : 'Tambah Produk Kewirausahaan Baru'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={editingProduct ? handleSaveEdit : handleSaveAdd}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul / Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Pempek Crispy Tenggiri Frozen Pack"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kategori Produk *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Harga (Rp) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stok Awal *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Mahasiswa Pembuat *</label>
                    <input
                      type="text"
                      required
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      placeholder="M. Rizky Pratama"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jurusan / Prodi Polsri *</label>
                    <input
                      type="text"
                      required
                      value={formJurusan}
                      onChange={(e) => setFormJurusan(e.target.value)}
                      placeholder="D4 Teknik Kimia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 text-xs sm:text-sm">Foto Produk *</label>
                    <label className="text-[11px] font-semibold text-polsri-600 hover:text-polsri-700 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingImage ? 'Mengupload ke Supabase...' : 'Upload dari Perangkat'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingImage(true);
                          try {
                            const url = await uploadProductImageToSupabase(file);
                            if (url) setFormImageUrl(url);
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    required
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... atau klik 'Upload dari Perangkat' di atas"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                  />
                  {formImageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <span className="text-[11px] text-slate-400 truncate max-w-sm">{formImageUrl}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Lengkap Produk *</label>
                  <textarea
                    rows={4}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan keunggulan produk inovasi karya mahasiswa..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Tandai Sebagai Produk Unggulan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-polsri-600 focus:ring-polsri-500"
                    />
                    <span>Tampilkan di Toko (Aktif)</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 btn-press"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-polsri-600 hover:bg-polsri-700 text-white font-bold shadow-md shadow-polsri-600/30 hover-lift btn-press"
                  >
                    {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal with Motion */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Hapus Produk Ini?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus <strong>&ldquo;{deletingProduct.title}&rdquo;</strong> dari katalog?
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 btn-press"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 btn-press"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
