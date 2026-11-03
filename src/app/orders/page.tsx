'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { formatRupiah, formatDate, getOrderStatusInfo, getPaymentStatusInfo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const { orders, user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 flex items-center justify-center text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5 w-full">
            <div className="w-16 h-16 rounded-2xl bg-polsri-50 text-polsri-600 mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Perlu Masuk Akun</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Silakan masuk terlebih dahulu untuk melihat status transaksi dan riwayat pesanan Anda.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-polsri-600/20 btn-press"
              >
                <span>Masuk Sekarang</span>
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 text-xs text-slate-600 hover:text-polsri-600 font-semibold block"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userOrders = orders.filter((o) => {
    return (
      o.user_id === user.id ||
      (user.email && o.customer_email?.toLowerCase() === user.email.toLowerCase())
    );
  });

  const filteredOrders = userOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'Semua Transaksi' },
    { id: 'pending_payment', label: 'Menunggu Bayar' },
    { id: 'paid', label: 'Sudah Dibayar' },
    { id: 'processing', label: 'Diproses' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Dibatalkan' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-polsri-600">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-polsri-700 font-semibold">Riwayat & Status Pesanan</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pesanan Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau status pesanan, pembayaran Midtrans, dan pengiriman produk kewirausahaan Polsri
            </p>
          </div>

          {/* Status Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
            {tabs.map((tab) => {
              const count =
                tab.id === 'all'
                  ? userOrders.length
                  : userOrders.filter((o) => o.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 btn-press ${
                    activeTab === tab.id
                      ? 'bg-polsri-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto shadow-sm my-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Tidak Ada Pesanan pada Kategori Ini
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Belum ada riwayat transaksi dengan status ini. Anda dapat menjelajahi katalog produk mahasiswa kami.
              </p>
              <Link
                href="/products"
                className="px-5 py-2.5 bg-polsri-600 text-white rounded-xl text-xs font-semibold hover:bg-polsri-700 transition-colors shadow-sm inline-flex items-center gap-1.5 hover-lift btn-press"
              >
                <ShoppingBag className="w-4 h-4" />
                Buka Katalog Produk
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  const paymentInfo = getPaymentStatusInfo(order.payment_status);

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover-lift hover:border-polsri-200 space-y-4"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-polsri-50 text-polsri-700 flex items-center justify-center font-bold text-xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {order.order_number}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(order.created_at)}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Penerima: {order.customer_name} ({order.shipping_city})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${paymentInfo.color}`}
                          >
                            {paymentInfo.label}
                          </span>

                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={item.id || `item-${idx}`} className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={
                                    item.product_image ||
                                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                                  }
                                  alt={item.product_title || 'Produk'}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-slate-800 truncate">
                                    {item.product_title || 'Produk Polsri'}
                                  </h4>
                                  <p className="text-slate-400 mt-0.5">
                                    {item.quantity || 1} barang x {formatRupiah(item.price || 0)}
                                  </p>
                                </div>
                              </div>
                              <div className="font-bold text-slate-800 whitespace-nowrap">
                                {formatRupiah(item.subtotal || ((item.price || 0) * (item.quantity || 1)))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic py-1">
                            Detail rincian produk tidak tersedia.
                          </div>
                        )}
                      </div>

                      {/* Tracking info if shipped */}
                      {order.tracking_number && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-polsri-600" />
                            <span>
                              Metode: <strong>{order.shipping_method}</strong>
                            </span>
                          </div>
                          <span className="font-mono font-bold text-polsri-700">
                            Resi / Kode: {order.tracking_number}
                          </span>
                        </div>
                      )}

                      {/* Bottom Summary & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Total Transaksi:</span>
                          <span className="text-base sm:text-lg font-black text-polsri-700">
                            {formatRupiah(order.total_amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="px-4 py-2 bg-polsri-50 hover:bg-polsri-100 text-polsri-700 rounded-xl text-xs font-bold border border-polsri-200 transition-colors flex items-center gap-1.5 hover-lift-sm btn-press"
                          >
                            <span>Lihat Rincian & Invoice</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          {order.status === 'pending_payment' && (
                            <Link
                              href={`/orders/${order.id}?pay=now`}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors hover-lift-sm btn-press"
                            >
                              Bayar Sekarang
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
