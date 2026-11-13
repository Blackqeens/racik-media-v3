'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Image as ImageIcon,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Store,
  Truck,
  X,
} from 'lucide-react';
import {
  SELLER_CATEGORY_OPTIONS,
  type ManagedSellerProduct,
} from '@/lib/seller-products-store';
import {
  DISTRIBUTOR_CATEGORY_OPTIONS,
  type ManagedDistributorSupply,
} from '@/lib/distributor-supply-store';

export type PartnerCatalogItem = ManagedSellerProduct | ManagedDistributorSupply;

interface PartnerCatalogManagementModalProps {
  partnerRole: 'seller' | 'distributor';
  initialItem?: PartnerCatalogItem | null;
  onClose: () => void;
  onSave: (item: PartnerCatalogItem) => void;
}

const PRESET_IMAGES = [
  {
    label: 'Kopi & Rempah',
    url: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
  },
  {
    label: 'Madu & Herbal',
    url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
  },
  {
    label: 'Pupuk & Kompos',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
  },
  {
    label: 'Pangan & Beras',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  },
  {
    label: 'Gudang & Armada',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  },
  {
    label: 'Kriya & Anyaman',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
];

interface NormalizedFormState {
  id: string;
  title: string;
  shortSummary: string;
  description: string;
  category: string;
  categoryLabel: string;
  price: number;
  unitLabel: string;
  stock: number;
  soldCount: number;
  coverImage: string;
  ownerName: string;
  areaLabel: string;
  fullAddress: string;
  operatingHours: string;
  contactPhone: string;
  extraLogisticsInfo: string;
  badge: string;
  rating: number;
}

function toNormalizedState(
  partnerRole: 'seller' | 'distributor',
  initialItem?: PartnerCatalogItem | null,
): NormalizedFormState {
  if (!initialItem) {
    return {
      id: `${partnerRole === 'seller' ? 'prd' : 'dist'}-${Date.now()}`,
      title: '',
      shortSummary: '',
      description: '',
      category: partnerRole === 'seller' ? 'hasil_tani' : 'pupuk',
      categoryLabel:
        partnerRole === 'seller' ? 'Kopi, Madu & Hasil Tani' : 'Pasokan Pupuk & Kompos Partai',
      price: partnerRole === 'seller' ? 45000 : 120000,
      unitLabel: partnerRole === 'seller' ? 'kemasan 250g' : 'sak / karton',
      stock: 50,
      soldCount: 0,
      coverImage: PRESET_IMAGES[partnerRole === 'seller' ? 0 : 2].url,
      ownerName:
        partnerRole === 'seller'
          ? 'Mitra Seller Racik Nusantara'
          : 'Mitra Distributor Regional Nusantara',
      areaLabel: '',
      fullAddress: '',
      operatingHours: 'Senin - Sabtu (08:00 - 17:00 WIB)',
      contactPhone: '0812-0000-0000',
      extraLogisticsInfo:
        partnerRole === 'seller'
          ? 'Dikirim H+1 • Kemasan Aman & Rapi'
          : 'Armada Box Tertutup • Kirim Maks. 24 Jam',
      badge: partnerRole === 'seller' ? 'Produk Lokal' : 'Siap Pasok Wilayah',
      rating: 4.9,
    };
  }

  if (partnerRole === 'seller') {
    const s = initialItem as ManagedSellerProduct;
    return {
      id: s.id,
      title: s.title,
      shortSummary: s.shortSummary,
      description: s.description,
      category: s.category,
      categoryLabel: s.categoryLabel,
      price: s.price,
      unitLabel: s.unitLabel,
      stock: s.stock,
      soldCount: s.soldCount,
      coverImage: s.coverImage,
      ownerName: s.storeName,
      areaLabel: s.locationArea,
      fullAddress: s.fullAddress,
      operatingHours: s.operatingHours,
      contactPhone: s.contactPhone,
      extraLogisticsInfo: s.shippingEstimate,
      badge: s.badge,
      rating: s.rating,
    };
  }

  const d = initialItem as ManagedDistributorSupply;
  return {
    id: d.id,
    title: d.title,
    shortSummary: d.shortSummary,
    description: d.description,
    category: d.category,
    categoryLabel: d.categoryLabel,
    price: d.price,
    unitLabel: d.unitLabel,
    stock: d.stock,
    soldCount: d.soldCount,
    coverImage: d.coverImage,
    ownerName: d.distributorName,
    areaLabel: d.coverageRegion,
    fullAddress: d.warehouseAddress,
    operatingHours: d.operatingHours,
    contactPhone: d.contactPhone,
    extraLogisticsInfo: d.fleetInfo,
    badge: d.badge,
    rating: d.rating,
  };
}

export function PartnerCatalogManagementModal({
  partnerRole,
  initialItem,
  onClose,
  onSave,
}: PartnerCatalogManagementModalProps) {
  const isNew = !initialItem;
  const isSeller = partnerRole === 'seller';
  const categoryOptions = isSeller ? SELLER_CATEGORY_OPTIONS : DISTRIBUTOR_CATEGORY_OPTIONS;

  const [form, setForm] = useState<NormalizedFormState>(() =>
    toNormalizedState(partnerRole, initialItem),
  );
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  function handleCategoryChange(catId: string) {
    const found = categoryOptions.find((c) => c.id === catId);
    setForm((prev) => ({
      ...prev,
      category: catId,
      categoryLabel: found ? found.label : catId,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError(isSeller ? 'Nama produk wajib diisi.' : 'Nama pasokan / komoditas wajib diisi.');
      return;
    }
    if (!form.shortSummary.trim() || form.shortSummary.trim().length < 20) {
      setError('Ringkasan singkat wajib diisi minimal 20 karakter.');
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 30) {
      setError('Deskripsi lengkap wajib diisi minimal 30 karakter.');
      return;
    }
    if (!form.fullAddress.trim()) {
      setError(
        isSeller
          ? 'Alamat lengkap toko / lokasi produksi wajib diisi.'
          : 'Alamat lengkap gudang / hub distribusi wajib diisi.',
      );
      return;
    }
    if (!form.coverImage.trim()) {
      setError('URL gambar sampul wajib diisi.');
      return;
    }

    const nowLabel = 'Baru saja (Menunggu Kurasi Moderator)';
    if (isSeller) {
      const payload: ManagedSellerProduct = {
        id: form.id,
        title: form.title.trim(),
        shortSummary: form.shortSummary.trim(),
        description: form.description.trim(),
        category: form.category,
        categoryLabel: form.categoryLabel,
        price: Number(form.price) || 0,
        unitLabel: form.unitLabel.trim() || 'pcs',
        stock: Number(form.stock) || 0,
        soldCount: form.soldCount,
        coverImage: form.coverImage.trim(),
        storeName: form.ownerName.trim() || 'Mitra Seller Nusantara',
        locationArea: form.areaLabel.trim() || 'Indonesia',
        fullAddress: form.fullAddress.trim(),
        operatingHours: form.operatingHours.trim() || 'Senin - Sabtu',
        contactPhone: form.contactPhone.trim() || '-',
        shippingEstimate: form.extraLogisticsInfo.trim() || 'Dikirim H+1',
        badge: form.badge.trim() || 'Produk Lokal',
        rating: form.rating || 4.9,
        moderationStatus: 'pending_review',
        updatedAt: nowLabel,
      };
      onSave(payload);
      return;
    }

    const payload: ManagedDistributorSupply = {
      id: form.id,
      title: form.title.trim(),
      shortSummary: form.shortSummary.trim(),
      description: form.description.trim(),
      category: form.category,
      categoryLabel: form.categoryLabel,
      price: Number(form.price) || 0,
      unitLabel: form.unitLabel.trim() || 'unit / sak',
      stock: Number(form.stock) || 0,
      soldCount: form.soldCount,
      coverImage: form.coverImage.trim(),
      distributorName: form.ownerName.trim() || 'Mitra Distributor Nusantara',
      coverageRegion: form.areaLabel.trim() || 'Regional Nusantara',
      warehouseAddress: form.fullAddress.trim(),
      operatingHours: form.operatingHours.trim() || 'Senin - Sabtu',
      contactPhone: form.contactPhone.trim() || '-',
      fleetInfo: form.extraLogisticsInfo.trim() || 'Armada Box Distribusi',
      badge: form.badge.trim() || 'Siap Pasok',
      rating: form.rating || 4.8,
      moderationStatus: 'pending_review',
      updatedAt: nowLabel,
    };
    onSave(payload);
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-white ${
            isSeller
              ? 'bg-gradient-to-r from-amber-800 via-orange-900 to-slate-900'
              : 'bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/25">
              {isSeller ? <Store className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                {isSeller
                  ? 'Kelola Produk Toko (Role Seller)'
                  : 'Kelola Pasokan & Gudang (Role Distributor)'}
              </span>
              <h2 className="text-base sm:text-lg font-bold">
                {isNew
                  ? isSeller
                    ? 'Tambah Produk Baru + Ajukan Kurasi Moderator'
                    : 'Tambah Pasokan & Rute Distribusi Baru'
                  : `Edit: ${form.title}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-white/10 p-1 border border-white/20">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === 'edit'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <FileEdit className="h-3.5 w-3.5" />
                Edit Data
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === 'preview'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Pratinjau Kartu
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/15 hover:bg-white/25 p-2 text-white transition"
              aria-label="Tutup modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body Modal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Peringatan Kepatuhan Skema Moderator */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aturan Kurasi Publikasi:</strong> Setiap penambahan atau hasil{' '}
              <em>Edit</em> deskripsi, harga, maupun foto produk/pasokan otomatis masuk ke antrean{' '}
              <strong>Dashboard Moderator</strong> untuk verifikasi tulisan dan kesesuaian gambar sebelum ditayangkan di Homepage.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-semibold text-rose-800">
              {error}
            </div>
          )}

          {mode === 'edit' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {isSeller ? 'Nama Produk Toko *' : 'Nama Pasokan Komoditas / Batch Distribusi *'}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    isSeller
                      ? 'Contoh: Kopi Arabika Gayo Single Origin 250g'
                      : 'Contoh: Pupuk Organik Matang Kemasan 25 Kg (Pasokan Regional)'
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Kategori Komoditas</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none bg-white"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {isSeller ? 'Nama Toko / Kebun Seller' : 'Nama Perusahaan / Hub Distributor'}
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Harga Satuan (Rp) *</label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-emerald-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Satuan Kemasan</label>
                  <input
                    type="text"
                    value={form.unitLabel}
                    onChange={(e) => setForm({ ...form, unitLabel: e.target.value })}
                    placeholder="kg / botol / sak"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Stok Gudang/Toko</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Ringkasan Singkat (Ditampilkan pada Kartu Katalog) *
                </label>
                <input
                  type="text"
                  value={form.shortSummary}
                  onChange={(e) => setForm({ ...form, shortSummary: e.target.value })}
                  placeholder="Tuliskan keunggulan produk/pasokan secara padat dan jelas (min. 20 karakter)..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Deskripsi Lengkap &amp; Spesifikasi Mutu *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan asal komoditas, proses panen/penyimpanan, standar mutu, dan cara pengiriman..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs leading-relaxed focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Lokasi & Alamat Lengkap */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {isSeller ? 'Wilayah / Kota Toko' : 'Cakupan Wilayah Distribusi'}
                </label>
                <input
                  type="text"
                  value={form.areaLabel}
                  onChange={(e) => setForm({ ...form, areaLabel: e.target.value })}
                  placeholder={
                    isSeller
                      ? 'Contoh: Takengon, Aceh Tengah'
                      : 'Contoh: Jawa Barat, Jabodetabek & Jawa Tengah'
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {isSeller ? 'Estimasi Pengemasan & Kirim' : 'Informasi Armada & Kapasitas'}
                </label>
                <input
                  type="text"
                  value={form.extraLogisticsInfo}
                  onChange={(e) => setForm({ ...form, extraLogisticsInfo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {isSeller
                    ? 'Alamat Lengkap Toko / Lokasi Produksi *'
                    : 'Alamat Lengkap Gudang / Hub Distribusi *'}
                </label>
                <input
                  type="text"
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                  placeholder="Tuliskan jalan, nomor, kecamatan, kabupaten/kota, dan kode pos..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Jam Operasional</label>
                <input
                  type="text"
                  value={form.operatingHours}
                  onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Nomor Kontak / WA Admin Toko</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Gambar Sampul & Pilihan Cepat */}
              <div className="md:col-span-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-sky-600" />
                  URL Gambar Sampul Produk / Gudang (Harus Sesuai Tema Tulisan) *
                </label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setForm({ ...form, coverImage: img.url })}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                        form.coverImage === img.url
                          ? 'border-amber-500 bg-amber-100 text-amber-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="h-4 w-4 rounded object-cover" />
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Mode Pratinjau Kartu */
            <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
              <div className="aspect-[16/10] bg-slate-100 relative">
                <img
                  src={form.coverImage}
                  alt={form.title || 'Pratinjau'}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow">
                  {form.categoryLabel}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-slate-950 shadow">
                  Menunggu Kurasi Moderator
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {form.title || 'Judul Produk / Pasokan'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {form.shortSummary || 'Ringkasan produk akan muncul di sini.'}
                </p>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Alamat:</strong> {form.fullAddress || form.areaLabel || '-'}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Stok Tersedia: <strong>{form.stock}</strong> {form.unitLabel}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{form.operatingHours}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{form.contactPhone}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{form.ownerName}</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {formatRupiah(form.price)}
                    <span className="text-[10px] font-normal text-slate-500">
                      /{form.unitLabel}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Tombol Simpan */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition"
            >
              <Save className="h-4 w-4" />
              {isNew
                ? 'Simpan & Ajukan ke Dashboard Moderator'
                : 'Simpan Perubahan & Ajukan ke Moderator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

