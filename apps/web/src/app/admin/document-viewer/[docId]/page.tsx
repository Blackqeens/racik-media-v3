'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  AdminSupportingFile,
  findAdminSupportingFileById,
} from '@/lib/admin-administration-store';

/**
 * Isolated PDF Document Viewer (/admin/document-viewer/[docId])
 *
 * Sesuai instruksi:
 * - Berkas PDF ketika diklik di Dashboard Admin membuka Tab Baru.
 * - Hanya menampilkan isi dokumen PDF untuk dicek kesesuaiannya dengan pengajuan.
 * - TIDAK memiliki Navbar, Sidebar, Footer, maupun tombol/link akses kembali ke aplikasi.
 * - Bila Admin ingin kembali ke Dashboard Admin, cukup berpindah kembali ke tab awal browser.
 */
export default function AdminIsolatedPdfViewerPage() {
  const params = useParams<{ docId: string }>();
  const docId = params?.docId ?? '';
  const [file, setFile] = useState<AdminSupportingFile | null>(null);
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  useEffect(() => {
    if (!docId) return;
    const found = findAdminSupportingFileById(decodeURIComponent(docId));
    setFile(found);
  }, [docId]);

  if (!file) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-lg w-full rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-bold">Berkas PDF Tidak Ditemukan</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dokumen dengan kode <code className="text-amber-300">{docId}</code> tidak tersedia.
            Halaman ini adalah penampil berkas terisolasi tanpa akses navigasi kembali. Silakan
            kembali ke <strong>Tab Awal (Dashboard Admin)</strong> pada browser Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 text-slate-900 flex flex-col">
      {/* ── TOOLBAR ATAS PENAMPIL PDF TERISOLASI (TANPA TOMBOL KEMBALI / TANPA NAVBAR) ── */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-950 px-4 py-3 text-white shadow-xl">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow">
              PDF
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white">{file.fileName}</span>
                <span className="rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  {file.fileSize}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  <Lock className="h-3 w-3" />
                  Tab Baca Berkas Terisolasi (Tanpa Akses Navigasi)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Periksa isi dokumen di bawah ini. <strong className="text-amber-300">Tidak ada akses kembali dari tab ini</strong> — silakan klik <strong>Tab Awal (Dashboard Admin)</strong> di browser Anda bila selesai memeriksa.
              </p>
            </div>
          </div>

          {/* Kontrol Zoom Pembacaan Dokumen (Bukan Navigasi) */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.max(85, z - 10))}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition inline-flex items-center gap-1"
              title="Perkecil tampilan dokumen"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-extrabold text-white min-w-[48px] text-center">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.min(125, z + 10))}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition inline-flex items-center gap-1"
              title="Perbesar tampilan dokumen"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PITA PERINGATAN AUDIT KESESUAIAN BERKAS ── */}
      <div className="bg-slate-900/90 border-b border-slate-700/80 px-4 py-2.5">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Pemeriksaan Kesesuaian Berkas (Role Admin):</strong> Cocokkan Nomor Dokumen, Nama Pemohon, dan Alamat pada lembar PDF ini dengan data pengajuan di Tab Awal.
            </span>
          </div>
          {file.isDataMatching ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-[11px] font-extrabold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Isi Berkas Sesuai Pengajuan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-[11px] font-extrabold text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Perlu Revisi / Lampiran Belum Lengkap
            </span>
          )}
        </div>
      </div>

      {/* ── KANVAS KERTAS DOKUMEN PDF (A4 SHEET) ── */}
      <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 flex justify-center">
        <div
          style={{
            transform: `scale(${zoomPercent / 100})`,
            transformOrigin: 'top center',
          }}
          className="w-full max-w-4xl rounded-sm bg-white shadow-2xl border border-slate-300 overflow-hidden transition-transform duration-150"
        >
          {/* KOP RESMI DOKUMEN PDF */}
          <div className="border-b-4 border-double border-slate-800 bg-slate-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  SALINAN DOKUMEN ELEKTRONIK TERVERIFIKASI • LAMPIRAN PENGAJUAN MITRA
                </p>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  {file.label.replace(/\.pdf$/i, '')}
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Diterbitkan oleh: <span className="text-slate-900">{file.issuer}</span>
                </p>
              </div>
              <div className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2.5 text-right shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Nomor Registrasi Dokumen
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900">
                  {file.documentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* ISI UTAMA LEMBAR PDF */}
          <div className="p-8 sm:p-10 space-y-8">
            {/* Kotak Identitas Pemohon / Pemilik Berkas */}
            <div className="rounded-xl border border-slate-300 bg-slate-50/70 p-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-4">
                Data Subjek Hukum &amp; Identitas Terdaftar pada Berkas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <UserCheck className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Nama Pemohon / Penanggung Jawab
                    </span>
                    <span className="font-bold text-slate-900">{file.applicantOrOwner}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Nama Entitas Usaha / Mitra
                    </span>
                    <span className="font-bold text-slate-900">{file.businessName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Tanggal Diterbitkan &amp; Masa Berlaku
                    </span>
                    <span className="font-semibold text-slate-800">
                      {file.issuedDate} — s/d {file.validUntil}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Lokasi Usaha / Gudang Terdaftar
                    </span>
                    <span className="font-semibold text-slate-800">{file.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian-bagian Isi Dokumen PDF */}
            <div className="space-y-6">
              {(file.pdfSections ?? []).map((sec, idx) => (
                <div key={idx} className="space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                    {sec.heading}
                  </h3>
                  <div className="space-y-1.5 pl-1">
                    {sec.content.map((line, lineIdx) => (
                      <p
                        key={lineIdx}
                        className="font-mono text-xs sm:text-[13px] text-slate-800 leading-relaxed"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Kotak Hasil Verifikasi Silang (Pencocokan Data Pengajuan vs Isi File PDF) */}
            <div
              className={`rounded-2xl border-2 p-5 space-y-2 ${
                file.isDataMatching
                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                  : 'border-amber-300 bg-amber-50/80 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {file.isDataMatching ? (
                  <BadgeCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
                )}
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  Ringkasan Pemeriksaan Kesesuaian Berkas (Role Admin Audit)
                </h4>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                {file.verificationMatchSummary}
              </p>
            </div>

            {/* Footer Lembar Kertas PDF & Stempel Elektronik */}
            <div className="border-t-2 border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="space-y-1">
                <p className="font-bold text-slate-700">
                  Arsip Dokumen Administrasi &amp; Legalitas — Racik Media Nusantara
                </p>
                <p>
                  Berkas: <code className="text-slate-800">{file.fileName}</code> • Ukuran:{' '}
                  {file.fileSize}
                </p>
                <p className="text-[11px] text-rose-700 font-semibold">
                  * Halaman ini hanya untuk membaca isi berkas PDF. Untuk melanjutkan tindakan verifikasi, silakan kembali ke Tab Awal browser Anda.
                </p>
              </div>

              <div className="rounded-xl border-2 border-dashed border-emerald-700/50 bg-emerald-50/40 px-4 py-3 text-center shrink-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                  TEREGISTRASI SISTEM KYB
                </p>
                <p className="font-mono text-xs font-black text-emerald-950 mt-0.5">
                  {file.documentNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

