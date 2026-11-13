'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Eye,
  FileCheck2,
  Globe,
  Image as ImageIcon,
  Newspaper,
  PackageSearch,
  PenLine,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  EditorialArchiveItem,
  analyzeWritingAndImage,
  useEditorialArchive,
} from '@/lib/editorial-archive';
import { EditorialReviewModal } from '@/components/moderation/EditorialReviewModal';

type ArchiveFilterTab =
  | 'all'
  | 'article'
  | 'event'
  | 'product_description'
  | 'pending';

const ARCHIVE_TABS: { id: ArchiveFilterTab; label: string }[] = [
  { id: 'all', label: 'Semua Arsip Tulisan' },
  { id: 'article', label: 'Artikel & Jurnal' },
  { id: 'event', label: 'Koleksi Event' },
  { id: 'product_description', label: 'Deskripsi Produk Seller & Distributor' },
  { id: 'pending', label: 'Perlu Analisis / Revisi' },
];

const SOURCE_ROLE_BADGE: Record<string, { label: string; className: string }> = {
  author: {
    label: 'Role: Author',
    className: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  member: {
    label: 'Role: Member',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  seller: {
    label: 'Role: Seller',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  distributor: {
    label: 'Role: Distributor',
    className: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  service_provider: {
    label: 'Role: Penyedia Jasa',
    className: 'bg-sky-50 text-sky-800 border-sky-200',
  },
};

export default function ModerationPage() {
  const { items, updateItem, resetAll } = useEditorialArchive();
  const [activeTab, setActiveTab] = useState<ArchiveFilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditorialArchiveItem | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const publishedHomepage = items.filter((i) => i.publishedToHomepage).length;
    const articlesCount = items.filter((i) => i.entityType === 'article').length;
    const eventsCount = items.filter((i) => i.entityType === 'event').length;
    const productsCount = items.filter((i) => i.entityType === 'product_description').length;
    const pendingCount = items.filter(
      (i) => !i.writingVerified || !i.imageThemeVerified || i.status !== 'published_homepage',
    ).length;

    return {
      total,
      publishedHomepage,
      articlesCount,
      eventsCount,
      productsCount,
      pendingCount,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'article' && item.entityType !== 'article') return false;
      if (activeTab === 'event' && item.entityType !== 'event') return false;
      if (
        activeTab === 'product_description' &&
        item.entityType !== 'product_description'
      ) {
        return false;
      }
      if (
        activeTab === 'pending' &&
        item.writingVerified &&
        item.imageThemeVerified &&
        item.publishedToHomepage
      ) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = `${item.title} ${item.excerpt} ${item.body} ${item.submitterName} ${item.categoryLabel} ${item.sourceRole}`
          .toLowerCase()
          .includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [items, activeTab, searchTerm]);

  function handleCreateNewArchive(entityType: 'article' | 'event' | 'product_description') {
    const nowId = `${entityType}-${Date.now().toString().slice(-5)}`;
    const newItem: EditorialArchiveItem = {
      id: nowId,
      slug: nowId,
      entityType,
      sourceRole:
        entityType === 'product_description'
          ? 'seller'
          : entityType === 'event'
            ? 'service_provider'
            : 'author',
      submitterName: 'Redaksi Moderator Racik',
      submitterOrigin: 'Nusantara',
      title:
        entityType === 'article'
          ? 'Judul Artikel Baru — Silakan Tulis & Analisis'
          : entityType === 'event'
            ? 'Agenda Kegiatan / Workshop Baru Nusantara'
            : 'Nama Produk Seller / Distributor Baru',
      excerpt:
        'Tuliskan ringkasan minimal 40 karakter yang menjelaskan inti bahasan secara lugas agar siap tampil di halaman Homepage.',
      body: 'Tuliskan uraian lengkap naskah artikel, agenda pelaksanaan acara, atau spesifikasi deskripsi produk seller/distributor sesuai standar skema penulisan publik Racik Media Nusantara.',
      category:
        entityType === 'article'
          ? 'Pertanian'
          : entityType === 'event'
            ? 'webinar'
            : 'hasil_tani',
      categoryLabel:
        entityType === 'article'
          ? 'Pertanian & Pangan'
          : entityType === 'event'
            ? 'Webinar Online'
            : 'Hasil Panen & Rempah',
      contentType: 'article',
      eventType: 'online',
      location: 'Zoom Meeting Interaktif',
      eventDate: new Date().toISOString(),
      startTime: '09:00 WIB',
      endTime: '12:00 WIB',
      price: 0,
      maxAttendees: 200,
      registeredAttendeesCount: 0,
      productPrice: 45000,
      stock: 50,
      soldCount: 10,
      rating: 4.9,
      badge: 'Terkurasi Moderator',
      publishedAt: new Date().toISOString(),
      readTimeMinutes: 5,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
      status: 'pending_review',
      publishedToHomepage: false,
      writingVerified: false,
      imageThemeVerified: false,
    };
    updateItem(newItem);
    const opened = window.open(
      `/admin/moderation/review/${encodeURIComponent(newItem.id)}`,
      '_blank',
      'noopener,noreferrer',
    );
    if (!opened) {
      setEditingItem(newItem);
    }
  }

  function handleToggleHomepagePublish(item: EditorialArchiveItem) {
    if (!item.publishedToHomepage) {
      // Jika belum lolos verifikasi penulisan/gambar, buka modal analisis terlebih dahulu
      if (!item.writingVerified || !item.imageThemeVerified) {
        setEditingItem(item);
        return;
      }
      updateItem({
        ...item,
        status: 'published_homepage',
        publishedToHomepage: true,
      });
    } else {
      updateItem({
        ...item,
        status: 'approved',
        publishedToHomepage: false,
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Dashboard Moderator — Murni Animasi CSS Ringan (Tanpa Gambar), Berjalan Slow & Langsung Aktif */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-indigo-300/60 p-6 sm:p-7 text-white shadow-xl">
        {/* Cahaya Aurora CSS Mengambang Slow (Murni CSS, Sangat Ringan) */}
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
        />
        {/* Pola Titik CSS Bergerak Halus (Slow Drift) */}
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-sm">
              Pusat Pengelolaan Arsip Tulisan, Event &amp; Deskripsi Produk
            </h1>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Seluruh role (<strong className="text-amber-200">Author, Member, Seller, Distributor, Penyedia Jasa</strong>) wajib patuh pada skema penulisan publik. Role Moderator memegang kendali penuh untuk <strong className="text-white underline decoration-amber-400/80 underline-offset-2">membaca naskah, menganalisis kebenaran penulisan, memeriksa kesesuaian gambar dengan tema, mengedit isi</strong>, serta <strong className="text-emerald-300">mempublikasikannya ke Homepage</strong>.
            </p>
          </div>

          {/* Tombol Fungsi: Koleksi Artikel & Koleksi Event di atas (Warna Putih), Lihat Live Homepage di bawahnya sejajar (Tanpa Frame) */}
          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/articles"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-indigo-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <Newspaper className="h-4 w-4 text-indigo-700 shrink-0" />
                <span>Koleksi Artikel</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-indigo-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <Calendar className="h-4 w-4 text-indigo-700 shrink-0" />
                <span>Koleksi Event</span>
              </Link>
            </div>
            <Link
              href="/?mode=live-preview&from=/admin/moderation"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg transition whitespace-nowrap"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span>Lihat Live Homepage (Mode Preview)</span>
            </Link>
          </div>
        </div>

        {/* Baris Keterangan Statistik Arsip — Tanpa Frame Kotak, Satu Baris Rata & Seimbang */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-5 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Total Arsip Tulisan
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {stats.total}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 whitespace-nowrap">
              Tayang di Homepage
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              {stats.publishedHomepage}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('article')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Artikel &amp; Jurnal
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {stats.articlesCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Koleksi Event
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {stats.eventsCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('product_description')}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Deskripsi Seller/Distributor
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {stats.productsCount}
            </p>
          </button>
        </div>
      </div>

      {/* Panduan 3 Pilar Verifikasi Wajib Moderator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              1. Baca &amp; Analisis Tata Tulis
            </h3>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              Periksa kejelasan judul, kelengkapan deskripsi, dan kebenaran kaidah penulisan dari setiap role sebelum disetujui.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
              2. Verifikasi Gambar Sesuai Tema
            </h3>
            <p className="mt-1 text-xs text-sky-800 leading-relaxed">
              Pastikan foto/ilustrasi yang diajukan Author, Seller, atau Distributor benar-benar relevan dengan tema konten.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
            <PenLine className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
              3. Edit &amp; Publikasikan ke Homepage
            </h3>
            <p className="mt-1 text-xs text-purple-800 leading-relaxed">
              Moderator dapat langsung menyunting isi artikel, event, maupun deskripsi produk lalu menayangkannya ke Homepage.
            </p>
          </div>
        </div>
      </div>

      {/* Bar Pencarian, Filter Kategori Arsip, & Tombol Tambah */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul artikel, event, deskripsi produk seller/distributor..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-xs sm:text-sm focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCreateNewArchive('article')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              + Artikel
            </button>
            <button
              type="button"
              onClick={() => handleCreateNewArchive('event')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-bold text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              + Event
            </button>
            <button
              type="button"
              onClick={() => handleCreateNewArchive('product_description')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-bold text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              + Deskripsi Produk
            </button>
            <button
              type="button"
              onClick={resetAll}
              title="Kembalikan ke data arsip awal"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Default
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ARCHIVE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Item Arsip Tulisan */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const analysis = analyzeWritingAndImage(item);
          const roleBadge =
            SOURCE_ROLE_BADGE[item.sourceRole] ?? SOURCE_ROLE_BADGE.member;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:border-indigo-300 transition flex flex-col lg:flex-row gap-4 lg:items-center justify-between"
            >
              {/* Kiri: Thumbnail Gambar + Info Naskah */}
              <div className="flex flex-col sm:flex-row gap-4 min-w-0 flex-1">
                <div className="relative h-28 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.entityType === 'article'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.entityType === 'event'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {item.entityType === 'article'
                        ? 'Artikel / Jurnal'
                        : item.entityType === 'event'
                          ? 'Event & Pelatihan'
                          : 'Deskripsi Produk'}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${roleBadge.className}`}
                    >
                      {roleBadge.label}
                    </span>

                    <span className="text-xs font-semibold text-gray-600">
                      Oleh: <strong>{item.submitterName}</strong>
                      {item.submitterOrigin ? ` (${item.submitterOrigin})` : ''}
                    </span>

                    {item.publishedToHomepage ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        <Globe className="h-3 w-3" />
                        Tayang di Homepage
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                        <AlertTriangle className="h-3 w-3" />
                        Arsip / Belum Tayang Homepage
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-base font-bold text-gray-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>

                  {/* Bar Indikator Hasil Analisis Penulisan & Gambar */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        item.writingVerified ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.writingVerified
                        ? 'Penulisan Terverifikasi'
                        : 'Penulisan Perlu Dicek'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        item.imageThemeVerified ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      {item.imageThemeVerified
                        ? 'Gambar Sesuai Tema'
                        : 'Gambar Belum Diverifikasi'}
                    </span>
                    <span className="text-gray-400">
                      Skor Skema: <strong>{analysis.score}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanan: Tombol Aksi Moderator */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                <a
                  href={`/admin/moderation/review/${encodeURIComponent(item.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                  title="Buka Mode Peninjauan Penuh & Referensi Lintas Role di Tab Baru"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Baca, Analisis &amp; Edit (Tab Baru)
                  <ExternalLink className="h-3 w-3 opacity-85" />
                </a>

                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-700 transition"
                  title="Sunting cepat via jendela modal"
                >
                  Modal
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleHomepagePublish(item)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    item.publishedToHomepage
                      ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {item.publishedToHomepage ? 'Tarik dari Homepage' : 'Publik ke Homepage'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Baca, Analisis & Edit Moderator */}
      {editingItem && (
        <EditorialReviewModal
          item={editingItem}
          allArchiveItems={items}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => updateItem(updated)}
        />
      )}
    </div>
  );
}
