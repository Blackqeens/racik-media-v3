'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useDashboardHomeUrl } from '@/lib/active-role';

/**
 * Footer — Global site footer yang bersih dengan akses cepat ke Lihat Kebijakan Penuh Web.
 */
export function Footer() {
  const { href: logoHref, roleLabel, isAuthenticated } = useDashboardHomeUrl();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-600">
        {/* Kolom 1: Identitas Platform & Akses Kebijakan Penuh */}
        <div className="space-y-3">
          <Link
            href={logoHref}
            className="inline-flex items-center"
            title={isAuthenticated ? `Kembali ke Dashboard (${roleLabel})` : 'Beranda Racik Media'}
          >
            <img
              src="/images/racik-logo.png"
              alt="Racik Media Nusantara"
              className="h-9 w-auto rounded-md bg-white/95 px-1.5 py-0.5 object-contain"
            />
          </Link>
          <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
            Platform media editorial, marketplace komoditas daerah, distribusi logistik, dan layanan kreatif nusantara.
          </p>
          <div className="pt-1">
            <Link
              href="/kebijakan?view=full"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              Lihat Kebijakan Penuh Web
            </Link>
          </div>
        </div>

        {/* Kolom 2: Jelajahi */}
        <div>
          <p className="font-bold text-gray-900 mb-2.5 text-xs uppercase tracking-wider">Jelajahi</p>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/marketplace" className="hover:text-primary-600">
                Marketplace Produk
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-primary-600">
                Katalog Layanan Jasa
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-primary-600">
                Koleksi Artikel &amp; Jurnal
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-primary-600">
                Agenda &amp; Event
              </Link>
            </li>
            <li>
              <Link href="/cerita-kami" className="hover:text-primary-600">
                Cerita Kami
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Layanan & Kontribusi */}
        <div>
          <p className="font-bold text-gray-900 mb-2.5 text-xs uppercase tracking-wider">Layanan &amp; Kontribusi</p>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/articles/write" className="hover:text-primary-600">
                Tulis Ide &amp; Cerita
              </Link>
            </li>
            <li>
              <Link href="/bookmarks" className="hover:text-primary-600">
                Bookmark &amp; Toko Favorit
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-primary-600">
                Lacak Pesanan Saya
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-primary-600">
                Profil &amp; Alamat Anggota
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-primary-600">
                Dashboard Member
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-slate-50 px-4 py-3.5 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <p>© {new Date().getFullYear()} Racik Media Nusantara. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
