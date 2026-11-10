'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { demoProducts } from '@/lib/demo-data';
import {
  ShieldCheck,
  Store,
  Star,
  ChevronRight,
  ShoppingCart,
  Zap,
  Package,
  Truck,
  RotateCw,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  weightGram?: number;
  vendor: {
    id: string;
    storeName: string;
    rating: number;
    city?: string;
    isVerified?: boolean;
    joinedAt?: string;
  };
  createdAt: string;
  isDemo?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addItem, updateQuantity, items: cartItems } = useCart();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch product detail
  const { data: product, isLoading, isError, error, refetch } = useQuery<ProductDetail>({
    queryKey: ['marketplace-product', productId],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/marketplace/catalog/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Produk tidak ditemukan atau gagal dimuat');
        }

        const json = await res.json();
        return json.data || json;
      } catch (error) {
        const product = demoProducts.find((item) => item.id === productId);
        if (process.env.NODE_ENV !== 'development' || !product) throw error;
        return { ...product, isDemo: true };
      }
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 3, // Cache 3 menit
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (!product) return;
    if (type === 'inc' && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    try {
      const existing = cartItems.find((i) => i.productId === product.id);
      if (existing) {
        updateQuantity(product.id, existing.quantity + quantity);
      } else {
        // addItem menambahkan 1, lalu jika quantity > 1 kita update
        addItem({
          productId: product.id,
          name: product.title,
          price: product.price,
          imageUrl: product.images?.[0] || '',
          vendorName: product.vendor?.storeName || 'Racik Official',
        });
        if (quantity > 1) {
          updateQuantity(product.id, quantity);
        }
      }

      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2500);
    } catch (err) {
      console.error('Failed to update cart', err);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-4">
              <div className="w-full aspect-square bg-slate-200 rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-slate-200 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="md:col-span-6 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-10 bg-slate-200 rounded w-1/2" />
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Produk Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            {(error as Error)?.message || 'Produk mungkin telah dihapus atau URL tidak valid.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Muat Ulang
            </button>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/marketplace" className="hover:text-emerald-600 transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="capitalize text-slate-400">{product.category || 'Katalog'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {product.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Produk pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Grid Detail Produk */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">

          {/* SISI KIRI: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover transition-all"
              />
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                    Stok Habis
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel / List */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedImageIndex === idx
                      ? 'border-emerald-600 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Banner Escrow Protection */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 mt-6">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-950">100% Proteksi Rekening Bersama Escrow</p>
                <p className="text-emerald-800 leading-relaxed">
                  Dana Anda ditahan aman oleh sistem Racik Media dan baru diteruskan ke vendor setelah pesanan tiba dan Anda konfirmasi puas.
                </p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Info & Action Flow */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category Pill & ID */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider">
                  {product.category || 'Umum'}
                </span>
                <span className="text-[11px] text-slate-400">ID: {product.id.slice(0, 8)}</span>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {product.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-emerald-700">
                    {formatRupiah(product.price)}
                  </span>
                </div>
              </div>

              {/* Card Vendor */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {product.vendor?.storeName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {product.vendor?.storeName || 'Official Store'}
                      </span>
                      {product.vendor?.isVerified !== false && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {product.vendor?.rating ? product.vendor.rating.toFixed(1) : '5.0'} Rating Toko
                    </span>
                  </div>
                </div>

                <Link
                  href={`/services?vendorId=${product.vendor?.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Kunjungi Toko
                </Link>
              </div>

              {/* Deskripsi Produk */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Produk
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {product.description || 'Tidak ada deskripsi detail untuk produk ini.'}
                </div>
              </div>
            </div>

            {/* Bagian Bawah: Quantity Selector & Checkout Actions */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1 || product.stock <= 0}
                      className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock || product.stock <= 0}
                      className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Tersedia {product.stock} unit
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isAddedToCart ? 'Ditambahkan ✓' : 'Keranjang'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Beli Sekarang
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}