'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
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
  Sparkles
} from 'lucide-react';

export default function AdminStockPage() {
  const { products, updateStock } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [saveNotice, setSaveNotice] = useState(false);

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

  const handleSaveAll = () => {
    Object.entries(stockChanges).forEach(([id, newStock]) => {
      updateStock(id, newStock);
    });
    setStockChanges({});
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
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
            Perbarui persediaan inventaris produk mahasiswa secara cepat dan pantau stok menipis
          </p>
        </div>

        {hasUnsavedChanges && (
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all animate-bounce"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan Stok</span>
          </button>
        )}
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Stok produk berhasil diperbarui ke database!</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Unit Stok Tersedia</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalStockUnits} pcs</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Nilai Inventaris</span>
          <div className="text-2xl font-black text-polsri-700 mt-1">{formatRupiah(totalInventoryValue)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Peringatan Stok Menipis</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{lowStockCount} Produk (&le; 30 pcs)</div>
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
              {filteredProducts.map((p) => {
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
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900 block truncate max-w-xs">
                          {p.title}
                        </span>
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
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          currentVal <= 10
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : currentVal <= 30
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {currentVal <= 10
                          ? 'Kritis / Habis'
                          : currentVal <= 30
                          ? 'Perlu Restock'
                          : 'Aman'}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleAdjust(p.id, currentVal, -5)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                          title="-5 pcs"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjust(p.id, currentVal, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                          title="-1 pcs"
                        >
                          -1
                        </button>

                        <input
                          type="number"
                          min={0}
                          value={currentVal}
                          onChange={(e) => handleManualInput(p.id, e.target.value)}
                          className="w-16 text-center py-1 bg-white border border-slate-300 rounded font-bold text-xs focus:ring-1 focus:ring-polsri-500 outline-none"
                        />

                        <button
                          onClick={() => handleAdjust(p.id, currentVal, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                          title="+1 pcs"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjust(p.id, currentVal, 5)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                          title="+5 pcs"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {isModified ? (
                        <button
                          onClick={() => {
                            updateStock(p.id, currentVal);
                            const updated = { ...stockChanges };
                            delete updated[p.id];
                            setStockChanges(updated);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm transition-all"
                        >
                          Simpan
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Tersimpan</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

