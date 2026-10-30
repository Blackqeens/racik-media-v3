'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Sparkles,
  Video,
  Ticket,
  RotateCw,
  AlertCircle,
  CalendarX,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: 'webinar' | 'workshop' | 'field_day' | 'seminar';
  eventType: 'online' | 'offline';
  location: string; // misal: 'Google Meet / Zoom' atau 'Kebun Percobaan Lembang, Bandung'
  eventDate: string; // ISO date
  startTime: string; // misal: '09:00 WIB'
  endTime: string; // misal: '12:00 WIB'
  price: number; // 0 = Gratis
  maxAttendees?: number;
  registeredAttendeesCount?: number;
  bannerImage?: string;
  speaker: {
    name: string;
    role: string; // misal: 'Formulator Pupuk Organik & Praktisi'
    avatar?: string;
  };
  registrationUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface EventsResponse {
  data: EventItem[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const EVENT_TABS = [
  { id: 'all', label: 'Semua Agenda' },
  { id: 'online', label: 'Webinar Online' },
  { id: 'offline', label: 'Workshop Lapangan' },
  { id: 'free', label: 'Acara Gratis' },
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch events via TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery<EventsResponse>({
    queryKey: ['events-list', { tab: activeTab, search: searchTerm, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (activeTab === 'online') params.append('type', 'online');
      if (activeTab === 'offline') params.append('type', 'offline');
      if (activeTab === 'free') params.append('isFree', 'true');
      params.append('page', page.toString());
      params.append('limit', '9');

      const res = await fetch(`${API_BASE_URL}/content/events?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Gagal memuat agenda kegiatan dan webinar');
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 3, // Cache 3 menit
  });

  const events = data?.data || [];
  const meta = data?.meta;

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatRupiah = (val: number) => {
    if (val === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Agenda & Temu Praktisi Tani
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Event & Pelatihan Racik Media
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Tingkatkan keahlian bercocok tanam dan formulasi nutrisi melalui webinar interaktif, kelas teknis, dan workshop langsung bersama para pakar.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tema acara, hidroponik, formulasi pupuk..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {EVENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Konten Utama */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4"
              >
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-semibold text-red-900">Gagal Memuat Jadwal Acara</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {(error as Error)?.message || 'Koneksi ke server acara mengalami kendala.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Coba Lagi
            </button>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <CalendarX className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Belum Ada Acara Mendatang</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada agenda yang cocok dengan filter atau kata kunci &quot;{searchTerm}&quot;. Silakan periksa kembali nanti.
            </p>
          </div>
        ) : (
          /* Grid Acara */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const remainingSeats =
                evt.maxAttendees && evt.registeredAttendeesCount !== undefined
                  ? Math.max(0, evt.maxAttendees - evt.registeredAttendeesCount)
                  : null;

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Banner */}
                    <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden relative">
                      <img
                        src={evt.bannerImage || '/placeholder-event.png'}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Badge Online/Offline & Price */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 capitalize">
                          {evt.eventType === 'online' ? (
                            <>
                              <Video className="w-3 h-3 text-emerald-600" /> Online
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3 text-amber-600" /> Offline
                            </>
                          )}
                        </span>
                      </div>

                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm ${evt.price === 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                          }`}
                      >
                        {formatRupiah(evt.price)}
                      </span>
                    </div>

                    {/* Konten Acara */}
                    <div className="p-5 space-y-4">
                      {/* Tanggal & Waktu */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{formatDate(evt.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{evt.startTime} - {evt.endTime}</span>
                        </div>
                      </div>

                      {/* Judul & Deskripsi */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>

                      {/* Speaker Box */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {evt.speaker?.name?.charAt(0) || 'N'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {evt.speaker?.name || 'Narasumber Tamu'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {evt.speaker?.role || 'Pakar Pertanian'}
                          </p>
                        </div>
                      </div>

                      {/* Info Lokasi & Kuota */}
                      <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                        {remainingSeats !== null && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {remainingSeats > 0 ? (
                                <>Tersisa <strong className="text-emerald-700">{remainingSeats}</strong> kursi</>
                              ) : (
                                <span className="text-rose-600 font-bold">Kuota Penuh</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Daftar di Bawah */}
                  <div className="p-5 pt-0">
                    <a
                      href={evt.registrationUrl || `/events/${evt.id}/register`}
                      target={evt.registrationUrl ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${remainingSeats === 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
                        }`}
                    >
                      <Ticket className="w-4 h-4" />
                      {remainingSeats === 0 ? 'Pendaftaran Ditutup' : 'Daftar Sekarang'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}