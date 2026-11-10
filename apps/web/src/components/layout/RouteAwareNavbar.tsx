'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { HomepageNavbar } from '@/components/layout/HomepageNavbar';

const HIDE_NAVBAR_ROUTES = ['/login', '/register', '/forgot-password'];

export function RouteAwareNavbar() {
  const pathname = usePathname();

  // Halaman beranda menggunakan HomepageNavbar khusus
  if (pathname === '/') {
    return <HomepageNavbar />;
  }

  // Halaman autentikasi tidak menampilkan navbar
  if (HIDE_NAVBAR_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  // Halaman lainnya (dashboard, kebijakan, marketplace, artikel, layanan, cart, dll.)
  // menampilkan Navbar utama yang adaptif terhadap status login/tamu
  return <Navbar />;
}

