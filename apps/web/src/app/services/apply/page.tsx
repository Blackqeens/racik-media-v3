'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { submitPartnerActivationRequest } from '@/lib/admin-administration-store';
import { SERVICE_CATEGORY_OPTIONS } from '@/lib/service-provider-store';

export default function ApplyServiceProviderPage() {
  const { session, user } = useAuth();

  const [fullName, setFullName] = useState(
    (session?.user?.user_metadata?.full_name as string | undefined) || '',
  );
  const [titleExpertise, setTitleExpertise] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [categoryLabel, setCategoryLabel] = useState(SERVICE_CATEGORY_OPTIONS[0].label);
  const [ktpNumber, setKtpNumber] = useState('');
  const [certificateRef, setCertificateRef] = useState('');
  const [startingPrice, setStartingPrice] = useState('250000');
  const [phone, setPhone] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [description, setDescription] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const app = submitPartnerActivationRequest({
      memberName: fullName.trim() || user?.email || 'Member Racik Media',
      memberEmail: session?.user?.email || user?.email || 'member@racikmedia.id',
      targetRole: 'service_provider',
      proposedBusinessName: `${serviceTitle.trim()} (${titleExpertise.trim() || fullName.trim()})`,
      region: locationArea.trim() || 'Nusantara',
      commodityFocus: `${categoryLabel} — Mulai Rp ${Number(startingPrice || 0).toLocaleString('id-ID')}. ${description.trim()}`,
      ktpNumber: ktpNumber.trim(),
      npwpNumber: certificateRef.trim() || 'Sertifikat Keahlian / Portofolio',
      nibNumber: certificateRef.trim() || 'Portofolio Praktisi',
      warehouseOrStoreAddress: fullAddress.trim(),
      phone: phone.trim(),
    });
    setSubmittedId(app.id);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Katalog Jasa
      </Link>

      {/* Hero dengan warna seragam Dashboard Penyedia Jasa (sky-blue gradient) */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-sky-300/60 p-6 text-white shadow-lg">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-12 -top-16 -z-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-16 right-8 -z-10 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <div className="relative z-10 space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Tawarkan Jasa Mu di Racik Media Nusantara
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
            Ajukan keahlian agronomi, uji lab tanah, kurasi kopi, pelatihan kriya, atau instalasi IoT Anda. Berkas keahlian &amp; identitas akan diverifikasi oleh <strong>Role Admin</strong> sebelum akun Penyedia Jasa Anda diaktifkan.
          </p>
        </div>
      </div>

      {submittedId ? (
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-sky-950">
                Pengajuan Aktivasi Penyedia Jasa Berhasil Dikirim!
              </h2>
              <p className="text-xs sm:text-sm text-sky-900 leading-relaxed">
                Permohonan Anda untuk layanan <strong>{serviceTitle}</strong> (Kode:{' '}
                <code>{submittedId}</code>) telah masuk ke antrean verifikasi KYB &amp; Kredensial <strong>Role Admin</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/services"
              className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white"
            >
              Kembali ke Katalog Jasa
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-xs font-bold text-sky-900"
            >
              Ke Dashboard Member
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-sky-600" />
            Formulir Pengajuan Keahlian &amp; Aktivasi Penyedia Jasa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Praktisi / Lembaga *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Misal: Ir. Hendro Kusuma"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gelar / Bidang Keahlian Utama *
              </label>
              <input
                type="text"
                required
                value={titleExpertise}
                onChange={(e) => setTitleExpertise(e.target.value)}
                placeholder="Misal: Agronom & Konsultan Irigasi"
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Layanan Jasa yang Ditawarkan *
              </label>
              <input
                type="text"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="Misal: Pendampingan Budidaya Hortikultura Organik"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Layanan *
              </label>
              <select
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="input-base"
              >
                {SERVICE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK KTP (Verifikasi Admin) *
              </label>
              <input
                type="text"
                required
                value={ktpNumber}
                onChange={(e) => setKtpNumber(e.target.value)}
                placeholder="16 digit NIK"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Sertifikat / Lisensi / Portofolio
              </label>
              <input
                type="text"
                value={certificateRef}
                onChange={(e) => setCertificateRef(e.target.value)}
                placeholder="Nomor sertifikasi kompetensi"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usulan Tarif Mulai (Rp) *
              </label>
              <input
                type="number"
                required
                min={50000}
                step={25000}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wilayah Cakupan Layanan *
              </label>
              <input
                type="text"
                required
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                placeholder="Contoh: Bandung, Garut & Konsultasi Online"
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Workshop / Klinik / Kantor Lengkap *
            </label>
            <input
              type="text"
              required
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Alamat lengkap untuk verifikasi Role Admin"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Ruang Lingkup &amp; Pengalaman Layanan *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan metode kerja, tahapan milestone yang Anda tawarkan, serta portofolio proyek sebelumnya..."
              className="input-base"
            />
          </div>

          <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-[11px] text-sky-900 flex items-start gap-2">
            <FileText className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              Pengajuan akan ditinjau oleh <strong>Role Admin</strong> (identitas &amp; sertifikasi) dan layanan Anda akan dikurasi <strong>Role Moderator</strong> setelah akun Penyedia Jasa aktif.
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3 px-4 text-sm font-extrabold text-white shadow-md transition inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Kirim Pengajuan Aktivasi Penyedia Jasa
          </button>
        </form>
      )}
    </div>
  );
}

