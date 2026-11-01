'use client';

import React from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/admin-header';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, ArrowRight, Store } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, switchUserRole } = useApp();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas: Role Admin</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Halaman ini dikhususkan untuk Pengelola PMW Politeknik Negeri Sriwijaya sebagai penjual dan penerima dana tunggal.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => switchUserRole('admin')}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover-lift btn-press"
            >
              <span>Masuk Sebagai Admin PMW (Mode Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors btn-press"
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span>Kembali ke Halaman Pelanggan</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
