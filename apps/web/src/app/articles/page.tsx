'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { apiClient } from '@/lib/api-client';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { demoArticles } from '@/lib/demo-data';

/**
 * Articles listing page — fetch konten published dari API.
 * Ref: content-lifecycle.md, search-architecture.md
 */

const CONTENT_TYPES = [
  { value: '', label: 'Semua' },
  { value: 'article', label: 'Artikel' },
  { value: 'paper', label: 'Paper' },
  { value: 'journal', label: 'Jurnal' },
  { value: 'event', label: 'Event' },
] as const;

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  slug?: string;
  excerpt?: string;
  author_name?: string;
  published_at: string;
}

export default function ArticlesPage() {
  const [search, setSearch]     = useState('');
  const [contentType, setContentType] = useState('');
  const [page, setPage]         = useState(1);
  const [debouncedSearch]       = useDebounce(search, 400);
  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', debouncedSearch, contentType, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
        status: 'published',
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(contentType && { content_type: contentType }),
      });
      try {
        const response = await apiClient.get<ContentItem[]>(`/content?${params}`);
        return {
          items: response.data,
          total: response.meta?.total ?? 0,
          totalPages: response.meta?.total_pages ?? 1,
          isDemo: false,
        };
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') throw error;

        const filtered = demoArticles.filter((item) => {
          const matchesType = !contentType || item.content_type === contentType;
          const matchesSearch =
            !debouncedSearch ||
            `${item.title} ${item.body}`.toLowerCase().includes(debouncedSearch.toLowerCase());
          return matchesType && matchesSearch;
        });
        const start = (page - 1) * limit;
        return {
          items: filtered.slice(start, start + limit),
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
          isDemo: true,
        };
      }
    },
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header + filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Cari artikel..."
            className="input-base w-64"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="input-base w-36"
            value={contentType}
            onChange={(e) => { setContentType(e.target.value); setPage(1); }}
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {data?.isDemo && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Artikel pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-gray-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="card text-center py-10 text-sm text-red-500">
          Gagal memuat artikel. Silakan coba lagi.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="card text-center py-16 space-y-2">
          <p className="text-3xl">📄</p>
          <p className="text-gray-500 text-sm">
            {debouncedSearch
              ? `Tidak ada artikel untuk "${debouncedSearch}".`
              : 'Belum ada artikel yang dipublikasikan.'}
          </p>
        </div>
      )}

      {/* Grid artikel */}
      {!isLoading && items.length > 0 && (
        <>
          <p className="text-xs text-gray-400">{total} artikel ditemukan</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ArticleCard
                key={item.id}
                slug={item.slug ?? item.id}
                title={item.title}
                excerpt={item.excerpt}
                authorName={item.author_name}
                publishedAt={item.published_at}
                contentType={item.content_type}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500 self-center">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
