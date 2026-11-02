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
        {/* Quick Role Toggle for Examiner */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
          <span className="text-slate-500 text-[11px]">Uji Mode:</span>
          <button
            onClick={() => {
              switchUserRole('customer');
              router.push('/');
            }}
            className="text-[11px] font-semibold text-polsri-700 hover:text-polsri-900 px-2 py-0.5 rounded-full hover:bg-white transition-all flex items-center gap-1"
          >
            <Store className="w-3 h-3" />
            Beralih ke Pelanggan
          </button>
        </div>

        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div className="hidden sm:block text-left text-xs">
            <span className="font-bold text-slate-800 block leading-tight">Admin PMW</span>
            <span className="text-[10px] text-slate-400">admin.pmw@polsri.ac.id</span>
          </div>
        </div>
      </div>
    </header>
  );
}

