'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { demoArticles } from '@/lib/demo-data';
import { getEditorialArchive } from '@/lib/editorial-archive';
import { findRegionalArticleBySlugOrId } from '@/lib/articles-regional-catalog';

/**
 * Article detail page — tampilan Live penuh (mendukung Mode Live Homepage / Mode Preview).
 */

interface ArticleDetail {
  id: string;
  title: string;
  body: string;
  excerpt?: string;
  image?: string;
  content_type: string;
  categoryLabel?: string;
  slug?: string;
  author_id: string;
  author_name?: string;
  author_role?: string;
  author_origin?: string;
  author_avatar?: string;
  readTimeMinutes?: number;
  published_at: string;
  updated_at: string;
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [returnHref, setReturnHref] = useState('/admin/moderation');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsLivePreview(params.get('mode') === 'live-preview');
    const from = params.get('from');
    if (from && from.startsWith('/')) {
      setReturnHref(from);
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      // 1. Cek Arsip Editorial Moderator terlebih dahulu (agar seluruh artikel Homepage tampil Live penuh)
      const archiveItems = getEditorialArchive();
      const matchedEditorial = archiveItems.find(
        (item) =>
          item.entityType === 'article' &&
          (item.slug === slug || item.id === slug),
      );

      if (matchedEditorial) {
        const mapped: ArticleDetail = {
          id: matchedEditorial.id,
          title: matchedEditorial.title,
          body: matchedEditorial.body,
          excerpt: matchedEditorial.excerpt,
          image: matchedEditorial.image,
          content_type: matchedEditorial.categoryLabel || 'Jurnal & Artikel',
          categoryLabel: matchedEditorial.categoryLabel,
          slug: matchedEditorial.slug,
          author_id: matchedEditorial.id,
          author_name: matchedEditorial.submitterName,
          author_role: matchedEditorial.sourceRole,
          author_origin: matchedEditorial.submitterOrigin,
          readTimeMinutes: matchedEditorial.readTimeMinutes ?? 6,
          published_at: matchedEditorial.publishedAt,
          updated_at: matchedEditorial.publishedAt,
        };
        return { article: mapped, isDemo: false, isCurated: true };
      }

      const matchedRegional = findRegionalArticleBySlugOrId(slug);
      if (matchedRegional) {
        const mapped: ArticleDetail = {
          id: matchedRegional.id,
          title: matchedRegional.title,
          body: matchedRegional.body,
          excerpt: matchedRegional.excerpt,
          image: matchedRegional.image,
          content_type: matchedRegional.categoryLabel || 'Jurnal & Artikel',
          categoryLabel: matchedRegional.categoryLabel,
          slug: matchedRegional.slug,
          author_id: matchedRegional.id,
          author_name: matchedRegional.submitterName,
          author_role: matchedRegional.sourceRole,
          author_origin: matchedRegional.submitterOrigin,
          readTimeMinutes: matchedRegional.readTimeMinutes ?? 6,
          published_at: matchedRegional.publishedAt,
          updated_at: matchedRegional.publishedAt,
        };
        return { article: mapped, isDemo: false, isCurated: true };
      }

      // 2. Fallback ke API / Demo Articles
      try {
        const response = await apiClient.get<ArticleDetail>(`/content/${slug}`);
        return { article: response.data, isDemo: false, isCurated: false };
      } catch (error) {
        const article = demoArticles.find((item) => item.id === slug);
        if (process.env.NODE_ENV !== 'development' || !article) throw error;
        return { article: article as ArticleDetail, isDemo: true, isCurated: false };
      }
    },
    staleTime: 30_000,
  });

  const article = data?.article;
  const backToHomepageHref = `/?mode=live-preview&from=${encodeURIComponent(returnHref)}`;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
        <div className="h-5 bg-gray-100 rounded animate-pulse w-36" />
        <div className="h-10 bg-gray-100 rounded animate-pulse w-4/5" />
        <div className="h-80 bg-gray-100 rounded-3xl animate-pulse w-full" />
        <div className="space-y-3 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${75 + (i % 3) * 8}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-4xl">📄</p>
        <h2 className="text-lg font-bold text-slate-800">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500">
          Artikel mungkin belum dipublikasikan atau tautan telah berubah.
        </p>
        <Link
          href={isLivePreview ? backToHomepageHref : '/articles'}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {isLivePreview ? 'Kembali ke Live Homepage' : 'Kembali ke Koleksi Artikel'}
        </Link>
      </div>
    );
  }

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(article.body || '');

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Keterangan Mode Live Homepage (Mode Preview) */}
        {isLivePreview ? (
          <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-4 sm:p-5 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                      <Lock className="h-3 w-3" /> MODE LIVE HOMEPAGE (MODE PREVIEW)
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-200">
                      Tampilan Detail Live Ukuran Penuh • Akses Mengubah Dibatasi
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-indigo-100 leading-relaxed">
                    Anda sedang meninjau tampilan <strong>Live Detail Artikel</strong> persis seperti yang dilihat pengunjung publik. Pada mode ini, akses mengubah/menyunting naskah dikunci. Untuk menyunting naskah, silakan kembali ke Dashboard Moderator.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={backToHomepageHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/25 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Live Homepage
                </Link>
                <Link
                  href={returnHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition shadow-sm"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Koleksi Artikel
            </Link>
          </div>
        )}

        {data?.isDemo && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
            Artikel pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Kartu Artikel Live Ukuran Penuh */}
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Hero Cover Image Besar */}
          {article.image && (
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&q=80';
                }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  <BookOpen className="h-3.5 w-3.5" />
                  {article.categoryLabel || article.content_type}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-emerald-900 shadow">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Terkurasi Moderator Editorial
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10 lg:p-12 space-y-8">
            {/* Header Judul & Meta Penulis */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              {!article.image && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {article.categoryLabel || article.content_type}
                </span>
              )}

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {article.author_name?.[0]?.toUpperCase() ?? 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {article.author_name ?? 'Redaksi Racik Media'}
                      </p>
                      {article.author_origin && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {article.author_origin}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatRelativeTime(article.published_at)}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        {article.readTimeMinutes ?? 6} menit baca
                      </span>
                    </div>
                  </div>
                </div>

                {isLivePreview && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    Mode Live Preview (Akses Edit Dibatasi)
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan / Excerpt Tayang */}
            {article.excerpt && (
              <div className="rounded-2xl border-l-4 border-emerald-600 bg-emerald-50/60 p-5 sm:p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1.5">
                  Intisari / Ringkasan Tayang
                </p>
                <p className="font-serif text-base sm:text-lg italic text-slate-800 leading-relaxed">
                  “{article.excerpt}”
                </p>
              </div>
            )}

            {/* Isi Lengkap Naskah */}
            {hasHtmlTags ? (
              <div
                className="prose prose-base sm:prose-lg max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            ) : (
              <div className="space-y-5 text-base sm:text-lg text-slate-700 leading-relaxed font-sans">
                {(article.body || '').split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Footer Keterangan Kurasi & Proteksi Mode Preview */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-800">
                    Naskah Terverifikasi Skema Penulisan Publik Racik Media
                  </p>
                  <p>
                    Dinaungi dan dikurasi oleh Role Moderator Editorial sebelum ditayangkan di Homepage.
                  </p>
                </div>
              </div>

              {isLivePreview && (
                <Link
                  href={backToHomepageHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Live Homepage
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
