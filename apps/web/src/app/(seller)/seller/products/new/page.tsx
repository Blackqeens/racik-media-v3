'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, PackagePlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { session } = useAuth();

  const [title, setTitle]             = useState('');
  const [category, setCategory]       = useState('bibit');
  const [itemType, setItemType]       = useState('retail');
  const [price, setPrice]             = useState('');
  const [stock, setStock]             = useState('50');
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push('/login?next=/seller/products/new');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post(
        '/catalog',
        {
          title,
          category,
          item_type: itemType,
          price_fixed: Number(price),
          stock_quantity: Number(stock),
          description,
        },
        { Authorization: `Bearer ${session.access_token}` },
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/seller/products');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan produk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Produk Saya
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
        <p className="text-xs text-gray-400 mt-1">
          Produk yang baru didaftarkan akan berstatus <em>pending review</em> untuk proses kurasi kualitas.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Produk berhasil ditambahkan! Mengalihkan ke daftar produk...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nama Produk <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="Contoh: Benih Cabai Rawit Hibrida F1 (10 Gram)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
            <select
              className="input-base"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="bibit">Bibit & Benih</option>
              <option value="pupuk">Pupuk & Nutrisi</option>
              <option value="alat">Peralatan & Mesin</option>
              <option value="pakan">Pakan & Suplemen</option>
              <option value="hasil_tani">Hasil Panen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tipe Penjualan</label>
            <select
              className="input-base"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              disabled={loading}
            >
              <option value="retail">Eceran (Retail)</option>
              <option value="wholesale">Grosir (Wholesale)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Harga Jual (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              className="input-base"
              placeholder="50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={1000}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Jumlah Stok <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              className="input-base"
              placeholder="100"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min={1}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Lengkap Produk</label>
          <textarea
            rows={4}
            className="input-base"
            placeholder="Jelaskan spesifikasi, keunggulan bibit/pupuk, cara aplikasi, dan dosis pemakaian..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full text-sm mt-4 flex items-center justify-center gap-2"
          disabled={loading || success}
        >
          <PackagePlus className="w-4 h-4" />
          {loading ? 'Menyimpan Produk...' : 'Publikasikan Produk'}
        </button>
      </form>
    </div>
  );
}

