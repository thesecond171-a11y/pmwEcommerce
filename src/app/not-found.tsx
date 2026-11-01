'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/page-transition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-24 h-24 bg-polsri-blue/10 rounded-full flex items-center justify-center mb-6 text-polsri-blue"
        >
          <span className="text-4xl font-extrabold font-serif">404</span>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-600 max-w-md mb-8 text-sm sm:text-base">
          Maaf, halaman produk atau menu yang Anda cari tidak tersedia atau sedang dalam pengembangan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-polsri-blue text-white font-medium hover:bg-polsri-navy transition-colors hover-lift text-sm"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors hover-lift text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Jelajahi Produk
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}

