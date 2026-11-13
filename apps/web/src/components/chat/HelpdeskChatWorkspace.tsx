'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck,
  Columns,
  GripVertical,
  Headphones,
  LifeBuoy,
  Maximize2,
  Minimize2,
  Plus,
  Send,
  ShieldCheck,
  Tag,
  UserCheck,
  X,
} from 'lucide-react';
import {
  HELPDESK_CATEGORIES,
  type HelpdeskTicket,
  type HelpdeskTicketCategory,
  useHelpdeskTickets,
} from '@/lib/helpdesk-chat-store';

interface HelpdeskChatWorkspaceProps {
  viewerRole?: 'member' | 'admin';
  viewerName?: string;
  initialTicketId?: string | null;
}

const TICKET_TIERS = [
  {
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconBg: 'bg-emerald-500 text-white',
    cardIdle:
      'bg-emerald-50/40 border border-emerald-200/70 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300 shadow-2xs',
    cardActive:
      'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-300/50',
    subjectIdle: 'text-slate-600 font-normal',
    subjectActive: 'text-emerald-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-emerald-700 font-medium',
    unreadBadge: 'bg-emerald-500 text-white',
  },
  {
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    iconBg: 'bg-amber-500 text-white',
    cardIdle:
      'bg-amber-50/40 border border-amber-200/70 text-slate-800 hover:bg-amber-50/80 hover:border-amber-300 shadow-2xs',
    cardActive:
      'bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-300/50',
    subjectIdle: 'text-slate-600 font-normal',
    subjectActive: 'text-amber-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-amber-700 font-medium',
    unreadBadge: 'bg-amber-500 text-white',
  },
  {
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
    iconBg: 'bg-sky-500 text-white',
    cardIdle:
      'bg-sky-50/40 border border-sky-200/70 text-slate-800 hover:bg-sky-50/80 hover:border-sky-300 shadow-2xs',
    cardActive:
      'bg-sky-50 border-2 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-300/50',
    subjectIdle: 'text-slate-600 font-normal',
    subjectActive: 'text-sky-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-sky-700 font-medium',
    unreadBadge: 'bg-sky-500 text-white',
  },
  {
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    iconBg: 'bg-purple-500 text-white',
    cardIdle:
      'bg-purple-50/40 border border-purple-200/70 text-slate-800 hover:bg-purple-50/80 hover:border-purple-300 shadow-2xs',
    cardActive:
      'bg-purple-50 border-2 border-purple-500 text-purple-950 shadow-xs ring-1 ring-purple-300/50',
    subjectIdle: 'text-slate-600 font-normal',
    subjectActive: 'text-purple-900 font-medium',
    timeIdle: 'text-slate-400 font-normal',
    timeActive: 'text-purple-700 font-medium',
    unreadBadge: 'bg-purple-500 text-white',
  },
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function HelpdeskChatWorkspace({
  viewerRole = 'member',
  viewerName = 'Member Racik',
  initialTicketId = null,
}: HelpdeskChatWorkspaceProps) {
  const { tickets, sendMessage, createTicket, updateStatus, markRead } =
    useHelpdeskTickets();

  const [categoryFilter, setCategoryFilter] = useState<'all' | HelpdeskTicketCategory>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId);
  const [draft, setDraft] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form Tiket Baru
  const [newCategory, setNewCategory] = useState<HelpdeskTicketCategory>('escrow_payment');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Resizer state
  const [leftPercent, setLeftPercent] = useState<number>(36);
  const [isMaximizedDetail, setIsMaximizedDetail] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMember = viewerRole === 'member';

  const visibleTickets = useMemo(() => {
    if (categoryFilter === 'all') return tickets;
    return tickets.filter((t) => t.category === categoryFilter);
  }, [tickets, categoryFilter]);

  const activeTicket: HelpdeskTicket | null = useMemo(() => {
    if (visibleTickets.length === 0) return null;
    if (selectedTicketId) {
      const found = visibleTickets.find((t) => t.id === selectedTicketId);
      if (found) return found;
    }
    return visibleTickets[0] ?? null;
  }, [visibleTickets, selectedTicketId]);

  useEffect(() => {
    if (!activeTicket) return;
    markRead(activeTicket.id, isMember ? 'member' : 'admin');
  }, [activeTicket, isMember, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeTicket?.messages.length, activeTicket?.id]);

  // Drag resizer
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

  function handleSend() {
    if (!activeTicket || !draft.trim()) return;
    sendMessage({
      ticketId: activeTicket.id,
      senderRole: isMember ? 'member' : 'admin',
      senderName: viewerName || (isMember ? 'Member Racik' : 'Admin Operasional'),
      text: draft.trim(),
    });
    setDraft('');
  }

  function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    const created = createTicket({
      memberName: viewerName || 'Member Racik Media',
      category: newCategory,
      subjectTitle: newSubject.trim(),
      initialMessage: newMessage.trim(),
    });

    setCategoryFilter('all');
    setSelectedTicketId(created.id);
    setNewSubject('');
    setNewMessage('');
    setShowNewModal(false);
  }

  const totalUnread = visibleTickets.reduce(
    (sum, t) => sum + (isMember ? t.unreadByMember : t.unreadByAdmin),
    0,
  );

  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-white shadow-sm overflow-hidden">
      {/* Header Pusat Bantuan Racik Media Nusantara */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 bg-emerald-800 px-5 py-3.5 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 ring-1 ring-emerald-300 text-white">
              <Headphones className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Pusat Bantuan Racik Media Nusantara</span>
              {totalUnread > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                  {totalUnread} pesan baru
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-emerald-100 font-normal mt-1">
            Saluran bantuan resmi langsung dengan tim <strong>Admin Operasional</strong> untuk penanganan transaksi escrow, verifikasi toko mitra, dan komplain pesanan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {isMember && (
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tanya Admin / Buka Tiket</span>
            </button>
          )}

          {/* Quick Toolbar Pengaturan Kolom */}
          <div className="flex items-center gap-1 border-l border-emerald-700 pl-2">
            <button
              type="button"
              onClick={() => {
                setIsMaximizedDetail(false);
                setLeftPercent(36);
              }}
              title="Tampilan Standar (36% : 64%)"
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                !isMaximizedDetail && leftPercent === 36
                  ? 'bg-white text-emerald-950 font-semibold'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-700'
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
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                !isMaximizedDetail && leftPercent === 25
                  ? 'bg-white text-emerald-950 font-semibold'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMaximizedDetail((v) => !v)}
              title={isMaximizedDetail ? 'Buka Daftar Tiket' : 'Fokus Penuh Kolom Percakapan'}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                isMaximizedDetail
                  ? 'bg-amber-400 text-slate-950 font-bold ring-1 ring-white'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              {isMaximizedDetail ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Daftar Tiket</span>
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
      </div>

      {/* Filter Kategori Masalah Helpdesk */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-200 px-4 py-2.5 bg-emerald-50/50">
        <span className="text-xs font-bold text-slate-700 mr-1">Kategori Masalah:</span>
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Semua Tiket ({tickets.length})
        </button>
        {HELPDESK_CATEGORIES.map((cat) => {
          const count = tickets.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Split Pane: Daftar Tiket & Chat Live dengan Admin */}
      <div
        ref={containerRef}
        className="relative flex flex-col md:flex-row select-none min-h-[460px] max-h-[580px]"
      >
        {/* KOLOM KIRI: Daftar Tiket Bantuan */}
        {!isMaximizedDetail && (
          <div
            style={{
              width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${leftPercent}%` : '100%',
            }}
            className="shrink-0 border-b md:border-b-0 md:border-r-2 border-slate-300 overflow-y-auto p-3 space-y-2.5 bg-slate-100/60"
          >
            {visibleTickets.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-600">
                <LifeBuoy className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="font-extrabold text-slate-800">Belum ada tiket bantuan pada kategori ini.</p>
                <p className="mt-1 text-slate-500">
                  Klik tombol <strong>Tanya Admin / Buka Tiket</strong> di atas untuk mengajukan kendala Anda.
                </p>
              </div>
            ) : (
              visibleTickets.map((t, index) => {
                const tier = TICKET_TIERS[index % TICKET_TIERS.length];
                const isSelected = activeTicket?.id === t.id;
                const unread = isMember ? t.unreadByMember : t.unreadByAdmin;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left rounded-xl p-3.5 transition flex items-start gap-3 cursor-pointer ${
                      isSelected ? tier.cardActive : tier.cardIdle
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                        isSelected ? 'bg-emerald-600 text-white shadow-xs' : tier.iconBg
                      }`}
                    >
                      <Headphones className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      {/* Baris 1: Nama Pengguna / Instansi + Status Tiket */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span
                          className={`truncate text-xs tracking-tight ${
                            isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800 font-semibold'
                          }`}
                        >
                          {isMember ? 'Admin Support Racik' : t.memberName}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                            t.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : t.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-red-100 text-red-900 border-red-300'
                          }`}
                        >
                          {t.status === 'resolved'
                            ? '✓ Selesai'
                            : t.status === 'in_progress'
                              ? '⏳ Diproses Admin'
                              : '🔴 Terbuka'}
                        </span>
                      </div>

                      {/* Baris 2: Subjek Tiket & Kategori */}
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <p
                          className={`text-[11px] leading-snug line-clamp-2 ${
                            isSelected ? tier.subjectActive : tier.subjectIdle
                          }`}
                          title={t.subjectTitle}
                        >
                          {t.subjectTitle}
                        </p>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] ${
                              isSelected ? tier.timeActive : tier.timeIdle
                            }`}
                          >
                            {formatTime(t.updatedAt)}
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

        {/* RESIZER DRAG HANDLE */}
        {!isMaximizedDetail && (
          <div
            onMouseDown={handleMouseDownResize}
            title="Tahan & geser untuk mengubah lebar kolom"
            className="hidden md:flex w-2.5 hover:w-3.5 bg-slate-200 hover:bg-emerald-600 cursor-col-resize items-center justify-center transition-colors z-20 group select-none"
          >
            <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-white" />
          </div>
        )}

        {/* KOLOM KANAN: Isi Obrolan Tiket Helpdesk */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          {activeTicket ? (
            <>
              {/* Header Tiket Aktif */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 px-4 py-3 bg-white shadow-2xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900">
                      {activeTicket.subjectTitle}
                    </span>
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
                      {activeTicket.categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    Pemohon: <strong>{activeTicket.memberName}</strong> • ID Tiket: #{activeTicket.id}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isMember && (
                    <select
                      value={activeTicket.status}
                      onChange={(e) =>
                        updateStatus(
                          activeTicket.id,
                          e.target.value as 'open' | 'in_progress' | 'resolved',
                        )
                      }
                      className="rounded-lg border-2 border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="open">Status: Terbuka</option>
                      <option value="in_progress">Status: Diproses</option>
                      <option value="resolved">Status: Selesai</option>
                    </select>
                  )}
                  {isMember && (
                    <span
                      className={`rounded-lg border px-3 py-1 text-xs font-black ${
                        activeTicket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {activeTicket.status === 'resolved' ? '✓ Masalah Diselesaikan' : '⏳ Sedang Ditangani Admin'}
                    </span>
                  )}
                </div>
              </div>

              {/* Sekat Penjamin Respons Resmi */}
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs text-emerald-950 font-medium">
                <UserCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>
                  Percakapan ini ditangani langsung oleh <strong>Staf Admin Operasional Racik Media Nusantara</strong>. Kerahasiaan data dijamin.
                </span>
              </div>

              {/* Bubble Pesan */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
                {activeTicket.messages.map((msg) => {
                  const isMine = isMember
                    ? msg.senderRole === 'member'
                    : msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-1">
                        {msg.senderName} • {formatTime(msg.createdAt)}
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

              {/* Form Input Balasan */}
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
                    isMember
                      ? 'Ketik pesan tambahan atau pertanyaan lanjutan untuk Admin...'
                      : 'Ketik tanggapan resmi Admin untuk Member...'
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
              <Headphones className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-black text-sm text-slate-800">Pusat Bantuan Racik Media</p>
              <p className="mt-1 max-w-sm text-slate-500">
                Pilih tiket pertanyaan di sebelah kiri atau klik tombol <strong>Tanya Admin / Buka Tiket</strong> untuk berkonsultasi langsung.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Tiket / Tanya Admin Baru */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-fadeIn border-2 border-emerald-400">
            <div className="flex items-center justify-between border-b-2 border-emerald-200 bg-emerald-900 px-5 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-black">
                  Buka Tiket Pengaduan / Tanya Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-lg p-1 text-emerald-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Pilih Kategori Kendala:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as HelpdeskTicketCategory)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  {HELPDESK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Subjek / Pokok Masalah:
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Contoh: Konfirmasi Saldo Escrow Pesanan #RCK-1234"
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Rincian Pertanyaan / Pengaduan:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Jelaskan secara jelas kendala atau detail bantuan yang Anda perlukan dari tim Admin Operasional..."
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newSubject.trim() || !newMessage.trim()}
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 px-5 py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
                >
                  Kirim ke Admin Operasional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
