'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/page-transition';
import { useApp } from '@/context/AppContext';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        setLoading(false);
        if (data.user.role === 'admin') router.push('/admin');
        else router.push('/');
        return;
      }

      if (!res.ok && data.error) {
        // If wrong credentials and not admin fallback
        if (
          email.toLowerCase() !== 'admin@gmail.com' ||
          password !== 'admin123#'
        ) {
          setError(data.error);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Login API fallback:', err);
    }

    // Direct check for admin credentials fallback (admin@gmail.com / admin123#)
    if (
      email.toLowerCase() === 'admin@gmail.com' &&
      password === 'admin123#'
    ) {
      setUser({
        id: 'admin-polsri-01',
        email: 'admin@gmail.com',
        full_name: 'Admin PMW Polsri',
        role: 'admin',
        city: 'Palembang',
        address: 'Gedung Kantor Pusat Administrasi Polsri, Jl. Srijaya Negara, Bukit Besar',
        phone: '081278901234',
      });
      setLoading(false);
      router.push('/admin');
      return;
    }

    setError('Email atau kata sandi tidak valid. Silakan periksa kembali.');
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        {/* Official Polsri Logo */}
        <Link href="/" className="flex items-center gap-3 mb-6 sm:mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-polsri-900/10 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo-polsri.jpg"
              alt="Logo Resmi Polsri"
              width={44}
              height={44}
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-polsri-900 tracking-tight flex items-center gap-1">
              POLSRI <span className="text-polsri-600">STORE</span>
            </span>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Program Mahasiswa Wirausaha</p>
          </div>
        </Link>

        {/* Login Form Box */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-5 sm:space-y-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Masuk ke akun Anda untuk berbelanja atau mengelola toko PMW Polsri
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-polsri-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 disabled:opacity-70 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-polsri-600/30 transition-all flex items-center justify-center gap-2 hover-lift btn-press"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-polsri-600" />
              <span>Info Akses Akun:</span>
            </div>
            <p>
              • <strong>Admin PMW:</strong> email <code className="text-polsri-700 font-mono">admin@gmail.com</code> | password <code className="text-polsri-700 font-mono">admin123#</code>
            </p>
            <p>
              • <strong>Pelanggan:</strong> Gunakan email & kata sandi yang telah Anda daftarkan.
            </p>
          </div>

          <p className="text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-polsri-600 hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-slate-400 mt-6 sm:mt-8 text-center max-w-sm">
          &copy; {new Date().getFullYear()} Politeknik Negeri Sriwijaya &bull; Program Mahasiswa Wirausaha
        </p>
      </div>
    </PageTransition>
  );
}
