'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { HomepageFooter } from '@/components/layout/HomepageFooter';

const HIDE_FOOTER_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/admin/document-viewer',
  '/admin/moderation/review',
];

export function RouteAwareFooter() {
  const pathname = usePathname();
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsLivePreview(pathname === '/' && params.get('mode') === 'live-preview');
  }, [pathname]);

  if (HIDE_FOOTER_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  if (pathname === '/') {
    if (isLivePreview) {
      return (
        <div className="pointer-events-none select-none opacity-75" aria-disabled="true">
          <HomepageFooter />
        </div>
      );
    }
    return <HomepageFooter />;
  }

  return <Footer />;
}
