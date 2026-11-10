'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { HomepageFooter } from '@/components/layout/HomepageFooter';

const HIDE_FOOTER_ROUTES = ['/login', '/register', '/forgot-password'];

/**
 * RouteAwareFooter — Menampilkan HomepageFooter khusus saat berada di beranda ('/'),
 * menyembunyikan footer di halaman autentikasi, dan menampilkan Footer reguler untuk halaman lainnya.
 */
export function RouteAwareFooter() {
  const pathname = usePathname();

  if (HIDE_FOOTER_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  if (pathname === '/') {
    return <HomepageFooter />;
  }

  return <Footer />;
}
