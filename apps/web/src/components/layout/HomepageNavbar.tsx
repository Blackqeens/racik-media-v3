'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, selectCartCount } from '@/stores/cart.store';
import { useDashboardHomeUrl } from '@/lib/active-role';

export function HomepageNavbar() {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);
  const { href: logoHref, roleLabel, isAuthenticated } = useDashboardHomeUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link
            href={logoHref}
            className="text-lg font-bold text-primary-700"
            title={isAuthenticated ? `Kembali ke Dashboard (${roleLabel})` : 'Beranda Racik Media'}
          >
            Racik<span className="hidden sm:inline"> Media</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/articles"
            className="hidden px-3 py-2 text-gray-600 hover:text-primary-700 sm:block"
          >
            Artikel
          </Link>
          <Link
            href="/marketplace"
            className="hidden px-3 py-2 text-gray-600 hover:text-primary-700 sm:block"
          >
            Marketplace
          </Link>
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Masuk
          </Link>
          <Link href="/register" className="btn-primary px-3 py-2 text-xs">
            Daftar
          </Link>
        </div>
      </nav>
    </header>
  );
}
