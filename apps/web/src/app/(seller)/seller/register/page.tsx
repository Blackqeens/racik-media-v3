'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { submitPartnerActivationRequest } from '@/lib/admin-administration-store';

export default function SellerRegisterPage() {
  const { session, user } = useAuth();

  const [targetRole, setTargetRole] = useState<'seller' | 'distributor'>('seller');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'distributor') {
      setTargetRole('distributor');
    }
  }, []);
  const [applicantName, setApplicantName] = useState(
    (session?.user?.user_metadata?.full_name as string | undefined) || '',
  );
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('perorangan');
  const [commodityFocus, setCommodityFocus] = useState('');
  const [ktpNumber, setKtpNumber] = useState('');
  const [npwpNumber, setNpwpNumber] = useState('');
  const [nibNumber, setNibNumber] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bandung');
  const [province, setProvince] = useState('Jawa Barat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Kirim juga ke backend API jika sesi Supabase aktif
      if (session?.access_token && targetRole === 'seller') {
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
        } catch {
          // Tetap lanjutkan penyimpanan antrean KYB ke Role Admin agar proses pengajuan berjalan mulus
        }
      }

      const app = submitPartnerActivationRequest({
        memberName: applicantName.trim() || user?.email || 'Member Racik Media',
        memberEmail: session?.user?.email || user?.email || 'member@racikmedia.id',
        targetRole,
        proposedBusinessName: storeName.trim(),
        region: `${city.trim()}, ${province.trim()}`,
        commodityFocus: commodityFocus.trim() || description.trim(),
        ktpNumber: ktpNumber.trim() || 'Belum diisi',
        npwpNumber: npwpNumber.trim() || '-',
        nibNumber: nibNumber.trim() || 'Dalam Proses OSS',
        warehouseOrStoreAddress: `${address.trim()}, ${city.trim()}, ${province.trim()}`,
        phone: phone.trim(),
      });

      setSubmittedAppId(app.id);
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message ||
          'Gagal mengirimkan pengajuan pembukaan toko. Silakan periksa kembali isian Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Marketplace
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            Proses Aktivasi Role Member → Seller / Distributor
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pengajuan Buka Toko / Gudang Mitra
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi berkas KYB (KTP, NPWP/NIB, dan alamat usaha) untuk diverifikasi oleh{' '}
          <strong>Role Admin</strong> sebelum akun toko Seller atau Distributor Anda diaktifkan.
        </p>
      </div>

      {submittedAppId ? (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-emerald-950">
                Pengajuan Toko Berhasil Dikirim ke Role Admin!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Permohonan aktivasi akun menjadi{' '}
                <strong className="uppercase">{targetRole}</strong> atas nama usaha{' '}
                <strong>{storeName}</strong> (ID: <code>{submittedAppId}</code>) telah masuk ke antrean verifikasi KYB &amp; Legalitas <strong>Role Admin</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link href="/dashboard" className="btn-primary text-xs">
              Kembali ke Dashboard Member
            </Link>
            <Link
              href="/marketplace"
              className="rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900"
            >
              Lanjut Belanja di Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Pilih Peran Tujuan Aktivasi */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Pilih Peran Kemitraan yang Diajukan *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetRole('seller')}
                  className={`rounded-xl border-2 p-3.5 text-left transition flex items-start gap-3 ${
                    targetRole === 'seller'
                      ? 'border-amber-500 bg-amber-50/70'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Store className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">
                      Mitra Seller (Toko / Produsen)
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Menjual produk kebun, benih, kriya &amp; olahan UMKM eceran.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole('distributor')}
                  className={`rounded-xl border-2 p-3.5 text-left transition flex items-start gap-3 ${
                    targetRole === 'distributor'
                      ? 'border-cyan-500 bg-cyan-50/70'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900">
                      Mitra Distributor (Gudang Wilayah)
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Menyalurkan pasokan partai besar, pupuk &amp; logistik regional.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap Penanggung Jawab <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Sesuai KTP"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NIK KTP (16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Contoh: 3273011205900001"
                  value={ktpNumber}
                  onChange={(e) => setKtpNumber(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Toko / Gudang Usaha <span className="text-rose-500">*</span>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jenis Badan Usaha
                </label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor NPWP (Opsional untuk Mikro)
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Contoh: 84.219.441.2-101.000"
                  value={npwpNumber}
                  onChange={(e) => setNpwpNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Induk Berusaha (NIB OSS)
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Contoh: NIB-9120300481921"
                  value={nibNumber}
                  onChange={(e) => setNibNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Fokus Komoditas &amp; Deskripsi Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="input-base mb-2"
                placeholder="Fokus komoditas (misal: Benih Cabai, Kopi Gayo, Kompos Organik)"
                value={commodityFocus}
                onChange={(e) => setCommodityFocus(e.target.value)}
                required
                disabled={loading}
              />
              <textarea
                rows={3}
                className="input-base"
                placeholder="Jelaskan profil kebun, toko, atau kapasitas gudang distribusi Anda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor WhatsApp / HP <span className="text-rose-500">*</span>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Lengkap Toko / Kebun / Gudang <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                className="input-base"
                placeholder="Nama jalan, nomor, RT/RW, kecamatan, dan patokan lokasi..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <FileText className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Setelah dikirim, pengajuan ini akan diperiksa oleh <strong>Role Admin</strong>. Akun Member Anda baru dapat membuka dashboard Seller/Distributor setelah verifikasi KYB disetujui.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              {loading
                ? 'Mengirim Pengajuan KYB ke Role Admin…'
                : `Ajukan Aktivasi Menjadi ${targetRole === 'seller' ? 'Seller' : 'Distributor'}`}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
