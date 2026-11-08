'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import type { ApiResponse } from '@/types/api.types';

/**
 * Dashboard page — metrik user aktif + aktivitas terbaru.
 * Fetch: pesanan aktif, reputasi, konten via React Query.
 * Ref: user-lifecycle.md, permission-matrix.md
 */

interface DashboardStats {
  active_orders: number;
  content_count: number;
  reputation_score: number;
}

interface RecentOrder {
  id: string;
  status: string;
  gross_amount: number;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  status: string;
  content_type: string;
  created_at: string;
  updated_at: string;
}

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="card text-center hover:border-primary-300 transition">
      <p className="text-3xl font-bold text-primary-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { session } = useAuth();

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['dashboard-orders'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: RecentOrder[]; total: number }>('/users/me/orders?limit=5', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const { data: reputationData, isLoading: loadingReputation } = useQuery({
    queryKey: ['dashboard-reputation'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ master_score: number }>('/users/me/reputation', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const { data: contentData, isLoading: loadingContent } = useQuery({
    queryKey: ['dashboard-content'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ total: number; items: ContentItem[] }>('/users/me/content?limit=5', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const activeOrders  = ordersData?.data?.total ?? 0;
  const reputationScore = reputationData?.data?.master_score ?? 0;
  const contentCount  = contentData?.data?.total ?? 0;
  const recentOrders  = ordersData?.data?.items ?? [];
  const recentContent = contentData?.data?.items ?? [];
  const isLoading     = loadingOrders || loadingReputation || loadingContent;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pesanan Aktif"
          value={isLoading ? '…' : activeOrders}
          href="/orders"
        />
        <StatCard
          label="Konten Dibuat"
          value={isLoading ? '…' : contentCount}
          href="/articles"
        />
        <StatCard
          label="Poin Reputasi"
          value={isLoading ? '…' : Math.round(reputationScore)}
        />
      </div>

      {/* ── Artikel Saya ─────────────────────────────────────────── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Artikel Saya</h2>
          <Link href="/articles/write" className="text-xs text-primary-600 hover:underline">
            Buat artikel →
          </Link>
        </div>

        {loadingContent ? (
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        ) : recentContent.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada artikel yang dibuat.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentContent.map((article) => (
              <Link key={article.id} href={`/articles/write?draft=${article.id}`} className="flex items-center justify-between py-3 text-sm hover:bg-gray-50">
                <div className="min-w-0 pr-3">
                  <p className="truncate font-medium text-gray-800">{article.title}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(article.updated_at)}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                  article.status === 'published' || article.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : article.status === 'under_review'
                      ? 'bg-amber-100 text-amber-700'
                      : article.status === 'revision_requested'
                        ? 'bg-blue-100 text-blue-700'
                        : article.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                }`}>
                  {article.status.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Pesanan Terbaru ────────────────────────────────────────── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
          <Link href="/orders" className="text-xs text-primary-600 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && recentOrders.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada pesanan.</p>
        )}

        {!isLoading && recentOrders.length > 0 && (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">
                    {formatRupiah(order.gross_amount)}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {formatRelativeTime(order.created_at)}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.status === 'completed'     ? 'bg-green-100 text-green-700' :
                  order.status === 'in_fulfillment' ? 'bg-blue-100 text-blue-700'  :
                  order.status === 'disputed'       ? 'bg-red-100 text-red-700'    :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
