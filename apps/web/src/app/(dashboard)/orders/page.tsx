'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  order_type: string;
  status: string;
  gross_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const { session } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: OrderItem[]; total: number }>('/orders', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const orders = data?.data?.items ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status pesanan, pembayaran, dan proteksi escrow Anda.
          </p>
        </div>
        <Link href="/marketplace" className="btn-secondary text-xs">
          Belanja Lagi
        </Link>
      </div>

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
            <div
              key={order.id}
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
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        order.status === 'completed'
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

