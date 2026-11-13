'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCheck,
  Columns,
  GripVertical,
  Maximize2,
  MessageCircle,
  Minimize2,
  Radio,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentActiveRole } from '@/lib/active-role';
import {
  type ManagementParticipantRole,
  useManagementChats,
} from '@/lib/management-chat-store';

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

export default function ManagementChatMasterPage() {
  const { session } = useAuth();
  const currentActiveRole = useCurrentActiveRole();

  // Role pengguna yang sedang membuka halaman ini:
  // Bisa 'admin', 'moderator', atau 'master_admin'
  const [effectiveRole, setEffectiveRole] = useState<ManagementParticipantRole>('admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paramRole = params.get('role');

    if (paramRole === 'moderator' || currentActiveRole === 'moderator') {
      setEffectiveRole('moderator');
    } else if (
      paramRole === 'master_admin' ||
      currentActiveRole === 'master_admin' ||
      window.localStorage.getItem('racik-dev-master') === 'true'
    ) {
      setEffectiveRole('master_admin');
    } else {
      setEffectiveRole('admin');
    }
  }, [currentActiveRole]);

  const { threads, allThreads, sendMessage, markRead } = useManagementChats(effectiveRole);

  const [activeThreadId, setActiveThreadId] = useState<string>(
    effectiveRole === 'moderator' ? 'mgmt-moderator-master' : 'mgmt-admin-master',
  );
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (effectiveRole === 'moderator') {
      setActiveThreadId('mgmt-moderator-master');
    } else if (effectiveRole === 'admin') {
      setActiveThreadId('mgmt-admin-master');
    }
  }, [effectiveRole]);

  const currentThread = useMemo(() => {
    return (
      allThreads.find((t) => t.id === activeThreadId) ??
      threads[0] ??
      allThreads[0]
    );
  }, [allThreads, threads, activeThreadId]);

  useEffect(() => {
    if (currentThread) {
      markRead(currentThread.id);
    }
  }, [currentThread, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentThread?.messages.length, currentThread?.id]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !currentThread) return;

    const senderName =
      effectiveRole === 'master_admin'
        ? 'Master Admin Racik Media'
        : effectiveRole === 'moderator'
          ? 'Moderator Editorial'
          : 'Admin Operasional';

    sendMessage({
      threadId: currentThread.id,
      senderRole: effectiveRole,
      senderName,
      text: draft.trim(),
    });

    setDraft('');
  }

  const roleLabels: Record<ManagementParticipantRole, string> = {
    admin: 'Admin Operasional',
    moderator: 'Moderator Editorial',
    master_admin: 'Master Admin',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header Live Chat Manajemen Web */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border-2 border-indigo-400 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl bg-indigo-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl bg-purple-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs">
                  <Radio className="h-4 w-4 text-emerald-300 animate-pulse" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                  Saluran Komunikasi Internal Manajemen Web
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Live Chat Manajemen: {roleLabels[effectiveRole]} &harr; Master Admin
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Koordinasi langsung via antarmuka web untuk eskalasi sengketa mendesak, persetujuan hold escrow, bimbingan kurasi artikel, serta sinkronisasi kebijakan platform.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href={
                  effectiveRole === 'master_admin'
                    ? '/admin/dashboard'
                    : effectiveRole === 'moderator'
                      ? '/admin/moderation'
                      : '/admin/administration'
                }
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-900 shadow-md transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>
                  Kembali ke {effectiveRole === 'moderator' ? 'Dashboard Moderator' : 'Dashboard Admin'}
                </span>
              </Link>
            </div>
          </div>

          {/* Tab Pemilihan Kanal Komunikasi untuk Master Admin */}
          {effectiveRole === 'master_admin' && (
            <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/25 pt-4">
              <span className="text-xs font-bold text-indigo-100">Kanal Aktif:</span>
              {allThreads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreadId(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                    activeThreadId === t.id
                      ? 'bg-white text-slate-950 shadow-md ring-2 ring-emerald-400'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{t.title}</span>
                  {t.unreadByMaster > 0 && (
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                      {t.unreadByMaster} baru
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Console Chat Live Manajemen Web */}
        <div className="rounded-2xl border-2 border-slate-300 bg-white shadow-lg overflow-hidden flex flex-col min-h-[520px] max-h-[640px]">
          {/* Header Kanal Obrolan Aktif */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <h2 className="text-sm sm:text-base font-black text-white">
                  {currentThread.title}
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                  Enkripsi Internal Web
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {currentThread.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-200">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {effectiveRole === 'admin'
                    ? 'Admin Operasional &bull; Master Admin'
                    : effectiveRole === 'moderator'
                      ? 'Moderator &bull; Master Admin'
                      : 'Admin &bull; Moderator &bull; Master'}
                </span>
              </span>
            </div>
          </div>

          {/* Garansi Keamanan & Kepatuhan Manajemen */}
          <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center gap-2 text-xs text-indigo-950 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-700 shrink-0" />
            <span>
              Seluruh arahan Master Admin dan laporan eskalasi tercatat dalam log audit sistem untuk pertanggungjawaban tata kelola platform.
            </span>
          </div>

          {/* Area Pesan Chat */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-100/70">
            {currentThread.messages.map((msg) => {
              const isMine = msg.senderRole === effectiveRole;
              const isMaster = msg.senderRole === 'master_admin';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-1 flex items-center gap-1.5">
                    <span className={isMaster ? 'text-purple-700 font-black' : ''}>
                      {msg.senderName}
                    </span>
                    <span>&bull;</span>
                    <span>{formatTime(msg.createdAt)}</span>
                  </span>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-normal leading-relaxed shadow-2xs ${
                      isMine
                        ? 'bg-indigo-100/90 border border-indigo-200/90 text-slate-900 rounded-br-sm'
                        : isMaster
                          ? 'bg-purple-100/90 border border-purple-200/90 text-purple-950 rounded-bl-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {isMine && (
                      <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-indigo-700 font-medium">
                        <CheckCheck className="h-3 w-3" />
                        <span>Tersampaikan</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Live Chat Manajemen */}
          <form
            onSubmit={handleSend}
            className="border-t-2 border-slate-200 bg-white p-3.5 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                effectiveRole === 'master_admin'
                  ? 'Ketik instruksi, persetujuan, atau arahan kebijakan Master Admin...'
                  : effectiveRole === 'moderator'
                    ? 'Ketik laporan kurasi artikel atau permohonan arahan ke Master Admin...'
                    : 'Ketik laporan eskalasi sengketa, legalitas KYB, atau izin hold escrow ke Master Admin...'
              }
              className="flex-1 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 font-medium focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 px-5 py-2.5 text-xs font-black text-white shadow-sm transition shrink-0 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
