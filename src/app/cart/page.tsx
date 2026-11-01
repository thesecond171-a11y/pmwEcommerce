'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/utils';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-polsri-600">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-polsri-700 font-semibold">Keranjang Belanja</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Keranjang Belanja
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola daftar produk karya mahasiswa yang ingin Anda beli
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-polsri-600 mx-auto flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Keranjang Belanja Anda Kosong</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
              Ayo dukung wirausaha muda Politeknik Negeri Sriwijaya dengan memilih produk inovatif, kuliner, dan kriya terbaik.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-polsri-600 hover:bg-polsri-700 text-white font-bold text-sm shadow-md shadow-polsri-600/30 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
                {cart.map((item) => {
                  const imageSrc =
                    item.product.images && item.product.images.length > 0
                      ? item.product.images[0]
                      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

                  const isStockInsufficient = item.quantity > item.product.stock;

                  return (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center flex-1">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={imageSrc}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-polsri-700 font-semibold mb-1">
                            <UserCheck className="w-3 h-3 text-polsri-600" />
                            <span className="truncate">{item.product.jurusan}</span>
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="text-sm font-bold text-slate-800 hover:text-polsri-600 line-clamp-1 transition-colors"
                          >
                            {item.product.title}
                          </Link>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Harga Satuan: {formatRupiah(item.product.price)}
                          </div>
                          {isStockInsufficient && (
                            <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              Stok tersisa hanya {item.product.stock} pcs
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="px-3 py-1 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-3 py-1 text-slate-700 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-polsri-700">
                            {formatRupiah(item.product.price * item.quantity)}
                          </div>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                          title="Hapus produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Sticky (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Harga ({cartCount} barang)</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim</span>
                    <span className="text-polsri-600 font-medium">Dihitung di checkout</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan Payment Gateway</span>
                    <span className="text-emerald-600 font-semibold">GRATIS</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                    <span className="text-xl font-black text-polsri-700">
                      {formatRupiah(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 px-4 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-polsri-600/30 hover:scale-[1.01] transition-all"
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Transaksi 100% aman diproses melalui <strong>Midtrans Payment Gateway</strong> langsung ke rekening resmi merchant PMW Polsri.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
