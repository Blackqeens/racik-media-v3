'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  CheckCheck,
  Columns,
  ExternalLink,
  GripVertical,
  MapPin,
  Maximize2,
  MessageSquare,
  Minimize2,
  Send,
  ShieldCheck,
  Store,
  Truck,
  X,
} from 'lucide-react';
import {
  type ChatPartnerRole,
  type PartnerChatThread,
  usePartnerChats,
} from '@/lib/partner-chat-store';

interface PartnerChatWorkspaceProps {
  viewerRole: 'member' | ChatPartnerRole;
  viewerName?: string;
  initialThreadId?: string | null;
  compact?: boolean;
}

const ROLE_META: Record<
  ChatPartnerRole,
  {
    label: string;
    badgeClass: string;
    accentBg: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  seller: {
    label: 'Seller',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    accentBg: 'bg-amber-600',
    icon: Store,
  },
  distributor: {
    label: 'Distributor',
    badgeClass: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    accentBg: 'bg-cyan-600',
    icon: Truck,
  },
  service_provider: {
    label: 'Penyedia Jasa',
    badgeClass: 'bg-sky-100 text-sky-950 border-sky-300',
    accentBg: 'bg-sky-600',
    icon: BriefcaseBusiness,
  },
};

/**
 * 4 Warna Lembut Bertingkat (Soft Pastel Tiers)
 * Kontras diturunkan 50% agar nyaman di mata, tidak terlalu gelap / mencolok,
 * menggunakan border tipis bersih dan tipografi yang elegan.
 */
const CONTRAST_TIERS = [
  {
    id: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconBg: 'bg-emerald-500 text-white',
    cardIdle:
      'bg-emerald-50/40 border border-emerald-200/70 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300 shadow-2xs',
    cardActive:
      'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-300/50',
    topikIdle: 'text-slate-600 font-normal',
    topikActive: 'text-emerald-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-emerald-700 font-medium',
    unreadBadge: 'bg-emerald-500 text-white',
  },
  {
    id: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    iconBg: 'bg-amber-500 text-white',
    cardIdle:
      'bg-amber-50/40 border border-amber-200/70 text-slate-800 hover:bg-amber-50/80 hover:border-amber-300 shadow-2xs',
    cardActive:
      'bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-300/50',
    topikIdle: 'text-slate-600 font-normal',
    topikActive: 'text-amber-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-amber-700 font-medium',
    unreadBadge: 'bg-amber-500 text-white',
  },
  {
    id: 'sky',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
    iconBg: 'bg-sky-500 text-white',
    cardIdle:
      'bg-sky-50/40 border border-sky-200/70 text-slate-800 hover:bg-sky-50/80 hover:border-sky-300 shadow-2xs',
    cardActive:
      'bg-sky-50 border-2 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-300/50',
    topikIdle: 'text-slate-600 font-normal',
    topikActive: 'text-sky-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-sky-700 font-medium',
    unreadBadge: 'bg-sky-500 text-white',
  },
  {
    id: 'purple',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    iconBg: 'bg-purple-500 text-white',
    cardIdle:
      'bg-purple-50/40 border border-purple-200/70 text-slate-800 hover:bg-purple-50/80 hover:border-purple-300 shadow-2xs',
    cardActive:
      'bg-purple-50 border-2 border-purple-500 text-purple-950 shadow-xs ring-1 ring-purple-300/50',
    topikIdle: 'text-slate-600 font-normal',
    topikActive: 'text-purple-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-purple-700 font-medium',
    unreadBadge: 'bg-purple-500 text-white',
  },
];

function formatChatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function PartnerChatWorkspace({
  viewerRole,
  viewerName,
  initialThreadId,
  compact = false,
}: PartnerChatWorkspaceProps) {
  const { threads, sendMessage, markRead } = usePartnerChats();

  const [roleFilter, setRoleFilter] = useState<'all' | ChatPartnerRole>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pengaturan Resizer & Perbesar Detail Chat
  // Default: split left 36% list, right 64% detail chat
  const [leftPercent, setLeftPercent] = useState<number>(36);
  const [isMaximizedDetail, setIsMaximizedDetail] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const isMemberViewer = viewerRole === 'member';

  useEffect(() => {
    if (initialThreadId) {
      setSelectedThreadId(initialThreadId);
    }
  }, [initialThreadId]);

  const visibleThreads = useMemo(() => {
    if (!isMemberViewer) {
      return threads.filter((t) => t.partnerRole === viewerRole);
    }
    if (roleFilter === 'all') return threads;
    return threads.filter((t) => t.partnerRole === roleFilter);
  }, [threads, isMemberViewer, viewerRole, roleFilter]);

  const activeThread: PartnerChatThread | null = useMemo(() => {
    if (visibleThreads.length === 0) return null;
    if (selectedThreadId) {
      const found = visibleThreads.find((t) => t.id === selectedThreadId);
      if (found) return found;
    }
    return visibleThreads[0] ?? null;
  }, [visibleThreads, selectedThreadId]);

  useEffect(() => {
    if (!activeThread) return;
    markRead(activeThread.id, isMemberViewer ? 'member' : 'partner');
  }, [activeThread, isMemberViewer, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeThread?.messages.length, activeThread?.id]);

  // Logika Drag Resizer
  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newPercent = Math.round((currentX / rect.width) * 100);
      // Batasi ukuran kolom kiri: min 20%, max 65%
      if (newPercent >= 20 && newPercent <= 65) {
        setLeftPercent(newPercent);
      }
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const quickPrompts = useMemo(() => {
    if (!activeThread || !isMemberViewer) return [];
    if (activeThread.partnerRole === 'service_provider') {
      return [
        'Bisa jelaskan detail ruang lingkup pekerjaan & deliverables-nya?',
        'Kapan jadwal survei / konsultasi terdekat yang tersedia?',
        'Bagaimana pembagian termin Milestone & revisinya?',
      ];
    }
    if (activeThread.partnerRole === 'distributor') {
      return [
        'Apakah stok grosir siap kirim & berapa minimal order?',
        'Estimasi armada & ongkir ke alamat saya bagaimana?',
      ];
    }
    return [
      'Apakah produk ini ready stock & siap kirim hari ini?',
      'Boleh minta detail spesifikasi & pengemasannya?',
    ];
  }, [activeThread, isMemberViewer]);

  function handleSend(textToSend?: string) {
    if (!activeThread) return;
    const text = (textToSend ?? draft).trim();
    if (!text) return;

    sendMessage({
      threadId: activeThread.id,
      senderRole: isMemberViewer ? 'member' : 'partner',
      senderName:
        viewerName || (isMemberViewer ? 'Member Racik' : activeThread.partnerName),
      text,
      triggerDemoAutoReply: isMemberViewer,
    });
    if (!textToSend) setDraft('');
  }

  const totalUnread = visibleThreads.reduce(
    (sum, t) => sum + (isMemberViewer ? t.unreadByMember : t.unreadByPartner),
    0,
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      {/* Header Chat Workspace */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
            <span>
              {isMemberViewer
                ? 'Pusat Chat & Tanya Detail Pekerjaan / Produk Mitra'
                : `Kotak Pesan Masuk dari Member (${ROLE_META[viewerRole].label})`}
            </span>
            {totalUnread > 0 && (
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                {totalUnread} baru
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {isMemberViewer
              ? 'Tanya jawab langsung dengan Seller, Distributor, dan Penyedia Jasa dengan tampilan riwayat toko yang lembut & tertata rapi.'
              : 'Balas pertanyaan Member mengenai ketersediaan stok, armada distribusi, atau spesifikasi jasa secara terpusat.'}
          </p>
        </div>

        {/* Quick Toolbar Pengaturan Kolom (Perbesar / Geser Kolom) */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setIsMaximizedDetail(false);
              setLeftPercent(36);
            }}
            title="Tampilan Standar (36% : 64%)"
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
              !isMaximizedDetail && leftPercent === 36
                ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Standar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMaximizedDetail(false);
              setLeftPercent(25);
            }}
            title="Perbesar Detail Chat (25% : 75%)"
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
              !isMaximizedDetail && leftPercent === 25
                ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Perbesar Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMaximizedDetail((v) => !v)}
            title={isMaximizedDetail ? 'Kembalikan Tampilan Split' : 'Fokus Penuh Kolom Detail Chat'}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
              isMaximizedDetail
                ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isMaximizedDetail ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Buka Daftar Toko</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fokus Penuh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs Role (untuk Member) */}
      {isMemberViewer && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 px-4 py-2 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-500 mr-1">Filter Kategori:</span>
          {[
            { id: 'all' as const, label: `Semua Toko (${threads.length})` },
            {
              id: 'seller' as const,
              label: `Seller Produk (${threads.filter((t) => t.partnerRole === 'seller').length})`,
            },
            {
              id: 'distributor' as const,
              label: `Distributor Grosir (${threads.filter((t) => t.partnerRole === 'distributor').length})`,
            },
            {
              id: 'service_provider' as const,
              label: `Penyedia Jasa (${threads.filter((t) => t.partnerRole === 'service_provider').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Split Pane: Kolom Daftar Percakapan & Detail Chat yang Dapat Digeser / Diperbesar */}
      <div
        ref={containerRef}
        className={`relative flex flex-col md:flex-row select-none ${
          compact ? 'min-h-[420px] max-h-[500px]' : 'min-h-[520px] max-h-[620px]'
        }`}
      >
        {/* KOLOM KIRI: Daftar Toko & Riwayat Chat Member */}
        {!isMaximizedDetail && (
          <div
            style={{
              width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${leftPercent}%` : '100%',
            }}
            className="shrink-0 border-b md:border-b-0 md:border-r-2 border-slate-300 overflow-y-auto p-3 space-y-2.5 bg-slate-100/60"
          >
            {visibleThreads.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-600">
                <Store className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="font-extrabold text-slate-800">Belum ada percakapan untuk kategori ini.</p>
                <p className="mt-1 text-slate-500">
                  Kunjungi etalase Marketplace atau Katalog Jasa, lalu klik <strong>Tanya Detail / Chat Penjual</strong> untuk memulai obrolan.
                </p>
              </div>
            ) : (
              visibleThreads.map((t, index) => {
                const tier = CONTRAST_TIERS[index % CONTRAST_TIERS.length];
                const meta = ROLE_META[t.partnerRole];
                const Icon = meta.icon;
                const isSelected = activeThread?.id === t.id;
                const unread = isMemberViewer ? t.unreadByMember : t.unreadByPartner;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full text-left rounded-xl p-3.5 transition flex items-start gap-3 cursor-pointer ${
                      isSelected ? tier.cardActive : tier.cardIdle
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                        isSelected ? 'bg-emerald-600 text-white shadow-xs' : tier.iconBg
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      {/* Baris 1: Nama Toko + Note Role (Badge) + Waktu */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span
                          className={`truncate text-xs tracking-tight ${
                            isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800 font-semibold'
                          }`}
                        >
                          {isMemberViewer ? t.partnerName : `Member: ${t.partnerName}`}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                            isSelected
                              ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-2xs'
                              : tier.badgeClass
                          }`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {/* Baris 2: Topik / Produk / Jasa yang ditawarkan (HAPUS ISI CHAT) */}
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <p
                          className={`text-[11px] leading-snug line-clamp-2 ${
                            isSelected ? tier.topikActive : tier.topikIdle
                          }`}
                          title={t.subjectTitle}
                        >
                          Topik: {t.subjectTitle}
                        </p>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] ${
                              isSelected ? tier.timeActive : tier.timeIdle
                            }`}
                          >
                            {formatChatTime(t.updatedAt)}
                          </span>
                          {unread > 0 && (
                            <span
                              className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[9px] font-black shadow-xs ${
                                isSelected ? 'bg-white text-slate-900 font-extrabold' : tier.unreadBadge
                              }`}
                            >
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* RESIZER DRAG HANDLE (PENGATURAN GESER LEBAR KOLOM) */}
        {!isMaximizedDetail && (
          <div
            onMouseDown={handleMouseDownResize}
            title="Tahan & geser untuk mengubah lebar kolom"
            className="hidden md:flex w-2.5 hover:w-3.5 bg-slate-200 hover:bg-emerald-600 cursor-col-resize items-center justify-center transition-colors z-20 group select-none"
          >
            <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </div>
        )}

        {/* KOLOM KANAN: Detail Chat & Isi Percakapan Aktif */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          {activeThread ? (
            <>
              {/* Header Percakapan Aktif */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 bg-white shadow-2xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">
                      {activeThread.partnerName}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${ROLE_META[activeThread.partnerRole].badgeClass}`}
                    >
                      {ROLE_META[activeThread.partnerRole].label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {activeThread.partnerLocation}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5 truncate">
                    Topik Jasa / Produk: {activeThread.subjectTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeThread.subjectId && (
                    <Link
                      href={
                        activeThread.partnerRole === 'service_provider'
                          ? `/services/${encodeURIComponent(activeThread.subjectId)}`
                          : `/marketplace/${encodeURIComponent(activeThread.subjectId)}`
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition shrink-0"
                    >
                      <span>
                        {activeThread.partnerRole === 'service_provider'
                          ? 'Buka Detail Layanan Jasa'
                          : 'Buka Detail Produk'}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Sekat Penjamin Transaksi Escrow */}
              <div className="bg-emerald-50/60 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-xs text-emerald-900 font-normal">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Komunikasi transaksi &amp; detail pekerjaan terlindungi oleh sistem <strong>Escrow &amp; Rekening Bersama Racik Media</strong>.
                </span>
              </div>

              {/* Bubble Pesan Obrolan */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
                {activeThread.messages.map((msg) => {
                  const isMine = isMemberViewer
                    ? msg.senderRole === 'member'
                    : msg.senderRole === 'partner';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-1">
                        {msg.senderName} • {formatChatTime(msg.createdAt)}
                      </span>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-normal leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-emerald-100/90 border border-emerald-200/90 text-slate-900 rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        {isMine && (
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-700 font-medium">
                            <CheckCheck className="h-3 w-3" />
                            <span>Terkirim</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Tombol Pertanyaan Cepat Member */}
              {isMemberViewer && quickPrompts.length > 0 && (
                <div className="border-t border-slate-200 bg-white px-3 pt-2 pb-1.5 flex flex-wrap gap-1.5">
                  {quickPrompts.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => handleSend(promptText)}
                      className="rounded-full border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 hover:border-emerald-500 px-3 py-1 text-[11px] font-bold text-emerald-900 transition text-left cursor-pointer"
                    >
                      + {promptText}
                    </button>
                  ))}
                </div>
              )}

              {/* Form Input Kirim Pesan */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="border-t border-slate-200 bg-white p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    isMemberViewer
                      ? activeThread.partnerRole === 'service_provider'
                        ? 'Ketik pertanyaan detail pekerjaan, survei lapangan, atau termin milestone...'
                        : 'Ketik pertanyaan stok, armada pengiriman, atau spesifikasi barang...'
                      : 'Ketik balasan untuk member...'
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-800 font-normal focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Kirim
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-600">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-black text-sm text-slate-800">Pilih Percakapan Toko Mitra</p>
              <p className="mt-1 max-w-sm text-slate-500">
                Pilih salah satu toko mitra di sebelah kiri untuk melihat detail riwayat chat, bertanya stok, maupun mendiskusikan pekerjaan jasa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PartnerChatModalProps {
  isOpen: boolean;
  threadId: string | null;
  onClose: () => void;
}

export function PartnerChatModal({
  isOpen,
  threadId,
  onClose,
}: PartnerChatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-fadeIn border-2 border-slate-300">
        <div className="flex items-center justify-between border-b-2 border-slate-200 bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-black">
              Obrolan Langsung Member &amp; Mitra
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard?layer=chat${threadId ? `&threadId=${encodeURIComponent(threadId)}` : ''}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white transition"
            >
              <span>Buka di Dashboard Umum</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              aria-label="Tutup jendela chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <PartnerChatWorkspace
          viewerRole="member"
          initialThreadId={threadId}
          compact
        />
      </div>
    </div>
  );
}
