'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  Image as ImageIcon,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import {
  type ManagedSellerProduct,
  useManagedSellerProducts,
} from '@/lib/seller-products-store';
import { PartnerCatalogManagementModal } from '@/components/commerce/PartnerCatalogManagementModal';
import { PartnerTransactionManager } from '@/components/commerce/PartnerTransactionManager';
import { DashboardSectionDivider } from '@/components/commerce/DashboardSectionDivider';

export default function SellerDashboardPage() {
  const { products, upsertProduct } = useManagedSellerProducts();
  const [editingProduct, setEditingProduct] = useState<ManagedSellerProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const publishedCount = products.filter(
    (p) => p.moderationStatus === 'published_homepage',
  ).length;
  const totalSold = products.reduce((acc, p) => acc + (p.soldCount || 0), 0);
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* ── HERO DASHBOARD SELLER — Konsep & Animasi CSS Slow Seragam dengan Penyedia Jasa ── */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-amber-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-6">
          <div className="lg:col-span-7 min-w-0 space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
              Dashboard Toko Seller &amp; Manajemen Komoditas
            </h1>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Kelola seluruh etalase produk toko Anda: tulis deskripsi komoditas, perbarui foto produk, atur alamat lengkap kebun/toko, stok tersedia, serta pantau pesanan pembeli dengan perlindungan <em className="text-amber-200 font-semibold">Rekening Bersama (Escrow)</em>.
            </p>
          </div>

          {/* 2 Tombol Putih di Atas + 1 Tombol Hijau Penuh di Bawah (Tanpa Frame & Tidak Terpotong) */}
          <div className="lg:col-span-5 min-w-0 flex flex-col gap-2.5 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/seller/products"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-amber-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <Package className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Kelola Produk Saya</span>
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-amber-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <Store className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Etalase Marketplace</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2.5 text-xs sm:text-[13px] font-extrabold text-white shadow-lg transition text-center leading-snug"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* Statistik Ringkas — Tanpa Frame Kotak, Rata Tengah & Seimbang */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Produk Terkelola
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {products.length} Item
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Tayang Homepage
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              {publishedCount} Produk
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Total Stok &amp; Terjual
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {totalStock} / {totalSold}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 whitespace-nowrap">
              Rating Toko Seller
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              4.9 / 5.0
            </p>
          </div>
        </div>
      </div>

      {/* ── DAFTAR PRODUK YANG DIKELOLA SELLER (KONSEP SAMA DENGAN PENYEDIA JASA) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-600" />
              Daftar Produk &amp; Komoditas yang Anda Kelola
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol <strong>&quot;Kelola / Edit Produk&quot;</strong> pada kartu untuk mengubah deskripsi tulisan, mengganti gambar produk, memperbarui stok, atau mengubah alamat toko/kebun (diajukan ke Moderator).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              Tulis &amp; Tambah Produk
            </button>
            <Link
              href="/seller/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
            >
              Buka Status Kurasi Produk
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition"
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
                      item.moderationStatus === 'published_homepage'
                        ? 'bg-emerald-600 text-white'
                        : item.moderationStatus === 'pending_review'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.moderationStatus === 'published_homepage'
                      ? 'Tayang di Homepage'
                      : item.moderationStatus === 'pending_review'
                        ? 'Menunggu Moderator'
                        : 'Perlu Revisi'}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.shortSummary || item.description}
                  </p>

                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong>Alamat Toko/Kebun:</strong> {item.fullAddress || item.locationArea}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Stok: <strong className="text-slate-800">{item.stock}</strong> {item.unitLabel} •{' '}
                        {item.soldCount} terjual
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 truncate pr-2">{item.locationArea}</span>
                  <span className="text-sm font-extrabold text-emerald-700 shrink-0">
                    {formatRupiah(item.price)}
                    <span className="text-[10px] font-normal text-slate-500">
                      /{item.unitLabel}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProduct(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  Kelola / Edit Produk (Tulis, Gambar &amp; Alamat)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DashboardSectionDivider tone="amber" />

      {/* ── PESANAN MASUK + INPUT NOMOR RESI + 3 DEMO TRANSAKSI SELLER ── */}
      <PartnerTransactionManager partnerRole="seller" />

      <DashboardSectionDivider tone="amber" />

      {/* ── HAK & RUANG LINGKUP ROLE SELLER (DI BAWAH, FULL WIDTH SEJAJAR) ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
          <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
            Hak &amp; Ruang Lingkup Role Seller
          </h2>
          <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-0.5 text-[11px] font-bold text-amber-900">
            Pengelolaan Toko &amp; Komoditas
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-700 leading-relaxed">
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Menulis &amp; Mengelola Produk</span>
            </div>
            <p>
              Bebas menambah dan menyunting judul produk, spesifikasi komoditas, harga jual, dan jumlah stok toko.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <ImageIcon className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Menambahkan Gambar Produk</span>
            </div>
            <p>
              Mengatur foto komoditas autentik yang sesuai tema tulisan untuk diajukan ke Role Moderator.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Alamat Toko &amp; Jam Operasional</span>
            </div>
            <p>
              Mencantumkan alamat lokasi produksi/kebun lengkap untuk mempermudah pengiriman dan audit legalitas Role Admin.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Kurasi &amp; Legalitas Terpisah</span>
            </div>
            <p>
              Perubahan deskripsi produk disahkan oleh <em>Role Moderator</em>, sedangkan legalitas &amp; komplain dimediasi oleh <em>Role Admin</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Kelola / Edit / Tambah Produk Seller */}
      {(editingProduct || isAddingNew) && (
        <PartnerCatalogManagementModal
          partnerRole="seller"
          initialItem={editingProduct}
          onClose={() => {
            setEditingProduct(null);
            setIsAddingNew(false);
          }}
          onSave={(saved) => {
            upsertProduct(saved as ManagedSellerProduct);
            setEditingProduct(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
}
