'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { demoOrders } from '@/lib/demo-data';

interface OrderItem {
  id: string;
  order_type: string;
  status: string;
  gross_amount: number;
  created_at: string;
}
export default function OrdersPage() {
  const { session } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: OrderItem[]; total: number }>('/orders', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const isDemo = process.env.NODE_ENV === 'development' && (!session || isError);
  const orders = isDemo ? demoOrders : data?.data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Header Riwayat Pesanan — Tema & Animasi Seragam dengan Dashboard Lainnya */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-emerald-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
              Riwayat Pesanan
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Pantau status pesanan, pembayaran, dan proteksi Rekening Bersama (Escrow) Anda.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-lg shrink-0 transition"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-emerald-700" />
            Belanja Lagi
          </Link>
        </div>
      </div>

      {isDemo && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Pesanan pratinjau lokal karena API belum tersedia. Ini bukan transaksi atau pembayaran sungguhan.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-semibold text-gray-800">Belum Ada Pesanan</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Anda belum melakukan pemesanan produk atau jasa pertanian apapun.
          </p>
          <Link href="/marketplace" className="btn-primary inline-block text-xs mt-2">
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card flex items-center justify-between p-4 hover:border-emerald-300 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {formatRupiah(order.gross_amount)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${order.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'escrow_held'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'pending_payment'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID: {order.id.slice(0, 8)} &middot; {formatRelativeTime(order.created_at)}
                  </p>
                </div>
              </div>

              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                Detail <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
