'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileEdit,
  LayoutDashboard,
  Layers,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import {
  ManagedServiceItem,
  SERVICE_CATEGORY_OPTIONS,
  useManagedServices,
} from '@/lib/service-provider-store';
import { ServiceManagementModal } from '@/components/services/ServiceManagementModal';
import { useCurrentActiveRole } from '@/lib/active-role';
import { useMemberBookmarks } from '@/lib/bookmarks-store';
import {
  applySalesAlgorithm,
  useAlgorithmSettings,
} from '@/lib/algorithm-settings-store';

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Semua Layanan' },
  ...SERVICE_CATEGORY_OPTIONS,
];

const FALLBACK_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80';

export default function ServicesPage() {
  const activeRole = useCurrentActiveRole();
  const canManageServices =
    activeRole === 'service-provider' || activeRole === 'master_admin';

  const { services, upsertService } = useManagedServices();
  const { isBookmarked, toggleBookmark } = useMemberBookmarks();
  const { settings } = useAlgorithmSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingService, setEditingService] = useState<ManagedServiceItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const activeServices = useMemo(() => {
    const filtered = services.filter((item) => {
      if (item.status !== 'active') return false;
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !searchTerm.trim() ||
        `${item.title} ${item.shortSummary} ${item.description} ${item.fullAddress} ${item.locationArea} ${item.provider.name} ${item.provider.titleExpertise}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return applySalesAlgorithm(filtered, settings, {
      getId: (s) => s.id,
      getTitle: (s) => s.title,
      getDescription: (s) => s.shortSummary || s.description,
      getStoreName: (s) => s.provider.name,
      getRating: (s) => s.provider.rating ?? 4.8,
      getPopularityScore: (s) => s.totalCompletedJobs ?? 20,
    });
  }, [services, selectedCategory, searchTerm, settings]);

  // Batas etalase per halaman (default 50 sesuai instruksi & pengaturan algoritma AI Master Admin)
  const pageSize = settings.pageSize || 50;
  const totalPages = Math.max(1, Math.ceil(activeServices.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  // Potongan jasa per halaman etalase (tanpa duplikasi antar halaman)
  const paginatedServices = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return activeServices.slice(start, start + pageSize);
  }, [activeServices, validPage, pageSize]);

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  }

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header Layanan & Jasa — Tema & Animasi Seragam dengan Dashboard Lainnya */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-sky-300/60 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Layanan &amp; Jasa Ahli Pertanian / UMKM
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                {canManageServices
                  ? 'Pekerjakan praktisi agronomi, instruktur kriya, kurator kopi, dan konsultan bergaransi kontrak bertahap (Milestone Escrow). Gunakan tombol di samping untuk mengelola jasa Anda.'
                  : 'Temukan dan pesan layanan praktisi ahli terverifikasi dengan jaminan kontrak bertahap (Milestone Escrow). Punya keahlian? Ajukan aktivasi menjadi Penyedia Jasa.'}
              </p>
            </div>

            {canManageServices ? (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/service-provider/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 text-slate-900 text-xs font-extrabold shadow-md transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-700" />
                  Dashboard Penyedia Jasa
                </Link>
                <Link
                  href="/service-provider/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-lg transition"
                >
                  <Wrench className="w-4 h-4" />
                  Kelola Jasa Saya
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Tawarkan / Tambah Jasa Baru
                </button>
              </div>
            ) : (
              <div className="shrink-0">
                <Link
                  href="/services/apply"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-white bg-white hover:bg-sky-50 text-slate-900 text-xs sm:text-sm font-extrabold shadow-lg transition"
                >
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Tawarkan Jasa Mu</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jasa konsultasi tanah, pelatihan rotan, kurasi kopi, alamat kota/kabupaten..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Card Layanan — Tampilan Gambar Bersih (Tanpa Badge Penutup Gambar) */}
        {activeServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Layanan Belum Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada penyedia jasa aktif untuk kategori atau kata kunci &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedServices.map((item) => {
              const followed = isBookmarked('service_provider', item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Gambar Bersih — Klik Gambar = Lihat Detail */}
                    <Link
                      href={`/services/${encodeURIComponent(item.id)}`}
                      className="block w-full aspect-[16/10] bg-slate-100 overflow-hidden relative cursor-pointer"
                      title={`Lihat detail jasa: ${item.title}`}
                    >
                      <img
                        src={item.coverImage || FALLBACK_SERVICE_IMAGE}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_SERVICE_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {item.provider.name.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {item.provider.name}
                            </span>
                            {item.provider.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {item.provider.titleExpertise}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.provider.rating.toFixed(1)}
                        </div>
                      </div>

                      {/* Judul & Deskripsi Jasa — Klik = Lihat Detail */}
                      <Link
                        href={`/services/${encodeURIComponent(item.id)}`}
                        className="block group/link cursor-pointer space-y-1"
                        title={`Lihat detail jasa: ${item.title}`}
                      >
                        <h3 className="text-sm font-bold text-slate-900 group-hover/link:text-sky-700 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 group-hover/link:text-slate-700 line-clamp-2 leading-relaxed">
                          {item.shortSummary || item.description}
                        </p>
                      </Link>

                      {/* Alamat & Durasi Jasa — Klik = Lihat Detail */}
                      <Link
                        href={`/services/${encodeURIComponent(item.id)}`}
                        className="block rounded-xl bg-slate-50 hover:bg-sky-50/70 p-2.5 border border-slate-100 hover:border-sky-200 transition space-y-1 text-[11px] text-slate-600 cursor-pointer"
                        title="Lihat detail alamat & informasi pengerjaan"
                      >
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong>Alamat:</strong> {item.fullAddress || item.locationArea}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.durationEstimate}</span>
                        </p>
                      </Link>
                    </div>
                  </div>

                  {/* Footer Card: Untuk Member hanya Detail & Pesan + Bookmark (tidak bisa edit) */}
                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500 truncate max-w-[140px]">
                        {item.locationArea}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block leading-tight">
                          Mulai dari
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {formatRupiah(item.priceStartingFrom)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">/{item.priceUnit}</span>
                      </div>
                    </div>

                    {canManageServices ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingService(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-2 text-xs font-bold text-sky-800 transition"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          Kelola Jasa (Tulis / Gambar / Alamat)
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/services/${encodeURIComponent(item.id)}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          Lihat Detail &amp; Pesan Jasa
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            toggleBookmark({
                              category: 'service_provider',
                              targetId: item.id,
                              title: `${item.provider.name} — ${item.title}`,
                              subtitle: `Penyedia Jasa • ${item.categoryLabel} (${item.locationArea})`,
                              href: `/services/${encodeURIComponent(item.id)}`,
                            })
                          }
                          title={
                            followed
                              ? 'Hapus penanda penyedia jasa'
                              : 'Follow / Tandai Penyedia Jasa ke Bookmark'
                          }
                          className={`rounded-xl border p-2 transition ${followed
                              ? 'border-sky-500 bg-sky-50 text-sky-700'
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                          <Bookmark className={`w-4 h-4 ${followed ? 'fill-sky-600' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigasi Etalase Jasa (< . 2 . 3 . 4 . 5 . 6 >) dengan Pembatasan 50 Jasa per Etalase */}
        {activeServices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Menampilkan{' '}
              <strong className="text-slate-900">
                {(validPage - 1) * pageSize + 1} - {Math.min(validPage * pageSize, activeServices.length)}
              </strong>{' '}
              dari <strong className="text-slate-900">{activeServices.length}</strong> jasa terkurasi • Halaman{' '}
              <strong className="text-sky-700">{validPage}</strong> dari {totalPages}
              <span className="hidden md:inline ml-1 text-slate-400">
                (Dibatasi {pageSize} etalase per halaman • Bebas duplikasi toko &amp; produk)
              </span>
            </div>

            <nav
              aria-label="Navigasi Halaman Etalase Jasa"
              className="inline-flex items-center gap-1 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm text-xs font-bold"
            >
              <button
                type="button"
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage <= 1}
                aria-label="Halaman Sebelumnya"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition ${
                  validPage <= 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === validPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-xl transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-sky-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage >= totalPages}
                aria-label="Halaman Berikutnya"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition ${
                  validPage >= totalPages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {canManageServices && (editingService || isAddingNew) && (
        <ServiceManagementModal
          initialItem={editingService}
          onClose={() => {
            setEditingService(null);
            setIsAddingNew(false);
          }}
          onSave={(saved) => {
            upsertService(saved);
            setEditingService(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
}
