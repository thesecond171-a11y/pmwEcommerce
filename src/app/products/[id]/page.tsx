'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  MapPin,
  GraduationCap,
  ArrowLeft,
  Share2,
  Building,
  AlertCircle
} from 'lucide-react';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { products, addToCart } = useApp();

  const product = products.find((p) => p.id === productId || p.slug === productId);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  if (!product) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">
          Produk yang Anda cari mungkin telah dihapus atau tidak tersedia saat ini.
        </p>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-polsri-600 text-white rounded-xl text-sm font-semibold hover:bg-polsri-700 transition-colors shadow-sm"
        >
          Kembali ke Katalog
        </Link>
      </main>
    );
  }

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  ];

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
      {/* Back and Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/products" className="hover:text-polsri-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs">{product.title}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-card">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.title}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Stok Produk Habis
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 hover-lift-sm ${
                    selectedImage === idx
                      ? 'border-polsri-600 ring-2 ring-polsri-300'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verified Student Entrepreneur Card */}
          <div className="bg-blue-50/70 border border-polsri-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-polsri-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-polsri-900">
                <span>Wirausaha Muda Polsri Terverifikasi</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
              </div>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{product.student_name}</p>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <span>{product.jurusan}</span>
                {product.nim && <span className="text-slate-400">NIM: {product.nim}</span>}
              </div>
              <p className="text-[11px] text-polsri-700 mt-2 font-medium">
                Unit Pengelola: Program Mahasiswa Wirausaha (PMW) Polsri Bukit Besar
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Info and Purchase Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-block bg-polsri-100 text-polsri-800 text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Produk Resmi Polsri
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating and Sold Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">(Ulasan Mahasiswa & Publik)</span>
              </div>
              <span>•</span>
              <span className="text-slate-700 font-semibold">{product.sold_count} Terjual</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Stok Tersedia: {product.stock} pcs
              </span>
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <span className="text-xs text-slate-500 block mb-1">Harga Resmi PMW:</span>
            <div className="text-3xl sm:text-4xl font-black text-polsri-700">
              {formatRupiah(product.price)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              *Seluruh hasil transaksi langsung masuk ke rekening merchant resmi PMW Polsri.
            </p>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Deskripsi Produk
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Delivery Methods Info */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pilihan Pengambilan & Pengiriman:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover-lift-sm">
                <MapPin className="w-4 h-4 text-polsri-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Ambil Langsung di Kampus</span>
                  <span className="text-slate-500">Gerai PMW Gedung PKM Bukit Besar (Gratis Ongkir)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover-lift-sm">
                <Truck className="w-4 h-4 text-polsri-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Kirim Kurir / Ekspedisi</span>
                  <span className="text-slate-500">Same-Day Palembang & JNE ke seluruh Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Purchase Action Box */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Atur Jumlah:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 btn-press"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 btn-press"
                >
                  +
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Subtotal: <span className="font-bold text-polsri-700 text-sm">{formatRupiah(product.price * quantity)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  product.stock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : addedNotice
                    ? 'bg-emerald-600 text-white'
                    : 'bg-polsri-50 text-polsri-700 border-2 border-polsri-600 hover:bg-polsri-600 hover:text-white'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4" /> Berhasil Ditambah ke Keranjang!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Masukkan Keranjang
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 px-6 rounded-xl bg-polsri-600 hover:bg-polsri-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-polsri-600/30 transition-all disabled:bg-slate-300 disabled:shadow-none hover-lift"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                Beli Sekarang & Bayar Midtrans
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Produk Terkait dalam Kategori Ini
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageTransition>
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat rincian produk...</div>}>
          <ProductDetailContent />
        </Suspense>
      </PageTransition>
      <Footer />
    </div>
  );
}
