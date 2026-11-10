'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  RotateCw
} from 'lucide-react';
import { demoOrders } from '@/lib/demo-data';

interface OrderDetail {
  id: string;
  order_type: string;
  status: string;
  gross_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    entity_type: string;
    entity_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  isDemo?: boolean;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const orderId = params?.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['order-detail', orderId],
    enabled: !!session && !!orderId,
    queryFn: () =>
      apiClient.get<OrderDetail>(`/orders/${orderId}`, {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const sampleOrder = demoOrders.find((item) => item.id === orderId);
  const isDemo =
    process.env.NODE_ENV === 'development' &&
    (!session || isError) &&
    !!sampleOrder;
  const order = data?.data ?? (isDemo ? { ...sampleOrder, isDemo: true } : undefined);

  // Mutasi konfirmasi penerimaan pesanan
  const confirmMutation = useMutation({
    mutationFn: () =>
      apiClient.post(
        `/orders/${orderId}/confirm`,
        {},
        { Authorization: `Bearer ${session!.access_token}` },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-800">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400">
          Pesanan ini mungkin tidak ada atau Anda tidak memiliki akses melihatnya.
        </p>
        <Link href="/orders" className="btn-secondary text-xs inline-block">
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat Pesanan
      </Link>

      {isDemo && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Pesanan pratinjau lokal karena API belum tersedia. Tidak ada pembayaran atau perubahan status sungguhan.
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Detail Pesanan #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Dibuat pada {formatRelativeTime(order.created_at)}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
            order.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : order.status === 'escrow_held'
              ? 'bg-blue-100 text-blue-700'
              : order.status === 'pending_payment'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Banner Escrow Protection */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Garansi Transaksi Aman (Escrow)</h3>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Dana Anda ditahan dengan aman oleh sistem Escrow Racik Media dan baru akan diteruskan ke penjual setelah Anda mengonfirmasi bahwa bibit/pupuk telah diterima dengan baik.
          </p>
        </div>
      </div>

      {/* Rincian Produk */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Item Pesanan</h2>
        <div className="divide-y divide-gray-100">
          {(order.order_items ?? []).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-gray-800">
                  Item #{item.entity_id.slice(0, 8)}
                </span>
                <p className="text-gray-400 mt-0.5">
                  {item.quantity} x {formatRupiah(item.unit_price)}
                </p>
              </div>
              <span className="font-bold text-gray-900">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">Total Pembayaran</span>
          <span className="text-base font-extrabold text-emerald-700">
            {formatRupiah(order.gross_amount)}
          </span>
        </div>
      </div>

      {/* Aksi Pembeli */}
      {order.status === 'escrow_held' && !order.isDemo && (
        <div className="card p-6 bg-slate-50 border-emerald-200 text-center space-y-3">
          <Truck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900">Pesanan Sedang Diproses / Dikirim</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Jika barang sudah sampai dan kondisi bibit/pupuk sesuai, silakan konfirmasi penerimaan di bawah untuk melepaskan dana ke penjual.
          </p>
          <button
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="btn-primary inline-flex items-center gap-2 text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmMutation.isPending ? 'Memproses...' : 'Konfirmasi Barang Diterima'}
          </button>
        </div>
      )}

      {order.status === 'completed' && (
        <div className="card p-6 bg-emerald-50 border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-emerald-900">Pesanan Selesai</h3>
          <p className="text-xs text-emerald-700">
            Terima kasih! Dana escrow telah sukses dicairkan ke penjual.
          </p>
        </div>
      )}
    </div>
  );
}
