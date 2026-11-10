'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { demoArticles } from '@/lib/demo-data';

/**
 * Article detail page — konten nyata dari API.
 * Ref: content-lifecycle.md §published
 */

interface ArticleDetail {
  id: string;
  title: string;
  body: string;
  content_type: string;
  slug?: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  published_at: string;
  updated_at: string;
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ArticleDetail>(`/content/${slug}`);
        return { article: response.data, isDemo: false };
      } catch (error) {
        const article = demoArticles.find((item) => item.id === slug);
        if (process.env.NODE_ENV !== 'development' || !article) throw error;
        return { article: article as ArticleDetail, isDemo: true };
      }
    },
    staleTime: 60_000,
  });

  const article = data?.article;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
        <div className="space-y-3 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-3">
        <p className="text-3xl">📄</p>
        <p className="text-gray-500">Artikel tidak ditemukan.</p>
        <Link href="/articles" className="btn-secondary text-sm inline-block">
          ← Kembali ke Artikel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link href="/articles" className="text-xs text-primary-600 hover:underline">
        ← Artikel
      </Link>

      {data?.isDemo && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Artikel pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
        </p>
      )}

      {/* Meta */}
      <p className="text-xs text-gray-400 uppercase tracking-wide mt-4 mb-2">
        {article.content_type}
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>

      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        {/* Avatar inisial penulis */}
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
          {article.author_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {article.author_name ?? 'Anonim'}
          </p>
          <p className="text-xs text-gray-400">
            {formatRelativeTime(article.published_at)}
          </p>
        </div>
      </div>

      {/* Body — render sebagai HTML (konten sudah dikurasi moderator) */}
      <div
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </div>
  );
}
