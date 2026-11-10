'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Sliders, CheckCircle2 } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'racik-cookie-consent';

type ConsentChoice = 'essential' | 'all';

/**
 * CookieConsent — Gerbang persetujuan cookie interaktif & pengoptimal performa situs.
 * Mengunci interaksi dan meringankan beban muat data hingga preferensi cookie ditentukan oleh pengunjung.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Periksa apakah pengunjung sudah pernah menyetujui cookie sebelumnya
    const choice = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    const hasCookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('racik_cookie_consent='));

    if (!choice && !hasCookie) {
      setVisible(true);
      document.body.style.overflow = 'hidden'; // Kunci scroll agar halaman fokus pada consent
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function saveChoice(choice: ConsentChoice) {
    // Simpan ke localStorage & document.cookie berumur 1 tahun
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    document.cookie = `racik_cookie_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;

    // Kembalikan scroll body dan tutup modal
    document.body.style.overflow = '';
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md transition-all animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl">
        {/* Header Icon & Brand */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Privasi & Optimasi Situs
              </span>
            </div>
            <h2 id="cookie-consent-title" className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Pengaturan Cookie & Akses
            </h2>
          </div>
        </div>

        {/* Deskripsi Alasan & Manfaat */}
        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-600">
          Selamat datang di <strong className="text-gray-900">Racik Media Nusantara</strong>.
          Untuk memastikan pengalaman bernavigasi ringan, cepat, dan aman, situs ini menggunakan
          penyimpanan cookie untuk mengelola sesi login, keranjang belanja, serta cache data produk.
        </p>

        {/* Fitur yang dioptimalkan */}
        <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4 border border-gray-100 text-xs">
          <div className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Meringankan Beban Halaman</p>
              <p className="text-gray-500 text-[11px]">
                Menyimpan cache data produk dan preferensi lokal agar halaman termuat instan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Keamanan Sesi & Transaksi</p>
              <p className="text-gray-500 text-[11px]">
                Memastikan keranjang dan autentikasi akun terlindungi selama sesi belanja.
              </p>
            </div>
          </div>
        </div>

        {/* Accordion Rincian Opsional */}
        {showDetails && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 text-[11px] text-gray-500 space-y-1.5 animate-fadeIn">
            <div className="flex justify-between font-medium text-gray-700">
              <span>Cookie Esensial:</span>
              <span className="text-emerald-700 font-bold">Wajib Aktif</span>
            </div>
            <p>Digunakan untuk otentikasi Supabase, keamanan CSRF, dan persistensi keranjang.</p>
            <div className="flex justify-between font-medium text-gray-700 pt-1 border-t border-gray-100">
              <span>Cookie Performa & Preferensi:</span>
              <span className="text-gray-600">Opsional</span>
            </div>
            <p>Menyimpan tema pilihan (gelap/terang) dan riwayat filter produk agar responsif.</p>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => saveChoice('all')}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>Terima Semua (Performa Optimal)</span>
          </button>

          <button
            type="button"
            onClick={() => saveChoice('essential')}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs sm:text-sm transition-all"
          >
            Hanya Esensial
          </button>
        </div>

        {/* Link toggle info */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-gray-400 hover:text-emerald-700 underline transition inline-flex items-center gap-1"
          >
            <Sliders className="h-3 w-3" />
            <span>{showDetails ? 'Sembunyikan detail teknis' : 'Pelajari rincian teknis cookie'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
