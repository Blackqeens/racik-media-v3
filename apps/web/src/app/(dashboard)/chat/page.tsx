'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BriefcaseBusiness,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentActiveRole } from '@/lib/active-role';
import { type ChatPartnerRole, usePartnerChats } from '@/lib/partner-chat-store';
import { PartnerChatWorkspace } from '@/components/chat/PartnerChatWorkspace';
import { HelpdeskChatWorkspace } from '@/components/chat/HelpdeskChatWorkspace';
import { DashboardSectionDivider } from '@/components/commerce/DashboardSectionDivider';

type ChatViewMode = 'partner' | 'member';

const PARTNER_META: Record<
  ChatPartnerRole,
  {
    label: string;
    dashboardHref: string;
    heroBorder: string;
    orbA: string;
    orbB: string;
    sparkle: string;
  }
> = {
  seller: {
    label: 'Seller',
    dashboardHref: '/seller/dashboard',
    heroBorder: 'border-amber-300/60',
    orbA: 'bg-amber-400/30',
    orbB: 'bg-emerald-400/30',
    sparkle: 'text-amber-300',
  },
  distributor: {
    label: 'Distributor',
    dashboardHref: '/distributor/dashboard',
    heroBorder: 'border-cyan-300/60',
    orbA: 'bg-cyan-400/30',
    orbB: 'bg-emerald-400/30',
    sparkle: 'text-cyan-300',
  },
  service_provider: {
    label: 'Penyedia Jasa',
    dashboardHref: '/service-provider/dashboard',
    heroBorder: 'border-sky-300/60',
    orbA: 'bg-sky-400/30',
    orbB: 'bg-emerald-400/30',
    sparkle: 'text-sky-300',
  },
};

export default function ChatHistoryPage() {
  const { session } = useAuth();
  const activeRole = useCurrentActiveRole();
  const { threads } = usePartnerChats();

  const partnerRole: ChatPartnerRole | null =
    activeRole === 'seller'
      ? 'seller'
      : activeRole === 'distributor'
        ? 'distributor'
        : activeRole === 'service-provider'
          ? 'service_provider'
          : null;

  const [viewMode, setViewMode] = useState<ChatViewMode>('member');
  const [initialThreadId, setInitialThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const threadId = params.get('threadId');
    if (threadId) setInitialThreadId(threadId);
    if (mode === 'member') {
      setViewMode('member');
    } else if (mode === 'partner' && partnerRole) {
      setViewMode('partner');
    } else if (partnerRole) {
      setViewMode('partner');
    } else {
      setViewMode('member');
    }
  }, [partnerRole]);

  const effectiveViewerRole: 'member' | ChatPartnerRole =
    partnerRole && viewMode === 'partner' ? partnerRole : 'member';

  const stats = useMemo(() => {
    const memberUnread = threads.reduce((sum, t) => sum + t.unreadByMember, 0);
    const partnerThreads = partnerRole
      ? threads.filter((t) => t.partnerRole === partnerRole)
      : [];
    const partnerUnread = partnerThreads.reduce((sum, t) => sum + t.unreadByPartner, 0);
    return {
      totalThreads: threads.length,
      memberUnread,
      partnerThreadCount: partnerThreads.length,
      partnerUnread,
      totalMessages: threads.reduce((sum, t) => sum + t.messages.length, 0),
    };
  }, [threads, partnerRole]);

  const userDisplayName =
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    session?.user?.email?.split('@')[0] ||
    'Pengguna Racik Media';

  const heroStyle = partnerRole
    ? PARTNER_META[partnerRole]
    : {
      heroBorder: 'border-teal-300/60',
      orbA: 'bg-teal-400/30',
      orbB: 'bg-emerald-400/30',
      sparkle: 'text-teal-300',
    };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header Riwayat Chat — Tema & Animasi Seragam dengan Dashboard Lainnya */}
        <div
          className={`dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border p-6 sm:p-7 text-white shadow-xl ${heroStyle.heroBorder}`}
        >
          <div
            aria-hidden="true"
            className={`dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl ${heroStyle.orbA}`}
          />
          <div
            aria-hidden="true"
            className={`dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl ${heroStyle.orbB}`}
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2.5 max-w-2xl">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Riwayat Chat Pelanggan &amp; Mitra
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Pantau seluruh riwayat percakapan pembelian produk, pasokan distributor, dan konsultasi pekerjaan jasa secara terpusat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {partnerRole && (
                <Link
                  href={PARTNER_META[partnerRole].dashboardHref}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard {PARTNER_META[partnerRole].label}
                </Link>
              )}
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Belanja Marketplace
              </Link>
            </div>
          </div>

          {/* Ringkasan Riwayat */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 border-t border-white/25 pt-5 sm:divide-x sm:divide-white/25">
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                Total Utas Chat
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-white">{stats.totalThreads}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                Total Pesan Tersimpan
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-white">{stats.totalMessages}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                Belum Dibaca (Member)
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
                {stats.memberUnread}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                {partnerRole
                  ? `Pesan Masuk (${PARTNER_META[partnerRole].label})`
                  : 'Mitra Terhubung'}
              </p>
              <p className="mt-1 text-lg sm:text-xl font-black text-amber-300">
                {partnerRole
                  ? `${stats.partnerUnread} baru (${stats.partnerThreadCount} utas)`
                  : 'Seller • Distributor • Jasa'}
              </p>
            </div>
          </div>

          {/* Switcher Khusus Role Mitra (Seller / Distributor / Penyedia Jasa) */}
          {partnerRole && (
            <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/25 pt-4">
              <button
                type="button"
                onClick={() => setViewMode('partner')}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-extrabold transition ${viewMode === 'partner'
                    ? 'border-white bg-white text-slate-950 shadow-md'
                    : 'border-white/30 bg-slate-950/40 text-white hover:bg-slate-950/60 backdrop-blur-sm'
                  }`}
              >
                {partnerRole === 'seller' ? (
                  <Store className="h-3.5 w-3.5" />
                ) : partnerRole === 'distributor' ? (
                  <Truck className="h-3.5 w-3.5" />
                ) : (
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                )}
                <span>Kotak Masuk Pembeli ({PARTNER_META[partnerRole].label})</span>
                {stats.partnerUnread > 0 && (
                  <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                    {stats.partnerUnread}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('member')}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-extrabold transition ${viewMode === 'member'
                    ? 'border-emerald-300 bg-emerald-500 text-white shadow-md'
                    : 'border-white/30 bg-slate-950/40 text-white hover:bg-slate-950/60 backdrop-blur-sm'
                  }`}
              >
                <UserRound className="h-3.5 w-3.5" />
                <span>Riwayat Chat Belanja Saya (Mode Member)</span>
                {stats.memberUnread > 0 && (
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    {stats.memberUnread}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Workspace Riwayat Chat Interaktif Toko Mitra */}
        <PartnerChatWorkspace
          viewerRole={effectiveViewerRole}
          viewerName={userDisplayName}
          initialThreadId={initialThreadId}
        />

        {/* SEKAT KOLOM: Sekat Pemisah DashboardSectionDivider (Tanpa Teks — Sama seperti di Dashboard Member) */}
        <div className="py-2">
          <DashboardSectionDivider tone="emerald" />
        </div>

        {/* KOLOM BARU: Pusat Bantuan Racik Media Nusantara (Chat Langsung dengan Admin) */}
        <HelpdeskChatWorkspace
          viewerRole={effectiveViewerRole === 'member' ? 'member' : 'member'}
          viewerName={userDisplayName}
        />
      </div>
    </div>
  );
}

