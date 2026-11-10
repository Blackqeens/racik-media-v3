'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  HelpCircle,
  Mail,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

/**
 * KebijakanPage — Halaman Kebijakan Privasi, Syarat & Ketentuan Layanan Racik Media.
 * Diadaptasi dari dokumen kebijakan Project 2 (racikmedia-claims/kebijakan).
 */
export default function KebijakanPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="font-semibold text-gray-800">Kebijakan & Ketentuan</span>
        </div>

        {/* Header Hero */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Transparansi & Keamanan Platform
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Kebijakan Privasi, Syarat & Ketentuan
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            Racik Media berkomitmen menjaga integritas data pengguna, transparansi transaksi produk
            nusantara, serta memberikan perlindungan penuh pada seluruh aktivitas marketplace dan editorial.
          </p>
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Terakhir diperbarui: 10 November 2026 • Berlaku untuk seluruh anggota, penjual, dan mitra jasa.
          </p>
        </div>

        {/* Section 1: Kebijakan Privasi */}
        <section id="privasi" className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                1. Kebijakan Privasi & Perlindungan Data
              </h2>
              <p className="text-xs text-gray-500">Pengumpulan, penggunaan, dan keamanan data pribadi.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Kami mengumpulkan informasi penting akun (nama, alamat email terdaftar, alamat pengiriman
              pesanan) semata-mata untuk memfasilitasi transaksi marketplace, pengiriman barang, serta
              pengelolaan akun anggota.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Data Anda tidak pernah dijual atau dialihkan ke pihak ketiga yang tidak berwenang.</li>
              <li>Penyimpanan kata sandi dienkripsi dengan standar industri melalui Supabase Auth.</li>
              <li>Penggunaan cookie dirancang untuk mempercepat cache halaman serta mengamankan sesi login.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Syarat & Ketentuan Transaksi (Escrow) */}
        <section id="syarat" className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                2. Ketentuan Transaksi & Rekening Bersama (Escrow)
              </h2>
              <p className="text-xs text-gray-500">Jaminan transaksi adil antara pembeli dan penjual.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Semua transaksi jual-beli produk dan jasa di platform Racik Media dilindungi dengan
              mekanisme <strong>Escrow Rekening Bersama</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
                <p className="font-semibold text-gray-800 text-xs">Produk Marketplace</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dana pembeli ditahan aman oleh sistem hingga barang tiba dalam kondisi baik dan diverifikasi oleh pembeli.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
                <p className="font-semibold text-gray-800 text-xs">Layanan Jasa (Milestones)</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pembayaran jasa dicairkan secara bertahap sesuai capaian target pengerjaan yang disepakati kedua belah pihak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Tata Tertib Komunitas & Editorial */}
        <section id="komunitas" className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                3. Etika Jurnalisme & Tabayyun Konten
              </h2>
              <p className="text-xs text-gray-500">Prinsip kurasi artikel, karya tulis, dan informasi.</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sebagai media berbasis tabayyun, setiap artikel yang dipublikasikan oleh penulis atau mitra
            wajib menjunjung kebenaran fakta, bebas dari ujaran kebencian, plagiarisme, serta klaim
            palsu yang merugikan masyarakat. Pelanggaran berat akan dikenakan sanksi penurunan konten
            dan penangguhan akun.
          </p>
        </section>

        {/* Section 4: Kontak & Bantuan Hukum */}
        <div className="rounded-3xl bg-emerald-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <HelpCircle className="h-4 w-4" />
              Butuh Penjelasan Lebih Lanjut?
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold">
              Hubungi Tim Kepatuhan & Tata Kelola
            </h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              Jika Anda memiliki pertanyaan seputar hak privasi atau sengketa transaksi, silakan hubungi tim legal kami.
            </p>
          </div>
          <a
            href="mailto:legal@racikmedia.id"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Hubungi Tim Legal
          </a>
        </div>
      </div>
    </div>
  );
}

