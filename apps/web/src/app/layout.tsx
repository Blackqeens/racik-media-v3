import type { Metadata } from 'next';
import './globals.css';
// Font Lora (serif) + Inter (sans) — sama dengan project 2 (racikmedia-claims)
// eslint-disable-next-line @next/next/no-page-custom-font
import { RouteAwareFooter } from '@/components/layout/RouteAwareFooter';
import { Providers } from './providers';
import { CookieConsent } from '@/components/CookieConsent';
import { RouteAwareNavbar } from '@/components/layout/RouteAwareNavbar';

/**
 * Root layout — wraps all pages.
 * Providers menyediakan: TanStack Query + AuthContext (Supabase session).
 * Ref: coding-standards.md, system-overview.md
 */
export const metadata: Metadata = {
  title: {
    default: 'Racik Media',
    template: '%s | Racik Media',
  },
  description: 'Marketplace media produk & layanan kreatif nusantara',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-surface">
        <Providers>
          <RouteAwareNavbar />
          <main className="flex-1">{children}</main>
          <RouteAwareFooter />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
