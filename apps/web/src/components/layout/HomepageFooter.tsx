'use client';

import Link from 'next/link';
import { useDashboardHomeUrl } from '@/lib/active-role';
import {
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  Calendar,
  Heart,
  LayoutDashboard,
  Newspaper,
  PackageSearch,
  PenLine,
  ReceiptText,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';

/**
 * HomepageFooter — Footer komprehensif khusus untuk halaman beranda / homepage Racik Media.
 * Mengadopsi struktur peran dan ekosistem dari Sidebar Dashboard:
 *  - Marketplace & Penjual (Seller)
 *  - Layanan Jasa & Distribusi (Service Provider & Distributor)
 *  - Editorial & Literasi (kontribusi semua role)
 *  - Ruang Anggota & Tata Kelola (Member / Security & Governance)
 */
export function HomepageFooter() {
  const { href: logoHref, roleLabel, isAuthenticated } = useDashboardHomeUrl();

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700" role="contentinfo">
      {/* Banner Kepercayaan & Ekosistem Nusantara */}
      <div className="border-b border-gray-100 bg-emerald-50/50 py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Escrow & Rekening Bersama</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Dana aman terlindungi hingga barang atau layanan jasa selesai diterima.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Mitra & Produk Terkurasi</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Verifikasi ketat untuk produsen, pengrajin lokal, dan penyedia jasa autentik.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Tabayyun & Wawasan</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Artikel investigasi, panduan praktis, dan narasi mendalam yang diverifikasi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Jaringan Distribusi Luas</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Menghubungkan produsen daerah ke pasar nasional secara terintegrasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Utama Menu Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Kolom 1 & 2: Identitas Brand & Pengenalan */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href={logoHref}
              className="inline-flex items-center"
              title={isAuthenticated ? `Kembali ke Dashboard (${roleLabel})` : 'Beranda Racik Media'}
            >
              <img
                src="/images/racik-logo.png"
                alt="Racik Media"
                className="h-10 w-auto rounded-md bg-white/95 px-1.5 py-0.5 object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              Platform media editorial dan marketplace produk serta layanan kreatif nusantara.
              Mengangkat potensi karya daerah, menjalin sinergi produsen lokal, dan membangun
              ekosistem ekonomi berkeadilan.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                🌱 Produk Lokal Asli
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                🛡️ Transaksi Terpercaya
              </span>
            </div>
          </div>

          {/* Kolom 3: Pasar & Penjual (Ref: Seller & Marketplace di Sidebar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">
              <Store className="h-4 w-4 text-emerald-700" />
              <span>Pasar & Seller</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/marketplace" className="hover:text-primary-700 hover:underline">
                  Jelajahi Marketplace
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary-700 hover:underline">
                  Benih & Bibit Unggul
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary-700 hover:underline">
                  Pupuk & Kompos Matang
                </Link>
              </li>
              <li>
                <Link href="/seller/register" className="font-semibold text-emerald-700 hover:underline">
                  Daftar Jadi Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-primary-700 hover:underline">
                  Dashboard Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Layanan Jasa & Distribusi (Ref: Service Provider & Distributor di Sidebar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">
              <BriefcaseBusiness className="h-4 w-4 text-emerald-700" />
              <span>Jasa & Distribusi</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/services" className="hover:text-primary-700 hover:underline">
                  Katalog Layanan Jasa
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary-700 hover:underline">
                  Konsultasi Perawatan
                </Link>
              </li>
              <li>
                <Link href="/service-provider/dashboard" className="hover:text-primary-700 hover:underline">
                  Dashboard Penyedia Jasa
                </Link>
              </li>
              <li>
                <Link href="/distributor/dashboard" className="hover:text-primary-700 hover:underline">
                  Dashboard Distributor
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary-700 hover:underline">
                  Agenda & Workshop
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 5: Jurnal & Editorial */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">
              <Newspaper className="h-4 w-4 text-emerald-700" />
              <span>Jurnal & Literasi</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/articles" className="hover:text-primary-700 hover:underline">
                  Semua Artikel
                </Link>
              </li>
              <li>
                <Link href="/articles/write" className="font-semibold text-emerald-700 hover:underline">
                  Kirim Ide & Cerita
                </Link>
              </li>
              <li>
                <Link href="/articles/write" className="hover:text-primary-700 hover:underline">
                  Ajukan ke Moderator
                </Link>
              </li>
              <li>
                <Link href="/cerita-kami" className="hover:text-primary-700 hover:underline">
                  Cerita Kami (Tentang)
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-primary-700 hover:underline">
                  Artikel Tersimpan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 6: Area Pengguna & Akun (Ref: Member di Sidebar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900">
              <LayoutDashboard className="h-4 w-4 text-emerald-700" />
              <span>Ruang Anggota</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/dashboard" className="hover:text-primary-700 hover:underline">
                  Dashboard Member
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary-700 hover:underline">
                  Pesanan Saya
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary-700 hover:underline">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-700 hover:underline">
                  Profil & Pengaturan
                </Link>
              </li>
              <li>
                <Link href="/admin/administration" className="hover:text-primary-700 hover:underline text-xs text-gray-500">
                  Dashboard Admin (Administrasi)
                </Link>
              </li>
              <li>
                <Link href="/kebijakan?view=full" className="font-bold text-indigo-700 hover:underline">
                  Seluruh Kebijakan Penuh Web
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Baris Bawah: Hak Cipta, Tagline & Akses Seluruh Kebijakan Penuh */}
      <div className="border-t border-gray-100 bg-gray-50 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-gray-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Racik Media Nusantara. Seluruh hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-gray-600">
            <Link href="/kebijakan?view=full" className="text-indigo-700 hover:underline">
              Kebijakan Penuh Seluruh Web
            </Link>
            <Link href="/kebijakan?view=full#matriks-role" className="hover:text-primary-700 hover:underline">
              Ruang Lingkup &amp; Batasan Role
            </Link>
            <Link href="/kebijakan?view=full#privasi" className="hover:text-primary-700 hover:underline">
              Kebijakan Privasi &amp; Escrow
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
