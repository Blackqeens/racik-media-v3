'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Store, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const { session } = useAuth();

  const [storeName, setStoreName]       = useState('');
  const [businessType, setBusinessType] = useState('perorangan');
  const [description, setDescription]   = useState('');
  const [phone, setPhone]               = useState('');
  const [address, setAddress]           = useState('');
  const [city, setCity]                 = useState('Bandung');
  const [province, setProvince]         = useState('Jawa Barat');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push('/login?next=/seller/register');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post(
        '/vendors/register',
        {
          storeName,
          businessType,
          description,
          phone,
          address,
          city,
          province,
          email: session.user.email,
        },
        { Authorization: `Bearer ${session.access_token}` },
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftar sebagai seller. Pastikan Anda belum memiliki toko aktif.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buka Toko Seller</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lengkapi data toko Anda untuk mulai berjualan bibit, pupuk, atau peralatan tani di Racik Media.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Toko Anda berhasil didaftarkan! Mengarahkan ke dashboard seller...</span>
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
            Nama Toko / Usaha <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="Contoh: Tani Makmur Organik"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Usaha</label>
          <select
            className="input-base"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={loading}
          >
            <option value="perorangan">Perorangan / Petani Mandiri</option>
            <option value="umkm">Kelompok Tani / UMKM</option>
            <option value="pt">PT / CV / Koperasi</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Produk / Toko</label>
          <textarea
            rows={3}
            className="input-base"
            placeholder="Jelaskan spesialisasi produk Anda (misal: produsen benih hortikultura unggul...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              className="input-base"
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kota Asal</label>
            <input
              type="text"
              className="input-base"
              placeholder="Kota/Kabupaten"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Gudang / Kebun</label>
          <input
            type="text"
            className="input-base"
            placeholder="Alamat lengkap lokasi pengiriman produk"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full text-sm mt-4"
          disabled={loading || success}
        >
          {loading ? 'Mendaftarkan Toko...' : 'Ajukan Buka Toko'}
        </button>
      </form>
    </div>
  );
}
