'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useAdminAdministrationStore } from '@/lib/admin-administration-store';
import { useEditorialArchive } from '@/lib/editorial-archive';

/**
 * Dashboard Master Admin (/admin/dashboard)
 * Menampilkan Pusat Kendali Utama Master Admin dengan pembagian tugas yang jelas
 * antara Master Admin (Strategis & Keuangan), Role Admin (Administrasi, Legalitas, Pengajuan Mitra & Komplain),
 * dan Role Moderator (Arsip Tulisan & Publikasi Homepage).
 */
export default function MasterAdminDashboardPage() {
  const { upgrades, complaints, legalDocs } = useAdminAdministrationStore();
  const { items: editorialItems } = useEditorialArchive();

  const pendingUpgrades = upgrades.filter(
    (u) => u.status === 'pending_review' || u.status === 'need_revision',
  ).length;
  const activeComplaints = complaints.filter(
    (c) => c.status === 'open' || c.status === 'in_mediation',
  ).length;
  const verifiedLegal = legalDocs.filter((l) => l.adminStatus === 'verified').length;
  const publishedHomepageCount = editorialItems.filter((i) => i.publishedToHomepage).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Dashboard Master Admin */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-purple-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-purple-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-sm">
              Pusat Kendali Master Admin &amp; Pembagian Otoritas Sistem
            </h1>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Agar tidak memberatkan <strong className="text-amber-200">Master Admin</strong>, pengelolaan operasional telah didelegasikan secara terstruktur: <strong className="text-white underline decoration-amber-400/80 underline-offset-2">Role Admin</strong> menangani penuh dokumen administrasi, pengajuan Member → (Seller/Distributor), komplain, dan legalitas; sedangkan <strong className="text-emerald-300">Role Moderator</strong> mengelola penuh seluruh arsip tulisan &amp; publikasi Homepage.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/administration"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-purple-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <ShieldCheck className="h-4 w-4 text-violet-700 shrink-0" />
                <span>Dashboard Role Admin</span>
              </Link>
              <Link
                href="/admin/moderation"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-indigo-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <ClipboardCheck className="h-4 w-4 text-indigo-700 shrink-0" />
                <span>Dashboard Moderator</span>
              </Link>
            </div>
            <Link
              href="/admin/financial-report"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg transition whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Buka Audit Keuangan &amp; Escrow (Otoritas Master Admin)</span>
            </Link>
          </div>
        </div>

        {/* Baris Keterangan Statistik Eksekutif — Tanpa Frame Kotak, Satu Baris Rata Tengah */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Pengajuan Mitra (Diurus Admin)
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-amber-300">
              {pendingUpgrades} Pending
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Komplain Aktif (Diurus Admin)
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-rose-300">
              {activeComplaints} Kasus
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Legalitas Mitra Sah (Admin)
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {verifiedLegal} Mitra
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-extrabold tracking-wide text-emerald-300 whitespace-nowrap">
              Tayang Homepage (Moderator)
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              {publishedHomepageCount} Konten
            </p>
          </div>
        </div>
      </div>

      {/* Matriks Pendelegasian Tugas: Master Admin vs Role Admin vs Role Moderator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kartu 1: Role Admin (Administrasi, Legalitas, Pengajuan Mitra & Komplain) */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-900">
                <ShieldCheck className="h-4 w-4 text-violet-700" />
                Role Admin (Administrasi &amp; Legalitas)
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Pengelolaan Administrasi, Mitra, Komplain &amp; Legalitas
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <UserCheck className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pengajuan Member → (Seller / Distributor):</strong> Memeriksa KTP, NPWP, NIB, dan alamat gudang/toko hingga menyetujui kenaikan role.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Komplain &amp; Penyelesaian Masalah:</strong> Memediasi komplain dari pihak Member maupun Seller/Distributor hingga tuntas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dokumen Administrasi &amp; Legalitas:</strong> Mengelola kontrak MoU, izin edar, dan kepatuhan hukum Seller &amp; Distributor.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <Link
              href="/admin/administration"
              className="flex w-full items-center justify-between rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition"
            >
              <span>Masuk ke Dashboard Role Admin</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/seller-verification"
                className="rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 text-center text-[11px] font-bold text-violet-900 transition"
              >
                Pengajuan Mitra
              </Link>
              <Link
                href="/admin/administration?tab=complaints"
                className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-center text-[11px] font-bold text-rose-900 transition"
              >
                Pusat Komplain
              </Link>
            </div>
          </div>
        </div>

        {/* Kartu 2: Role Moderator (Arsip Tulisan, Event & Publikasi Homepage) */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-900">
              <ClipboardCheck className="h-4 w-4 text-indigo-700" />
              Role Moderator (Editorial &amp; Homepage)
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Otoritas Arsip Tulisan, Naungan Author &amp; Kurasi Homepage
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <BadgeCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Naungan Kepenulisan:</strong> Membaca dan menganalisis seluruh artikel, event, serta deskripsi produk Seller/Distributor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Verifikasi Gambar &amp; Tema:</strong> Memastikan visual gambar sesuai tema sebelum dipublikasikan ke Homepage.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/admin/moderation"
              className="flex w-full items-center justify-between rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition"
            >
              <span>Buka Dashboard Moderator</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Kartu 3: Otoritas Khusus Master Admin (Keuangan Strategis & Escrow) */}
        <div className="rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-900">
              <CreditCard className="h-4 w-4 text-purple-700" />
              Fokus Utama Master Admin
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Pengawasan Keuangan, Rekening Bersama Escrow &amp; Kebijakan
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan didelegasikannya urusan administrasi harian &amp; komplain ke <strong>Role Admin</strong> serta urusan konten ke <strong>Role Moderator</strong>, Master Admin fokus pada audit kas Escrow, laporan keuangan strategis, dan pengawasan lintas dashboard.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/admin/financial-report"
              className="flex w-full items-center justify-between rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition"
            >
              <span>Buka Laporan Keuangan &amp; Escrow</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
