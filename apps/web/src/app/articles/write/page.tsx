'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export default function WriteArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, session } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'under_review' | 'approved' | 'rejected'>('draft');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const sessionAccessToken = session?.access_token ?? '';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/articles/write');
      return;
    }
    if (typeof window !== 'undefined') {
      setTitle(window.localStorage.getItem('article-draft-title') ?? '');
      setContent(window.localStorage.getItem('article-draft-content') ?? '');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const draftId = searchParams.get('draft');
    if (!draftId || loading || !isAuthenticated) return;

    apiClient.get<{ id: string; title: string; body: string; status: typeof status }>(`/content/${draftId}`)
      .then((result) => {
        if (!result.data) return;
        setArticleId(result.data.id);
        setTitle(result.data.title ?? '');
        setContent(result.data.body ?? '');
        setStatus(result.data.status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat artikel.'));
  }, [searchParams, loading, isAuthenticated]);

  function saveDraft() {
    saveDraftToApi();
  }

  async function saveDraftToApi() {
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi artikel wajib diisi.');
      return;
    }

    setWorking(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${sessionAccessToken}` };
      if (articleId) {
        await apiClient.patch<{ id: string }>(`/content/${articleId}`, { title, body: content }, headers);
      } else {
        const result = await apiClient.post<{ id: string }>(
          '/content',
          { content_type: 'article', title, body: content },
          headers,
        );
        setArticleId(result.data?.id ?? null);
      }
      window.localStorage.setItem('article-draft-title', title);
      window.localStorage.setItem('article-draft-content', content);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan draf.');
    } finally {
      setWorking(false);
    }
  }

  async function submitForReview() {
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi artikel wajib diisi sebelum diajukan.');
      return;
    }

    setWorking(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${sessionAccessToken}` };
      let id = articleId;
      if (!id) {
        const result = await apiClient.post<{ id: string }>(
          '/content',
          { content_type: 'article', title, body: content },
          headers,
        );
        id = result.data?.id ?? null;
        setArticleId(id);
      } else {
        await apiClient.patch<{ id: string }>(`/content/${id}`, { title, body: content }, headers);
      }
      if (!id) throw new Error('Artikel berhasil dibuat tetapi ID tidak diterima.');
      await apiClient.post(`/content/${id}/submit`, {}, headers);
      setStatus('under_review');
      window.localStorage.removeItem('article-draft-title');
      window.localStorage.removeItem('article-draft-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengajukan artikel.');
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-gray-400">Memuat sesi...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Pusat Literasi</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Buat Artikel</h1>
        </div>
        {saved && <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">Draf tersimpan</span>}
      </div>
      <div className="card space-y-4">
        {status === 'under_review' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Artikel telah diajukan ke antrean moderasi dan menunggu keputusan moderator.
          </div>
        )}
        {status === 'approved' && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Artikel telah disetujui moderator.
          </div>
        )}
        {status === 'rejected' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Artikel ditolak moderator dan dapat diperbaiki sebelum diajukan kembali.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-700">Judul artikel</span>
          <input
            className="input-base"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Masukkan judul artikel"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-700">Isi artikel</span>
          <textarea
            className="input-base min-h-[320px] resize-y"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Mulai menulis..."
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={saveDraft} disabled={working || status === 'under_review'} className="btn-secondary text-sm disabled:opacity-50">
            Simpan draf
          </button>
          <button type="button" onClick={submitForReview} disabled={working || status === 'under_review'} className="btn-primary text-sm disabled:opacity-50">
            Ajukan ke Moderator
          </button>
        </div>
      </div>
    </div>
  );
}
