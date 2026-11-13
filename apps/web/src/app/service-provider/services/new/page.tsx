'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  MapPin,
  Save,
  UserCheck,
  Wrench,
} from 'lucide-react';
import {
  ManagedServiceItem,
  SERVICE_CATEGORY_OPTIONS,
  upsertManagedService,
} from '@/lib/service-provider-store';
import { createBlankServiceItem } from '@/components/services/ServiceManagementModal';

export default function NewServicePage() {
  const router = useRouter();
  const [form, setForm] = useState<ManagedServiceItem>(() => createBlankServiceItem());
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    upsertManagedService({
      ...form,
      shortSummary: form.shortSummary.trim() || form.description.trim().slice(0, 140),
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/service-provider/services');
    }, 1000);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/service-provider/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kelola Jasa Saya
        </Link>
        <Link
          href="/services"
          className="text-xs font-semibold text-sky-700 hover:underline"
        >
          Lihat Katalog Layanan Publik →
        </Link>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-900 via-sky-800 to-teal-800 p-6 text-white shadow-md space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
          <Wrench className="h-3.5 w-3.5" /> Formulir Penawaran Jasa Baru
        </span>
        <h1 className="font-serif text-2xl font-bold">
          Tulis &amp; Tambahkan Layanan Jasa Keahlian Anda
        </h1>
        <p className="text-xs text-sky-100">
          Lengkapi judul jasa, deskripsi pekerjaan, foto sampul dokumentasi, alamat lengkap kantor/workshop, serta cakupan wilayah dan tarif layanan.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Layanan jasa baru berhasil disimpan! Mengalihkan ke daftar Kelola Jasa Saya...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Penulisan Judul & Deskripsi Jasa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-sky-600" />
            1. Penulisan Judul &amp; Deskripsi Layanan Jasa
          </h2>

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
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Keahlian
              </label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800"
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
                Metode Pelaksanaan
              </label>
              <select
                value={form.serviceMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serviceMode: e.target.value as 'onsite' | 'online' | 'hybrid',
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800"
              >
                <option value="onsite">Kunjungan Lokasi (On-Site Lapangan)</option>
                <option value="online">Daring / Konsultasi Online</option>
                <option value="hybrid">Hybrid (Kunjungan Lapangan &amp; Online)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ringkasan Singkat Jasa
            </label>
            <textarea
              rows={2}
              value={form.shortSummary}
              onChange={(e) => setForm({ ...form, shortSummary: e.target.value })}
              placeholder="Ringkasan 1-2 kalimat mengenai manfaat utama layanan Anda..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs leading-relaxed text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Teknis Lengkap &amp; Lingkup Pekerjaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tuliskan rincian tahapan pekerjaan, alat yang digunakan, serta hasil akhir yang diterima pengguna jasa..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs leading-relaxed text-slate-800"
            />
          </div>
        </div>

        {/* 2. Menambahkan Gambar Sampul */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-sky-600" />
            2. Tambahkan Gambar Sampul Dokumentasi Jasa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={form.coverImage}
                alt="Preview Jasa"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Gambar Sampul Jasa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Pastikan gambar sesuai dengan tema keahlian yang Anda tawarkan agar lolos kurasi tampilan publik.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Menambahkan Alamat Lengkap & Wilayah Cakupan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            3. Alamat Lengkap Praktik / Workshop &amp; Wilayah Layanan
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Lengkap Tempat Praktik / Studio / Lab / Workshop <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              placeholder="Contoh: Jl. Raya Dramaga Km 7 No. 14, Kec. Dramaga, Kab. Bogor, Jawa Barat 16680"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cakupan Wilayah Layanan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.locationArea}
                onChange={(e) => setForm({ ...form, locationArea: e.target.value })}
                placeholder="Jawa Barat & Konsultasi Online"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={form.operatingHours}
                onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Kontak / Koordinasi
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 4. Tarif, Durasi & Identitas Praktisi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-600" />
            4. Tarif Layanan, Milestone &amp; Profil Keahlian
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarif Mulai Dari (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={10000}
                value={form.priceStartingFrom}
                onChange={(e) =>
                  setForm({ ...form, priceStartingFrom: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-emerald-700"
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
                placeholder="per sesi / per hektar / per paket"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Waktu Pengerjaan
              </label>
              <input
                type="text"
                value={form.durationEstimate}
                onChange={(e) => setForm({ ...form, durationEstimate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Praktisi / Penyedia Jasa
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
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Spesialisasi / Gelar Keahlian
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
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/service-provider/services"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition"
          >
            <Save className="h-4 w-4" />
            Simpan &amp; Tayangkan Jasa
          </button>
        </div>
      </form>
    </div>
  );
}

