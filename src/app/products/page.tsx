'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlQuery = searchParams.get('q');

  const { products, categories, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || selectedCategory || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(urlQuery || searchQuery || '');
  const [selectedJurusan, setSelectedJurusan] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(300000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync with URL params
  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, setSelectedCategory]);

  useEffect(() => {
    if (urlQuery) {
      setSearchTerm(urlQuery);
      setSearchQuery(urlQuery);
    }
  }, [urlQuery, setSearchQuery]);

  // Unique list of Jurusan
  const uniqueJurusan = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (p.jurusan) list.add(p.jurusan);
    });
    return Array.from(list);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product.is_active) return false;

        // Category filter
        if (activeCategory !== 'all') {
          const categoryObj = categories.find((c) => c.slug === activeCategory);
          if (categoryObj && product.category_id !== categoryObj.id) {
            return false;
          }
        }

        // Search term
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchStudent = product.student_name.toLowerCase().includes(q);
          const matchJurusan = product.jurusan.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchStudent && !matchJurusan) {
            return false;
          }
        }

        // Jurusan filter
        if (selectedJurusan !== 'all' && product.jurusan !== selectedJurusan) {
          return false;
        }

        // Price range
        if (product.price > priceRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'sold') return b.sold_count - a.sold_count;
        if (sortBy === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
        // default featured
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, categories, activeCategory, searchTerm, selectedJurusan, priceRange, sortBy]);

  const resetFilters = () => {
    setActiveCategory('all');
    setSelectedCategory(null);
    setSearchTerm('');
    setSearchQuery('');
    setSelectedJurusan('all');
    setPriceRange(300000);
    setSortBy('featured');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Beranda</span>
          <span>/</span>
          <span className="text-polsri-700 font-semibold">Katalog Produk Mahasiswa</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Katalog Produk PMW Polsri
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dukung wirausaha muda dengan membeli produk berkualitas karya mahasiswa Politeknik Negeri Sriwijaya
        </p>
      </div>

      {/* Toolbar: Search, Sort, Filter Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama produk, mahasiswa, atau jurusan..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-polsri-50 text-polsri-700 rounded-xl border border-polsri-200 text-sm font-semibold flex-1 btn-press"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 whitespace-nowrap hidden sm:inline">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-polsri-500 cursor-pointer"
            >
              <option value="featured">Unggulan & Rekomendasi</option>
              <option value="sold">Terlaris</option>
              <option value="newest">Terbaru</option>
              <option value="price-low">Harga Terendah</option>
              <option value="price-high">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Layout: Left Sidebar + Right Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Left Sidebar Filter */}
        <aside className="w-64 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hidden md:block shrink-0 sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-polsri-600" />
              Filter Produk
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-polsri-600 hover:text-polsri-700 font-semibold flex items-center gap-1 btn-press"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Kategori
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedCategory(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-polsri-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    setSelectedCategory(cat.slug);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? 'bg-polsri-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Jurusan Filter */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-polsri-600" />
              Jurusan Pembuat
            </h4>
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 p-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-polsri-500"
            >
              <option value="all">Semua Jurusan</option>
              {uniqueJurusan.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Maksimal Harga
              </h4>
              <span className="text-xs font-semibold text-polsri-700">
                Rp {priceRange.toLocaleString('id-ID')}
              </span>
            </div>
            <input
              type="range"
              min={20000}
              max={300000}
              step={5000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-polsri-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Rp 20.000</span>
              <span>Rp 300.000</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Active filter summary pill */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-slate-600">
              Menampilkan <span className="font-bold text-slate-900">{filteredProducts.length}</span> produk
            </p>
            {(activeCategory !== 'all' || selectedJurusan !== 'all' || searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 btn-press"
              >
                <X className="w-3.5 h-3.5" /> Hapus Semua Filter
              </button>
            )}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-polsri-600 mx-auto flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Tidak ada produk yang sesuai filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Coba gunakan kata kunci pencarian lain atau klik tombol reset untuk melihat seluruh katalog produk mahasiswa.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-polsri-600 text-white rounded-xl text-xs font-semibold hover:bg-polsri-700 transition-colors shadow-sm btn-press"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer with Motion AnimatePresence */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-80 max-w-full bg-white h-full p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="font-bold text-base text-slate-900">Filter Produk</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Kategori
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      activeCategory === 'all'
                        ? 'bg-polsri-600 text-white'
                        : 'text-slate-600 bg-slate-50'
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        activeCategory === cat.slug
                          ? 'bg-polsri-600 text-white'
                          : 'text-slate-600 bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jurusan */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Jurusan Pembuat
                </h4>
                <select
                  value={selectedJurusan}
                  onChange={(e) => setSelectedJurusan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl text-xs"
                >
                  <option value="all">Semua Jurusan</option>
                  {uniqueJurusan.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Button */}
              <div className="pt-6 border-t border-slate-200 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 btn-press"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-polsri-600 text-white text-xs font-bold btn-press"
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageTransition>
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat katalog...</div>}>
          <ProductsCatalog />
        </Suspense>
      </PageTransition>
      <Footer />
    </div>
  );
}
