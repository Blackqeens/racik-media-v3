'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Image as ImageIcon,
  Layers,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Star,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import {
  ManagedServiceItem,
  SERVICE_CATEGORY_OPTIONS,
} from '@/lib/service-provider-store';

interface ServiceManagementModalProps {
  initialItem?: ManagedServiceItem | null;
  onClose: () => void;
  onSave: (item: ManagedServiceItem) => void;
}

const PRESET_SERVICE_IMAGES = [
  {
    label: 'Kriya & Workshop',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    label: 'Uji Lab & Tanah',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a45?w=800&q=80',
  },
  {
    label: 'Kurasi Kopi',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  },
  {
    label: 'Greenhouse & IoT',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  },
  {
    label: 'Pendampingan Kebun',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
  },
  {
    label: 'Dokumentasi UMKM',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
  },
];

export function createBlankServiceItem(): ManagedServiceItem {
  const nowIso = new Date().toISOString();
  return {
    id: `srv-${Date.now()}`,
    title: '',
    shortSummary: '',
    description: '',
    category: 'konsultasi',
    categoryLabel: 'Konsultasi & Formulasi',
    priceStartingFrom: 250000,
    priceUnit: 'sesi / kunjungan',
    coverImage: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a45?w=800&q=80',
    locationArea: 'Jawa Barat & Konsultasi Online',
    fullAddress: '',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Sabtu (08:00 - 16:30 WIB)',
    contactPhone: '0812-0000-0000',
    durationEstimate: '2 - 3 Hari Kerja',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary:
      'Tahap 1: Observasi & Analisis Awal (40%) • Tahap 2: Pelaksanaan & Laporan Hasil (60%)',
    status: 'active',
    totalCompletedJobs: 1,
    provider: {
      id: `pro-${Date.now()}`,
      name: 'Praktisi Mitra Racik',
      titleExpertise: 'Konsultan & Spesialis Lapangan',
      bio: 'Praktisi berpengalaman dalam pendampingan teknis, kurasi kualitas, dan solusi terapan Nusantara.',
      rating: 5.0,
      isVerified: true,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function ServiceManagementModal({
  initialItem,
  onClose,
  onSave,
}: ServiceManagementModalProps) {
  const isNew = !initialItem;
  const [form, setForm] = useState<ManagedServiceItem>(
    initialItem ? { ...initialItem, provider: { ...initialItem.provider } } : createBlankServiceItem(),
  );
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(catId: string) {
    const found = SERVICE_CATEGORY_OPTIONS.find((c) => c.id === catId);
    setForm({
      ...form,
      category: catId,
      categoryLabel: found ? found.label : catId,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Judul layanan jasa wajib diisi.');
      return;
    }
    if (!form.description.trim()) {
      setError('Deskripsi lengkap jasa wajib diisi.');
      return;
    }
    if (!form.fullAddress.trim() || !form.locationArea.trim()) {
      setError('Alamat lengkap dan wilayah cakupan layanan wajib diisi.');
      return;
    }

    setError(null);
    onSave({
      ...form,
      shortSummary:
        form.shortSummary.trim() || form.description.trim().slice(0, 140),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  }

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/65 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl border-2 border-sky-200 bg-white shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-sky-800 via-sky-700 to-teal-700 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Manajemen Layanan — Role Penyedia Jasa (Service Provider)
              </span>
              <h3 className="truncate text-base sm:text-lg font-bold mt-0.5">
                {isNew
                  ? 'Tambah & Tulis Layanan Jasa Baru (Deskripsi, Gambar, Alamat & Tarif)'
                  : `Kelola & Edit Jasa: ${form.title}`}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bar Mode Edit vs Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 bg-slate-50 px-6 py-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                mode === 'edit'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" />
              Form Kelola Jasa (Tulis, Gambar &amp; Alamat)
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                mode === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Mode Preview Kartu Layanan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status Layanan:</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'active' | 'draft' })
              }
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800"
            >
              <option value="active">Aktif Ditawarkan</option>
              <option value="draft">Draft / Disembunyikan</option>
            </select>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {mode === 'preview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kartu Preview */}
              <div className="lg:col-span-5 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Pratinjau Kartu di Halaman /services
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <img
                      src={form.coverImage}
                      alt={form.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                      {form.categoryLabel}
                    </span>
                    {form.hasMilestones && (
                      <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Milestones
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                        {form.provider.name.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          {form.provider.name}
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {form.provider.titleExpertise}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {form.provider.rating.toFixed(1)}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {form.title || '(Judul Jasa Belum Diisi)'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {form.shortSummary || form.description || '(Deskripsi belum diisi)'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate max-w-[150px]">{form.locationArea}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Mulai dari</span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {formatRupiah(form.priceStartingFrom)}
                        </span>
                        <span className="text-[10px] text-slate-500">/{form.priceUnit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Lengkap Jasa */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {form.title || '(Judul Jasa)'}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {form.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" /> Alamat Praktik / Workshop:
                    </span>
                    <p className="text-slate-600">{form.fullAddress || '-'}</p>
                    <p className="text-[11px] text-sky-700 font-semibold">
                      Cakupan: {form.locationArea}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Jam Operasional &amp; Kontak:
                    </span>
                    <p className="text-slate-600">{form.operatingHours}</p>
                    <p className="text-slate-600">Telp/WA: {form.contactPhone}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Estimasi Pengerjaan: {form.durationEstimate}
                    </p>
                  </div>
                </div>
                {form.hasMilestones && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                    <p className="font-bold mb-1">Tahapan Kontrak Milestone Escrow:</p>
                    <p>{form.milestonesSummary}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Penulisan Jasa, Alamat & Spesifikasi (7 Kolom) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-sky-700" />
                    1. Informasi Utama &amp; Penulisan Deskripsi Jasa
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Layanan Jasa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Contoh: Pemeriksaan Kesuburan Tanah & Formulasi Pemupukan Presisi"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori Keahlian
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        {SERVICE_CATEGORY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Metode Pelaksanaan Layanan
                      </label>
                      <select
                        value={form.serviceMode}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            serviceMode: e.target.value as 'onsite' | 'online' | 'hybrid',
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="onsite">Kunjungan Lokasi (On-Site Lapangan)</option>
                        <option value="online">Daring / Konsultasi Online</option>
                        <option value="hybrid">Hybrid (Kunjungan Lapangan &amp; Online)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ringkasan Singkat Layanan (Tampil di Kartu Katalog)
                    </label>
                    <textarea
                      rows={2}
                      value={form.shortSummary}
                      onChange={(e) => setForm({ ...form, shortSummary: e.target.value })}
                      placeholder="Ringkasan 1-2 kalimat mengenai manfaat utama jasa Anda..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deskripsi Teknis Lengkap &amp; Lingkup Pekerjaan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Tuliskan rincian pekerjaan, metode yang digunakan, peralatan yang dibawa, serta hasil akhir yang diterima klien..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-800"
                    />
                  </div>
                </div>

                {/* Bagian 2: Alamat Lengkap, Wilayah Cakupan & Jadwal */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    2. Alamat Praktik / Workshop, Cakupan Wilayah &amp; Kontak
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Lengkap Kantor / Studio / Workshop / Lab <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.fullAddress}
                      onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                      placeholder="Contoh: Jl. Raya Dramaga Km 7 No. 14, Kec. Dramaga, Kab. Bogor, Jawa Barat 16680"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Wilayah Jangkauan Layanan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.locationArea}
                        onChange={(e) => setForm({ ...form, locationArea: e.target.value })}
                        placeholder="Contoh: Jawa Barat, Jabodetabek & Online"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Operasional Layanan
                      </label>
                      <input
                        type="text"
                        value={form.operatingHours}
                        onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                        placeholder="Senin - Sabtu (08:00 - 16:30 WIB)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Kontak / Koordinasi
                      </label>
                      <input
                        type="text"
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estimasi Durasi Pengerjaan
                      </label>
                      <input
                        type="text"
                        value={form.durationEstimate}
                        onChange={(e) => setForm({ ...form, durationEstimate: e.target.value })}
                        placeholder="Contoh: 3 - 5 Hari Kerja"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Batas Kuota Revisi / Garansi
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={form.maxRevisions}
                        onChange={(e) =>
                          setForm({ ...form, maxRevisions: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Gambar Sampul, Tarif, Milestone & Profil Keahlian (5 Kolom) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Bagian 3: Gambar Sampul Jasa */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-sky-600" />
                    3. Gambar Sampul &amp; Dokumentasi Jasa
                  </h4>

                  <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200 relative">
                    <img
                      src={form.coverImage}
                      alt={form.title || 'Preview Jasa'}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      URL Gambar Sampul Jasa
                    </label>
                    <input
                      type="text"
                      value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 mb-1.5">
                      Atau Pilih Cepat Gambar Dokumentasi Sesuai Bidang:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SERVICE_IMAGES.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setForm({ ...form, coverImage: img.url })}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
                            form.coverImage === img.url
                              ? 'border-sky-600 bg-sky-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Tarif & Skema Milestone */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-amber-700" />
                    4. Tarif Layanan &amp; Tahapan Kontrak (Milestones)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tarif Mulai (Rp)
                      </label>
                      <input
                        type="number"
                        min={10000}
                        step={5000}
                        value={form.priceStartingFrom}
                        onChange={(e) =>
                          setForm({ ...form, priceStartingFrom: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Tarif
                      </label>
                      <input
                        type="text"
                        value={form.priceUnit}
                        onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                        placeholder="sesi / proyek / hektar / sampel"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.hasMilestones}
                      onChange={(e) => setForm({ ...form, hasMilestones: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    Aktifkan Pembayaran Bertahap (Milestone Escrow)
                  </label>

                  {form.hasMilestones && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Rincian Tahapan Pencairan Milestone
                      </label>
                      <textarea
                        rows={2}
                        value={form.milestonesSummary}
                        onChange={(e) =>
                          setForm({ ...form, milestonesSummary: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Bagian 5: Identitas Praktisi / Penyedia Jasa */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    5. Profil Praktisi / Penyedia Jasa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nama Praktisi / Tim Ahli
                      </label>
                      <input
                        type="text"
                        value={form.provider.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            provider: { ...form.provider, name: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Gelar / Spesialisasi Keahlian
                      </label>
                      <input
                        type="text"
                        value={form.provider.titleExpertise}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            provider: { ...form.provider, titleExpertise: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
              >
                <Eye className="h-4 w-4" />
                {mode === 'preview' ? 'Kembali ke Form Edit' : 'Lihat Preview'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Save className="h-4 w-4" />
                {isNew ? 'Simpan & Tawarkan Jasa Baru' : 'Simpan Perubahan Jasa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

