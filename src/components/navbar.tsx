'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Shield,
  Layers,
  ChevronDown,
  Menu,
  X,
  FileText,
  LogOut,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const router = useRouter();
  const {
    user,
    switchUserRole,
    logout,
    isAdmin,
    cartCount,
    categories,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    router.push(`/products?q=${encodeURIComponent(localSearch)}`);
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    router.push(`/products?category=${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Bar Announcement */}
      <div className="bg-polsri-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-polsri-700/70 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <Sparkles className="w-3 h-3" /> PMW POLSRI STORE
            </span>
            <span className="hidden sm:inline text-blue-100 text-xs">
              Platform Resmi Produk Kewirausahaan Mahasiswa Politeknik Negeri Sriwijaya
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-blue-200">
            <span className="hidden md:inline">Kampus Bukit Besar, Palembang</span>
            <a
              href="https://www.polsri.ac.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white transition-colors font-medium flex items-center gap-1"
            >
              <span>Portal Polsri &rarr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-polsri-900/10 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo-polsri.png"
                alt="Logo POLSRI"
                width={40}
                height={40}
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-polsri-900 flex items-center gap-1">
                POLSRI <span className="text-polsri-600">STORE</span>
              </span>
              <span className="text-[9px] sm:text-xs text-slate-500 font-medium -mt-0.5 sm:-mt-1 hidden xs:block">
                Kewirausahaan Mahasiswa
              </span>
            </div>
          </Link>

          {/* Category Dropdown (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 hover:text-polsri-700 hover:bg-polsri-50 font-medium text-sm transition-colors border border-slate-200"
            >
              <Layers className="w-4 h-4 text-polsri-600" />
              <span>Kategori</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoriesOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kategori Produk
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-polsri-50 hover:text-polsri-700 flex items-center justify-between transition-colors"
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1 pt-1">
                  <Link
                    href="/products"
                    onClick={() => setCategoriesOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-polsri-600 hover:text-polsri-700 text-center"
                  >
                    Lihat Semua Produk &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative hidden sm:block"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari pempek, hoodie teknik, sensor IoT, kriya..."
                className="w-full pl-10 pr-20 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500 focus:bg-white focus:border-transparent transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-polsri-600 hover:bg-polsri-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge/Link if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-300/60 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Dashboard Admin</span>
              </Link>
            )}

            {/* Riwayat Pesanan */}
            <Link
              href="/orders"
              className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-polsri-600 hover:bg-polsri-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Pesanan Saya"
            >
              <FileText className="w-5 h-5 text-slate-600" />
              <span className="hidden xl:inline">Pesanan Saya</span>
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-polsri-600 hover:bg-polsri-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline">Keranjang</span>
            </Link>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block"></div>

            {/* User Profile / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-polsri-100 border border-polsri-300 flex items-center justify-center text-polsri-800 font-bold text-xs">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[100px]">
                      {user.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role === 'admin' ? 'Pengelola PMW' : 'Pelanggan'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>Panel Admin PMW</span>
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Daftar Transaksi</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profil & Alamat</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-polsri-700 hover:text-polsri-800 hover:bg-polsri-50 rounded-xl transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-polsri-600/30 transition-all btn-press"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-polsri-600 sm:hidden rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari produk mahasiswa Polsri..."
              className="w-full pl-9 pr-16 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-polsri-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-polsri-600 text-white rounded-full text-[11px] font-semibold"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 bg-amber-50 text-amber-800 rounded-lg text-sm font-semibold border border-amber-200"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Buka Dashboard Admin</span>
            </Link>
          )}

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Kategori Produk
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="text-left p-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-polsri-50 hover:text-polsri-700"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-sm font-medium text-slate-700 hover:text-polsri-600"
            >
              Katalog Seluruh Produk
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-sm font-medium text-slate-700 hover:text-polsri-600"
            >
              Riwayat Pesanan Saya
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-sm font-medium text-slate-700 hover:text-polsri-600"
            >
              Profil & Alamat
            </Link>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="w-full text-left p-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-polsri-700 bg-polsri-50 rounded-xl"
                >
                  Masuk ke Akun
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-polsri-600 rounded-xl shadow-sm"
                >
                  Daftar Akun Baru
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

