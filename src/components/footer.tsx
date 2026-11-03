import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, MapPin, Mail, Phone, ShieldCheck, CreditCard, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12 sm:mt-20 border-t border-slate-800 w-full max-w-full overflow-hidden">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Karya Mahasiswa</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung langsung inovasi dan kemandirian mahasiswa Politeknik Negeri Sriwijaya.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pembayaran Aman</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Satu pintu rekening resmi merchant PMW Polsri via QRIS, Virtual Account & E-Wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Ambil di Kampus / Kirim</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gratis ambil langsung di Gerai PMW Kampus Bukit Besar atau kirim kurir ke rumah.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Kualitas Terjamin</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Didampingi dosen pembimbing dan unit inkubator bisnis kampus Polsri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0 border border-slate-700">
                <Image
                  src="/logo-polsri.png"
                  alt="Logo Resmi Polsri"
                  width={36}
                  height={36}
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">
                  POLSRI <span className="text-polsri-400">STORE</span>
                </span>
                <p className="text-[10px] text-slate-400 -mt-1">Kewirausahaan Mahasiswa</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Marketplace resmi wadah unjuk karya, produk inovasi, kriya, kuliner, dan teknologi hasil inkubasi Program Mahasiswa Wirausaha (PMW) Politeknik Negeri Sriwijaya.
            </p>
            <div className="pt-1">
              <span className="inline-block bg-polsri-900/80 text-polsri-300 text-[11px] px-2.5 py-1 rounded border border-polsri-700/50">
                Didukung oleh UPT Inkubator Kewirausahaan Polsri
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-polsri-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-polsri-400 transition-colors">
                  Katalog Semua Produk
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-polsri-400 transition-colors">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-polsri-400 transition-colors">
                  Status & Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors font-medium">
                  Masuk Dashboard Pengelola (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Kategori Unggulan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=kuliner-minuman" className="hover:text-polsri-400 transition-colors">
                  Kuliner & Camilan Palembang
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion-kriya" className="hover:text-polsri-400 transition-colors">
                  Fashion & Merchandise Polsri
                </Link>
              </li>
              <li>
                <Link href="/products?category=teknologi-kreatif" className="hover:text-polsri-400 transition-colors">
                  Teknologi & Solusi IoT
                </Link>
              </li>
              <li>
                <Link href="/products?category=karya-seni-souvenir" className="hover:text-polsri-400 transition-colors">
                  Plakat & Souvenir Sriwijaya
                </Link>
              </li>
              <li>
                <Link href="/products?category=pertanian-agribisnis" className="hover:text-polsri-400 transition-colors">
                  Agribisnis & BioGrow
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hubungi Gerai PMW</h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-polsri-400 shrink-0 mt-0.5" />
              <span>Gedung PMW / PKM Lantai 1, Jl. Srijaya Negara, Bukit Besar, Palembang 30139</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-polsri-400 shrink-0" />
              <span>(0711) 353414 / WhatsApp: +62 811-710-9988</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-polsri-400 shrink-0" />
              <span>pmw.store@polsri.ac.id</span>
            </div>

            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-300 mb-2">Metode Pembayaran Resmi:</div>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">QRIS</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">GoPay</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">BCA VA</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Mandiri</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">ShopeePay</span>
                {/* <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Midtrans</span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            &copy; {new Date().getFullYear()} PMW Politeknik Negeri Sriwijaya. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            Dikembangkan untuk Kemajuan Wirausaha Muda Politeknik Negeri Sriwijaya
          </p>
        </div>
      </div>
    </footer>
  );
}

