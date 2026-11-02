'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import { signUpWithSupabase } from '@/lib/services/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await res.json();

      if (!res.ok && !data.alreadyRegistered) {
        setErrorMessage(data.error || 'Pendaftaran gagal');
        setLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        setLoading(false);
        router.push('/');
        return;
      }
    } catch (err: any) {
      console.warn('API register fallback:', err);
    }

    // Local fallback
    setUser({
      id: `user-cust-${Date.now()}`,
      full_name: fullName,
      email,
      phone,
      role: 'customer',
      city: 'Palembang',
      address: 'Politeknik Negeri Sriwijaya, Bukit Besar',
    });
    setLoading(false);
    router.push('/');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-polsri-800 to-polsri-600 flex items-center justify-center text-white shadow-lg shadow-polsri-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <span className="text-2xl font-black text-polsri-900 tracking-tight">
              POLSRI <span className="text-polsri-600">STORE</span>
            </span>
            <p className="text-xs text-slate-500 font-medium">Program Mahasiswa Wirausaha</p>
          </div>
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Akun Pelanggan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Bergabung untuk mendukung dan membeli produk karya mahasiswa Polsri
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-polsri-600/30 transition-all flex items-center justify-center gap-2 hover-lift btn-press"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-polsri-600 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
