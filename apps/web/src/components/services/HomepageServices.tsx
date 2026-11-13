'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Briefcase,
  MapPin,
  Star,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface HomepageServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  priceStartingFrom: number;
  priceUnit: string;
  coverImage: string;
  locationArea: string;
  hasMilestones: boolean;
  totalCompletedJobs: number;
  provider: {
    id: string;
    name: string;
    titleExpertise: string;
    rating: number;
    isVerified: boolean;
  };
}

const SERVICES_DATA: HomepageServiceItem[] = [
  {
    id: 'srv-01-pelatihan-rotan',
    title: 'Pelatihan & Workshop Kriya Anyaman Rotan Tradisi',
    description: 'Bimbingan intensif teknik anyam kriya rotan warisan Cirebon untuk perajin pemula hingga butik desain interior.',
    category: 'pelatihan',
    categoryLabel: 'Pelatihan & Workshop',
    priceStartingFrom: 1500000,
    priceUnit: 'batch / grup',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    locationArea: 'Cirebon & On-Site',
    hasMilestones: true,
    totalCompletedJobs: 32,
    provider: {
      id: 'pro-cirebon',
      name: 'Ki Anom Tegalwangi',
      titleExpertise: 'Master Craftsman Rotan',
      rating: 5.0,
      isVerified: true,
    },
  },
  {
    id: 'srv-02-uji-kopi',
    title: 'Kurasi Cita Rasa & Uji Organoleptik Kopi Nusantara',
    description: 'Sesi cupping profesional untuk menganalisis skor rasa, cacat biji (defect), dan profil sangrai single origin nusantara.',
    category: 'konsultasi',
    categoryLabel: 'Konsultasi & Kurasi',
    priceStartingFrom: 750000,
    priceUnit: 'sesi cupping',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    locationArea: 'Bandung & Online Sample',
    hasMilestones: true,
    totalCompletedJobs: 85,
    provider: {
      id: 'pro-kopi',
      name: 'Ir. Bayu Wicaksono',
      titleExpertise: 'Q Grader & Sensory Specialist',
      rating: 4.9,
      isVerified: true,
    },
  },
  {
    id: 'srv-03-uji-tanah',
    title: 'Pemeriksaan Kesuburan Tanah & Formulasi Pemupukan Presisi',
    description: 'Analisis pH, kandungan NPK, dan mikrobioma tanah dengan rekomendasi racikan bahan organik sesuai jenis tanaman.',
    category: 'uji_lab',
    categoryLabel: 'Uji Lab & Tanah',
    priceStartingFrom: 180000,
    priceUnit: 'sampel lahan',
    coverImage: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a45?w=800&q=80',
    locationArea: 'Jawa & Konsultasi Online',
    hasMilestones: true,
    totalCompletedJobs: 64,
    provider: {
      id: 'pro-agronomi',
      name: 'Dr. Sarah Amalia',
      titleExpertise: 'Pakar Ilmu Tanah & Kesuburan',
      rating: 4.9,
      isVerified: true,
    },
  },
  {
    id: 'srv-04-dokumentasi-umkm',
    title: 'Dokumentasi Visual & Penulisan Narasi Jenama UMKM',
    description: 'Paket fotografi produk autentik dan penyusunan narasi storytelling agar karya lokal memiliki daya pikat ekspor.',
    category: 'dokumentasi',
    categoryLabel: 'Dokumentasi & Media',
    priceStartingFrom: 1200000,
    priceUnit: 'paket narasi',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
    locationArea: 'Seluruh Nusantara',
    hasMilestones: true,
    totalCompletedJobs: 54,
    provider: {
      id: 'pro-media',
      name: 'Kolektif Media Nusantara',
      titleExpertise: 'Dokumentator Budaya & Bisnis',
      rating: 4.8,
      isVerified: true,
    },
  },
  {
    id: 'srv-05-hama-terpadu',
    title: 'Pendampingan Kebun & Pengendalian Hama Terpadu Ramah Hayati',
    description: 'Kunjungan observasi lapangan langsung untuk mendeteksi hama dan menyusun strategi penanganan tanpa insektisida kimia berbahaya.',
    category: 'pelatihan',
    categoryLabel: 'Pendampingan Lahan',
    priceStartingFrom: 350000,
    priceUnit: 'kunjungan',
    coverImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
    locationArea: 'Jabodetabek & Bandung',
    hasMilestones: true,
    totalCompletedJobs: 42,
    provider: {
      id: 'pro-kebun',
      name: 'Tim Racik Agro Edukasi',
      titleExpertise: 'Praktisi Pertanian Berkelanjutan',
      rating: 5.0,
      isVerified: true,
    },
  },
  {
    id: 'srv-06-konsultasi-online',
    title: 'Konsultasi Perawatan Tanaman Sayur & Herbal Skala Rumah',
    description: 'Sesi temu daring 1-on-1 via video call untuk bedah media tanam, intensitas sinar matahari, dan jadwal pemangkasan.',
    category: 'konsultasi',
    categoryLabel: 'Konsultasi Online',
    priceStartingFrom: 75000,
    priceUnit: 'sesi (60 menit)',
    coverImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
    locationArea: 'Seluruh Indonesia (Daring)',
    hasMilestones: false,
    totalCompletedJobs: 110,
    provider: {
      id: 'pro-urban',
      name: 'Rian Pratama, S.P.',
      titleExpertise: 'Konsultan Urban Farming',
      rating: 4.9,
      isVerified: true,
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Semua Layanan' },
  { id: 'konsultasi', label: 'Konsultasi & Kurasi' },
  { id: 'uji_lab', label: 'Uji Lab & Tanah' },
  { id: 'pelatihan', label: 'Pelatihan & Lahan' },
  { id: 'dokumentasi', label: 'Dokumentasi & Media' },
];

/**
 * HomepageServices — Page section layanan & service provider khusus homepage.
 * Mengadopsi arsitektur, layout, filter, dan data model dari `apps/web/src/app/services/page.tsx`
 * dan `apps/web/src/app/service-provider/dashboard/page.tsx`.
 */
export function HomepageServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        `${item.title} ${item.description} ${item.provider.name} ${item.provider.titleExpertise} ${item.locationArea}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="services-showcase" className="w-full px-4 sm:px-6 lg:px-10 py-12 bg-white">
      {/* Header & Sub-header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Layanan Ahli & Jasa Kreatif
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Kontrak Bertahap (*Milestone*)
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Penyedia Jasa & Praktisi Terpercaya
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1 max-w-2xl">
            Pekerjakan agronomis, kurator cita rasa, master perajin kriya, dan tim dokumentasi
            karya lokal dengan perlindungan pembayaran rekening bersama.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/service-provider/dashboard"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Tawarkan Jasa Keahlian
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>Semua Layanan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar (Sesuai Services Page) */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 mb-8 space-y-4">
        {/* Input Pencarian */}
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari konsultasi tanah, pelatihan rotan, kurasi kopi, dokumentasi UMKM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        {/* Kategori Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layanan Jasa */}
      {filteredServices.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
          <Briefcase className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-gray-800">Layanan Belum Ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tidak ada penyedia jasa yang cocok dengan kata kunci &quot;{searchTerm}&quot; pada kategori yang
            dipilih.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filter Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((item) => (
            <Link
              key={item.id}
              href={`/services/${item.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div>
                {/* Cover Image — Bersih Tanpa Badge Penutup Gambar */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  {/* Provider Profile Row */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {item.provider.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.provider.name}
                        </span>
                        {item.provider.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-50 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">
                        {item.provider.titleExpertise}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-600 text-xs font-bold shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {item.provider.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Judul & Deskripsi Layanan */}
                  <div>
                    <h3 className="font-serif text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Lokasi & Tarif */}
              <div className="p-4 pt-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate max-w-[130px]">{item.locationArea}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block leading-tight">Mulai dari</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {formatRupiah(item.priceStartingFrom)}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1">/{item.priceUnit}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Banner Ajakan Bergabung Mitra Penyedia Jasa */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-emerald-300 font-semibold bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
            <UserCheck className="h-3.5 w-3.5" />
            Peluang Kemitraan Keahlian
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            Anda praktisi pertanian, kurator produk, atau kriya daerah?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            Tawarkan jasa konsultasi, pendampingan, atau workshop Anda kepada jaringan pelaku
            usaha tani dan UMKM di seluruh Nusantara dengan jaminan escrow milestone.
          </p>
        </div>
        <Link
          href="/service-provider/dashboard"
          className="shrink-0 px-6 py-3 rounded-xl bg-white text-emerald-900 font-semibold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
        >
          Gabung Jadi Penyedia Jasa
        </Link>
      </div>
    </section>
  );
}

