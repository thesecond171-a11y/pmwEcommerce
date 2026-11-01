'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  badgeColor: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tag: 'Program Mahasiswa Wirausaha (PMW)',
    title: 'Dukung Karya & Inovasi Mahasiswa Politeknik Negeri Sriwijaya',
    subtitle: 'Temukan aneka produk unggulan mulai dari kuliner khas Palembang, fashion kampus, hingga karya teknologi mahasiswa Polsri.',
    ctaText: 'Jelajahi Semua Produk',
    ctaLink: '/products',
    bgGradient: 'from-polsri-950 via-polsri-900 to-polsri-800',
    badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    tag: 'Kuliner Mahasiswa Kimia & Tata Boga',
    title: 'Pempek Crispy Tenggiri Segar & Cuko Khas Asli Bukit Besar',
    subtitle: '100% Ikan tenggiri tanpa pengawet. Tersedia kemasan vacuum beku siap kirim ke seluruh Indonesia atau ambil langsung di kampus.',
    ctaText: 'Beli Kuliner Khas',
    ctaLink: '/products?category=kuliner-minuman',
    bgGradient: 'from-blue-900 via-polsri-800 to-sky-800',
    badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    tag: 'Inovasi Rekayasa & IoT Terapan',
    title: 'Solusi Cerdas IoT & Perangkat Digital Karya Mahasiswa TI',
    subtitle: 'Modul monitoring tanaman otomatis, kit robotika, dan karya kriya akrilik presisi untuk kebutuhan praktikum dan hadiah.',
    ctaText: 'Lihat Inovasi Teknologi',
    ctaLink: '/products?category=teknologi-kreatif',
    bgGradient: 'from-slate-900 via-polsri-950 to-blue-900',
    badgeColor: 'bg-cyan-400 text-slate-950 font-bold',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[current];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/50">
      <div className={`relative min-h-[380px] sm:min-h-[440px] bg-gradient-to-r ${activeSlide.bgGradient} transition-all duration-700 flex items-center`}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="w-full h-full object-cover opacity-20 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-polsri-950 via-polsri-900/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col justify-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 w-fit shadow-sm bg-white/10 text-white backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{activeSlide.tag}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-sm">
            {activeSlide.title}
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-xl mb-8 leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={activeSlide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 hover:scale-105 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-blue-200 bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verifikasi Resmi Merchant PMW Polsri</span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all z-20 border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all z-20 border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
