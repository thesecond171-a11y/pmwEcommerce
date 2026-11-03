'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Truck,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Clock
} from 'lucide-react';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  fee: number;
}

const shippingOptions: ShippingOption[] = [
  {
    id: 'pickup',
    name: 'Ambil di Gerai PMW Polsri (Bukit Besar)',
    description: 'Gratis! Ambil langsung di Gedung PKM Lantai 1 Polsri.',
    fee: 0,
  },
  {
    id: 'sameday',
    name: 'Kurir Lokal Kampus / Palembang Area',
    description: 'Pengiriman kurir kilat tiba di hari yang sama.',
    fee: 10000,
  },
  {
    id: 'jne',
    name: 'Ekspedisi JNE / J&T Regular',
    description: 'Pengiriman aman dengan nomor resi ke seluruh Indonesia (2-3 hari).',
    fee: 18000,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, user, createOrder } = useApp();
  const validCart = cart.filter((item) => item && item.product && item.product.id);

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Palembang');
  const [shippingPostalCode, setShippingPostalCode] = useState(user?.postal_code || '');
  const [notes, setNotes] = useState('');

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(shippingOptions[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback simulator modal if Snap iframe doesn't open in sandbox
  const [showSimulatedSnap, setShowSimulatedSnap] = useState(false);
  const [snapOrderId, setSnapOrderId] = useState('');
  const [selectedSimulatedMethod, setSelectedSimulatedMethod] = useState('qris');

  React.useEffect(() => {
    if (user) {
      if (user.full_name) setCustomerName(user.full_name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.address) setShippingAddress(user.address);
      if (user.city) setShippingCity(user.city);
      if (user.postal_code) setShippingPostalCode(user.postal_code);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 flex items-center justify-center text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5 w-full">
            <div className="w-16 h-16 rounded-2xl bg-polsri-50 text-polsri-600 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Masuk untuk Melanjutkan Checkout</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Silakan masuk ke akun pelanggan Anda agar pesanan dan alamat pengiriman dapat tercatat dengan aman.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-polsri-600/20 btn-press"
              >
                <span>Masuk Sekarang</span>
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="w-full py-2.5 text-xs text-slate-600 hover:text-polsri-600 font-semibold block"
              >
                Belum punya akun? Daftar
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const grandTotal = cartTotal + selectedShipping.fee;

  // Trigger Confetti effect on payment success
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setErrorMessage('');

    const tempOrderId = `POLSRI-${Date.now().toString().slice(-8)}`;
    setSnapOrderId(tempOrderId);

    try {
      // 1. Request Snap Token from backend API
      const res = await fetch('/api/payment/create-snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tempOrderId,
          grossAmount: grandTotal,
          customerDetails: {
            first_name: customerName,
            email: customerEmail,
            phone: customerPhone,
            billing_address: {
              first_name: customerName,
              email: customerEmail,
              phone: customerPhone,
              address: shippingAddress,
              city: shippingCity,
              postal_code: shippingPostalCode,
            },
          },
          itemDetails: validCart.map((item) => ({
            id: item.product_id,
            price: item.product?.price || 0,
            quantity: item.quantity,
            name: item.product?.title || 'Produk Polsri',
          })),
        }),
      });

      const data = await res.json();

      // 2. Open Midtrans Snap popup if window.snap is available
      if (typeof window !== 'undefined' && window.snap && data.token && !data.isMock) {
        window.snap.pay(data.token, {
          onSuccess: (result: any) => {
            const finalOrder = createOrder({
              user_id: user?.id,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              shipping_address: shippingAddress,
              shipping_city: shippingCity,
              shipping_postal_code: shippingPostalCode,
              shipping_method: selectedShipping.name,
              shipping_fee: selectedShipping.fee,
              total_amount: grandTotal,
              status: 'paid',
              payment_status: 'paid',
              payment_method: result.payment_type || 'Midtrans Snap',
              snap_token: data.token,
              notes,
              items: validCart.map((item) => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                order_id: '',
                product_id: item.product_id,
                product_title: item.product?.title || 'Produk Polsri',
                product_image: item.product?.images?.[0],
                price: item.product?.price || 0,
                quantity: item.quantity,
                subtotal: (item.product?.price || 0) * item.quantity,
              })),
            });

            triggerConfetti();
            router.push(`/orders/${finalOrder.id}?payment=success`);
          },
          onPending: (result: any) => {
            const finalOrder = createOrder({
              user_id: user?.id,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              shipping_address: shippingAddress,
              shipping_city: shippingCity,
              shipping_postal_code: shippingPostalCode,
              shipping_method: selectedShipping.name,
              shipping_fee: selectedShipping.fee,
              total_amount: grandTotal,
              status: 'pending_payment',
              payment_status: 'unpaid',
              payment_method: result.payment_type || 'Midtrans Snap',
              snap_token: data.token,
              notes,
              items: validCart.map((item) => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                order_id: '',
                product_id: item.product_id,
                product_title: item.product?.title || 'Produk Polsri',
                product_image: item.product?.images?.[0],
                price: item.product?.price || 0,
                quantity: item.quantity,
                subtotal: (item.product?.price || 0) * item.quantity,
              })),
            });

            router.push(`/orders/${finalOrder.id}?payment=pending`);
          },
          onError: (err: any) => {
            setErrorMessage('Pembayaran gagal atau dibatalkan.');
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      } else {
        // Fallback: Open Midtrans interactive simulation modal
        setShowSimulatedSnap(true);
      }
    } catch (err) {
      console.error(err);
      // Even if network fails, show simulation modal for demonstration
      setShowSimulatedSnap(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteSimulatedPayment = (isSuccessful: boolean = true) => {
    const methodNames: Record<string, string> = {
      qris: 'QRIS (Gopay/ShopeePay/BCA)',
      bca_va: 'BCA Virtual Account',
      mandiri_va: 'Mandiri Bill Payment',
      bni_va: 'BNI Virtual Account',
    };

    const finalOrder = createOrder({
      user_id: user?.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_postal_code: shippingPostalCode,
      shipping_method: selectedShipping.name,
      shipping_fee: selectedShipping.fee,
      total_amount: grandTotal,
      status: isSuccessful ? 'paid' : 'pending_payment',
      payment_status: isSuccessful ? 'paid' : 'unpaid',
      payment_method: methodNames[selectedSimulatedMethod] || 'Midtrans Snap Simulator',
      snap_token: `mock-snap-${Date.now()}`,
      notes,
      items: cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        order_id: '',
        product_id: item.product_id,
        product_title: item.product.title,
        product_image: item.product.images?.[0],
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      })),
    });

    setShowSimulatedSnap(false);
    if (isSuccessful) {
      triggerConfetti();
      router.push(`/orders/${finalOrder.id}?payment=success`);
    } else {
      router.push(`/orders/${finalOrder.id}?payment=pending`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang Belanja Anda Kosong</h2>
          <p className="text-sm text-slate-500 mb-6">
            Silakan pilih produk terlebih dahulu sebelum melakukan checkout.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-polsri-600 text-white rounded-xl text-sm font-semibold hover:bg-polsri-700 transition-colors shadow-sm"
          >
            Mulai Belanja
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/cart" className="hover:text-polsri-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Keranjang
            </Link>
            <span>/</span>
            <span className="text-polsri-700 font-semibold">Checkout & Pembayaran</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Checkout Pesanan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lengkapi alamat pengiriman dan lakukan pembayaran resmi melalui Midtrans Snap
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form: Delivery & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Customer Information Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-polsri-600" />
                  1. Data Penerima & Alamat Pengiriman
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap Penerima *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                      placeholder="Nama mahasiswa / pemesan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                      placeholder="0812xxxxxxxx"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Konfirmasi Transaksi *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                      placeholder="nama@student.polsri.ac.id"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Alamat Lengkap Pengiriman / Lokasi Kampus *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                      placeholder="Contoh: Jl. Srijaya Negara, Bukit Besar, Asrama Polsri / Ruang Kelas / Alamat Rumah Lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kota / Kabupaten *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catatan Tambahan untuk Penjual (Opsional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Titip di pos satpam / Jangan terlalu pedas untuk pempek"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method Selection */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-polsri-600" />
                  2. Metode Pengiriman
                </h2>

                <div className="space-y-3">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover-lift-sm ${
                        selectedShipping.id === opt.id
                          ? 'border-polsri-600 bg-polsri-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="mt-1 text-polsri-600 focus:ring-polsri-500"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {opt.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-polsri-700 whitespace-nowrap">
                        {opt.fee === 0 ? 'GRATIS' : formatRupiah(opt.fee)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Pay Button (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Ringkasan Pesanan ({validCart.length} Jenis Produk)
                </h3>

                {/* Item Previews */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {validCart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={item.product?.title || 'Produk'}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{item.product?.title || 'Produk Polsri'}</p>
                        <p className="text-slate-400">
                          {item.quantity} x {formatRupiah(item.product?.price || 0)}
                        </p>
                      </div>
                      <div className="font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah((item.product?.price || 0) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold">{formatRupiah(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim ({selectedShipping.name.split('(')[0]})</span>
                    <span className="font-semibold">
                      {selectedShipping.fee === 0 ? 'GRATIS' : formatRupiah(selectedShipping.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan Payment Gateway</span>
                    <span className="text-emerald-600 font-bold">Rp 0 (Ditanggung PMW)</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
                    <span className="text-2xl font-black text-polsri-700">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Midtrans Snap Pay Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-polsri-700 to-polsri-600 hover:from-polsri-800 hover:to-polsri-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-polsri-600/30 hover-lift disabled:opacity-70"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" /> Menghubungkan Midtrans...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Bayar Sekarang (Midtrans Snap)</span>
                    </>
                  )}
                </motion.button>

                {/* Merchant Guarantee Info */}
                <div className="p-3.5 rounded-xl bg-polsri-50/70 border border-polsri-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-polsri-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-polsri-600" />
                    Alur Rekening Merchant Terpusat
                  </div>
                  <p>
                    Seluruh dana transaksi masuk secara resmi dan aman ke rekening merchant PMW Politeknik Negeri Sriwijaya via Midtrans.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Interactive Midtrans Payment Simulator Modal with Motion */}
          <AnimatePresence>
            {showSimulatedSnap && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5"
                >
                  {/* Midtrans Snap Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        M
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          Midtrans Snap Payment Gateway
                        </h3>
                        <p className="text-[10px] text-slate-500">Merchant: PMW Politeknik Negeri Sriwijaya</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Mode Sandbox / Simulasi
                    </span>
                  </div>

                  {/* Order Amount */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-500 block">Total Tagihan:</span>
                      <span className="text-xl font-black text-polsri-700">
                        {formatRupiah(grandTotal)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Order ID:</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{snapOrderId}</span>
                    </div>
                  </div>

                  {/* Payment Methods Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Pilih Saluran Pembayaran:
                    </label>
                    <div className="space-y-2">
                      <label
                        onClick={() => setSelectedSimulatedMethod('qris')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover-lift-sm ${
                          selectedSimulatedMethod === 'qris'
                            ? 'border-polsri-600 bg-polsri-50/60'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">QRIS (Semua E-Wallet)</div>
                            <div className="text-[10px] text-slate-500">GoPay, OVO, ShopeePay, DANA, BCA Mobile</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">Instan</span>
                      </label>

                      <label
                        onClick={() => setSelectedSimulatedMethod('bca_va')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover-lift-sm ${
                          selectedSimulatedMethod === 'bca_va'
                            ? 'border-polsri-600 bg-polsri-50/60'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">BCA Virtual Account</div>
                            <div className="text-[10px] text-slate-500">VA: 8802919283749102</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600">Otomatis</span>
                      </label>

                      <label
                        onClick={() => setSelectedSimulatedMethod('mandiri_va')}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover-lift-sm ${
                          selectedSimulatedMethod === 'mandiri_va'
                            ? 'border-polsri-600 bg-polsri-50/60'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Mandiri Bill Payment</div>
                            <div className="text-[10px] text-slate-500">Perusahaan: 70012 (PMW POLSRI)</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-600">Otomatis</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteSimulatedPayment(true)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 btn-press"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Simulasikan Pembayaran Berhasil (Status: LUNAS)
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteSimulatedPayment(false)}
                        className="w-1/2 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition-colors btn-press"
                      >
                        Simulasikan Menunggu Bayar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSimulatedSnap(false)}
                        className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition-colors btn-press"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
