'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const loadingSteps = [
  'Menyiapkan etalase inovasi mahasiswa...',
  'Sinkronisasi database Supabase...',
  'Memuat produk kewirausahaan Polsri...',
  'Selamat Datang di PMW Polsri Store!',
];

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check if splash was already shown in this browser session
    const hasViewed = sessionStorage.getItem('pmw_splash_viewed');
    if (hasViewed === 'true') {
      setIsVisible(false);
      return;
    }

    // Progress animation
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStepIndex(0);
      } else if (pct < 65) {
        setStepIndex(1);
      } else if (pct < 90) {
        setStepIndex(2);
      } else {
        setStepIndex(3);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('pmw_splash_viewed', 'true');
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem('pmw_splash_viewed', 'true');
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-polsri-950 to-slate-900 text-white select-none overflow-hidden p-4 sm:p-8 w-full max-w-full h-full"
        >
          {/* Ambient Glowing Background Orbs (Clipped) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-10 w-60 h-60 sm:w-80 sm:h-80 bg-polsri-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-10 w-60 h-60 sm:w-80 sm:h-80 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.7)_100%)]" />
          </div>

          {/* Top Bar with Skip */}
          <div className="w-full max-w-5xl flex items-center justify-between z-10 px-1 pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/10 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 tracking-wide">
                Marketplace Resmi Polsri
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] sm:text-xs text-slate-200 hover:text-white font-medium flex items-center gap-1 backdrop-blur-md transition-all active:scale-95"
            >
              <span>Lewati</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Center Brand Identity */}
          <div className="w-full max-w-md flex flex-col items-center text-center z-10 space-y-4 sm:space-y-6 my-auto px-4">
            {/* Animated Emblem with Official Polsri Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative mx-auto"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-polsri-500 to-amber-400 rounded-3xl blur-lg opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white p-2 border border-white/30 shadow-2xl flex items-center justify-center">
                <Image
                  src="/logo-polsri.jpg"
                  alt="Logo Resmi Polsri"
                  width={80}
                  height={80}
                  className="object-contain rounded-xl drop-shadow"
                  priority
                />
              </div>

              {/* Sparkle badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 p-1 sm:p-1.5 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-1.5 sm:space-y-2 w-full"
            >
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-polsri-500/20 border border-polsri-400/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                Program Mahasiswa Wirausaha
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                POLSRI <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-polsri-200 bg-clip-text text-transparent">STORE</span>
              </h1>

              <p className="text-[11px] sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                Platform Resmi Inovasi, Kuliner, Merchandise, dan Teknologi Politeknik Negeri Sriwijaya
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Step */}
          <div className="w-full max-w-sm sm:max-w-md space-y-2 sm:space-y-3 z-10 pb-2 px-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="text-[10px] sm:text-[11px] text-amber-300 font-semibold truncate max-w-[220px] sm:max-w-[280px]">
                {loadingSteps[stepIndex]}
              </span>
              <span className="font-mono text-[11px] text-slate-300">{progress}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-polsri-500 via-blue-400 to-amber-300 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[9px] sm:text-[10px] text-center text-slate-400">
              Politeknik Negeri Sriwijaya &bull; Kampus Bukit Besar Palembang
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
