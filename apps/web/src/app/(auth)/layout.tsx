import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Auth group layout — centered card layout for auth pages (/login, /register, /forgot-password).
 * Menggunakan latar gradasi hijau-biru lembut & header "Racik Media Nusantara"
 * yang kembali ke beranda ('/') bila diklik.
 */
export const metadata: Metadata = {
  title: {
    default: 'Autentikasi',
    template: '%s | Racik Media Nusantara',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 50%, #f0fdf4 100%)',
      }}
    >
      <div className="my-4 flex w-full max-w-[460px] flex-col gap-5">
        {/* Header Brand — Klik untuk kembali ke Homepage */}
        <div className="text-center">
          <Link
            href="/"
            title="Kembali ke Beranda Racik Media Nusantara"
            className="inline-block font-serif text-3xl font-bold tracking-tight text-slate-900 transition hover:text-emerald-800"
          >
            Racik Media Nusantara
          </Link>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Platform Editorial, Budaya &amp; Commerce Indonesia
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
