'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRupiah, formatDate, getOrderStatusInfo, getPaymentStatusInfo } from '@/lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  Database,
  RefreshCw,
  ExternalLink,
  Inbox
} from 'lucide-react';

interface StatsData {
  totalRevenue: number;
  totalOrdersCount: number;
  paidOrdersCount: number;
  pendingPaymentCount: number;
  processingCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;
  totalProductsCount: number;
  activeProductsCount: number;
  lowStockCount: number;
  totalCategoriesCount: number;
  totalCustomersCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLiveStats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Gagal mengambil data dari Supabase');
      }
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setRecentOrders(json.recentOrders || []);
        setLowStockProducts(json.lowStockProducts || []);
        setLastRefreshed(new Date().toLocaleTimeString('id-ID'));
      } else {
        throw new Error(json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Fetch error:', err);
      setErrorMsg(err.message || 'Gagal terhubung ke database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title & Merchant Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ringkasan Penjualan & Statistik PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data live terhubung murni langsung ke database Supabase (tanpa LocalStorage)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Rekening Merchant: PMW POLSRI (Aktif)</span>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <div className="p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs bg-emerald-50/80 border-emerald-200 text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Database Supabase Live & Terkoneksi Murni</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-200/80 text-emerald-800">
                Ref: vguhuwlrjkncgetignqd
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              Semua perhitungan penjualan, inventaris, dan pelanggan diambil secara real-time dari PostgreSQL Supabase.
              {lastRefreshed && <span className="ml-1 text-slate-500 font-medium">(Terakhir disinkronkan: {lastRefreshed})</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchLiveStats}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs disabled:opacity-50 btn-press"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menyinkronkan...' : 'Muat Ulang Supabase'}</span>
          </button>
          <a
            href="https://supabase.com/dashboard/project/vguhuwlrjkncgetignqd"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-polsri-600 font-semibold text-white hover:bg-polsri-700 flex items-center gap-1.5 shadow-xs btn-press"
          >
            <span>Buka Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pendapatan Lunas
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-3/4 mb-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatRupiah(stats?.totalRevenue || 0)}
              </div>
            )}
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.paidOrdersCount || 0} Transaksi Lunas di Supabase</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pesanan Masuk
            </span>
            <div className="w-10 h-10 rounded-xl bg-polsri-50 text-polsri-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/2 mb-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalOrdersCount || 0}
              </div>
            )}
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats?.pendingPaymentCount || 0} Menunggu Pembayaran</span>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Produk Terdaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/2 mb-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalProductsCount || 0}
              </div>
            )}
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>{stats?.totalCategoriesCount || 0} Kategori di Supabase</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pelanggan Terdaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/2 mb-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalCustomersCount || 0}
              </div>
            )}
            <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1 mt-1">
              <Link href="/admin/customers" className="hover:underline">
                Kelola profil pelanggan &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Midtrans Flow & Payment Notice Banner */}
      <div className="bg-gradient-to-r from-polsri-900 to-polsri-800 text-white p-6 rounded-3xl shadow-md border border-polsri-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm tracking-wide uppercase text-amber-300">
              Arsitektur Alur Pembayaran Terpusat PMW
            </span>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Sesuai regulasi unit usaha Polsri, seluruh dana transaksi pembeli langsung masuk ke <strong>satu rekening merchant Midtrans resmi milik Pengelola PMW Polsri</strong>. Data transaksi dicatat langsung ke database Supabase secara real-time.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md"
          >
            Kelola {stats?.processingCount || 0} Pesanan Perlu Diproses
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders + Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Transaksi Terbaru di Supabase</h3>
              <p className="text-xs text-slate-500">5 transaksi terakhir yang tercatat di database</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-polsri-600 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-polsri-600 mx-auto" />
                <p className="text-xs text-slate-500">Memuat data transaksi dari Supabase...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi Masuk</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Belum ada pesanan yang dibuat oleh pelanggan di database Supabase. Transaksi baru akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status Pesanan</th>
                    <th className="p-3">Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => {
                    const statusInfo = getOrderStatusInfo(o.status);
                    const payInfo = getPaymentStatusInfo(o.payment_status);

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-polsri-700">
                          <Link href={`/admin/orders`} className="hover:underline">
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{o.customer_name}</span>
                          <span className="text-[10px] text-slate-400">{o.customer_phone}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {formatRupiah(o.total_amount)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${payInfo.color}`}
                          >
                            {payInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Quick Operational Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Status Operasional Pesanan</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">Menunggu Pembayaran</span>
                </div>
                <span className="font-black text-sm text-amber-800">
                  {stats?.pendingPaymentCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 text-polsri-800">
                  <Package className="w-4 h-4 text-polsri-600" />
                  <span className="font-semibold">Perlu Diproses</span>
                </div>
                <span className="font-black text-sm text-polsri-800">
                  {stats?.processingCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-800">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Sedang Dikirim</span>
                </div>
                <span className="font-black text-sm text-purple-800">
                  {stats?.shippedCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Transaksi Selesai</span>
                </div>
                <span className="font-black text-sm text-emerald-800">
                  {stats?.completedCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Aksi Cepat Admin PMW
            </h4>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Kelola & Tambah Produk</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/categories"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Kelola Kategori Produk</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/stock"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Periksa & Edit Stok ({stats?.lowStockCount || 0} menipis)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/reports"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Unduh Laporan Penjualan (CSV)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
