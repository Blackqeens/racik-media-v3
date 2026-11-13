'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Layers,
  Newspaper,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  Truck,
  Wrench,
} from 'lucide-react';
import {
  DEFAULT_ALGORITHM_SETTINGS,
  useAlgorithmSettings,
} from '@/lib/algorithm-settings-store';
import { useManagedServices } from '@/lib/service-provider-store';
import { useManagedSellerProducts } from '@/lib/seller-products-store';
import { useManagedDistributorSupplies } from '@/lib/distributor-supply-store';
import { REGIONAL_MARKETPLACE_PRODUCTS } from '@/lib/marketplace-regional-catalog';
import { useEditorialArchive } from '@/lib/editorial-archive';
import { REGIONAL_ARTICLES_CATALOG } from '@/lib/articles-regional-catalog';

export default function AlgorithmSettingsPage() {
  const { settings, updateSettings, resetSettings } = useAlgorithmSettings();
  const { services } = useManagedServices();
  const { products: sellerProducts } = useManagedSellerProducts();
  const { supplies: distributorSupplies } = useManagedDistributorSupplies();
  const { items: editorialItems } = useEditorialArchive();

  const [form, setForm] = useState(settings);
  const [saveToast, setSaveToast] = useState(false);

  // Perkiraan simulasi etalase Jasa, Barang Marketplace, & Artikel
  const totalServices = services.filter((s) => s.status === 'active').length;
  const totalMarketplaceItems =
    sellerProducts.length + distributorSupplies.length + REGIONAL_MARKETPLACE_PRODUCTS.length;
  const totalArticles =
    editorialItems.filter((e) => e.entityType === 'article').length +
    REGIONAL_ARTICLES_CATALOG.length;
  const simulatedServicePages = Math.max(1, Math.ceil(totalServices / (form.pageSize || 50)));
  const simulatedMarketplacePages = Math.max(
    1,
    Math.ceil(totalMarketplaceItems / (form.pageSize || 50)),
  );
  const simulatedArticlePages = Math.max(1, Math.ceil(totalArticles / (form.pageSize || 50)));

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings(form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  function handleReset() {
    resetSettings();
    setForm(DEFAULT_ALGORITHM_SETTINGS);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Simpan */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-[150] flex items-center gap-2.5 rounded-2xl border border-purple-400 bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Pengaturan Algoritma Penjualan AI Berhasil Diterapkan ke Seluruh Etalase!</span>
        </div>
      )}

      {/* Hero Header Master Admin — Tema Ungu Keemasan Seragam */}
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
              Pengaturan Algoritma Penjualan &amp; Distribusi Etalase AI
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Pusat kendali <strong className="text-amber-200">Master Admin</strong> untuk mengatur batasan kuota etalase (50 per halaman), mencegah duplikasi toko/produk, dan mengoptimalkan pembobotan mesin rekomendasi AI agar rotasi penjualan antar UMKM berlangsung adil dan merata.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition"
            >
              <ArrowLeft className="h-4 w-4 text-purple-700" />
              Kembali ke Dashboard Master
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition"
            >
              <Store className="h-4 w-4" />
              Etalase Barang Marketplace
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition"
            >
              <Wrench className="h-4 w-4" />
              Etalase Layanan Jasa
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition"
            >
              <Newspaper className="h-4 w-4" />
              Etalase Artikel &amp; Jurnal
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ringkasan Simulasi Etalase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Katalog Jasa, Barang &amp; Artikel
            </span>
            <p className="text-lg font-black text-slate-900">
              {totalServices} Jasa • {totalMarketplaceItems} Barang • {totalArticles} Artikel
            </p>
            <p className="text-[11px] text-slate-500">Seller, Distributor, Jasa &amp; Penulis</p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
              Batas per Halaman (Page Size)
            </span>
            <p className="text-2xl font-black text-sky-900">{form.pageSize} Item</p>
            <p className="text-[11px] text-sky-700">Berlaku di Jasa, Barang &amp; Artikel</p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
              Halaman Terbentuk
            </span>
            <p className="text-lg font-black text-purple-900">
              {simulatedServicePages} Jasa / {simulatedMarketplacePages} Barang / {simulatedArticlePages} Artikel
            </p>
            <p className="text-[11px] text-purple-700">Navigasi tombol &lt; . 2 . 3 . 4 . 5 . 6 &gt;</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Status Anti-Duplikasi Toko
            </span>
            <p className="text-2xl font-black text-emerald-900">
              {form.antiDuplication ? 'Aktif (Ketat)' : 'Nonaktif'}
            </p>
            <p className="text-[11px] text-emerald-700">
              Maks {form.maxItemsPerStorePerPage} produk/toko per halaman
            </p>
          </div>
        </div>

        {/* Panel 1: Pengaturan Batasan & Paginasi Etalase */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Batasan Kuota Etalase &amp; Navigasi Halaman
              </h2>
              <p className="text-xs text-slate-500">
                Mengatur kuota maksimal jasa atau produk yang boleh muncul dalam satu layar etalase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Jumlah Jasa / Produk Maksimal per Halaman
              </label>
              <select
                value={form.pageSize}
                onChange={(e) => setForm({ ...form, pageSize: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-none"
              >
                <option value={25}>25 Item per Halaman</option>
                <option value={50}>50 Item per Halaman (Standar Rekomendasi)</option>
                <option value={75}>75 Item per Halaman</option>
                <option value={100}>100 Item per Halaman</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Bila jumlah etalase melebihi batas ini, sistem otomatis membaginya ke halaman berikutnya dengan navigasi nomor halaman (&lt; 1 2 3 ... &gt;).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Batas Kemunculan Toko yang Sama per Halaman (Anti-Monopoli)
              </label>
              <select
                value={form.maxItemsPerStorePerPage}
                onChange={(e) =>
                  setForm({ ...form, maxItemsPerStorePerPage: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-none"
              >
                <option value={1}>Maksimal 1 Item per Toko / Halaman (Rotasi Ekstrem)</option>
                <option value={2}>Maksimal 2 Item per Toko / Halaman (Rekomendasi Adil)</option>
                <option value={3}>Maksimal 3 Item per Toko / Halaman</option>
                <option value={5}>Maksimal 5 Item per Toko / Halaman</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mencegah toko besar membanjiri satu halaman etalase dengan produk/jasa yang serupa, sehingga toko lain memiliki ruang tampil yang seimbang.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="antiDuplicationToggle"
              checked={form.antiDuplication}
              onChange={(e) => setForm({ ...form, antiDuplication: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="antiDuplicationToggle" className="cursor-pointer">
              <span className="block text-xs font-bold text-slate-900">
                Kunci Anti-Duplikasi Lintas Halaman (Strict Unique Items)
              </span>
              <span className="block text-[11px] text-slate-500 leading-relaxed">
                Ketika pengguna berpindah dari halaman 1 ke halaman 2, sistem menjamin tidak akan ada jasa, produk, atau deskripsi toko yang berulang. Pengguna hanya melihat item baru yang belum pernah muncul di halaman sebelumnya.
              </span>
            </label>
          </div>
        </div>

        {/* Panel 2: Pembobotan Algoritma AI (AI Ranking Weights) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Pembobotan Mesin Rekomendasi &amp; Ranking AI
              </h2>
              <p className="text-xs text-slate-500">
                Sesuaikan persentase pengaruh metrik performa mitra terhadap urutan kemunculan di halaman publik.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Skor Kepuasan Pembeli &amp; Ulasan Positif (Rating Weight)</span>
                <span className="text-purple-700">{form.aiRatingWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.aiRatingWeight}
                onChange={(e) => setForm({ ...form, aiRatingWeight: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Memberi prioritas posisi atas kepada mitra dengan rating bintang 4.8 - 5.0 dan ulasan autentik.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Kecepatan Respons, SLA Pengiriman &amp; Sukses Escrow (SLA Speed Weight)</span>
                <span className="text-indigo-700">{form.aiSlaSpeedWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.aiSlaSpeedWeight}
                onChange={(e) => setForm({ ...form, aiSlaSpeedWeight: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Mengutamakan mitra yang konsisten menyelesaikan pesanan tepat waktu tanpa komplain.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Rotasi Eksposur Adil bagi UMKM Baru (Fair Exposure Weight)</span>
                <span className="text-emerald-700">{form.aiFairExposureWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.aiFairExposureWeight}
                onChange={(e) =>
                  setForm({ ...form, aiFairExposureWeight: Number(e.target.value) })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Menyisipkan 15-20% slot terdepan untuk penyedia jasa atau penjual baru yang baru bergabung agar cepat memperoleh pesanan pertama.
              </p>
            </div>
          </div>
        </div>

        {/* Panel 3: Fitur Cerdas AI Tambahan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Fitur Cerdas Penjualan &amp; Relevansi Lokasi AI
              </h2>
              <p className="text-xs text-slate-500">
                Aktifkan modul kecerdasan buatan untuk membantu pembeli menemukan penyedia jasa terdekat secara otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  AI Geo-Relevance (Prioritas Jarak Lokasi)
                </span>
                <input
                  type="checkbox"
                  checked={form.geoRadiusPriority}
                  onChange={(e) => setForm({ ...form, geoRadiusPriority: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Memprioritaskan penyedia jasa on-site yang beralamat di kota/provinsi yang sama dengan domisili akun pengguna.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  AI Smart Dynamic Discovery
                </span>
                <input
                  type="checkbox"
                  checked={form.aiSmartRanking}
                  onChange={(e) => setForm({ ...form, aiSmartRanking: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mengurutkan etalase secara dinamis berdasarkan jam aktif respon chat mitra dan ketersediaan slot pengerjaan.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Simpan & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Reset Rekomendasi Default AI
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 text-xs font-bold text-emerald-800 transition"
            >
              Uji Etalase Barang (Marketplace)
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 text-xs font-bold text-sky-800 transition"
            >
              Uji Etalase Layanan Publik
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-800 transition"
            >
              Uji Etalase Artikel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-purple-700/25 transition"
            >
              <Save className="w-4 h-4" />
              Simpan &amp; Terapkan Konfigurasi Algoritma
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

