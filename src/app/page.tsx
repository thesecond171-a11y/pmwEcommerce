'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import BannerSlider from '@/components/banner-slider';
import ProductCard from '@/components/product-card';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import {
  UtensilsCrossed,
  Shirt,
  Laptop,
  Palette,
  Sprout,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { products, categories, setSelectedCategory } = useApp();

  const featuredProducts = products.filter((p) => p.is_featured && p.is_active);
  const activeProducts = products.filter((p) => p.is_active);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-6 h-6 text-amber-500" />;
      case 'Shirt':
        return <Shirt className="w-6 h-6 text-blue-500" />;
      case 'Laptop':
        return <Laptop className="w-6 h-6 text-cyan-500" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-purple-500" />;
      case 'Sprout':
        return <Sprout className="w-6 h-6 text-emerald-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-polsri-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-12 overflow-x-hidden">
          {/* Hero Banner Section */}
          <BannerSlider />

          {/* Categories Grid with Stagger Motion */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-polsri-600 rounded-full inline-block" />
                  Kategori Produk Mahasiswa
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Pilih kategori produk karya mahasiswa Politeknik Negeri Sriwijaya
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-semibold text-polsri-600 hover:text-polsri-700 flex items-center gap-1 group"
              >
                <span>Semua Kategori</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {categories.map((category) => {
                const count = products.filter((p) => p.category_id === category.id).length;
                return (
                  <div key={category.id}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      onClick={() => setSelectedCategory(category.slug)}
                      className="group bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover-lift hover:border-polsri-300 hover:shadow-card-hover flex flex-col items-center text-center h-full transition-all"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-polsri-50 group-hover:bg-polsri-100/70 transition-all flex items-center justify-center mb-2.5 sm:mb-3">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-polsri-600 transition-colors">
                        {category.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{count} Produk</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="bg-gradient-to-b from-polsri-50/50 to-transparent p-3.5 sm:p-6 rounded-3xl border border-polsri-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Produk Unggulan PMW Polsri
                  </h2>
                  <p className="text-[11px] sm:text-sm text-slate-500">
                    Produk terpilih dengan penjualan tertinggi
                  </p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-semibold text-polsri-600 hover:text-polsri-700 flex items-center gap-1 group whitespace-nowrap shrink-0"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* Polsri Entrepreneurship Impact Banner */}
          <section className="bg-gradient-to-r from-polsri-900 via-polsri-800 to-polsri-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block mb-3">
                Misi Kewirausahaan Kampus
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">
                Dari Mahasiswa Polsri, Untuk Kemajuan Ekonomi Sriwijaya
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-6 leading-relaxed">
                Setiap pembelian produk di PMW Polsri Store langsung mendukung pengembangan bakat wirausaha muda, pendanaan riset produk, dan perputaran ekonomi kreatif kampus Politeknik Negeri Sriwijaya.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-blue-400/20 pt-6">
                <div>
                  <div className="text-2xl font-black text-amber-300">100%</div>
                  <div className="text-xs text-blue-200">Karya Mahasiswa</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-300">5+</div>
                  <div className="text-xs text-blue-200">Jurusan Berpartisipasi</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl font-black text-amber-300">Resmi</div>
                  <div className="text-xs text-blue-200">Merchant Midtrans</div>
                </div>
              </div>
            </div>

            {/* Decorative illustration / badge */}
            <div className="hidden lg:block absolute -right-10 -bottom-10 w-96 h-96 bg-polsri-600/30 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* All Products Catalog Preview */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-polsri-600" />
                  Rekomendasi Produk Lainnya
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                  Jelajahi beragam karya civitas akademika Polsri
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-semibold text-polsri-600 hover:text-polsri-700 flex items-center gap-1 group whitespace-nowrap shrink-0"
              >
                <span>Buka Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {activeProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
