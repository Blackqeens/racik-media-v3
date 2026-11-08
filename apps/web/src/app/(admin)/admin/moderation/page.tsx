'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Clock,
  Filter,
  Check,
  X
} from 'lucide-react';

interface ModerationTicket {
  id: string;
  queue_name: string;
  entity_type: string;
  entity_id: string;
  status: string;
  priority: string;
  reason_code?: string;
  created_at: string;
}

const QUEUES = [
  { id: 'all', label: 'Semua Antrean' },
  { id: 'catalog_queue', label: 'Katalog Produk' },
  { id: 'knowledge_queue', label: 'Artikel & Riset' },
  { id: 'identity_queue', label: 'Verifikasi Seller (KYC)' },
  { id: 'service_queue', label: 'Layanan Jasa' },
];

export default function ModerationPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQueue, setSelectedQueue] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-moderation-tickets', selectedQueue],
    enabled: !!session,
    queryFn: () => {
      const q = selectedQueue === 'all' ? '' : `?queue=${selectedQueue}`;
      return apiClient.get<ModerationTicket[]>(`/moderation/tickets${q}`, {
        Authorization: `Bearer ${session!.access_token}`,
      });
    },
  });

  const tickets = data?.data ?? [];

  // Mutasi Keputusan Moderasi (Approve / Reject)
  const decideMutation = useMutation({
    mutationFn: ({ ticketId, decision, reasonCode }: { ticketId: string; decision: string; reasonCode: string }) =>
      apiClient.post(
        `/moderation/tickets/${ticketId}/decide`,
        { decision, reason_code: reasonCode },
        { Authorization: `Bearer ${session!.access_token}` },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation-tickets'] });
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Kurasi & Moderasi</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Tinjau konten, produk, dan permohonan verifikasi seller sebelum dipublikasikan ke publik.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Segarkan
        </button>
      </div>

      {/* Filter Antrean */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUEUES.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedQueue(q.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedQueue === q.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Konten Tiket */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-semibold text-gray-800">Antrean Bersih</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tidak ada tiket moderasi tertunda saat ini. Semua kiriman baru sudah ditinjau.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
          {tickets.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                    {t.queue_name.replace('_queue', '')}
                  </span>
                  <span className="text-gray-300">&middot;</span>
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {t.entity_id ? t.entity_id.slice(0, 8) : t.id.slice(0, 8)}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      t.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Diajukan {formatRelativeTime(t.created_at)}
                </p>
              </div>

              {/* Tombol Aksi Moderasi */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() =>
                    decideMutation.mutate({
                      ticketId: t.id,
                      decision: 'approved',
                      reasonCode: 'quality_verified',
                    })
                  }
                  disabled={decideMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Check className="w-3.5 h-3.5" /> Setujui
                </button>
                <button
                  onClick={() =>
                    decideMutation.mutate({
                      ticketId: t.id,
                      decision: 'revision_requested',
                      reasonCode: 'needs_revision',
                    })
                  }
                  disabled={decideMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Revisi
                </button>
                <button
                  onClick={() =>
                    decideMutation.mutate({
                      ticketId: t.id,
                      decision: 'rejected',
                      reasonCode: 'guideline_violation',
                    })
                  }
                  disabled={decideMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <X className="w-3.5 h-3.5" /> Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
