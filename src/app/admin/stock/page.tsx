'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Save,
  RotateCcw,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AdminStockPage() {
  const { refreshData } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error('[AdminStock] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getStockValue = (productId: string, originalStock: number) => {
    return stockChanges[productId] !== undefined ? stockChanges[productId] : originalStock;
  };

  const handleAdjust = (productId: string, currentVal: number, delta: number) => {
    const newVal = Math.max(0, currentVal + delta);
    setStockChanges((prev) => ({
      ...prev,
      [productId]: newVal,
    }));
  };

  const handleManualInput = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockChanges((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSaveSingle = async (productId: string) => {
    const newStock = stockChanges[productId];
    if (newStock === undefined) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, stock: newStock }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan stok ke Supabase');

      showToast('Stok produk berhasil diperbarui di Supabase');
      setStockChanges((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      await loadProducts();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(stockChanges).map(([id, stock]) => ({ id, stock }));
    if (updates.length === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan perubahan stok');

      showToast(`${updates.length} produk berhasil diperbarui di database Supabase`);
      setStockChanges({});
      await loadProducts();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jurusan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= 30).length;

  const hasUnsavedChanges = Object.keys(stockChanges).length > 0;

  return (
    <div className="space-y-6">
      {/* Title & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pengelolaan Stok Produk PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Perbarui persediaan inventaris produk mahasiswa langsung di tabel <code className="text-polsri-700 bg-polsri-50 px-1 py-0.5 rounded font-mono">public.products</code> Supabase
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs btn-press"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sinkronkan Supabase</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all btn-press disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan Semua ({Object.keys(stockChanges).length} Produk)</span>
            </button>
          )}
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Unit Stok di Supabase</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {isLoading ? '...' : `${totalStockUnits} pcs`}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Nilai Inventaris</span>
          <div className="text-2xl font-black text-polsri-700 mt-1">
            {isLoading ? '...' : formatRupiah(totalInventoryValue)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Peringatan Stok Menipis</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {isLoading ? '...' : `${lowStockCount} Produk (≤ 30 pcs)`}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama produk atau jurusan mahasiswa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Mahasiswa & Jurusan</th>
                <th className="p-4 text-right">Harga Satuan</th>
                <th className="p-4 text-center">Status Stok</th>
                <th className="p-4 text-center">Atur Jumlah Stok</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-polsri-600 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Memuat stok produk dari Supabase...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan pencarian di Supabase.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentVal = getStockValue(p.id, p.stock);
                  const isModified = stockChanges[p.id] !== undefined;

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
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-400">ID: {p.id.slice(0, 8)}...</span>
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
                          className={`font-bold px-2.5 py-1 rounded-full text-[11px] inline-block ${
                            currentVal <= 10
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : currentVal <= 30
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {currentVal <= 10 ? 'Kritis' : currentVal <= 30 ? 'Menipis' : 'Aman'} ({currentVal} pcs)
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => handleAdjust(p.id, currentVal, -5)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shadow-2xs btn-press"
                            title="Kurang 5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentVal}
                            onChange={(e) => handleManualInput(p.id, e.target.value)}
                            className="w-16 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg py-1 text-xs focus:outline-none focus:ring-1 focus:ring-polsri-500"
                          />

                          <button
                            onClick={() => handleAdjust(p.id, currentVal, 5)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shadow-2xs btn-press"
                            title="Tambah 5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        {isModified ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveSingle(p.id)}
                              disabled={isSaving}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center gap-1 btn-press disabled:opacity-50"
                            >
                              <Save className="w-3 h-3" />
                              <span>Simpan</span>
                            </button>
                            <button
                              onClick={() => {
                                setStockChanges((prev) => {
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                });
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Batal Ubah"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tersimpan</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
