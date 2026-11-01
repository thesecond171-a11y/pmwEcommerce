'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatDate, getOrderStatusInfo, getPaymentStatusInfo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  X,
  CreditCard,
  MapPin,
  FileText
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, updatePaymentStatus } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingStatusOrder, setEditingStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');

  const openStatusModal = (order: Order) => {
    setEditingStatusOrder(order);
    setNewStatus(order.status);
    setNewTrackingNumber(order.tracking_number || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatusOrder) return;

    updateOrderStatus(editingStatusOrder.id, newStatus, newTrackingNumber);

    if (newStatus === 'paid' || newStatus === 'completed' || newStatus === 'shipped') {
      if (editingStatusOrder.payment_status === 'unpaid') {
        updatePaymentStatus(editingStatusOrder.id, 'paid', 'Midtrans / Verifikasi Admin');
      }
    }

    setEditingStatusOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch =
      searchTerm.trim() === '' ||
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.includes(searchTerm);
    return matchTab && matchSearch;
  });

  const tabs = [
    { id: 'all', label: 'Semua Pesanan' },
    { id: 'pending_payment', label: 'Menunggu Bayar' },
    { id: 'paid', label: 'Sudah Dibayar' },
    { id: 'processing', label: 'Perlu Diproses' },
    { id: 'shipped', label: 'Sedang Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Dibatalkan' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Kelola Pesanan & Pengiriman
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Proses pesanan pelanggan, input resi ekspedisi / pickup kampus, dan pantau status Midtrans
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const count =
            tab.id === 'all' ? orders.length : orders.filter((o) => o.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 btn-press ${
                activeTab === tab.id
                  ? 'bg-polsri-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan No. Pesanan (POLSRI-...), Nama Pelanggan, atau No HP..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Metode Pengiriman</th>
                <th className="p-4 text-right">Total Tagihan</th>
                <th className="p-4 text-center">Status Pembayaran</th>
                <th className="p-4 text-center">Status Pesanan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada pesanan yang sesuai dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const statusInfo = getOrderStatusInfo(o.status);
                  const payInfo = getPaymentStatusInfo(o.payment_status);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-polsri-700">{o.order_number}</td>

                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatDate(o.created_at)}
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{o.customer_name}</span>
                        <span className="text-[11px] text-slate-400">{o.customer_phone}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-700 block truncate max-w-[150px]">
                          {o.shipping_method}
                        </span>
                        {o.tracking_number && (
                          <span className="text-[10px] font-mono font-bold text-polsri-600">
                            Resi: {o.tracking_number}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right font-bold text-slate-900">
                        {formatRupiah(o.total_amount)}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${payInfo.color}`}
                        >
                          {payInfo.label}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingOrder(o)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-polsri-600 hover:bg-polsri-50 transition-colors btn-press"
                            title="Lihat Rincian Pesanan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openStatusModal(o)}
                            className="px-2.5 py-1 bg-polsri-50 text-polsri-700 hover:bg-polsri-600 hover:text-white rounded-lg font-bold text-[11px] border border-polsri-200 transition-colors btn-press"
                          >
                            Update Status
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

      {/* Update Status Modal with Motion */}
      <AnimatePresence>
        {editingStatusOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">
                  Update Status Pesanan #{editingStatusOrder.order_number}
                </h3>
                <button
                  onClick={() => setEditingStatusOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Pilih Status Pesanan Baru *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-polsri-500 outline-none bg-white"
                  >
                    <option value="pending_payment">Menunggu Pembayaran</option>
                    <option value="paid">Sudah Dibayar (Midtrans)</option>
                    <option value="processing">Sedang Diproses Pengelola</option>
                    <option value="shipped">Sedang Dikirim / Siap Diambil</option>
                    <option value="completed">Pesanan Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Nomor Resi Pengiriman / ID Pengambilan Kampus
                  </label>
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNE-883719002 / PLG-KAMPUS-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-polsri-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Nomor ini akan langsung terlihat oleh pelanggan pada halaman riwayat pesanannya.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStatusOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 btn-press"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-polsri-600 hover:bg-polsri-700 text-white font-bold shadow-md shadow-polsri-600/30 btn-press"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail View Modal with Motion */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Rincian Transaksi #{viewingOrder.order_number}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dibuat pada {formatDate(viewingOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-polsri-600" />
                  Data Pemesan & Alamat
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Nama Penerima:</span>
                    <span className="font-semibold text-slate-800">{viewingOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kontak WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{viewingOrder.customer_phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Alamat Tujuan:</span>
                    <span className="text-slate-800">{viewingOrder.shipping_address}, {viewingOrder.shipping_city}</span>
                  </div>
                  {viewingOrder.notes && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Catatan Pembeli:</span>
                      <span className="text-amber-800 italic">&ldquo;{viewingOrder.notes}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Produk yang Dipesan
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">Produk</th>
                        <th className="p-3 text-center">Jumlah</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-semibold text-slate-800">
                            {item.product_title}
                          </td>
                          <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total and Payment info */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block">Metode Pembayaran:</span>
                  <span className="font-bold text-slate-800">
                    {viewingOrder.payment_method || 'Midtrans Snap'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Total Tagihan:</span>
                  <span className="text-lg font-black text-polsri-700">
                    {formatRupiah(viewingOrder.total_amount)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
