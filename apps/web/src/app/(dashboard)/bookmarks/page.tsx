'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  FileEdit,
  Heart,
  PenLine,
  RotateCcw,
  Sparkles,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { useEditorialArchive } from '@/lib/editorial-archive';
import {
  useMemberBookmarks,
  type BookmarkCategory,
  type MemberBookmarkEntry,
} from '@/lib/bookmarks-store';

interface ApiBookmarkItem {
  id: string;
  entity_type: 'content_item' | 'catalog_item';
  entity_id: string;
  title: string;
  slug?: string;
  created_at: string;
}

type BookmarkFilterTab = 'all' | 'article' | 'followed_partner' | 'drafts';

export default function BookmarksPage() {
  const { session } = useAuth();
  const { bookmarks, removeBookmark, resetBookmarks } = useMemberBookmarks();
  const { items: archiveItems } = useEditorialArchive();

  const [activeTab, setActiveTab] = useState<BookmarkFilterTab>('all');
  const [localEditorDraft, setLocalEditorDraft] = useState<{
    title: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.localStorage.getItem('article-draft-title') ?? '';
    const c = window.localStorage.getItem('article-draft-content') ?? '';
    if (t.trim() || c.trim()) {
      setLocalEditorDraft({ title: t.trim(), content: c.trim() });
    } else {
      setLocalEditorDraft(null);
    }
  }, []);

  const { data } = useQuery({
    queryKey: ['bookmarks'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: ApiBookmarkItem[]; total: number }>('/users/me/bookmarks', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  // Gabungkan bookmark API dengan penanda lokal serbaguna (tanpa duplikasi)
  const allBookmarks = useMemo(() => {
    const apiList: MemberBookmarkEntry[] = (data?.data?.items ?? []).map((b) => ({
      id: b.id,
      category: (b.entity_type === 'content_item' ? 'article' : 'seller_store') as BookmarkCategory,
      targetId: b.entity_id,
      title: b.title,
      subtitle:
        b.entity_type === 'content_item'
          ? 'Artikel Tersimpan'
          : 'Produk / Toko Seller Tersimpan',
      href:
        b.entity_type === 'content_item'
          ? `/articles/${b.slug ?? b.entity_id}`
          : `/marketplace/${b.entity_id}`,
      createdAt: b.created_at,
    }));

    const seen = new Set(bookmarks.map((b) => `${b.category}:${b.targetId}`));
    return [
      ...bookmarks,
      ...apiList.filter((a) => !seen.has(`${a.category}:${a.targetId}`)),
    ];
  }, [bookmarks, data?.data?.items]);

  const articleBookmarks = useMemo(
    () => allBookmarks.filter((b) => b.category === 'article'),
    [allBookmarks],
  );

  const followedPartners = useMemo(
    () =>
      allBookmarks.filter(
        (b) =>
          b.category === 'seller_store' ||
          b.category === 'distributor_hub' ||
          b.category === 'service_provider',
      ),
    [allBookmarks],
  );

  // Draf tulisan & karya Member dari editor maupun arsip kontribusi Member
  const memberWritingDrafts = useMemo(() => {
    return archiveItems.filter((item) => item.sourceRole === 'member');
  }, [archiveItems]);

  const totalDraftsCount =
    memberWritingDrafts.length + (localEditorDraft ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Header Bookmark Serbaguna — Tema & Animasi Seragam dengan Dashboard Lainnya */}
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

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
              Bookmark, Follow Toko/Mitra &amp; Draf Tulisan Saya
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Simpan bacaan artikel favorit, tandai / ikuti (<em>follow</em>) toko Seller, Distributor, maupun Penyedia Jasa pilihan Anda, serta lanjutkan draf tulisan yang pernah Anda buat.
            </p>
          </div>

          <button
            type="button"
            onClick={resetBookmarks}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-lg shrink-0 transition"
            title="Muat ulang penanda contoh"
          >
            <RotateCcw className="h-3.5 w-3.5 text-emerald-700" />
            Reset Contoh Penanda
          </button>
        </div>
      </div>

      {/* Tab Layer Penanda */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {[
          {
            id: 'all' as const,
            label: `Semua Penanda (${allBookmarks.length + totalDraftsCount})`,
          },
          {
            id: 'followed_partner' as const,
            label: `Follow Toko Seller, Distributor & Jasa (${followedPartners.length})`,
          },
          {
            id: 'article' as const,
            label: `Artikel & Bacaan Ditandai (${articleBookmarks.length})`,
          },
          {
            id: 'drafts' as const,
            label: `Draf Tulisan Member (${totalDraftsCount})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. PENANDA TOKO SELLER, DISTRIBUTOR & PENYEDIA JASA (FOLLOW) */}
      {(activeTab === 'all' || activeTab === 'followed_partner') && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                Penanda Toko Seller, Distributor &amp; Penyedia Jasa yang Diikuti (Follow)
              </h2>
              <p className="text-xs text-slate-500">
                Toko dan praktisi jasa yang Anda tandai agar mudah dipantau dan dikunjungi kembali.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/marketplace"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Cari Toko →
              </Link>
              <Link
                href="/services"
                className="text-xs font-bold text-sky-700 hover:underline"
              >
                Cari Jasa →
              </Link>
            </div>
          </div>

          {followedPartners.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada toko Seller, Distributor, atau Penyedia Jasa yang Anda ikuti. Klik ikon Bookmark di halaman Marketplace atau Jasa untuk menandai mitra favorit.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followedPartners.map((item) => {
                const isSeller = item.category === 'seller_store';
                const isDistributor = item.category === 'distributor_hub';
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-start justify-between gap-3 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                          isSeller
                            ? 'bg-amber-500'
                            : isDistributor
                              ? 'bg-cyan-600'
                              : 'bg-sky-600'
                        }`}
                      >
                        {isSeller ? (
                          <Store className="h-5 w-5" />
                        ) : isDistributor ? (
                          <Truck className="h-5 w-5" />
                        ) : (
                          <BriefcaseBusiness className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isSeller
                              ? 'bg-amber-100 text-amber-900'
                              : isDistributor
                                ? 'bg-cyan-100 text-cyan-900'
                                : 'bg-sky-100 text-sky-900'
                          }`}
                        >
                          {isSeller
                            ? 'Follow Toko Seller'
                            : isDistributor
                              ? 'Follow Distributor'
                              : 'Follow Penyedia Jasa'}
                        </span>
                        <Link
                          href={item.href}
                          className="block text-sm font-bold text-slate-900 hover:text-emerald-700 truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{item.subtitle}</p>
                        {item.note && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            Catatan: {item.note}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Ditandai {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white"
                      >
                        Kunjungi <ArrowRight className="h-3 w-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeBookmark(item.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600"
                        title="Berhenti mengikuti / hapus penanda"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 2. DRAF TULISAN YANG PERNAH DIBUAT MEMBER */}
      {(activeTab === 'all' || activeTab === 'drafts') && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-teal-600" />
                Draf Tulisan &amp; Cerita yang Pernah Dibuat Member
              </h2>
              <p className="text-xs text-slate-500">
                Simpanan draf ide tulisan di editor lokal maupun naskah kontribusi Member yang pernah Anda kirimkan.
              </p>
            </div>
            <Link
              href="/articles/write"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-2 text-xs font-bold text-white shrink-0"
            >
              <PenLine className="h-3.5 w-3.5" />
              Tulis Draf Baru
            </Link>
          </div>

          {totalDraftsCount === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada draf tulisan yang tersimpan. Mulai menulis ide &amp; cerita Anda untuk dikurasi Moderator.
            </p>
          ) : (
            <div className="space-y-3">
              {localEditorDraft && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase">
                      Draf Aktif di Editor (Belum Dikirim)
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {localEditorDraft.title || '(Draf Tanpa Judul)'}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {localEditorDraft.content || 'Belum ada isi tulisan.'}
                    </p>
                  </div>
                  <Link
                    href="/articles/write"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shrink-0"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Lanjutkan Menulis Draf
                  </Link>
                </div>
              )}

              {memberWritingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          draft.status === 'published_homepage'
                            ? 'bg-emerald-100 text-emerald-800'
                            : draft.status === 'revision_needed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {draft.status === 'published_homepage'
                          ? 'Tayang di Homepage'
                          : draft.status === 'revision_needed'
                            ? 'Perlu Revisi Moderator'
                            : draft.status === 'approved'
                              ? 'Disetujui di Arsip'
                              : 'Menunggu Kurasi Moderator'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Kategori: {draft.categoryLabel}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{draft.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{draft.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/articles/${encodeURIComponent(draft.slug || draft.id)}`}
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      Lihat Naskah
                    </Link>
                    <Link
                      href={`/articles/write?draft=${encodeURIComponent(draft.id)}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-2 text-xs font-bold text-white"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Sunting Draf
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. ARTIKEL & REFERENSI BACAAN YANG DITANDAI */}
      {(activeTab === 'all' || activeTab === 'article') && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Penanda Artikel &amp; Referensi Bacaan
              </h2>
              <p className="text-xs text-slate-500">
                Artikel penting yang Anda tandai untuk dibaca ulang atau dijadikan referensi praktik.
              </p>
            </div>
            <Link href="/articles" className="text-xs font-bold text-emerald-700 hover:underline">
              Jelajahi Artikel →
            </Link>
          </div>

          {articleBookmarks.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada artikel yang ditandai. Klik ikon Bookmark pada artikel mana saja untuk menyimpannya di sini.
            </p>
          ) : (
            <div className="space-y-2.5">
              {articleBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <Link
                      href={item.href}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 block truncate"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                    {item.note && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Catatan: {item.note}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Disimpan {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Baca
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeBookmark(item.id)}
                      className="rounded-xl border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-600 p-2 text-slate-400 transition"
                      title="Hapus penanda artikel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
