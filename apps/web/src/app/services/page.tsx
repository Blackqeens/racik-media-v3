'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
  RotateCw,
  AlertCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { demoServices } from '@/lib/demo-data';

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priceStartingFrom: number;
  priceUnit: string; // misal: 'per sesi', 'per hektar', 'per proyek'
  coverImage?: string;
  locationArea: string; // misal: 'Seluruh Indonesia (Online)', 'Jawa Barat'
  totalCompletedJobs?: number;
  hasMilestones?: boolean;
  provider: {
    id: string;
    name: string;
    titleExpertise: string; // misal: 'Agronomist Spesialis Nutrisi'
    avatar?: string;
    rating: number;
    isVerified?: boolean;
  };
  createdAt: string;
}

interface ServicesResponse {
  data: ServiceItem[];
  isDemo?: boolean;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Semua Layanan' },
  { id: 'konsultasi', label: 'Konsultasi & Formulasi' },
  { id: 'uji_lab', label: 'Uji Lab & Tanah' },
  { id: 'mekanisasi', label: 'Drone & Mekanisasi' },
  { id: 'greenhouse', label: 'Instalasi Greenhouse' },
  { id: 'pelatihan', label: 'Pelatihan & Pendampingan' },
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch listing layanan via TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery<ServicesResponse>({
    queryKey: ['services-listings', { search: searchTerm, category: selectedCategory, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('page', page.toString());
      params.append('limit', '12');

      try {
        const res = await fetch(`${API_BASE_URL}/services?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Gagal memuat daftar jasa & layanan pertanian');
        }

        return res.json();
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') throw error;

        const filtered = demoServices.filter((service) => {
          const matchesCategory =
            selectedCategory === 'all' || service.category === selectedCategory;
          const matchesSearch =
            !searchTerm ||
            `${service.title} ${service.description}`.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        const start = (page - 1) * 12;
        return {
          data: filtered.slice(start, start + 12),
          isDemo: true,
          meta: { total: filtered.length, page, lastPage: Math.max(1, Math.ceil(filtered.length / 12)) },
        };
      }
    },
    staleTime: 1000 * 60 * 3, // Cache 3 menit
  });

  const services = data?.data || [];
  const meta = data?.meta;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Layanan & Jasa Ahli Pertanian
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pekerjakan praktisi agronomi, operator mekanisasi modern, dan konsultan bergaransi kontrak bertahap (*Milestone Escrow*).
            </p>
          </div>
          <Link
            href="/services/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Tawarkan Jasa Keahlian
          </Link>
        </div>

        {data?.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Jasa pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Filter & Search Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jasa konsultasi tanah, drone, greenhouse..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Kategori Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Konten Utama */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4"
              >
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-semibold text-red-900">Gagal Mengambil Data Layanan</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {(error as Error)?.message || 'Koneksi ke backend service marketplace terputus.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Coba Lagi
            </button>
          </div>
        ) : services.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Layanan Belum Tersedia</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada penyedia jasa aktif untuk kategori atau kata kunci &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          /* Grid Card Layanan */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => (
              <Link
                key={item.id}
                href={`/services/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Cover */}
                  <div className="w-full aspect-[16/10] bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.coverImage || '/placeholder-service.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-sm capitalize">
                      {item.category}
                    </span>
                    {item.hasMilestones !== false && (
                      <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Milestones
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    {/* Provider Info Row */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {item.provider?.name?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.provider?.name || 'Praktisi Agribisnis'}
                          </span>
                          {item.provider?.isVerified !== false && (
                            <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-50 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.provider?.titleExpertise || 'Penyedia Layanan'}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.provider?.rating ? item.provider.rating.toFixed(1) : '5.0'}
                      </div>
                    </div>

                    {/* Judul & Deskripsi */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Card: Harga & Lokasi */}
                <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px]">{item.locationArea || 'Online'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-tight">Mulai dari</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {formatRupiah(item.priceStartingFrom)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">/{item.priceUnit || 'proyek'}</span>
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