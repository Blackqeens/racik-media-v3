'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headphones,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { HelpdeskChatWorkspace } from '@/components/chat/HelpdeskChatWorkspace';
import { useHelpdeskTickets } from '@/lib/helpdesk-chat-store';

export default function AdminHelpdeskPage() {
  const { tickets } = useHelpdeskTickets();

  const stats = useMemo(() => {
    const openCount = tickets.filter((t) => t.status === 'open').length;
    const progressCount = tickets.filter((t) => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
    const totalMessages = tickets.reduce((sum, t) => sum + t.messages.length, 0);

    return {
      total: tickets.length,
      open: openCount,
      progress: progressCount,
      resolved: resolvedCount,
      totalMessages,
    };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header Helpdesk Admin */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border-2 border-violet-400 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl bg-violet-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl bg-indigo-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs">
                  <Headphones className="h-4 w-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-violet-200">
                  Panel Dukungan &amp; Layanan Pengaduan Resmi
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Pusat Bantuan &amp; Tiket Pengaduan Member
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Tanggapi kendala transaksi escrow, verifikasi akun penjual, serta keluhan layanan secara cepat. Sinkron langsung dengan Pusat Bantuan Member.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/admin/administration"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-900 shadow-md transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Dashboard Admin</span>
              </Link>
            </div>
          </div>

          {/* Ringkasan Status Tiket */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 border-t border-white/25 pt-5 sm:divide-x sm:divide-white/25">
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                Total Tiket Masuk
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-amber-200">
                Perlu Tanggapan (Terbuka)
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-amber-300">{stats.open}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-sky-200">
                Sedang Ditangani
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-sky-300">{stats.progress}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-emerald-200">
                Masalah Selesai
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* Workspace Helpdesk Admin */}
        <HelpdeskChatWorkspace
          viewerRole="admin"
          viewerName="Admin Operasional Racik Media"
        />
      </div>
    </div>
  );
}

