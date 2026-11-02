'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageTransition from '@/components/page-transition';
import { motion } from 'framer-motion';
import {
  Mail,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'email Anda';

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('Tautan verifikasi baru telah berhasil dikirimkan ke email Anda!');
      } else {
        setResendStatus(data.error || 'Gagal mengirim ulang email. Silakan coba lagi.');
      }
    } catch {
      setResendStatus('Terjadi kendala jaringan saat mengirim ulang email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl space-y-6 text-center">
      {/* Animated Mail Icon with Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-polsri-600 flex items-center justify-center border border-blue-100 shadow-sm"
      >
        <Mail className="w-10 h-10" />
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-polsri-950 flex items-center justify-center font-bold text-xs shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      </motion.div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pendaftaran Berhasil Tersimpan di Supabase</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verifikasi Email Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Tautan aktivasi akun telah dikirim ke alamat email:
        </p>
        <div className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-slate-100 font-mono text-xs sm:text-sm font-bold text-polsri-900 border border-slate-200 break-all">
          {email}
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 text-left border border-slate-200/70 space-y-3 text-xs text-slate-600">
        <p className="font-bold text-slate-800 text-[13px] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-polsri-600" />
          Langkah Finalisasi Akun:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
          <li>
            Buka kotak masuk email <strong>{email}</strong>.
          </li>
          <li>
            Cari pesan dari <strong>PMW Polsri / Supabase</strong> dengan subjek <em>"Confirm your email address"</em>.
          </li>
          <li>
            Klik tombol <strong>"Confirm your email"</strong> di dalam pesan untuk mengaktifkan akun secara permanen.
          </li>
        </ol>
        <p className="text-[11px] text-slate-400 italic pt-1">
          * Catatan: Jika email belum muncul di Inbox, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
        </p>
      </div>

      {resendStatus && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs text-center font-medium animate-in fade-in duration-200">
          {resendStatus}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-polsri-600 hover:bg-polsri-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-polsri-600/30 flex items-center justify-center gap-2 hover-lift btn-press"
        >
          <span>Buka Gmail</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <Link
          href="/login"
          className="w-full py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors hover-lift-sm btn-press"
        >
          <span>Sudah Verifikasi? Masuk Sekarang</span>
          <ArrowRight className="w-4 h-4 text-polsri-600" />
        </Link>

        <div className="pt-2 text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold text-slate-500 hover:text-polsri-600 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Mengirim ulang...' : 'Belum menerima email? Kirim ulang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        {/* Brand Logo */}
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

        <Suspense
          fallback={
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
              Memuat data verifikasi...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </PageTransition>
  );
}

