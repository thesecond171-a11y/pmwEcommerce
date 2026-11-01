'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { formatRupiah, formatDate, getOrderStatusInfo, getPaymentStatusInfo } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  CreditCard,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Building,
  AlertCircle
} from 'lucide-react';

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const paymentQuery = searchParams.get('payment');

  const { getOrderById, updatePaymentStatus } = useApp();
  const order = getOrderById(orderId);

  const [paying, setPaying] = useState(false);

  if (!order) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">
          Nomor transaksi ini tidak terdaftar dalam sistem.
        </p>
        <Link
          href="/orders"
          className="px-6 py-2.5 bg-polsri-600 text-white rounded-xl text-sm font-semibold hover:bg-polsri-700 transition-colors shadow-sm"
        >
          Lihat Semua Pesanan
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.payment_status);

  // Stepper calculations
  const steps = [
    { key: 'pending_payment', title: 'Menunggu Pembayaran' },
    { key: 'paid', title: 'Sudah Dibayar' },
    { key: 'processing', title: 'Diproses Kampus' },
    { key: 'shipped', title: 'Sedang Dikirim' },
    { key: 'completed', title: 'Selesai' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'paid':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleManualPaySimulation = () => {
    setPaying(true);
    setTimeout(() => {
      updatePaymentStatus(order.id, 'paid', 'QRIS Midtrans');
      setPaying(false);
    }, 800);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* Breadcrumb and Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="text-xs font-semibold text-slate-500 hover:text-polsri-600 flex items-center gap-1.5 btn-press"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat Pesanan
        </Link>

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm print:hidden hover-lift-sm"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          Cetak Invoice
        </button>
      </div>

      {/* Success Alert Banner if just paid */}
      {paymentQuery === 'success' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm print:hidden animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Pembayaran Berhasil Diverifikasi Midtrans!</p>
            <p className="text-emerald-700 mt-0.5">
              Terima kasih telah mendukung produk kewirausahaan mahasiswa Politeknik Negeri Sriwijaya. Pesanan Anda kini sedang diteruskan ke pengelola PMW untuk diproses.
            </p>
          </div>
        </div>
      )}

      {/* Main Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-polsri-900 tracking-tight">
                POLSRI <span className="text-polsri-600">STORE</span>
              </span>
              <span className="text-[10px] bg-polsri-100 text-polsri-800 px-2 py-0.5 rounded font-bold">
                OFFICIAL INVOICE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Nomor Pesanan: <strong className="text-slate-800 font-mono">{order.order_number}</strong>
            </p>
            <p className="text-xs text-slate-400">Waktu Transaksi: {formatDate(order.created_at)}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              {statusInfo.label}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${paymentInfo.color}`}>
              Status Dana: {paymentInfo.label}
            </span>
          </div>
        </div>

        {/* Stepper (Only visible if not cancelled) */}
        {order.status !== 'cancelled' && (
          <div className="py-2 print:hidden">
            <div className="grid grid-cols-5 gap-2 relative">
              {steps.map((s, idx) => {
                const isDone = idx <= currentStepIdx;
                return (
                  <div key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-polsri-600 text-white shadow-md shadow-polsri-600/30 ring-4 ring-polsri-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-2 font-medium ${
                        isDone ? 'text-polsri-900 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery & Tracking Details Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
          {/* Recipient info */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-polsri-600" />
              Informasi Penerima & Pengiriman
            </h3>
            <div className="text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800 text-sm">{order.customer_name}</p>
              <p>No. HP: {order.customer_phone}</p>
              <p>Email: {order.customer_email}</p>
              <p className="pt-1 text-slate-700 leading-relaxed">
                Alamat: {order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}
              </p>
              {order.notes && (
                <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                  Catatan: &ldquo;{order.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Shipping method & Midtrans Payment */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-polsri-600" />
              Metode Pengiriman & Pembayaran
            </h3>
            <div className="text-slate-600 space-y-1.5">
              <div>
                <span className="text-slate-400 block">Layanan Pengiriman:</span>
                <span className="font-semibold text-slate-800">{order.shipping_method}</span>
              </div>
              {order.tracking_number && (
                <div>
                  <span className="text-slate-400 block">Nomor Resi / ID Pickup:</span>
                  <span className="font-mono font-bold text-polsri-700 text-sm">
                    {order.tracking_number}
                  </span>
                </div>
              )}
              <div className="pt-1">
                <span className="text-slate-400 block">Metode Pembayaran:</span>
                <span className="font-semibold text-slate-800">
                  {order.payment_method || 'Midtrans Snap Gateway'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Merchant Penerima Dana:</span>
                <span className="font-medium text-polsri-800">
                  Rekening Merchant PMW Politeknik Negeri Sriwijaya
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Daftar Produk yang Dipesan
          </h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5">Produk</th>
                  <th className="p-3.5 text-center">Jumlah</th>
                  <th className="p-3.5 text-right">Harga Satuan</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product_image ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-800">{item.product_title}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="p-3.5 text-right text-slate-600">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="border-t border-slate-100 pt-4 flex flex-col items-end space-y-1.5 text-xs">
          <div className="w-full max-w-xs flex justify-between text-slate-600">
            <span>Subtotal Produk:</span>
            <span className="font-semibold text-slate-800">
              {formatRupiah(order.total_amount - order.shipping_fee)}
            </span>
          </div>
          <div className="w-full max-w-xs flex justify-between text-slate-600">
            <span>Biaya Pengiriman:</span>
            <span className="font-semibold text-slate-800">
              {order.shipping_fee === 0 ? 'GRATIS' : formatRupiah(order.shipping_fee)}
            </span>
          </div>
          <div className="w-full max-w-xs flex justify-between text-slate-600">
            <span>Biaya Layanan Midtrans:</span>
            <span className="text-emerald-600 font-semibold">Rp 0</span>
          </div>

          <div className="w-full max-w-xs border-t border-slate-200 pt-2 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Tagihan:</span>
            <span className="text-xl font-black text-polsri-700">
              {formatRupiah(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Pending Payment Action */}
        {order.status === 'pending_payment' && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div>
              <p className="text-xs font-bold text-amber-900">
                Pesanan ini masih menunggu pembayaran!
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Segera selesaikan pembayaran agar pesanan Anda dapat segera disiapkan oleh mahasiswa.
              </p>
            </div>

            <button
              onClick={handleManualPaySimulation}
              disabled={paying}
              className="px-5 py-2.5 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap btn-press"
            >
              {paying ? 'Memverifikasi...' : 'Bayar Sekarang (Midtrans)'}
            </button>
          </div>
        )}

        {/* Official Stamp Footer */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumen transaksi resmi UPT Kewirausahaan Politeknik Negeri Sriwijaya</span>
          </div>
          <span>Palembang, Sumatera Selatan</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageTransition>
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat rincian pesanan...</div>}>
          <OrderDetailContent />
        </Suspense>
      </PageTransition>
      <Footer />
    </div>
  );
}
