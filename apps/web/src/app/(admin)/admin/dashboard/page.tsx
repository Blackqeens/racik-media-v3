'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Users, ShieldAlert, Package, CheckCircle, ArrowRight, Activity } from 'lucide-react';

interface AdminStats {
  activeUsers: number;
  pendingTickets: number;
  pendingProducts: number;
  pendingVerifications: number;
}

export default function AdminDashboardPage() {
  const { session } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<AdminStats>('/moderation/stats', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const stats = data?.data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin & Kurasi Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Pengawasan metrik platform, persetujuan seller, dan moderasi konten Racik Media V3.
          </p>
        </div>
        <Link href="/admin/moderation" className="btn-primary text-xs flex items-center gap-1.5">
          Buka Panel Moderasi <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pengguna Terdaftar', value: stats?.activeUsers ?? 0, icon: Users, color: 'text-blue-600' },
          { label: 'Tiket Moderasi', value: stats?.pendingTickets ?? 0, icon: ShieldAlert, color: 'text-amber-600' },
          { label: 'Produk Pending', value: stats?.pendingProducts ?? 0, icon: Package, color: 'text-purple-600' },
          { label: 'Verifikasi Seller', value: stats?.pendingVerifications ?? 0, icon: CheckCircle, color: 'text-emerald-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '…' : s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Status Server & Integrasi
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              Online
            </span>
          </div>
          <div className="space-y-2 text-xs text-gray-500 divide-y divide-gray-100">
            <div className="pt-2 flex justify-between">
              <span>Database PostgreSQL (Supabase Cloud)</span>
              <span className="text-emerald-600 font-semibold">Terkoneksi</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span>Cache & Rate Limit (Upstash Redis)</span>
              <span className="text-emerald-600 font-semibold">Terkoneksi</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span>Event Broker (RabbitMQ CloudAMQP)</span>
              <span className="text-emerald-600 font-semibold">Terkoneksi</span>
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Pintasan Operasional</h2>
          <div className="space-y-2">
            <Link
              href="/admin/moderation"
              className="block p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-gray-50/50 transition text-xs"
            >
              <div className="font-semibold text-gray-800">Antrean Moderasi Produk & Konten</div>
              <p className="text-gray-400 mt-0.5">Tinjau bibit, pupuk, atau artikel yang baru diajukan.</p>
            </Link>
            <Link
              href="/marketplace"
              className="block p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-gray-50/50 transition text-xs"
            >
              <div className="font-semibold text-gray-800">Pratinjau Etalase Marketplace</div>
              <p className="text-gray-400 mt-0.5">Lihat katalog produk yang sedang tayang di publik.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
