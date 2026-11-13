'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Sparkles,
  Video,
  Ticket,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  CalendarX,
  X,
} from 'lucide-react';
import { useEditorialArchive } from '@/lib/editorial-archive';

export interface HomepageEventItem {
  id: string;
  title: string;
  description: string;
  category: 'webinar' | 'workshop' | 'field_day' | 'seminar';
  eventType: 'online' | 'offline';
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  price: number;
  maxAttendees: number;
  registeredAttendeesCount: number;
  bannerImage: string;
  speaker: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const EVENTS_DATA: HomepageEventItem[] = [
  {
    id: 'evt-01-pupuk-organik',
    title: 'Webinar Nasional: Formulasi Pupuk Organik Cair & Mikroba Pembenah Tanah',
    description: 'Panduan teknis meracik POC dari limbah dapur dan kotoran ternak dengan isolasi bakteri indigenous untuk menyuburkan lahan kritis.',
    category: 'webinar',
    eventType: 'online',
    location: 'Zoom Meeting / YouTube Live',
    eventDate: '2026-06-20T09:00:00Z',
    startTime: '09:00 WIB',
    endTime: '11:30 WIB',
    price: 0,
    maxAttendees: 500,
    registeredAttendeesCount: 420,
    bannerImage: 'https://images.unsplash.com/photo-1585336261026-7f516a5a87d0?w=800&q=80',
    speaker: {
      name: 'Dr. Sarah Amalia',
      role: 'Pakar Mikrobiologi & Formulator Tanah',
    },
  },
  {
    id: 'evt-02-workshop-rotan',
    title: 'Workshop Lapangan: Teknik Anyam Rotan Kontemporer untuk Pasar Global',
    description: 'Praktik langsung menganyam furnitur dan aksesoris rumah tangga dari bahan rotan alami grade ekspor bersama maestro pengrajin Tegalwangi.',
    category: 'workshop',
    eventType: 'offline',
    location: 'Sentra Rotan Tegalwangi, Cirebon',
    eventDate: '2026-06-27T08:30:00Z',
    startTime: '08:30 WIB',
    endTime: '16:00 WIB',
    price: 250000,
    maxAttendees: 25,
    registeredAttendeesCount: 19,
    bannerImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    speaker: {
      name: 'Ki Anom Tegalwangi',
      role: 'Master Craftsman Rotan Cirebon',
    },
  },
  {
    id: 'evt-03-sensory-kopi',
    title: 'Kelas Intensif: Sensori Rasa & Uji Cupping Kopi Single Origin Nusantara',
    description: 'Pelajari standar SCA cupping protocol untuk mengidentifikasi catatan rasa, keasaman buah, dan kemanisan karamel biji kopi Indonesia.',
    category: 'workshop',
    eventType: 'offline',
    location: 'Lab Sensori Racik Media, Bandung',
    eventDate: '2026-07-04T10:00:00Z',
    startTime: '10:00 WIB',
    endTime: '15:00 WIB',
    price: 350000,
    maxAttendees: 20,
    registeredAttendeesCount: 18,
    bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    speaker: {
      name: 'Ir. Bayu Wicaksono',
      role: 'Q Grader & Konsultan Rasa Kopi',
    },
  },
  {
    id: 'evt-04-smart-farming',
    title: 'Bedah Teknologi: Instalasi Sensor IoT Murah untuk Kebun Sayur & Greenhouse',
    description: 'Workshop daring merakit sensor kelembapan tanah dan penyiraman otomatis berbasis microcontroller yang terhubung ke ponsel pintar.',
    category: 'webinar',
    eventType: 'online',
    location: 'Google Meet Interaktif',
    eventDate: '2026-07-11T13:30:00Z',
    startTime: '13:30 WIB',
    endTime: '16:00 WIB',
    price: 0,
    maxAttendees: 300,
    registeredAttendeesCount: 260,
    bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    speaker: {
      name: 'Budi Santoso, M.Kom',
      role: 'Inovator Smart Agriculture',
    },
  },
];

const EVENT_TABS = [
  { id: 'all', label: 'Semua Agenda' },
  { id: 'online', label: 'Webinar Online' },
  { id: 'offline', label: 'Workshop Lapangan' },
  { id: 'free', label: 'Acara Gratis' },
];

/**
 * HomepageEvents — Page section event & agenda komunitas khusus homepage.
 * Mengadopsi arsitektur, filter, dan data model dari `apps/web/src/app/events/page.tsx`
 * dengan fitur pendaftaran langsung interaktif.
 */
export function HomepageEvents() {
  const { items: archiveItems } = useEditorialArchive();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [registeredEvent, setRegisteredEvent] = useState<HomepageEventItem | null>(null);
  const [registeredList, setRegisteredList] = useState<Record<string, boolean>>({});

  const curatedEvents: HomepageEventItem[] = useMemo(() => {
    const fromArchive = archiveItems
      .filter((i) => i.entityType === 'event' && i.publishedToHomepage)
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.excerpt,
        category: (i.category as HomepageEventItem['category']) || 'webinar',
        eventType: i.eventType ?? 'online',
        location: i.location ?? 'Zoom Meeting / Online',
        eventDate: i.eventDate ?? i.publishedAt,
        startTime: i.startTime ?? '09:00 WIB',
        endTime: i.endTime ?? '12:00 WIB',
        price: i.price ?? 0,
        maxAttendees: i.maxAttendees ?? 100,
        registeredAttendeesCount: i.registeredAttendeesCount ?? 15,
        bannerImage: i.image,
        speaker: {
          name: i.submitterName,
          role: i.speakerRole ?? 'Praktisi & Narasumber Racik Media',
        },
      }));
    return fromArchive.length > 0 ? fromArchive : EVENTS_DATA;
  }, [archiveItems]);

  const filteredEvents = useMemo(() => {
    return curatedEvents.filter((evt) => {
      let matchTab = true;
      if (activeTab === 'online') matchTab = evt.eventType === 'online';
      else if (activeTab === 'offline') matchTab = evt.eventType === 'offline';
      else if (activeTab === 'free') matchTab = evt.price === 0;

      const matchSearch =
        !searchTerm ||
        `${evt.title} ${evt.description} ${evt.speaker.name} ${evt.location}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [curatedEvents, searchTerm, activeTab]);

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

  function handleRegister(evt: HomepageEventItem) {
    setRegisteredEvent(evt);
    setRegisteredList((prev) => ({ ...prev, [evt.id]: true }));
  }

  return (
    <section id="events" className="w-full px-4 sm:px-6 lg:px-10 py-12 bg-white">
      {/* Header & Sub-header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Temu Praktisi & Workshop
            </span>
            <span className="text-xs text-gray-400">Komunitas Belajar Mandiri</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Agenda Kegiatan & Pelatihan Nusantara
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1 max-w-2xl">
            Tingkatkan keterampilan bercocok tanam, formulasi nutrisi tanah, kriya tangan, dan
            uji cita rasa bersama pakar serta komunitas kreatif Racik Media.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>Semua Agenda</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar (Sesuai Events Page) */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Kolom Pencarian */}
          <div className="relative w-full sm:max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tema acara, pupuk organik, anyam rotan, kopi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Filter Tabs Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {EVENT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Acara Kegiatan */}
      {filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
          <CalendarX className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-gray-800">Belum Ada Agenda Mendatang</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tidak ada agenda yang cocok dengan kata kunci &quot;{searchTerm}&quot; pada kategori yang
            dipilih.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filter Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = !!registeredList[evt.id];
            const remainingSeats = Math.max(
              0,
              evt.maxAttendees - evt.registeredAttendeesCount - (isRegistered ? 1 : 0)
            );

            return (
              <div
                key={evt.id}
                className="group flex flex-col justify-between rounded-3xl border border-gray-200 bg-white overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div>
                  {/* Cover Banner 16:9 */}
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                    <img
                      src={evt.bannerImage}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badge Online/Offline & Harga */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-white/95 backdrop-blur text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 capitalize">
                        {evt.eventType === 'online' ? (
                          <>
                            <Video className="h-3 w-3 text-emerald-600" /> Online
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 text-amber-600" /> Offline
                          </>
                        )}
                      </span>
                    </div>

                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm ${
                        evt.price === 0
                          ? 'bg-emerald-700 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {formatRupiah(evt.price)}
                    </span>
                  </div>

                  {/* Konten Acara */}
                  <div className="p-5 space-y-4">
                    {/* Waktu & Jadwal */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{formatDate(evt.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>
                          {evt.startTime} - {evt.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Judul & Deskripsi */}
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {evt.title}
                      </h3>
                      <p className="font-sans text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    {/* Speaker Card Box */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="h-9 w-9 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {evt.speaker.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {evt.speaker.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {evt.speaker.role}
                        </p>
                      </div>
                    </div>

                    {/* Lokasi & Sisa Kuota */}
                    <div className="space-y-1 text-[11px] text-gray-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>
                          {remainingSeats > 0 ? (
                            <>
                              Tersisa <strong className="text-emerald-700">{remainingSeats}</strong> kursi
                            </>
                          ) : (
                            <span className="text-rose-600 font-bold">Kuota Penuh</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Pendaftaran */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleRegister(evt)}
                    disabled={remainingSeats === 0 || isRegistered}
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isRegistered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : remainingSeats === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-700" />
                        <span>Terdaftar! Cek Tiket</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4" />
                        <span>{remainingSeats === 0 ? 'Kuota Penuh' : 'Daftar Sekarang'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Popup Konfirmasi Pendaftaran Instan */}
      {registeredEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle className="h-5 w-5" />
                <span>Pendaftaran Berhasil!</span>
              </div>
              <button
                onClick={() => setRegisteredEvent(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-gray-900 text-base leading-snug">
                {registeredEvent.title}
              </h4>
              <p className="text-xs text-gray-500">
                Tempat duduk Anda telah diamankan. Undangan akses dan tautan ke ruang acara telah
                dikirimkan ke email terdaftar Anda.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Jadwal:</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(registeredEvent.eventDate)} ({registeredEvent.startTime})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lokasi:</span>
                <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                  {registeredEvent.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya:</span>
                <span className="font-bold text-emerald-700">
                  {formatRupiah(registeredEvent.price)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setRegisteredEvent(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

