'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';

/**
 * Bookmarks page — artikel & produk yang disimpan user.
 * Ref: user-lifecycle.md §bookmarks
 */

interface BookmarkItem {
  id: string;
  entity_type: 'content_item' | 'catalog_item';
  entity_id: string;
  title: string;
  slug?: string;
  created_at: string;
}

export default function BookmarksPage() {
  const { session } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: BookmarkItem[]; total: number }>('/users/me/bookmarks', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const bookmarks = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookmark Saya</h1>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-14 animate-pulse bg-gray-50" />
          ))}
        </div>
      )}

      {/* Kosong */}
      {!isLoading && bookmarks.length === 0 && (
        <div className="card text-center py-12 space-y-3">
          <p className="text-3xl">🔖</p>
          <p className="text-gray-500 text-sm">Belum ada item yang di-bookmark.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/articles"    className="btn-secondary text-xs">Jelajahi Artikel</Link>
            <Link href="/marketplace" className="btn-secondary text-xs">Jelajahi Produk</Link>
          </div>
        </div>
      )}

      {/* Daftar bookmark */}
      {!isLoading && bookmarks.length > 0 && (
        <div className="space-y-2">
          {bookmarks.map((item) => {
            const href =
              item.entity_type === 'content_item'
                ? `/articles/${item.slug ?? item.entity_id}`
                : `/marketplace/${item.entity_id}`;
            return (
              <Link
                key={item.id}
                href={href}
                className="card flex items-center justify-between hover:border-primary-300 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.entity_type === 'content_item' ? '📄' : '🛍️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {item.entity_type === 'content_item' ? 'Artikel' : 'Produk'} &middot;{' '}
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </div>
                <span className="text-gray-300 text-sm">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
