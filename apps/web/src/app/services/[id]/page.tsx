'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Star,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Layers,
  Clock,
  RotateCw,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Eye,
  Lock,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { demoServices } from '@/lib/demo-data';
import { getManagedServices } from '@/lib/service-provider-store';
import { openOrCreatePartnerChatThread } from '@/lib/partner-chat-store';
import { PartnerChatModal } from '@/components/chat/PartnerChatWorkspace';

export interface MilestoneTemplate {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  percentage: number;
  estimatedDays: number;
  deliverables: string[];
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  shortSummary?: string;
  category: string;
  priceStartingFrom: number;
  priceUnit: string;
  coverImage?: string;
  locationArea: string;
  fullAddress?: string;
  operatingHours?: string;
  durationEstimate?: string;
  maxRevisions: number;
  provider: {
    id: string;
    name: string;
    titleExpertise: string;
    avatar?: string;
    rating: number;
    completedProjects: number;
    bio?: string;
    isVerified?: boolean;
    joinedAt?: string;
  };
  milestones?: MilestoneTemplate[];
  createdAt: string;
  isDemo?: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [returnHref, setReturnHref] = useState('/admin/moderation');
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    setIsLivePreview(searchParams.get('mode') === 'live-preview');
    const from = searchParams.get('from');
    if (from && from.startsWith('/')) {
      setReturnHref(from);
    }
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch service detail (utamakan dari Managed Services Store agar seluruh Layanan Homepage tampil Live penuh)
  const { data: service, isLoading, isError, error, refetch } = useQuery<ServiceDetail>({
    queryKey: ['service-detail', serviceId],
    queryFn: async () => {
      const managedList = getManagedServices();
      const matchedManaged = managedList.find((item) => item.id === serviceId);
      if (matchedManaged) {
        return {
          id: matchedManaged.id,
          title: matchedManaged.title,
          description: matchedManaged.description,
          shortSummary: matchedManaged.shortSummary,
          category: matchedManaged.categoryLabel || matchedManaged.category,
          priceStartingFrom: matchedManaged.priceStartingFrom,
          priceUnit: matchedManaged.priceUnit,
          coverImage: matchedManaged.coverImage,
          locationArea: matchedManaged.locationArea,
          fullAddress: matchedManaged.fullAddress,
          operatingHours: matchedManaged.operatingHours,
          durationEstimate: matchedManaged.durationEstimate,
          maxRevisions: matchedManaged.maxRevisions ?? 3,
          provider: {
            id: matchedManaged.provider.id,
            name: matchedManaged.provider.name,
            titleExpertise: matchedManaged.provider.titleExpertise,
            rating: matchedManaged.provider.rating,
            completedProjects: matchedManaged.totalCompletedJobs ?? 15,
            isVerified: matchedManaged.provider.isVerified,
          },
          createdAt: matchedManaged.createdAt,
          isDemo: false,
        };
      }

      try {
        const res = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Layanan tidak ditemukan atau belum aktif');
        }

        const json = await res.json();
        return json.data || json;
      } catch (err) {
        const fallback = demoServices.find((item) => item.id === serviceId);
        if (process.env.NODE_ENV !== 'development' || !fallback) throw err;
        return { ...fallback, isDemo: true };
      }
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 3,
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleBookService = () => {
    if (isLivePreview || !service) return;
    setIsSubmitting(true);
    try {
      const serviceContract = {
        serviceId: service.id,
        serviceTitle: service.title,
        providerId: service.provider.id,
        providerName: service.provider.name,
        price: service.priceStartingFrom,
        milestones: service.milestones || [],
        notes: notes,
      };
      localStorage.setItem('rm_active_service_contract', JSON.stringify(serviceContract));
      router.push(`/checkout?type=service&id=${service.id}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const backToHomepageHref = `/?mode=live-preview&from=${encodeURIComponent(returnHref)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="w-full h-72 bg-slate-200 rounded-3xl" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-64 bg-slate-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Layanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            {(error as Error)?.message || 'Layanan yang Anda tuju mungkin dinonaktifkan atau telah dihapus.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Muat Ulang
            </button>
            <Link
              href={isLivePreview ? backToHomepageHref : '/services'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              {isLivePreview ? 'Kembali ke Live Homepage' : 'Kembali ke Layanan'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const milestones: MilestoneTemplate[] =
    service.milestones && service.milestones.length > 0
      ? service.milestones
      : [
          {
            id: 'm1',
            stepNumber: 1,
            title: 'Konsultasi & Pengumpulan Data Awal',
            description: 'Survey kondisi lapangan/kebutuhan dan penentuan parameter teknis.',
            percentage: 30,
            estimatedDays: 3,
            deliverables: ['Laporan audit awal', 'Rekomendasi teknis tertulis'],
          },
          {
            id: 'm2',
            stepNumber: 2,
            title: 'Eksekusi & Pendampingan Lapangan',
            description: 'Penerapan pelatihan, formulasi, atau pengerjaan teknis sesuai kontrak.',
            percentage: 50,
            estimatedDays: 7,
            deliverables: ['Bukti dokumentasi pengerjaan', 'Data log implementasi'],
          },
          {
            id: 'm3',
            stepNumber: 3,
            title: 'Evaluasi Hasil & Serah Terima Kontrak',
            description: 'Uji efektivitas hasil pengerjaan, laporan akhir, dan evaluasi kepuasan klien.',
            percentage: 20,
            estimatedDays: 4,
            deliverables: ['Laporan evaluasi final', 'Berita Acara Serah Terima (BAST)'],
          },
        ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Keterangan Mode Live Homepage (Mode Preview) */}
        {isLivePreview ? (
          <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-4 sm:p-5 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                      <Lock className="h-3 w-3" /> MODE LIVE HOMEPAGE (MODE PREVIEW)
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-200">
                      Tampilan Detail Jasa Live Penuh • Akses Mengubah & Kontrak Dibatasi
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-indigo-100 leading-relaxed">
                    Anda sedang meninjau halaman <strong>Live Detail Layanan Jasa</strong> ukuran penuh. Pada mode ini, pengajuan kontrak dan perubahan data dikunci.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={backToHomepageHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/25 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Live Homepage
                </Link>
                <Link
                  href={returnHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition shadow-sm"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/services" className="hover:text-emerald-600 transition-colors">
              Layanan
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize text-slate-400">{service.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
              {service.title}
            </span>
          </nav>
        )}

        {service.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Jasa pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Layout Utama: Kiri (Detail & Milestone), Kanan (Booking Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SISI KIRI (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src={service.coverImage || '/placeholder-service.svg'}
                  alt={service.title}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/95 text-emerald-900 text-[11px] font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
                  {service.category}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {service.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {service.locationArea || 'Online / Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Estimasi {service.durationEstimate || '1-2 Minggu'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                    <FileCheck2 className="w-4 h-4" />
                    Maks. {service.maxRevisions || 3}x Revisi / Milestone
                  </span>
                </div>
              </div>

              {/* Alamat Praktik / Workshop Lengkap */}
              {(service.fullAddress || service.operatingHours) && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 text-xs text-slate-700 space-y-1">
                  {service.fullAddress && (
                    <p>
                      <strong className="text-sky-950">Alamat Praktik / Workshop:</strong>{' '}
                      {service.fullAddress}
                    </p>
                  )}
                  {service.operatingHours && (
                    <p>
                      <strong className="text-sky-950">Jam Operasional Layanan:</strong>{' '}
                      {service.operatingHours}
                    </p>
                  )}
                </div>
              )}

              {/* Deskripsi Lingkup Kerja */}
              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ruang Lingkup & Deskripsi Layanan
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {service.description}
                </div>
              </div>
            </div>

            {/* SEKSI MILESTONES / TAHAPAN KERJA */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Tahapan Kerja (Milestones) & Pencairan Dana
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Dana pembayaran Anda diamankan di sistem Escrow dan hanya dicairkan per milestone setelah Anda mengonfirmasi hasil pengerjaan.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {milestones.map((ms, index) => {
                  const milestonePrice = (service.priceStartingFrom * ms.percentage) / 100;
                  return (
                    <div
                      key={ms.id || index}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {ms.stepNumber || index + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800">{ms.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                          {ms.percentage}% ({formatRupiah(milestonePrice)})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 pl-10 leading-relaxed">
                        {ms.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-0.5">
                  <p className="font-bold">Proteksi Garansi Escrow Layanan</p>
                  <p className="text-emerald-800 leading-relaxed">
                    Setiap milestone dapat diajukan revisi maksimal 3 kali jika hasil belum sesuai perjanjian kerja sebelum Anda menyetujui pencairan dana ke pihak penyedia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SISI KANAN (Col 4): Sticky Order Box */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div>
                <span className="text-xs text-slate-400 font-medium">Biaya Jasa Mulai Dari</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {formatRupiah(service.priceStartingFrom)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    /{service.priceUnit || 'proyek'}
                  </span>
                </div>
              </div>

              {/* Provider Info Ringkas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                    {service.provider?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {service.provider?.name}
                      </span>
                      {service.provider?.isVerified !== false && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {service.provider?.titleExpertise || 'Praktisi Ahli'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {service.provider?.rating ? service.provider.rating.toFixed(1) : '5.0'}
                    </span>
                    <span className="text-[10px] text-slate-400">Rating Klien</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {service.provider?.completedProjects || 12}+
                    </span>
                    <span className="text-[10px] text-slate-400">Pekerjaan Selesai</span>
                  </div>
                </div>

                {!isLivePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      const thread = openOrCreatePartnerChatThread({
                        partnerId: service.provider?.id || service.id,
                        partnerName: service.provider?.name || 'Penyedia Jasa',
                        partnerRole: 'service_provider',
                        partnerLocation: service.locationArea || 'Indonesia',
                        subjectTitle: service.title,
                        subjectId: service.id,
                      });
                      setActiveChatThreadId(thread.id);
                      setIsChatOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-sky-900 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
                    Chat Penyedia Jasa (Tanya Detail Pekerjaan)
                  </button>
                )}
              </div>

              {isLivePreview && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Mode Live Homepage (Mode Preview):</strong> Pengajuan kontrak layanan dinonaktifkan pada mode pratinjau ini.
                  </span>
                </div>
              )}

              {/* Catatan / Kebutuhan Khusus */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Catatan Tambahan untuk Tenaga Ahli (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  disabled={isLivePreview}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isLivePreview
                      ? 'Input catatan dikunci pada Mode Live Preview...'
                      : 'Ceritakan gambaran lokasi atau kebutuhan teknis Anda...'
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* CTA Booking Button */}
              <button
                onClick={handleBookService}
                disabled={isLivePreview || isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLivePreview ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Kontrak Dibatasi (Mode Preview)
                  </>
                ) : (
                  <>
                    Ajukan Kontrak Layanan Bertahap
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <PartnerChatModal
        isOpen={isChatOpen}
        threadId={activeChatThreadId}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
