'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah } from '@/lib/utils';
import { Store, Package, ShoppingBag, ShieldCheck, Plus, ArrowRight } from 'lucide-react';

interface SellerDashboardData {
  store: {
    id: string;
    name: string;
    legalName?: string;
    status: string;
    rating: number;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    revenueEstimate: number;
    pendingOrders: number;
  };
}

export default function SellerDashboardPage() {
  const { session } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller-dashboard'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<SellerDashboardData>('/vendors/me/dashboard', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const dashboard = data?.data;

  // Jika belum terdaftar sebagai seller
  if (!isLoading && (isError || !dashboard)) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="card text-center py-16 space-y-4">
          <Store className="w-14 h-14 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Buka Toko di Racik Media</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Jual bibit unggul, pupuk organik, dan alat pertanian ke ribuan petani & praktisi di seluruh Nusantara dengan proteksi escrow terjamin.
          </p>
          <Link href="/seller/register" className="btn-primary inline-flex items-center gap-2 text-sm mt-2">
            Daftar Jadi Seller Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {dashboard?.store?.name ?? 'Dashboard Seller'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Status: <span className="text-emerald-600 font-semibold capitalize">{dashboard?.store?.status ?? 'Aktif'}</span> &middot; Rating: ⭐ {dashboard?.store?.rating ?? 5.0}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/products/new" className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Tambah Produk
          </Link>
          <Link href="/seller/products" className="btn-secondary text-xs">
            Kelola Produk
          </Link>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Produk', value: dashboard?.stats?.totalProducts ?? 0, icon: Package },
          { label: 'Pesanan Masuk', value: dashboard?.stats?.totalOrders ?? 0, icon: ShoppingBag },
          { label: 'Pesanan Tertunda', value: dashboard?.stats?.pendingOrders ?? 0, icon: Store },
          { label: 'Estimasi Pendapatan', value: formatRupiah(dashboard?.stats?.revenueEstimate ?? 0), icon: ShieldCheck },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs">{s.label}</span>
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">{isLoading ? '…' : s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Daftar Pesanan Terbaru */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900">Pesanan Masuk Terbaru</h2>
        <p className="text-xs text-gray-400">Belum ada pesanan yang memerlukan pengiriman saat ini.</p>
      </div>
    </div>
  );
}
