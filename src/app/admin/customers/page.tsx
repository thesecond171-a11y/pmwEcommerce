'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Users, Search, Mail, Phone, MapPin, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

interface CustomerData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  city: string;
  role: string;
  address?: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || []);
      }
    } catch (err) {
      console.error('[AdminCustomers] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Data Pelanggan & Pengguna PMW Polsri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar akun terdaftar murni dari tabel <code className="text-polsri-700 bg-polsri-50 px-1 py-0.5 rounded font-mono">public.profiles</code> Supabase
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={isLoading}
          className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs btn-press self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sinkronkan Supabase</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama pelanggan, email, nomor HP, atau kota..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Nama & Email</th>
                <th className="p-4">Kontak WhatsApp</th>
                <th className="p-4">Kota Domisili</th>
                <th className="p-4 text-center">Role Akun</th>
                <th className="p-4 text-center">Jumlah Pesanan</th>
                <th className="p-4 text-right">Total Belanja Lunas</th>
                <th className="p-4 text-right">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-polsri-600 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Memuat profil dari Supabase...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada pelanggan yang cocok dengan pencarian di Supabase.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-polsri-50 text-polsri-700 font-bold flex items-center justify-center text-xs border border-polsri-200">
                          {c.full_name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.full_name}</span>
                          <span className="text-[11px] text-slate-500">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-700">{c.phone || '-'}</td>

                    <td className="p-4 text-slate-600 font-medium">{c.city || 'Palembang'}</td>

                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          c.role === 'admin'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {c.role === 'admin' ? 'Admin PMW' : 'Pelanggan'}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                        {c.orders_count} Pesanan
                      </span>
                    </td>

                    <td className="p-4 text-right font-black text-polsri-700">
                      {formatRupiah(c.total_spent)}
                    </td>

                    <td className="p-4 text-right text-slate-400 text-[11px]">
                      {c.created_at ? formatDate(c.created_at) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
