'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { updateEditorialArchiveItem } from '@/lib/editorial-archive';

const ARTICLE_IMAGES_DB = 'racik-article-drafts';
const ARTICLE_IMAGES_STORE = 'images';
const ARTICLE_DRAFT_ID = 'current';

function openArticleImagesDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(ARTICLE_IMAGES_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(ARTICLE_IMAGES_STORE)) {
        request.result.createObjectStore(ARTICLE_IMAGES_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Database gambar tidak tersedia.'));
  });
}

async function saveArticleImagesToDatabase(images: { url: string; name: string }[]) {
  const database = await openArticleImagesDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(ARTICLE_IMAGES_STORE, 'readwrite');
    transaction.objectStore(ARTICLE_IMAGES_STORE).put(images, ARTICLE_DRAFT_ID);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Gagal menyimpan gambar.'));
  });
  database.close();
}

async function loadArticleImagesFromDatabase() {
  const database = await openArticleImagesDatabase();
  const images = await new Promise<{ url: string; name: string }[]>((resolve, reject) => {
    const request = database.transaction(ARTICLE_IMAGES_STORE, 'readonly')
      .objectStore(ARTICLE_IMAGES_STORE)
      .get(ARTICLE_DRAFT_ID);
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error ?? new Error('Gagal memuat gambar.'));
  });
  database.close();
  return images;
}

export default function WriteArticlePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-10 text-sm text-gray-400">Memuat editor...</div>}>
      <WriteArticleContent />
    </Suspense>
  );
}

