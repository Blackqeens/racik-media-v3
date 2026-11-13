'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { HomepageNavbar } from '@/components/layout/HomepageNavbar';

const HIDE_NAVBAR_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/admin/document-viewer',
  '/admin/moderation/review',
];

export function RouteAwareNavbar() {
  const pathname = usePathname();
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsLivePreview(params.get('mode') === 'live-preview');
  }, [pathname]);

  // Halaman autentikasi dan viewer/review terisolasi tidak menampilkan navbar
  if (HIDE_NAVBAR_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  // Halaman beranda menggunakan HomepageNavbar khusus
  if (pathname === '/') {
    if (isLivePreview) {
      return (
        <div
          className="sticky top-0 z-40 pointer-events-none select-none opacity-75"
          aria-disabled="true"
        >
          <HomepageNavbar />
        </div>
      );
    }
    return <HomepageNavbar />;
  }

  // Halaman lainnya (dashboard, kebijakan, marketplace, artikel, layanan, cart, dll.)
  // menampilkan Navbar utama yang adaptif terhadap status login/tamu
  if (isLivePreview) {
    return (
      <div
        className="sticky top-0 z-40 pointer-events-none select-none opacity-75"
        aria-disabled="true"
      >
        <Navbar />
      </div>
    );
  }

  return <Navbar />;
}

