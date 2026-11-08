'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  BarChart3,
  Bookmark,
  Boxes,
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  PenLine,
  ReceiptText,
  Settings,
  ShoppingBag,
  Truck,
  UserRound,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role?: 'member' | 'user' | 'author' | 'seller' | 'distributor' | 'service-provider' | 'moderator' | 'admin';
}

/*
 * EDIT MANUAL - DAFTAR MENU TIAP ROLE:
 * Tambah/hapus menu pada daftar member, seller, author, distributor,
 * service-provider, moderator, atau admin di bawah.
 * Format menu: { label: 'Nama Menu', href: '/alamat-halaman', icon: NamaIcon }.
 *
 * EDIT MANUAL - TAMPILAN SIDEBAR:
 * w-[208px]  = lebar sidebar terbuka.
 * w-[64px]   = lebar rail/ikon tertutup agar rata dengan pusat tombol navbar.
 * h-10       = tinggi satu baris menu.
 * px-1.5     = jarak kiri sidebar dan jarak menu dari tepi.
 * gap-1      = jarak antar menu.
 * Icon h-5/w-5 = ukuran ikon menu.
 * Edit bagian navByRole untuk menu; edit kelas pada <aside> dan <Link> untuk layout.
 */
const navByRole: Record<string, { label: string; href: string; icon: typeof Home }[]> = {
  member: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: ShoppingBag },
  ],
  user: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: ShoppingBag },
  ],
  seller: [
    { label: 'Dashboard Seller', href: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'Produk Saya', href: '/seller/products', icon: PackageSearch },
    { label: 'Pesanan Masuk', href: '/seller/orders', icon: ReceiptText },
    { label: 'Laporan', href: '/seller/reports', icon: BarChart3 },
  ],
  author: [
    { label: 'Dashboard Author', href: '/author/dashboard', icon: LayoutDashboard },
    { label: 'Tulis Artikel', href: '/articles/write', icon: PenLine },
    { label: 'Artikel Saya', href: '/dashboard', icon: ClipboardCheck },
  ],
  distributor: [
    { label: 'Dashboard Distributor', href: '/distributor/dashboard', icon: LayoutDashboard },
    { label: 'Produk Distribusi', href: '/distributor/products', icon: Boxes },
    { label: 'Pengiriman', href: '/distributor/orders', icon: Truck },
  ],
  'service-provider': [
    { label: 'Dashboard Penyedia Jasa', href: '/service-provider/dashboard', icon: LayoutDashboard },
    { label: 'Layanan Saya', href: '/service-provider/services', icon: BriefcaseBusiness },
    { label: 'Pemesanan Jasa', href: '/service-provider/orders', icon: ClipboardCheck },
  ],
  moderator: [
    { label: 'Dashboard Moderasi', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Antrean Moderasi', href: '/admin/moderation', icon: ClipboardCheck },
    { label: 'Verifikasi Konten', href: '/admin/moderation', icon: BadgeCheck },
  ],
  admin: [
    { label: 'Dashboard Admin', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
    { label: 'Moderasi', href: '/admin/moderation', icon: ClipboardCheck },
    { label: 'Verifikasi Seller', href: '/admin/seller-verification', icon: BadgeCheck },
    { label: 'Laporan Keuangan', href: '/admin/financial-report', icon: CreditCard },
    { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ],
};

/**
 * Sidebar — role-aware side navigation for dashboard, seller, admin layouts.
 */
export function Sidebar({ role = 'user' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [activeRole, setActiveRole] = useState(role);

  useEffect(() => {
    const saved = window.localStorage.getItem('racik-sidebar-expanded');
    const narrowScreen = window.matchMedia('(max-width: 767px)').matches;
    if (narrowScreen) {
      setExpanded(false);
      return;
    }
    if (saved === 'true' || saved === 'false') {
      setExpanded(saved === 'true');
    }
  }, []);

  useEffect(() => {
    function handleNavbarToggle() {
      setExpanded((current) => {
        const next = !current;
        window.localStorage.setItem('racik-sidebar-expanded', String(next));
        return next;
      });
    }

    window.addEventListener('racik-sidebar-toggle', handleNavbarToggle);
    return () => window.removeEventListener('racik-sidebar-toggle', handleNavbarToggle);
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setActiveRole(role === 'user' ? 'member' : role);
      return;
    }

    supabase
      .from('user_roles')
      .select('role_type, status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .then(({ data }) => {
        const roles = (data ?? []).map((item) => item.role_type).filter(Boolean);

        if (role === 'admin' || role === 'moderator') {
          if (roles.includes('admin')) setActiveRole('admin');
          else if (roles.includes('moderator')) setActiveRole('moderator');
          else setActiveRole(role);
          return;
        }

        if (role === 'member' || role === 'user') {
          setActiveRole('member');
          return;
        }

        setActiveRole(role);
      });
  }, [session?.user.id, role]);

  const items = navByRole[activeRole] ?? navByRole.member;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-[64px] z-30 shrink-0 overflow-hidden border-r border-gray-200 bg-white shadow-lg transition-[width] duration-200 md:sticky md:top-[64px] md:z-auto md:h-[calc(100vh-64px)] md:self-start md:shadow-none ${
        expanded ? 'w-[208px]' : 'w-[64px]'
      }`}
    >
      {/* EDIT MANUAL:
          - pt-2: jarak menu pertama dari garis bawah navbar.
          - px-1.5: jarak horizontal menu ke tepi sidebar.
          - space-y-1: jarak vertikal antar menu.
          - rounded-md: sudut latar menu aktif.
          - h-10: tinggi tiap baris menu.
      */}
      <nav className="flex h-full flex-col px-1.5 pb-2 pt-2">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                title={expanded ? undefined : item.label}
                className={`group flex h-10 items-center rounded-md text-sm transition ${
                  expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                } ${
                  active
                    ? 'bg-primary-50 font-semibold text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-primary-700' : 'text-gray-500'}`} />
                {expanded && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          type="button"
          title={expanded ? undefined : 'Keluar'}
          className={`mt-auto flex h-10 items-center rounded-md text-sm text-rose-600 transition hover:bg-rose-50 ${
            expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span>Keluar</span>}
        </button>
      </nav>
    </aside>
  );
}
