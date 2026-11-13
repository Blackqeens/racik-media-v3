'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarX,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Image as ImageIcon,
  MapPin,
  Newspaper,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Video,
} from 'lucide-react';
import {
  EditorialArchiveItem,
  useEditorialArchive,
} from '@/lib/editorial-archive';
import { EditorialReviewModal } from '@/components/moderation/EditorialReviewModal';

const EVENT_TABS = [
  { id: 'all', label: 'Semua Agenda' },
  { id: 'online', label: 'Webinar Online' },
  { id: 'offline', label: 'Workshop Lapangan' },
  { id: 'free', label: 'Acara Gratis' },
];

export default function EventsPage() {
  const { items: archiveItems, canPublishToHomepage, updateItem } = useEditorialArchive();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingItem, setEditingItem] = useState<EditorialArchiveItem | null>(null);

  const events = useMemo(() => {
    return archiveItems.filter((item) => {
      if (item.entityType !== 'event') return false;
      if (activeTab === 'online' && item.eventType !== 'online') return false;
      if (activeTab === 'offline' && item.eventType !== 'offline') return false;
      if (activeTab === 'free' && (item.price ?? 0) !== 0) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = `${item.title} ${item.excerpt} ${item.submitterName} ${item.location}`
          .toLowerCase()
          .includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [archiveItems, activeTab, searchTerm]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Segera Hadir';
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

  const formatRupiah = (val?: number) => {
    if (!val || val === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Bar Akses Moderator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Koleksi Event &amp; Pelatihan Terkurasi Moderator
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Koleksi Event &amp; Agenda Nusantara
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Moderator memeriksa kelayakan penulisan agenda, kesesuaian poster/gambar acara dengan tema, serta mengelola publikasinya ke halaman Homepage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-900 transition"
            >
              <Newspaper className="h-4 w-4 text-emerald-600" />
              Koleksi Artikel
            </Link>
            <Link
              href="/admin/moderation"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <ClipboardCheck className="h-4 w-4" />
              Panel Arsip Moderator
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tema acara, hidroponik, formulasi pupuk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {EVENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
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

        {events.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <CalendarX className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Belum Ada Acara Ditemukan</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {events.map((evt) => {
              const remainingSeats = Math.max(
                0,
                (evt.maxAttendees ?? 100) - (evt.registeredAttendeesCount ?? 15),
              );

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden relative">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                      />

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
                        <span
                          className={`text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm ${
                            evt.publishedToHomepage
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {evt.publishedToHomepage ? 'Tayang Homepage' : 'Arsip'}
                        </span>
                      </div>

                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm ${
                          (evt.price ?? 0) === 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {formatRupiah(evt.price)}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{formatDate(evt.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {evt.startTime} - {evt.endTime}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-serif text-base font-bold text-slate-900 leading-snug">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {evt.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {evt.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Sisa {remainingSeats} kursi
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            evt.writingVerified ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {evt.writingVerified ? 'Deskripsi Terverifikasi' : 'Cek Penulisan'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            evt.imageThemeVerified ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          {evt.imageThemeVerified ? 'Poster Sesuai Tema' : 'Cek Gambar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar Aksi Edit & Pendaftaran */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(evt)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        canPublishToHomepage
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      {canPublishToHomepage
                        ? 'Analisis, Edit & Publik Homepage'
                        : 'Edit Event (Ajukan ke Moderator)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingItem && (
        <EditorialReviewModal
          item={editingItem}
          canPublishHomepage={canPublishToHomepage}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => updateItem(updated)}
        />
      )}
    </div>
  );
}
