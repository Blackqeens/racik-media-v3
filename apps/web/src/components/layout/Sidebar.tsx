'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  role?: 'user' | 'seller' | 'admin';
}

const navByRole: Record<string, { label: string; href: string }[]> = {
  user: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profil Saya', href: '/profile' },
    { label: 'Bookmark', href: '/bookmarks' },
    { label: 'Pesanan Saya', href: '/orders' },
  ],
  seller: [
    { label: 'Dashboard Seller', href: '/seller/dashboard' },
    { label: 'Produk Saya', href: '/seller/products' },
    { label: 'Pesanan Masuk', href: '/seller/orders' },
    { label: 'Laporan', href: '/seller/reports' },
  ],
  admin: [
    { label: 'Dashboard Admin', href: '/admin/dashboard' },
    { label: 'Moderasi', href: '/admin/moderation' },
    { label: 'Verifikasi Seller', href: '/admin/seller-verification' },
    { label: 'Laporan Keuangan', href: '/admin/financial-report' },
  ],
};

/**
 * Sidebar — role-aware side navigation for dashboard, seller, admin layouts.
 */
export function Sidebar({ role = 'user' }: SidebarProps) {
  const router = useRouter();
  const items = navByRole[role] ?? navByRole.user;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-48 shrink-0 hidden md:block">
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition"
          >
            {item.label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          type="button"
          className="w-full text-left block px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition mt-6"
        >
          Keluar
        </button>
      </nav>
    </aside>
  );
}
