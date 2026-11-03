'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Shield, Bell, User, Store, LogOut, Sparkles } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const { user, switchUserRole, logout, isSupabaseLive } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>Panel Pengelola Resmi PMW Polsri</span>
        </div>

        <div
          className={`hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
            isSupabaseLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
          title="Status koneksi database Supabase"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
          <span>
            {isSupabaseLive ? 'Supabase: Live Database' : 'Supabase: vguhuwlrjkncgetignqd (Connected)'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Storefront Link */}
        <Link
          href="/"
          className="text-xs font-semibold text-polsri-700 hover:text-polsri-900 bg-polsri-50 hover:bg-polsri-100 border border-polsri-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Lihat Etalase Toko</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          title="Keluar dari akun admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <span className="font-bold text-slate-800 block leading-tight">{user?.full_name || 'Admin PMW'}</span>
            <span className="text-[10px] text-slate-400">{user?.email || 'admin@gmail.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

