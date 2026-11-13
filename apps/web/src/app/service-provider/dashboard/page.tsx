'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  FileEdit,
  Image as ImageIcon,
  MapPin,
  Plus,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  ManagedServiceItem,
  useManagedServices,
} from '@/lib/service-provider-store';
import { ServiceManagementModal } from '@/components/services/ServiceManagementModal';
import { PartnerTransactionManager } from '@/components/commerce/PartnerTransactionManager';
import { DashboardSectionDivider } from '@/components/commerce/DashboardSectionDivider';

export default function ServiceProviderDashboardPage() {
  const { services, upsertService } = useManagedServices();
  const [editingService, setEditingService] = useState<ManagedServiceItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const activeServicesCount = services.filter((s) => s.status === 'active').length;
  const totalCompleted = services.reduce((acc, s) => acc + (s.totalCompletedJobs || 0), 0);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Dashboard Penyedia Jasa — Murni Animasi CSS Ringan (Tanpa Gambar), Berjalan Slow & Langsung Aktif */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-sky-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl"
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
              Dashboard Penyedia Jasa &amp; Praktisi Keahlian
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Kelola seluruh layanan keahlian Anda: tulis deskripsi teknis, tambahkan foto dokumentasi, atur alamat lengkap workshop/lab, cakupan wilayah, serta pantau kontrak pembayaran bertahap (<em className="text-amber-200 font-semibold">Milestone Escrow</em>).
            </p>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/service-provider/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-sky-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <Wrench className="h-4 w-4 text-sky-700 shrink-0" />
                <span>Kelola Jasa Saya</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white hover:bg-sky-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-md transition whitespace-nowrap"
              >
                <BriefcaseBusiness className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Katalog Publik</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg transition whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Tambah Jasa Baru</span>
            </button>
          </div>
        </div>

        {/* Statistik Ringkas — Tanpa Frame Kotak, Satu Baris Rata & Seimbang */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Layanan Aktif
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {activeServicesCount} Jasa
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Permintaan Masuk
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              3 Kontrak
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Proyek Selesai
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {totalCompleted} Proyek
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 whitespace-nowrap">
              Rating Praktisi
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              4.9 / 5.0
            </p>
          </div>
        </div>
      </div>

      {/* Seksi Manajemen Cepat Jasa yang Dimiliki */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-sky-600" />
              Daftar Jasa &amp; Keahlian yang Anda Kelola
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol <strong>&quot;Kelola / Edit Jasa&quot;</strong> pada kartu untuk mengubah deskripsi tulisan, mengganti gambar sampul, atau memperbarui alamat lokasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              Tulis &amp; Tambah Jasa
            </button>
            <Link
              href="/service-provider/services"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
            >
              Buka Halaman Kelola Penuh
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition"
            >
              <div>
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow">
                    {item.categoryLabel}
                  </span>
                  <span
                    className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow ${
                      item.status === 'active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.status === 'active' ? 'Aktif' : 'Draft'}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.shortSummary || item.description}
                  </p>

                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong>Alamat:</strong> {item.fullAddress || item.locationArea}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item.durationEstimate}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.locationArea}</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {formatRupiah(item.priceStartingFrom)}
                    <span className="text-[10px] font-normal text-slate-500">
                      /{item.priceUnit}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingService(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  Kelola / Edit Jasa (Tulis, Gambar &amp; Alamat)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DashboardSectionDivider tone="sky" />

      {/* Permintaan & 3 Demo Transaksi Penyedia Jasa */}
      <PartnerTransactionManager partnerRole="service_provider" />

      <DashboardSectionDivider tone="sky" />

      {/* Hak & Ruang Lingkup Role Penyedia Jasa (Di Bawah, Full Width Sejajar) */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
          <h2 className="text-base font-extrabold text-sky-950 flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-sky-600 shrink-0" />
            Hak &amp; Ruang Lingkup Role Penyedia Jasa
          </h2>
          <span className="rounded-full bg-sky-100 border border-sky-200 px-3 py-0.5 text-[11px] font-bold text-sky-900">
            Layanan Keahlian &amp; Milestone Escrow
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 leading-relaxed">
          <div className="rounded-xl border border-sky-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
              <span>Menulis &amp; Mengelola Jasa</span>
            </div>
            <p>
              Bebas menambah dan menyunting judul, rincian pekerjaan, tarif, dan tahapan milestone.
            </p>
          </div>
          <div className="rounded-xl border border-sky-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <ImageIcon className="h-4 w-4 text-sky-600 shrink-0" />
              <span>Menambahkan Gambar Dokumentasi</span>
            </div>
            <p>
              Mengatur foto sampul portofolio sesuai bidang keahlian.
            </p>
          </div>
          <div className="rounded-xl border border-sky-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
              <span>Menambahkan Alamat &amp; Wilayah</span>
            </div>
            <p>
              Mencantumkan alamat workshop/lab serta area kunjungan lapangan atau online.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Edit / Tambah Jasa */}
      {(editingService || isAddingNew) && (
        <ServiceManagementModal
          initialItem={editingService}
          onClose={() => {
            setEditingService(null);
            setIsAddingNew(false);
          }}
          onSave={(saved) => {
            upsertService(saved);
            setEditingService(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
}
