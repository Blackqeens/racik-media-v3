'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { apiClient } from '@/lib/api-client';
import { ArticleCard } from '@/components/articles/ArticleCard';

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
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
        status: 'published',
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(contentType && { content_type: contentType }),
      });
      return apiClient.get<ContentItem[]>(`/content?${params}`);
    },
    staleTime: 30_000,
  });

  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.total_pages ?? Math.ceil(total / limit);

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
