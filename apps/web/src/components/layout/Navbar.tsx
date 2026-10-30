'use client';

import Link from 'next/link';
import { useCartStore, selectCartCount } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Navbar — global top navigation.
 * - Cart badge dari Zustand store
 * - Nama + inisial avatar dari profil user saat sudah login
 * Ref: coding-standards.md, system-overview.md
 */
export function Navbar() {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);
  const { isAuthenticated, session } = useAuth();

  // Fetch nama user (hanya kalau sudah login)
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    enabled: isAuthenticated && !!session,
    staleTime: 5 * 60 * 1000,   // cache 5 menit — tidak perlu refetch tiap render
    queryFn: () =>
      apiClient.get<{ individual_profiles: { full_name: string } | null }>(
        '/users/me',
        { Authorization: `Bearer ${session!.access_token}` },
      ),
  });

  const fullName =
    (profileData as any)?.data?.full_name ||
    (profileData as any)?.data?.individual_profiles?.full_name ||
    (session?.user?.user_metadata?.full_name as string) ||
    session?.user?.email?.split('@')[0] ||
    'Pengguna';

  const displayName = fullName.split(' ')[0];
  const initial = (fullName[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-primary-600 text-lg shrink-0">
          Racik Media
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/marketplace" className="hover:text-primary-600 transition">Marketplace</Link>
          <Link href="/services"    className="hover:text-primary-600 transition">Layanan</Link>
          <Link href="/articles"    className="hover:text-primary-600 transition">Artikel</Link>
          <Link href="/events"      className="hover:text-primary-600 transition">Event</Link>
        </div>

        {/* Auth / Cart */}
        <div className="flex items-center gap-3 text-sm">
          {/* Cart badge */}
          <Link
            href="/cart"
            className="relative text-gray-500 hover:text-primary-600 transition"
            aria-label={`Keranjang${cartCount > 0 ? ` (${cartCount} item)` : ''}`}
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
              {/* Avatar inisial */}
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                {initial}
              </span>
              <span className="hidden sm:block text-sm text-gray-700 font-medium">
                {displayName}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login"    className="btn-secondary py-1.5 px-3 text-xs">Masuk</Link>
              <Link href="/register" className="btn-primary  py-1.5 px-3 text-xs">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
