'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatRupiah, formatDate } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function AdminReportsPage() {
  const { orders, products, categories } = useApp();
  const [period, setPeriod] = useState<string>('all');

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
            Rekapitulasi omzet penjualan produk mahasiswa melalui rekening merchant resmi Midtrans
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Laporan (CSV / Excel)</span>
        </button>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Total Omzet Kotor (Gross)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatRupiah(totalGrossRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Diterima via Merchant Midtrans
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Pendapatan Bersih Mahasiswa
          </span>
          <div className="text-2xl sm:text-3xl font-black text-polsri-700">
            {formatRupiah(netProductRevenue)}
          </div>
          <span className="text-[11px] text-polsri-600 font-semibold block">
            Siap disalurkan ke tim wirausaha muda
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Alokasi Ongkos Kirim / Logistik
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {formatRupiah(totalShippingFees)}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Ekspedisi JNE & Kurir Kampus
          </span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Distribusi Omzet Berdasarkan Kategori Produk
        </h3>

        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Kategori Produk Mahasiswa</th>
                <th className="p-4 text-center">Unit Terjual</th>
                <th className="p-4 text-right">Kontribusi Omzet</th>
                <th className="p-4 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(categoryRevenue).map(([id, data]) => {
                const percentage =
                  netProductRevenue > 0
                    ? ((data.total / netProductRevenue) * 100).toFixed(1)
                    : '0';

                return (
                  <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{data.name}</td>
                    <td className="p-4 text-center font-medium text-slate-600">
                      {data.count} pcs
                    </td>
                    <td className="p-4 text-right font-black text-polsri-700">
                      {formatRupiah(data.total)}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit & Compliance Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kepatuhan Transaksi & Audit PMW Polsri</span>
        </div>
        <p className="leading-relaxed">
          Seluruh rekaman transaksi terenkripsi dan dapat diaudit secara berkala oleh UPT Inkubator Kewirausahaan dan Satuan Pengawas Internal (SPI) Politeknik Negeri Sriwijaya guna menjamin transparansi penyaluran omzet ke mahasiswa binaan.
        </p>
      </div>
    </div>
  );
}

