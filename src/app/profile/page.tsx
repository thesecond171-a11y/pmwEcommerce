'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  LogOut,
  Save,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, orders, logout } = useApp();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Palembang');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');
  const [savedNotice, setSavedNotice] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || 'Palembang');
      setPostalCode(user.postal_code || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 flex items-center justify-center text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5 w-full">
            <div className="w-16 h-16 rounded-2xl bg-polsri-50 text-polsri-600 mx-auto flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Perlu Masuk Akun</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Silakan masuk terlebih dahulu untuk mengakses data profil, alamat pengiriman, dan riwayat belanja Anda.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-polsri-600/20 btn-press"
              >
                <span>Masuk Sekarang</span>
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-xs text-slate-600 hover:text-polsri-600 font-semibold block"
              >
                Belum punya akun? Daftar
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.user_id === user?.id || (user?.email && o.customer_email === user.email));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUser({
      ...user,
      full_name: fullName,
      email,
      phone,
      address,
      city,
      postal_code: postalCode,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-polsri-600">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-polsri-700 font-semibold">Profil Pengguna</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Profil & Akun Saya
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kelola informasi identitas, nomor kontak, dan alamat pengiriman pesanan Anda
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          </div>

          {savedNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perubahan data profil dan alamat berhasil disimpan!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Summary Card (4 cols) */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 text-center shadow-sm space-y-4">
                <div className="w-24 h-24 rounded-full bg-polsri-100 text-polsri-800 border-4 border-white shadow-md mx-auto flex items-center justify-center text-3xl font-black">
                  {fullName.charAt(0)}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{fullName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{email}</p>
                  <div className="mt-2.5">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border inline-block ${
                        user?.role === 'admin'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-polsri-50 text-polsri-700 border-polsri-200'
                      }`}
                    >
                      Role: {user?.role === 'admin' ? 'Admin Pengelola PMW' : 'Pelanggan Mahasiswa/Umum'}
                    </span>
                  </div>
                </div>

                {/* Quick Order Stats */}
                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-lg font-black text-polsri-700">{userOrders.length}</span>
                    <span className="text-[10px] text-slate-500 block">Total Pesanan</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-lg font-black text-emerald-600">
                      {userOrders.filter((o) => o.status === 'completed' || o.status === 'paid').length}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Transaksi Sukses</span>
                  </div>
                </div>

                {/* Status Role Badge */}
                <div className="border-t border-slate-100 pt-4 text-left">
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Status Akun Terdaftar:
                  </span>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <Shield className="w-4 h-4 text-polsri-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {user.role === 'admin' ? 'Pengelola PMW Polsri' : 'Pelanggan Terverifikasi'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {user.role === 'admin' ? 'Akses Penuh Dashboard Admin' : 'Dapat Berbelanja Produk Mahasiswa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card (8 cols) */}
            <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Informasi Kontak & Pengiriman Default
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Mahasiswa / Akun
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Alamat Lengkap (Kampus / Rumah / Kost)
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kota / Kabupaten
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-polsri-600/30 transition-all flex items-center gap-1.5 hover-lift btn-press"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
