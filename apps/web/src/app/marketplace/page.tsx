'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  Store,
  Star,
  AlertCircle,
  RotateCw,
  PackageX
} from 'lucide-react';
import { demoProducts } from '@/lib/demo-data';

// Type definition sesuai data model Catalog / Marketplace
export interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  vendor: {
    id: string;
    storeName: string;
    rating?: number;
    isVerified?: boolean;
  };
  stock: number;
  soldCount?: number;
  createdAt: string;
}

interface CatalogResponse {
  data: ProductItem[];
  isDemo?: boolean;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'bibit', label: 'Bibit & Benih' },
  { id: 'pupuk', label: 'Pupuk & Nutrisi' },
  { id: 'alat', label: 'Peralatan & Mesin' },
  { id: 'pakan', label: 'Pakan & Suplemen' },
  { id: 'hasil_tani', label: 'Hasil Panen' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'popular', label: 'Terlaris / Terpopuler' },
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch catalog dari API menggunakan TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery<CatalogResponse>({
    queryKey: ['marketplace-catalog', { search: searchTerm, category: selectedCategory, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page.toString());
      params.append('limit', '12');

      try {
        const response = await fetch(`${API_BASE_URL}/marketplace/catalog?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Gagal memuat katalog produk marketplace');
        }

        return response.json();
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') throw error;

        const filtered = demoProducts.filter((product) => {
          const matchesCategory =
            selectedCategory === 'all' || product.category === selectedCategory;
          const matchesSearch =
            !searchTerm ||
            `${product.title} ${product.description}`.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
        if (sortBy === 'popular') filtered.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));

        const start = (page - 1) * 12;
        return {
          data: filtered.slice(start, start + 12),
          isDemo: true,
          meta: { total: filtered.length, page, lastPage: Math.max(1, Math.ceil(filtered.length / 12)) },
        };
      }
    },
    staleTime: 1000 * 60 * 2, // Cache 2 menit
  });

  const products = data?.data || [];
  const meta = data?.meta;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header & Banner Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Marketplace Racik Media
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Temukan produk pertanian berkualitas dari vendor terpercaya dengan garansi Escrow.
            </p>
          </div>
          <Link
            href="/seller/products"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Store className="w-4 h-4" />
            Buka Toko / Kelola Produk
          </Link>
        </div>

        {/* Filter & Search Bar Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pupuk, benih, alat panen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Sort Select */}
            <div className="md:col-span-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategori Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {data?.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Produk pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Konten Utama (Grid Produk / Skeletons / State) */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-semibold text-red-900">Gagal Mengambil Data Produk</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {(error as Error)?.message || 'Terjadi gangguan koneksi ke server API.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <PackageX className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchTerm}&quot; atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          /* Grid Produk */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
              >
                {/* Thumbnail Image */}
                <div className="w-full aspect-square relative bg-slate-100 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                  {item.stock <= 0 && (
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      Habis
                    </span>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-base font-bold text-emerald-700 mt-1">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[120px] font-medium text-slate-600">
                      {item.vendor?.storeName || 'Racik Official'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.vendor?.rating ? item.vendor.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Nav */}
        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-slate-600 font-medium">
              Halaman {page} dari {meta.lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
              disabled={page >= meta.lastPage}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Selanjutnya
            </button>
          </div>
        )}

      </div>
    </div>
  );
}