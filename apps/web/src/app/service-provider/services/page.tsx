'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Image as ImageIcon,
  Layers,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  ManagedServiceItem,
  SERVICE_CATEGORY_OPTIONS,
  useManagedServices,
} from '@/lib/service-provider-store';
import { ServiceManagementModal } from '@/components/services/ServiceManagementModal';

export default function ManageMyServicesPage() {
  const { services, upsertService, removeService, resetServices } = useManagedServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingService, setEditingService] = useState<ManagedServiceItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchQuery =
        !searchTerm.trim() ||
        `${s.title} ${s.shortSummary} ${s.description} ${s.fullAddress} ${s.locationArea} ${s.provider.name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchTerm]);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
            <Wrench className="h-3.5 w-3.5 text-sky-600" />
            Manajemen Penuh Layanan Jasa (Role Service Provider)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Kelola Jasa Saya: Tulis Deskripsi, Gambar &amp; Alamat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Atur seluruh layanan keahlian Anda: tulis uraian teknis pekerjaan, perbarui foto sampul dokumentasi, tambahkan alamat lengkap praktik/workshop, serta kelola tarif dan kontrak milestone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Jasa Baru
          </button>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            <Eye className="h-4 w-4" />
            Lihat di Halaman /services
          </Link>
          <button
            type="button"
            onClick={resetServices}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 transition"
            title="Kembalikan contoh jasa bawaan"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan judul jasa, alamat workshop, wilayah layanan, atau kategori..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-sky-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Semua Jasa ({services.length})
          </button>
          {SERVICE_CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Kartu Kelola Jasa */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-sky-300 transition flex flex-col lg:flex-row gap-5"
          >
            {/* Gambar Sampul */}
            <div className="w-full lg:w-64 aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
              <img
                src={item.coverImage}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow">
                {item.categoryLabel}
              </span>
              <span
                className={`absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow ${item.status === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-white'
                  }`}
              >
                {item.status === 'active' ? 'Aktif di Katalog' : 'Draft'}
              </span>
            </div>

            {/* Detail Tulisan, Alamat & Spesifikasi */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Praktisi: <strong>{item.provider.name}</strong> ({item.provider.titleExpertise})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Tarif Mulai</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {formatRupiah(item.priceStartingFrom)}
                  </span>
                  <span className="text-xs text-slate-500">/{item.priceUnit}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>

              {/* Kotak Alamat & Operasional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    Alamat Lengkap &amp; Wilayah Layanan:
                  </p>
                  <p className="text-slate-600 leading-relaxed">{item.fullAddress}</p>
                  <p className="text-[11px] font-semibold text-sky-700">
                    Jangkauan: {item.locationArea}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Jadwal, Durasi &amp; Kontak:
                  </p>
                  <p className="text-slate-600">{item.operatingHours}</p>
                  <p className="text-slate-600">
                    Estimasi: <strong>{item.durationEstimate}</strong> &middot; Kontak:{' '}
                    <strong>{item.contactPhone}</strong>
                  </p>
                  {item.hasMilestones && (
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {item.milestonesSummary}
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Edit Deskripsi, Gambar &amp; Alamat
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      upsertService({
                        ...item,
                        status: item.status === 'active' ? 'draft' : 'active',
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    {item.status === 'active' ? 'Jadikan Draft' : 'Aktifkan Kembali'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeService(item.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Jasa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

