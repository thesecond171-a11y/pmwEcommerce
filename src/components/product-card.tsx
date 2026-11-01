'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Check, UserCheck, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover-lift hover:border-polsri-300 hover:shadow-card-hover flex flex-col h-full">
      {/* Product Image Container */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Creator Jurusan Pill */}
        <div className="absolute top-2.5 left-2.5 bg-polsri-900/85 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 border border-white/20">
          <UserCheck className="w-3 h-3 text-amber-300" />
          <span className="truncate max-w-[140px]">{product.jurusan}</span>
        </div>

        {/* Stock Out Overlay if stock is 0 */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Stok Habis
            </span>
          </div>
        )}

        {/* Featured Tag */}
        {product.is_featured && product.stock > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            PRODUK UNGGULAN
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Student Creator Name */}
          <p className="text-[11px] text-polsri-700 font-medium line-clamp-1 mb-1">
            Oleh: <span className="font-semibold text-slate-700">{product.student_name}</span>
          </p>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-slate-800 group-hover:text-polsri-700 transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100">
          {/* Price */}
          <div className="text-base sm:text-lg font-bold text-polsri-700">
            {formatRupiah(product.price)}
          </div>

          {/* Rating and Sold Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px]">{product.sold_count} terjual</span>
          </div>

          {/* Add to Cart Button with Motion micro-interaction */}
          <div className="mt-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                product.stock <= 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-polsri-50 text-polsri-700 hover:bg-polsri-600 hover:text-white border border-polsri-200/80 hover:border-transparent'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Ditambahkan!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> + Keranjang
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
