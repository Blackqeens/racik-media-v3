import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';

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
      <body className="flex flex-col min-h-screen bg-surface">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
