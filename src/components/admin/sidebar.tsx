'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Users,
  BarChart3,
  Store,
  GraduationCap,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { orders } = useApp();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pending_payment' || o.status === 'paid'
  ).length;

  const menuItems = [
    {
      title: 'Ringkasan & Statistik',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Kelola Produk',
      href: '/admin/products',
      icon: Package,
    },
    {
      title: 'Kelola Kategori',
      href: '/admin/categories',
      icon: Layers,
    },
    {
      title: 'Kelola Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      title: 'Pengelolaan Stok',
      href: '/admin/stock',
      icon: Boxes,
    },
    {
      title: 'Data Pelanggan',
      href: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Laporan Penjualan',
      href: '/admin/reports',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-polsri-700 to-polsri-500 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight flex items-center gap-1">
              POLSRI <span className="text-amber-400">ADMIN</span>
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5">Pengelola Tunggal PMW</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Manajemen
          </div>
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-polsri-600 text-white shadow-md shadow-polsri-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Switch to Storefront */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Rekening Merchant PMW</span>
          </div>
          <p>Admin mengelola seluruh produk dan menjadi penerima tunggal pembayaran Midtrans.</p>
        </div>

        <Link
          href="/"
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Store className="w-4 h-4 text-polsri-400" />
          <span>Kembali ke Halaman Toko</span>
        </Link>
      </div>
    </aside>
  );
}

