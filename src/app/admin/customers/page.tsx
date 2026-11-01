'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/utils';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, ExternalLink } from 'lucide-react';

export default function AdminCustomersPage() {
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique customers from orders
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpend: number;
    lastOrderDate: string;
  }>();

  orders.forEach((o) => {
    const key = o.customer_email.toLowerCase();
    const existing = customerMap.get(key);
    const isPaid = o.payment_status === 'paid';
    const amount = isPaid ? o.total_amount : 0;

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpend += amount;
      if (o.created_at > existing.lastOrderDate) {
        existing.lastOrderDate = o.created_at;
      }
    } else {
      customerMap.set(key, {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        city: o.shipping_city,
        orderCount: 1,
        totalSpend: amount,
        lastOrderDate: o.created_at,
      });
    }
  });

  const customerList = Array.from(customerMap.values()).filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Data Pelanggan PMW Polsri
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Daftar mahasiswa, dosen, dan masyarakat umum yang berbelanja produk kewirausahaan
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama pelanggan, email, atau kota..."
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
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">Kontak WhatsApp</th>
                <th className="p-4">Kota Domisili</th>
                <th className="p-4 text-center">Jumlah Pesanan</th>
                <th className="p-4 text-right">Total Transaksi Lunas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerList.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-polsri-50 text-polsri-700 font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">{c.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-700">{c.phone}</td>

                  <td className="p-4 text-slate-600 font-medium">{c.city}</td>

                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                      {c.orderCount} Pesanan
                    </span>
                  </td>

                  <td className="p-4 text-right font-black text-polsri-700">
                    {formatRupiah(c.totalSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

