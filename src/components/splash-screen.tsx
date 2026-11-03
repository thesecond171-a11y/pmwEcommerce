'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const loadingSteps = [
  'Menyiapkan etalase produk inovasi mahasiswa...',
  'Sinkronisasi database Supabase...',
  'Memuat katalog wirausaha Politeknik Negeri Sriwijaya...',
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
        }, 350);
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
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-polsri-950 to-slate-900 text-white select-none overflow-hidden p-6 sm:p-10"
        >
          {/* Ambient Glowing Background Orbs */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-polsri-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)] pointer-events-none" />

          {/* Top Bar with Skip */}
          <div className="w-full max-w-5xl flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-300 tracking-wide">
                Official Marketplace Polsri
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 backdrop-blur-md transition-all hover-lift btn-press"
            >
              <span>Lewati</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center text-center max-w-lg z-10 space-y-6">
            {/* Animated Emblem */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-polsri-600 to-amber-400 rounded-3xl blur-xl opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-polsri-800 via-polsri-600 to-polsri-500 border border-white/20 shadow-2xl flex items-center justify-center">
                <GraduationCap className="w-12 h-12 sm:w-14 sm:h-14 text-amber-300 drop-shadow-md" />
              </div>

              {/* Sparkle badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </motion.div>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-polsri-500/20 border border-polsri-400/30 text-amber-300 text-xs font-bold tracking-wider uppercase">
                Program Mahasiswa Wirausaha
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                POLSRI <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-polsri-200 bg-clip-text text-transparent">STORE</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-sm mx-auto">
                Platform Resmi Produk Inovasi, Kuliner, Merchandise, dan Teknologi Mahasiswa Politeknik Negeri Sriwijaya
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Step */}
          <div className="w-full max-w-md space-y-3 z-10">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="text-[11px] text-amber-300/90 font-semibold truncate max-w-[280px]">
                {loadingSteps[stepIndex]}
              </span>
              <span className="font-mono text-slate-300">{progress}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-polsri-500 via-blue-400 to-amber-300 shadow-sm"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <p className="text-[10px] text-center text-slate-500 pt-1">
              Politeknik Negeri Sriwijaya &bull; Kampus Bukit Besar Palembang
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

