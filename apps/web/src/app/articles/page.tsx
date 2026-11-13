'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Image as ImageIcon,
  Newspaper,
  PenLine,
  Search,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react';
import {
  EditorialArchiveItem,
  useEditorialArchive,
} from '@/lib/editorial-archive';
import { EditorialReviewModal } from '@/components/moderation/EditorialReviewModal';
import { useCurrentActiveRole } from '@/lib/active-role';
import { useMemberBookmarks } from '@/lib/bookmarks-store';
import {
  applySalesAlgorithm,
  useAlgorithmSettings,
} from '@/lib/algorithm-settings-store';
import { REGIONAL_ARTICLES_CATALOG } from '@/lib/articles-regional-catalog';

const FALLBACK_ARTICLE_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80';

const CONTENT_TYPES = [
  { value: '', label: 'Semua Tipe' },
  { value: 'article', label: 'Artikel' },
  { value: 'paper', label: 'Paper / Riset' },
  { value: 'journal', label: 'Jurnal' },
  { value: 'story', label: 'Kisah Komunitas' },
] as const;

export default function ArticlesPage() {
  const activeRole = useCurrentActiveRole();
  const { items: archiveItems, canPublishToHomepage, updateItem } = useEditorialArchive();
  const { isBookmarked, toggleBookmark } = useMemberBookmarks();
  const { settings } = useAlgorithmSettings();

  const isModeratorOrMaster =
    canPublishToHomepage || activeRole === 'moderator' || activeRole === 'master_admin';

  const [search, setSearch] = useState('');
  const [contentType, setContentType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<EditorialArchiveItem | null>(null);

  const articles = useMemo(() => {
    const coreArticles = archiveItems.filter((item) => item.entityType === 'article');
    const seenIds = new Set(coreArticles.map((a) => a.id));
    const combined = [
      ...coreArticles,
      ...REGIONAL_ARTICLES_CATALOG.filter((r) => !seenIds.has(r.id)),
    ];

    const filtered = combined.filter((item) => {
      const matchesType = !contentType || item.contentType === contentType;
      const matchesSearch =
        !search ||
        `${item.title} ${item.excerpt} ${item.body} ${item.submitterName} ${item.submitterOrigin ?? ''} ${item.categoryLabel}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });

    return applySalesAlgorithm(filtered, settings, {
      getId: (a) => a.id,
      getTitle: (a) => a.title,
      getDescription: (a) => a.excerpt || a.body,
      getStoreName: (a) => a.submitterName,
      getRating: (a) => a.rating ?? (a.writingVerified && a.imageThemeVerified ? 4.9 : 4.6),
      getPopularityScore: (a) => a.soldCount ?? 60,
    });
  }, [archiveItems, contentType, search, settings]);

  const pageSize = settings.pageSize || 50;
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedArticles = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return articles.slice(start, start + pageSize);
  }, [articles, validPage, pageSize]);

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header Artikel & Jurnal — Tema & Animasi Seragam dengan Dashboard Lainnya */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-emerald-300/60 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Koleksi Artikel &amp; Jurnal Nusantara
              </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              {isModeratorOrMaster
                ? 'Seluruh artikel wajib lulus analisis tata penulisan dan kesesuaian gambar tema oleh Role Moderator sebelum dipublikasikan ke halaman Homepage.'
                : 'Baca seluruh artikel, jurnal riset, dan kisah komunitas daerah yang telah dikurasi dan ditayangkan secara aman.'}
            </p>
          </div>

          {isModeratorOrMaster && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-lg transition"
              >
                <ClipboardCheck className="h-4 w-4 text-indigo-700" />
                Panel Arsip Moderator
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bar Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Cari judul artikel, penulis, kategori..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-xs sm:text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-44 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value);
              setCurrentPage(1);
            }}
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Link
            href="/articles/write"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white whitespace-nowrap transition"
          >
            <PenLine className="h-3.5 w-3.5" />
            Tulis Ide &amp; Cerita MU
          </Link>
        </div>
      </div>

      {/* Grid Koleksi Artikel */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <p>
          Menampilkan{' '}
          <strong>
            {articles.length === 0 ? 0 : (validPage - 1) * pageSize + 1} -{' '}
            {Math.min(validPage * pageSize, articles.length)}
          </strong>{' '}
          dari <strong>{articles.length}</strong> artikel siap baca (Halaman{' '}
          <strong className="text-emerald-700">{validPage}</strong> dari {totalPages})
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Artikel Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada artikel yang cocok dengan pencarian &quot;{search}&quot; atau tipe konten yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((item) => {
            const saved = isBookmarked('article', item.id);
            const detailHref = `/articles/${item.slug}`;
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-emerald-300 hover:shadow-md transition"
              >
                <div>
                  <Link
                    href={detailHref}
                    title={`Baca detail artikel: ${item.title}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden bg-gray-100"
                  >
                    <img
                      src={item.image || FALLBACK_ARTICLE_IMAGE}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_ARTICLE_IMAGE;
                      }}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-4 space-y-2.5">
                    <Link
                      href={detailHref}
                      title={`Baca selengkapnya: ${item.title}`}
                      className="block space-y-1.5 group/title"
                    >
                      <h3 className="font-serif text-base font-bold text-gray-900 group-hover/title:text-emerald-700 line-clamp-2 leading-snug transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </Link>

                    {/* Kolom Penulis — Keterangan Kategori & Asal Daerah */}
                    <Link
                      href={detailHref}
                      title={`Lihat artikel oleh ${item.submitterName}`}
                      className="block rounded-xl bg-slate-50 p-2.5 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 space-y-1 text-[11px] text-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 truncate">
                          <UserRound className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          Penulis: {item.submitterName}
                        </span>
                        <span className="uppercase font-bold text-emerald-700 shrink-0">
                          {item.contentType ?? 'article'}
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Tag className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Kategori: {item.categoryLabel}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>
                          Estimasi baca {item.readTimeMinutes ?? 5} menit
                          {item.submitterOrigin ? ` • ${item.submitterOrigin}` : ''}
                        </span>
                      </p>
                    </Link>

                    {isModeratorOrMaster && (
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            item.writingVerified ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.writingVerified ? 'Tulisan Lolos' : 'Cek Tulisan'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            item.imageThemeVerified ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          {item.imageThemeVerified ? 'Gambar Sesuai' : 'Cek Gambar'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Kartu: Role Member hanya Baca & Bookmark (tidak bisa edit karya orang lain) */}
                <div className="border-t border-gray-100 bg-gray-50/70 p-3 flex items-center justify-between gap-2">
                  {isModeratorOrMaster ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Analisis, Edit &amp; Publik
                      </button>
                      <Link
                        href={detailHref}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition"
                      >
                        <Newspaper className="h-3.5 w-3.5" />
                        Baca
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={detailHref}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Baca Artikel Lengkap
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          toggleBookmark({
                            category: 'article',
                            targetId: item.id,
                            title: item.title,
                            subtitle: `Artikel • Kategori: ${item.categoryLabel} • Oleh: ${item.submitterName}`,
                            href: detailHref,
                          })
                        }
                        title={saved ? 'Hapus dari Bookmark' : 'Simpan artikel ke Bookmark'}
                        className={`rounded-xl border p-2 transition ${
                          saved
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${saved ? 'fill-emerald-600' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navbar / Navigasi Etalase Artikel (< . 2 . 3 . 4 . 5 . 6 >) dengan Pembatasan 50 Artikel per Halaman */}
      {articles.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Menampilkan{' '}
            <strong className="text-slate-900">
              {(validPage - 1) * pageSize + 1} - {Math.min(validPage * pageSize, articles.length)}
            </strong>{' '}
            dari <strong className="text-slate-900">{articles.length}</strong> artikel terkurasi • Halaman{' '}
            <strong className="text-emerald-700">{validPage}</strong> dari {totalPages}
            <span className="hidden md:inline ml-1 text-slate-400">
              (Dibatasi {pageSize} etalase per halaman • Bebas duplikasi penulis &amp; naskah)
            </span>
          </div>

          <nav
            aria-label="Navigasi Halaman Etalase Artikel"
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
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
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
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
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
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}

      {isModeratorOrMaster && editingItem && (
        <EditorialReviewModal
          item={editingItem}
          canPublishHomepage={canPublishToHomepage}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => updateItem(updated)}
        />
      )}
      </div>
    </div>
  );
}
