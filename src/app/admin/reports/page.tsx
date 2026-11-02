'use client';

import React, { useState, useEffect } from 'react';
import { Order, Product, Category } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Inbox
} from 'lucide-react';

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordRes, prodRes, catRes] = await Promise.all([
        fetch('/api/admin/orders', { cache: 'no-store' }),
        fetch('/api/admin/products', { cache: 'no-store' }),
        fetch('/api/admin/categories', { cache: 'no-store' }),
      ]);

      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        setOrders(ordJson.data || []);
      }
      if (prodRes.ok) {
        const prodJson = await prodRes.json();
        setProducts(prodJson.data || []);
      }
      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data || []);
      }
    } catch (err) {
      console.error('[AdminReports] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const paidOrders = orders.filter((o) => o.payment_status === 'paid');

  const totalGrossRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const totalShippingFees = paidOrders.reduce((acc, o) => acc + o.shipping_fee, 0);
  const netProductRevenue = totalGrossRevenue - totalShippingFees;

  // Breakdown by category
  const categoryRevenue: Record<string, { name: string; total: number; count: number }> = {};
  categories.forEach((cat) => {
    categoryRevenue[cat.id] = { name: cat.name, total: 0, count: 0 };
  });

  paidOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod && prod.category_id && categoryRevenue[prod.category_id]) {
        categoryRevenue[prod.category_id].total += item.subtotal;
        categoryRevenue[prod.category_id].count += item.quantity;
      }
    });
  });

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = [
      'Nomor Pesanan',
      'Tanggal Transaksi',
      'Nama Pelanggan',
      'Kontak WA',
      'Kota',
      'Metode Pengiriman',
      'Metode Pembayaran',
      'Status Pesanan',
      'Status Pembayaran',
      'Total Transaksi (IDR)',
    ];

    const rows = paidOrders.map((o) => [
      `"${o.order_number}"`,
      `"${formatDate(o.created_at)}"`,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.shipping_city}"`,
      `"${o.shipping_method}"`,
      `"${o.payment_method || 'Midtrans Snap'}"`,
      `"${o.status}"`,
      `"${o.payment_status}"`,
      o.total_amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Keuangan_PMW_POLSRI_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Laporan Transaksi & Pendapatan PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data laporan dihitung langsung dari transaksi live database Supabase
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
            onClick={handleExportCSV}
            disabled={paidOrders.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 btn-press"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV ({paidOrders.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Total Omzet Kotor (Gross)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {isLoading ? '...' : formatRupiah(totalGrossRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Diterima via Merchant Midtrans ({paidOrders.length} Lunas)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Pendapatan Bersih Produk
          </span>
          <div className="text-2xl sm:text-3xl font-black text-polsri-700">
            {isLoading ? '...' : formatRupiah(netProductRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            (Total Omzet dikurangi Ongkir Pengiriman)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Total Ongkos Kirim / Ekspedisi
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {isLoading ? '...' : formatRupiah(totalShippingFees)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Diteruskan ke kurir / logistik kampus
          </span>
        </div>
      </div>

      {/* Distribution by Category */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pendapatan Berdasarkan Kategori</h3>
            <p className="text-xs text-slate-500">Omzet yang disumbangkan oleh masing-masing klaster mahasiswa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryRevenue).map(([id, cat]) => (
            <div key={id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
              <span className="font-bold text-slate-900 block truncate">{cat.name}</span>
              <div className="text-lg font-black text-polsri-700">{formatRupiah(cat.total)}</div>
              <span className="text-[11px] text-slate-500 block">{cat.count} pcs terjual</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Daftar Transaksi Lunas di Supabase</h3>
          <p className="text-xs text-slate-500">Transaksi valid yang masuk ke pembukuan resmi PMW</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Metode Bayar</th>
                <th className="p-4 text-right">Nilai Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-polsri-600" />
                    <span>Memuat laporan dari Supabase...</span>
                  </td>
                </tr>
              ) : paidOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi Lunas</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Semua transaksi berstatus &apos;paid&apos; di database Supabase akan direkapitulasi secara otomatis di halaman ini.
                    </p>
                  </td>
                </tr>
              ) : (
                paidOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono font-bold text-polsri-700">{o.order_number}</td>
                    <td className="p-4 text-slate-500">{formatDate(o.created_at)}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{o.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{o.customer_phone}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {o.payment_method || 'Midtrans Snap'}
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      {formatRupiah(o.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
