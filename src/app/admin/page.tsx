'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
  CreditCard
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, orders, categories } = useApp();

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const paidOrdersCount = orders.filter((o) => o.payment_status === 'paid').length;
  const pendingPaymentCount = orders.filter((o) => o.status === 'pending_payment').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;

  const lowStockProducts = products.filter((p) => p.stock <= 30);
  const activeProductsCount = products.filter((p) => p.is_active).length;

  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Title & Merchant Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ringkasan Penjualan & Statistik PMW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus transaksi, penerimaan dana merchant, dan operasional pengiriman produk mahasiswa
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Rekening Merchant: PMW POLSRI (Aktif)</span>
        </div>
      </div>

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
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidOrdersCount} Transaksi Berhasil</span>
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
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingPaymentCount} Menunggu Pembayaran</span>
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
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeProductsCount}
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>{categories.length} Kategori Mahasiswa</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Peringatan Stok Menipis
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {lowStockProducts.length} Produk
            </div>
            <Link
              href="/admin/stock"
              className="text-[11px] text-polsri-600 hover:underline font-semibold flex items-center gap-1 mt-1"
            >
              <span>Perbarui stok sekarang &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Midtrans Flow & Payment Notice Banner */}
      <div className="bg-gradient-to-r from-polsri-900 to-polsri-800 text-white p-6 rounded-3xl shadow-md border border-polsri-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm tracking-wide uppercase text-amber-300">
              Arsitektur Alur Pembayaran Terpusat
            </span>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Sesuai regulasi unit usaha Polsri, seluruh dana transaksi pembeli langsung masuk ke <strong>satu akun merchant Midtrans resmi milik Admin PMW Polsri</strong>. Penyaluran laba bersih ke mahasiswa binaan dilakukan terjadwal melalui pembukuan kas internal PMW.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md"
          >
            Kelola {processingCount} Pesanan Siap Kirim
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Order Status Distribution + Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Transaksi Terbaru</h3>
              <p className="text-xs text-slate-500">Daftar transaksi pelanggan terakhir</p>
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
                <span className="font-black text-sm text-amber-800">{pendingPaymentCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2 text-polsri-800">
                  <Package className="w-4 h-4 text-polsri-600" />
                  <span className="font-semibold">Perlu Diproses</span>
                </div>
                <span className="font-black text-sm text-polsri-800">{processingCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-800">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Sedang Dikirim</span>
                </div>
                <span className="font-black text-sm text-purple-800">{shippedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Transaksi Selesai</span>
                </div>
                <span className="font-black text-sm text-emerald-800">
                  {orders.filter((o) => o.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Aksi Cepat Admin
            </h4>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Tambah Produk Baru</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin/stock"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-polsri-50 text-slate-700 hover:text-polsri-700 rounded-xl border border-slate-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Periksa & Edit Stok Produk</span>
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
