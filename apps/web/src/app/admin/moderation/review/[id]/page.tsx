'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileCheck2, ShieldCheck } from 'lucide-react';
import { useEditorialArchive } from '@/lib/editorial-archive';
import { EditorialReviewWorkspace } from '@/components/moderation/EditorialReviewWorkspace';

const ROLE_LABELS: Record<string, string> = {
  author: 'Penulis (Naungan Moderator)',
  member: 'Member / Kontributor',
  seller: 'Mitra Seller',
  distributor: 'Mitra Distributor',
  service_provider: 'Penyedia Jasa',
};

/**
 * Halaman Mode Peninjauan & Sunting Naskah Moderator Ukuran Penuh (Tab Baru)
 * - Dibuka pada Tab Baru dari Dashboard Moderator (/admin/moderation)
 * - Menyediakan ruang kerja penuh layar, galeri 4+ gambar, tool editing teks lengkap,
 *   Panel Referensi Naskah dari Seluruh Role, dan tombol kembali ke Dashboard Moderator.
 */
export default function ModeratorFullReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const targetId = decodeURIComponent(params?.id ?? '');

  const { items, canPublishToHomepage, updateItem } = useEditorialArchive();

  const currentItem = useMemo(
    () => items.find((entry) => entry.id === targetId || entry.slug === targetId) ?? null,
    [items, targetId],
  );

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Naskah Arsip Tidak Ditemukan</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data arsip dengan ID <code className="font-mono text-indigo-700">{targetId}</code> belum tersimpan atau sudah dihapus. Silakan kembali ke Dashboard Moderator untuk memilih naskah lainnya.
          </p>
          <Link
            href="/admin/moderation"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-extrabold text-white shadow transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Moderator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── TOP BAR FULL-PAGE WORKSPACE MODERATOR (DENGAN TOMBOL KEMBALI KE DASHBOARD MODERATOR) ── */}
      <header className="sticky top-0 z-50 border-b border-indigo-900/20 bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-800 px-4 sm:px-6 py-3.5 text-white shadow-lg">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/moderation"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-950 shadow-md transition shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard Moderator
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Mode Peninjauan Penuh Moderator (Tab Baru)
                </span>
                <span className="text-xs text-indigo-100 truncate">
                  Pengaju: <strong>{currentItem.submitterName}</strong> (
                  {ROLE_LABELS[currentItem.sourceRole] ?? currentItem.sourceRole})
                </span>
              </div>
              <h1 className="truncate text-sm sm:text-base font-bold mt-0.5">
                {currentItem.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center rounded-lg bg-white/15 border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white">
              Perubahan otomatis tersinkron ke Tab Dashboard Moderator
            </span>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE PENUH LAYAR ── */}
      <div className="flex-1 flex flex-col">
        <EditorialReviewWorkspace
          item={currentItem}
          allArchiveItems={items}
          canPublishHomepage={canPublishToHomepage}
          isFullPage={true}
          backHref="/admin/moderation"
          onSave={(updated) => updateItem(updated)}
          onSelectArchiveItem={(target) => {
            router.push(`/admin/moderation/review/${encodeURIComponent(target.id)}`);
          }}
        />
      </div>
    </div>
  );
}