function WriteArticleContent() {
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
  const [articleImages, setArticleImages] = useState<{ url: string; name: string }[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [previewMode, setPreviewMode] = useState(false);
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null);
  const articleIdRef = useRef<string | null>(null);
  const sessionAccessToken = session?.access_token ?? '';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/articles/write');
      return;
    }
    if (typeof window !== 'undefined' && !loading && isAuthenticated) {
      setTitle(window.localStorage.getItem('article-draft-title') ?? '');
      setContent(window.localStorage.getItem('article-draft-content') ?? '');
      loadArticleImagesFromDatabase()
        .then((images) => setArticleImages(images))
        .catch(() => setArticleImages([]))
        .finally(() => setDraftReady(true));
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const draftId = searchParams.get('draft');
    if (!draftId || loading || !isAuthenticated) return;

    apiClient.get<{ id: string; title: string; body: string; cover_image?: string; status: typeof status }>(`/content/mine/${draftId}`, {
      Authorization: `Bearer ${sessionAccessToken}`,
    })
      .then((result) => {
        if (!result.data) return;
        setArticleId(result.data.id);
        articleIdRef.current = result.data.id;
        setTitle(result.data.title ?? '');
        setContent(result.data.body ?? '');
        setArticleImages(result.data.cover_image ? [{ url: result.data.cover_image, name: 'Hero artikel tersimpan' }] : []);
        setStatus(result.data.status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat artikel.'));
  }, [searchParams, loading, isAuthenticated]);

  function handleArticleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const availableSlots = 4 - articleImages.length;
    if (availableSlots <= 0) {
      setError('Maksimal 4 gambar artikel.');
      event.target.value = '';
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    const invalidType = selectedFiles.find((file) => !file.type.startsWith('image/'));
    const oversized = selectedFiles.find((file) => file.size > 5 * 1024 * 1024);
    if (invalidType) {
      setError('Semua file harus berupa gambar.');
      event.target.value = '';
      return;
    }
    if (oversized) {
      setError(`Maksimal 5 MB per gambar. "${oversized.name}" terlalu besar.`);
      event.target.value = '';
      return;
    }
    if (files.length > availableSlots) {
      setError('Maksimal 4 gambar artikel dipilih; gambar tambahan tidak dimasukkan.');
    } else {
      setError('');
    }

    Promise.all(selectedFiles.map((file) => new Promise<{ url: string; name: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: typeof reader.result === 'string' ? reader.result : '', name: file.name });
      reader.onerror = () => reject(new Error(`Gagal membaca "${file.name}".`));
      reader.readAsDataURL(file);
    }))).then((images) => {
      setArticleImages((current) => [...current, ...images].slice(0, 4));
      event.target.value = '';
    }).catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat gambar.'));
  }

  function removeArticleImage(index: number) {
    setArticleImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveArticleImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setArticleImages((current) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) return current;
      const next = [...current];
      const [movedImage] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedImage);
      return next;
    });
  }

  useEffect(() => {
    if (!draftReady) return;

    window.localStorage.setItem('article-draft-title', title);
    window.localStorage.setItem('article-draft-content', content);
    saveArticleImagesToDatabase(articleImages).catch((err) => {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan gambar draf.');
    });

    if (!title.trim() || !content.trim() || loading || !isAuthenticated || status === 'under_review') return;

    setAutoSaveState('saving');
    const timer = window.setTimeout(() => {
      saveDraftToApi(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [title, content, articleImages, draftReady, loading, isAuthenticated, status]);

  useEffect(() => {
    if (!draftReady) return;

    const saveBeforeLeaving = () => {
      window.localStorage.setItem('article-draft-title', title);
      window.localStorage.setItem('article-draft-content', content);
      void saveArticleImagesToDatabase(articleImages).catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveBeforeLeaving();
    };

    window.addEventListener('beforeunload', saveBeforeLeaving);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', saveBeforeLeaving);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [title, content, articleImages, draftReady]);

  function saveDraft() {
    saveDraftToApi();
  }

  async function saveDraftToApi(silent = false) {
    if (!title.trim() || !content.trim()) {
      if (!silent) setError('Judul dan isi artikel wajib diisi.');
      return;
    }

    setWorking(true);
    if (!silent) setError('');
    setAutoSaveState('saving');
    try {
      const headers = { Authorization: `Bearer ${sessionAccessToken}` };
      if (articleId) {
        await apiClient.patch<{ id: string }>(`/content/${articleId}`, { title, body: content, cover_image: articleImages[0]?.url ?? '' }, headers);
      } else {
        const result = await apiClient.post<{ id: string }>(
          '/content',
          { content_type: 'article', title, body: content, cover_image: articleImages[0]?.url ?? '' },
          headers,
        );
        setArticleId(result.data?.id ?? null);
        articleIdRef.current = result.data?.id ?? null;
      }
      window.localStorage.setItem('article-draft-title', title);
      window.localStorage.setItem('article-draft-content', content);
      setSaved(true);
      setAutoSaveState('saved');
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
      const submissionId = articleId || `art-sub-${Date.now().toString().slice(-6)}`;
      const activeRole =
        (typeof window !== 'undefined' && window.localStorage.getItem('racik-dev-role')) ||
        'member';
      const normalizedSourceRole =
        activeRole === 'seller' ||
        activeRole === 'distributor' ||
        activeRole === 'service_provider'
          ? activeRole
          : 'member';

      // Simpan langsung ke antrean Arsip Dashboard Moderator (publishedToHomepage: false)
      updateEditorialArchiveItem({
        id: submissionId,
        slug: submissionId,
        entityType: 'article',
        sourceRole: normalizedSourceRole,
        submitterName:
          (session?.user?.user_metadata?.full_name as string) ||
          session?.user?.email?.split('@')[0] ||
          'Kontributor Racik Media',
        title: title.trim(),
        excerpt: content.trim().slice(0, 160),
        body: content.trim(),
        category: 'Pertanian',
        categoryLabel: 'Karya Tulis Kontributor',
        contentType: 'article',
        image:
          articleImages[0]?.url ||
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
        images:
          articleImages.length > 0
            ? articleImages.map((img) => img.url)
            : ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80'],
        publishedAt: new Date().toISOString(),
        readTimeMinutes: Math.max(3, Math.ceil(content.trim().split(/\s+/).length / 180)),
        status: 'pending_review',
        publishedToHomepage: false,
        writingVerified: false,
        imageThemeVerified: false,
        moderatorNotes:
          'Diajukan dari halaman Tulis Artikel — menunggu pembacaan, analisis tata tulis, dan verifikasi gambar tema oleh Moderator.',
      });

      try {
        const headers = { Authorization: `Bearer ${sessionAccessToken}` };
        let id = articleId;
        if (!id) {
          const result = await apiClient.post<{ id: string }>(
            '/content',
            { content_type: 'article', title, body: content, cover_image: articleImages[0]?.url ?? '' },
            headers,
          );
          id = result.data?.id ?? null;
          setArticleId(id);
        } else {
          await apiClient.patch<{ id: string }>(
            `/content/${id}`,
            { title, body: content, cover_image: articleImages[0]?.url ?? '' },
            headers,
          );
        }
        if (id) {
          await apiClient.post(`/content/${id}/submit`, {}, headers);
        }
      } catch {
        // Tetap sukses tersimpan di antrean Dashboard Moderator meskipun API backend sedang offline
      }

      setStatus('under_review');
      window.localStorage.removeItem('article-draft-title');
      window.localStorage.removeItem('article-draft-content');
      await saveArticleImagesToDatabase([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengajukan artikel.');
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-400">Memuat sesi...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Pusat Literasi</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Buat Artikel</h1>
        </div>
        {(saved || autoSaveState !== 'idle') && (
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {autoSaveState === 'saving' ? 'Menyimpan otomatis...' : 'Draf tersimpan otomatis'}
          </span>
        )}
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
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="block text-sm font-semibold text-gray-700">Hero Artikel</span>
            <span className="text-xs text-gray-500">Maksimal 4 gambar · 5 MB per gambar</span>
          </div>
          <label className="flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 transition hover:border-primary-400 hover:bg-primary-50/30">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleArticleImages}
              disabled={working || status === 'under_review' || articleImages.length >= 4}
            />
            {articleImages.length === 0 ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Unggah gambar hero artikel</p>
                <p className="mt-1 text-xs text-gray-500">Maksimal 4 gambar, 5 MB per gambar</p>
              </div>
            ) : (
              <div
                draggable
                onDragStart={() => setDraggingImageIndex(0)}
                onDragEnd={() => setDraggingImageIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingImageIndex !== null) moveArticleImage(draggingImageIndex, 0);
                  setDraggingImageIndex(null);
                }}
                className="relative h-[220px] w-full cursor-grab active:cursor-grabbing"
              >
                <img src={articleImages[0].url} alt="Hero artikel" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(event) => { event.preventDefault(); removeArticleImage(0); }}
                  className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 shadow"
                >
                  Hapus hero
                </button>
              </div>
            )}
          </label>
          {articleImages.length > 1 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {articleImages.slice(1).map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  draggable
                  onDragStart={() => setDraggingImageIndex(index + 1)}
                  onDragEnd={() => setDraggingImageIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingImageIndex !== null) moveArticleImage(draggingImageIndex, index + 1);
                    setDraggingImageIndex(null);
                  }}
                  className="relative cursor-grab overflow-hidden rounded-lg border border-gray-200 active:cursor-grabbing"
                >
                  <img src={image.url} alt={`Gambar artikel ${index + 2}`} className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeArticleImage(index + 1)}
                    className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 shadow"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="h-10 rounded-lg border border-primary-200 bg-primary-50 px-4 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
          >
            Mode Pratinjau
          </button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleArticleImages}
              disabled={working || status === 'under_review' || articleImages.length >= 4}
            />
            <span>{articleImages.length >= 4 ? 'Gambar Penuh (4/4)' : `Tambah Gambar (${articleImages.length}/4)`}</span>
          </label>
          <button type="button" onClick={saveDraft} disabled={working || status === 'under_review'} className="h-10 rounded-lg px-4 text-sm font-semibold disabled:opacity-50 btn-secondary">
            Simpan draf
          </button>
          <button type="button" onClick={submitForReview} disabled={working || status === 'under_review'} className="h-10 rounded-lg px-4 text-sm font-semibold disabled:opacity-50 btn-primary">
            Ajukan ke Moderator
          </button>
        </div>
      </div>
      {previewMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Pratinjau Artikel</p>
                <p className="text-sm text-gray-500">Mode tampilan sebelum dipublikasikan</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="h-9 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
            <article className="p-5 sm:p-8">
              {articleImages[0] && (
                <img
                  src={articleImages[0].url}
                  alt={title || 'Hero artikel'}
                  className="mb-6 max-h-[420px] w-full rounded-lg object-cover"
                />
              )}
              {articleImages.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold text-gray-600">Urutan gambar — seret untuk memindahkan posisi</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {articleImages.map((image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        draggable
                        onDragStart={() => setDraggingImageIndex(index)}
                        onDragEnd={() => setDraggingImageIndex(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggingImageIndex !== null) moveArticleImage(draggingImageIndex, index);
                          setDraggingImageIndex(null);
                        }}
                        className="relative cursor-grab active:cursor-grabbing"
                      >
                        <img src={image.url} alt={`Urutan gambar ${index + 1}`} className="h-24 w-full rounded-lg border border-gray-200 object-cover" />
                        <span className="absolute left-2 top-2 rounded bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {index === 0 ? 'Hero' : `Gambar ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h2 className="text-3xl font-bold leading-tight text-gray-900">
                {title.trim() || 'Judul artikel belum diisi'}
              </h2>
              <div className="mt-6 whitespace-pre-wrap text-base leading-7 text-gray-700">
                {content.trim() || 'Isi artikel belum ditulis.'}
              </div>
              {articleImages.length > 1 && (
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {articleImages.slice(1).map((image, index) => (
                    <img
                      key={`${image.name}-${index}`}
                      src={image.url}
                      alt={`${title || 'Artikel'} - ${index + 2}`}
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
