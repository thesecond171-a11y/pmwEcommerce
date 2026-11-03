'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/page-transition';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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
        setErrorMessage(data.error || 'Pendaftaran gagal. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      // Transition to verification info page
      router.push(`/register/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(
        'Terjadi kendala koneksi saat menghubungi server. Pastikan Anda terhubung ke internet.'
      );
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        {/* Brand Header with Official Polsri Logo */}
        <Link href="/" className="flex items-center gap-3 mb-6 sm:mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-polsri-900/10 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo-polsri.png"
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

        {/* Card Form */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-5 sm:space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-polsri-800 border border-blue-100 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-polsri-600" />
              <span>Pendaftaran Pelanggan Resmi PMW</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Dukung produk inovasi dan kewirausahaan mahasiswa Politeknik Negeri Sriwijaya
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
                  placeholder="Nama Lengkap Anda"
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
                  minLength={6}
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
              className="w-full py-3 bg-polsri-600 hover:bg-polsri-700 disabled:opacity-70 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-polsri-600/30 transition-all flex items-center justify-center gap-2 hover-lift btn-press"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Database Supabase...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-polsri-600 hover:underline">
              Masuk ke Akun
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-6 sm:mt-8 text-center max-w-sm">
          &copy; {new Date().getFullYear()} Politeknik Negeri Sriwijaya &bull; Kampus Bukit Besar, Palembang
        </p>
      </div>
    </PageTransition>
  );
}
