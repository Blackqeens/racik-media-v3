'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import { Plus, Package, FileEdit, ShieldCheck, Globe } from 'lucide-react';
import {
  useEditorialArchive,
  type EditorialArchiveItem,
} from '@/lib/editorial-archive';
import { EditorialReviewModal } from '@/components/moderation/EditorialReviewModal';

interface SellerProduct {
  id: string;
  title: string;
  price_fixed: number;
  stock_quantity: number;
  status: string;
  item_type: string;
  created_at: string;
}

export default function SellerProductsPage() {
  const { session } = useAuth();
  const { items: archiveItems, canPublishToHomepage, updateItem } = useEditorialArchive();
  const archiveProducts = archiveItems.filter((i) => i.entityType === 'product_description');
  const [editingItem, setEditingItem] = useState<EditorialArchiveItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['seller-my-products'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<SellerProduct[]>('/catalog/vendor/mine', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const products = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Daftar produk bibit, pupuk, atau saprotan Anda. Setiap edit deskripsi produk akan diajukan ke Dashboard Moderator sebelum tampil di Homepage.
          </p>
        </div>
        <Link href="/seller/products/new" className="btn-primary text-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      {/* Daftar Produk di Arsip Editorial (Terhubung dengan Dashboard Moderator) */}
      {archiveProducts.length > 0 && (
        <div className="card p-0 overflow-hidden border border-amber-200/80">
          <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">
                Status Kurasi Deskripsi Produk (Terhubung ke Dashboard Moderator)
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Edit Deskripsi → Masuk Antrean Moderator
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {archiveProducts.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{item.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.publishedToHomepage && item.status === 'published_homepage'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.publishedToHomepage && item.status === 'published_homepage'
                        ? 'Tayang di Homepage'
                        : item.status === 'pending_review'
                        ? 'Menunggu Verifikasi Moderator'
                        : 'Perlu Revisi Deskripsi'}
                    </span>
                    {item.publishedToHomepage && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Globe className="w-3 h-3" /> Publik Homepage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-1">
                    <span className="font-bold text-emerald-700">
                      {formatRupiah(item.productPrice ?? 0)}
                    </span>
                    <span>&middot;</span>
                    <span>Stok: {item.stock ?? 0}</span>
                    <span>&middot;</span>
                    <span>Toko: {item.submitterName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Edit Deskripsi (Ajukan ke Moderator)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-semibold text-gray-800">Belum Ada Produk</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Anda belum mendaftarkan produk apapun. Mulai jual produk pertanian pertama Anda.
          </p>
          <Link href="/seller/products/new" className="btn-primary inline-flex items-center gap-1.5 text-xs mt-2">
            <Plus className="w-4 h-4" /> Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
          {products.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{item.title}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      item.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'pending_review' || item.status === 'under_review'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="font-bold text-emerald-700">{formatRupiah(item.price_fixed)}</span>
                  <span>&middot;</span>
                  <span>Stok: {item.stock_quantity}</span>
                  <span>&middot;</span>
                  <span>Tipe: {item.item_type}</span>
                  <span>&middot;</span>
                  <span>{formatRelativeTime(item.created_at)}</span>
                </div>
              </div>

              <Link
                href={`/marketplace/${item.id}`}
                className="btn-secondary text-xs shrink-0 ml-4"
              >
                Lihat di Toko
              </Link>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <EditorialReviewModal
          item={editingItem}
          canPublishHomepage={canPublishToHomepage}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            updateItem(updated);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
