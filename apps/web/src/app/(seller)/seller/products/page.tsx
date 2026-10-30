'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import { Plus, Package, AlertCircle } from 'lucide-react';

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
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Daftar produk bibit, pupuk, atau saprotan yang Anda jual di etalase.
          </p>
        </div>
        <Link href="/seller/products/new" className="btn-primary text-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

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
    </div>
  );
}
