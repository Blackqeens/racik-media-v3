'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Palette,
  PenLine,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, selectCartCount } from '@/stores/cart.store';

type DropdownName = 'article' | 'theme' | 'user' | null;
type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset' | 'lavender';

const themes: { id: ThemeName; label: string; swatch: string }[] = [
  { id: 'light', label: 'Terang', swatch: 'bg-white border border-gray-300' },
  { id: 'dark', label: 'Gelap', swatch: 'bg-slate-800' },
  { id: 'ocean', label: 'Samudra', swatch: 'bg-sky-500' },
  { id: 'sunset', label: 'Senja', swatch: 'bg-amber-500' },
  { id: 'lavender', label: 'Lavender', swatch: 'bg-purple-500' },
];

const roleLabels: Record<string, string> = {
  member: 'Member',
  author: 'Author',
  seller: 'Seller',
  distributor: 'Distributor',
  service_provider: 'Penyedia Jasa',
  'service-provider': 'Penyedia Jasa',
  expert: 'Penyedia Jasa',
  moderator: 'Moderator',
  admin: 'Admin',
  master_admin: 'Master Admin',
  super_admin: 'Master Admin',
};

const devRoleNames: Record<string, string> = {
  member: 'Member Racik',
  author: 'Penulis Racik',
  seller: 'Mitra Seller',
  distributor: 'Mitra Distributor',
  service_provider: 'Mitra Penyedia Jasa',
  moderator: 'Moderator Kurasi',
  admin: 'Admin Operasional',
  master_admin: 'Master Admin',
};

function inferRoleFromPathname(pathname: string): string | null {
  if (pathname.startsWith('/admin/moderation')) return 'moderator';
  if (pathname.startsWith('/admin')) return 'master_admin';
  if (pathname.startsWith('/seller')) return 'seller';
  if (pathname.startsWith('/distributor')) return 'distributor';
  if (pathname.startsWith('/service-provider')) return 'service_provider';
  if (pathname.startsWith('/author')) return 'author';
  return null;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, session, loading } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);
  const [openDropdown, setOpenDropdown] = useState<DropdownName>(null);
  const [theme, setTheme] = useState<ThemeName>('light');
  const [roles, setRoles] = useState<string[]>([]);
  const [profileName, setProfileName] = useState<string>('');
  const [devRole, setDevRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true' &&
    !session?.user?.id;

  useEffect(() => {
    const saved = window.localStorage.getItem('racik-theme') as ThemeName | null;
    if (saved && themes.some((item) => item.id === saved)) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved === 'light' ? '' : saved;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sinkronisasi role dari localStorage (Dev Mode) + Pathname
  useEffect(() => {
    function syncDevRole() {
      const saved = window.localStorage.getItem('racik-dev-role');
      const normalized = saved === 'service-provider' || saved === 'expert' ? 'service_provider' : saved;
      const fromPath = inferRoleFromPathname(pathname);
      setDevRole(fromPath || normalized || 'member');
    }
    syncDevRole();
    window.addEventListener('racik-dev-role-change', syncDevRole);
    return () => window.removeEventListener('racik-dev-role-change', syncDevRole);
  }, [pathname]);

  // Sinkronisasi role & nama profil dari Supabase jika login asli
  useEffect(() => {
    if (!session?.user.id) {
      setRoles([]);
      setProfileName('');
      return;
    }

    const userId = session.user.id;

    Promise.all([
      supabase
        .from('user_roles')
        .select('role_type, status')
        .eq('user_id', userId)
        .eq('status', 'active'),
      supabase
        .from('individual_profiles')
        .select('full_name, display_name, user_role, is_admin')
        .eq('user_id', userId)
        .maybeSingle(),
    ]).then(([rolesRes, profileRes]) => {
      const collected = new Set<string>();
      for (const item of rolesRes.data ?? []) {
        if (item.role_type) {
          collected.add(item.role_type === 'expert' ? 'service_provider' : item.role_type);
        }
      }
      const prof = profileRes.data as {
        full_name?: string;
        display_name?: string;
        user_role?: string;
        is_admin?: boolean;
      } | null;

      if (prof?.is_admin) collected.add('master_admin');
      if (prof?.user_role) {
        const mapped =
          prof.user_role === 'expert'
            ? 'service_provider'
            : prof.user_role === 'buyer'
              ? 'member'
              : prof.user_role;
        collected.add(mapped);
      }
      if (collected.size === 0) collected.add('member');

      setRoles(Array.from(collected));
      setProfileName(prof?.display_name || prof?.full_name || '');
    });
  }, [session?.user.id]);

  const effectiveRoles = isDevBypass
    ? [inferRoleFromPathname(pathname) || devRole || 'member']
    : roles.length
      ? roles
      : ['member'];

  const activeRole = effectiveRoles.includes('master_admin') || effectiveRoles.includes('super_admin')
    ? 'master_admin'
    : effectiveRoles.includes('admin')
      ? 'admin'
      : effectiveRoles.includes('moderator')
        ? 'moderator'
        : effectiveRoles.includes('seller')
          ? 'seller'
          : effectiveRoles.includes('distributor')
            ? 'distributor'
            : effectiveRoles.includes('service_provider')
              ? 'service_provider'
              : effectiveRoles.includes('author')
                ? 'author'
                : 'member';

  const fullName = isDevBypass
    ? devRoleNames[activeRole] ?? 'Member Racik'
    : profileName ||
      (session?.user?.user_metadata?.full_name as string) ||
      session?.user?.email?.split('@')[0] ||
      roleLabels[activeRole] ||
      'Member';

  const displayName = fullName;
  const initial = (fullName[0] || 'U').toUpperCase();

  const dashboardHomeHref: Record<string, string> = {
    member: '/dashboard',
    author: '/author/dashboard',
    seller: '/seller/dashboard',
    distributor: '/distributor/dashboard',
    service_provider: '/service-provider/dashboard',
    moderator: '/admin/moderation',
    admin: '/admin/dashboard',
    master_admin: '/admin/dashboard',
  };
  const dashboardHome = dashboardHomeHref[activeRole] ?? '/dashboard';

  function toggleDropdown(name: Exclude<DropdownName, null>) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  function changeTheme(nextTheme: ThemeName) {
    setTheme(nextTheme);
    window.localStorage.setItem('racik-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme === 'light' ? '' : nextTheme;
    setOpenDropdown(null);
  }

  function handleSwitchRole(targetRole: string, href: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('racik-dev-role', targetRole);
      if (targetRole === 'master_admin') {
        window.localStorage.setItem('racik-dev-master', 'true');
      }
      window.dispatchEvent(new Event('racik-dev-role-change'));
    }
    setDevRole(targetRole);
    setOpenDropdown(null);
    router.push(href);
  }

  async function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('racik-dev-role');
      window.localStorage.removeItem('racik-dev-master');
    }
    await supabase.auth.signOut();
    setOpenDropdown(null);
    router.push('/login');
    router.refresh();
  }

  const roleMenu: Record<string, readonly (readonly [string, string])[]> = {
    member: [
      ['Dashboard Member', '/dashboard'],
      ['Profil Saya', '/profile'],
      ['Pesanan Saya', '/orders'],
      ['Artikel Tersimpan', '/bookmarks'],
    ],
    author: [
      ['Dashboard Author', '/author/dashboard'],
      ['Tulis Artikel', '/articles/write'],
      ['Artikel Tersimpan', '/bookmarks'],
      ['Profil Saya', '/profile'],
    ],
    seller: [
      ['Dashboard Seller', '/seller/dashboard'],
      ['Produk Saya', '/seller/products'],
      ['Tambah Produk', '/seller/products/new'],
      ['Profil Saya', '/profile'],
    ],
    distributor: [
      ['Dashboard Distributor', '/distributor/dashboard'],
      ['Profil Saya', '/profile'],
    ],
    service_provider: [
      ['Dashboard Penyedia Jasa', '/service-provider/dashboard'],
      ['Katalog Layanan', '/services'],
      ['Profil Saya', '/profile'],
    ],
    moderator: [
      ['Panel Moderasi', '/admin/moderation'],
      ['Profil Saya', '/profile'],
    ],
    admin: [
      ['Dashboard Member', '/dashboard'],
      ['Dashboard Admin', '/admin/dashboard'],
      ['Verifikasi Seller', '/admin/seller-verification'],
      ['Laporan Keuangan', '/admin/financial-report'],
    ],
    master_admin: [
      ['Dashboard Member', '/dashboard'],
      ['Dashboard Master Admin', '/admin/dashboard'],
      ['Antrean Moderasi', '/admin/moderation'],
      ['Verifikasi Seller', '/admin/seller-verification'],
      ['Laporan Keuangan', '/admin/financial-report'],
      ['Dashboard Seller', '/seller/dashboard'],
      ['Dashboard Penyedia Jasa', '/service-provider/dashboard'],
    ],
  };

  const currentMenuItems = roleMenu[activeRole] ?? roleMenu.member;

  const allSwitchableRoles: { role: string; label: string; href: string }[] = [
    { role: 'member', label: 'Member / Buyer', href: '/dashboard' },
    { role: 'seller', label: 'Seller', href: '/seller/dashboard' },
    { role: 'service_provider', label: 'Penyedia Jasa', href: '/service-provider/dashboard' },
    { role: 'author', label: 'Author', href: '/author/dashboard' },
    { role: 'distributor', label: 'Distributor', href: '/distributor/dashboard' },
    { role: 'moderator', label: 'Moderator', href: '/admin/moderation' },
    { role: 'master_admin', label: 'Master Admin', href: '/admin/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm" data-theme={theme}>
      <nav ref={navRef} className="mx-auto flex h-[64px] max-w-[1440px] items-center gap-2 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('racik-sidebar-toggle'))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Buka atau sembunyikan sidebar"
          title="Buka atau sembunyikan sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="h-6 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <Link href="/" className="ml-1 mr-1 shrink-0 text-lg font-bold text-primary-700" title="Beranda Racik Media">
          Racik<span className="hidden sm:inline"> Media</span>
        </Link>

        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => toggleDropdown('article')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              openDropdown === 'article'
                ? 'border-transparent bg-primary-700 text-white shadow-lg'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            <PenLine className="h-4 w-4" />
            Artikel
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {openDropdown === 'article' && (
            <div className="absolute left-0 top-[calc(100%+8px)] w-[220px] rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
              <Link href="/articles" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Membaca</span>
                <span className="mt-1 block text-gray-500">Jelajahi artikel dan jurnal lokal</span>
              </Link>
              <Link href="/bookmarks" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Artikel tersimpan</span>
                <span className="mt-1 block text-gray-500">Lanjutkan membaca favorit Anda</span>
              </Link>
              <Link href="/articles/write" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Menulis</span>
                <span className="mt-1 block text-gray-500">Buat dan publikasikan tulisan</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mx-1 hidden min-w-0 flex-1 md:flex">
          <label className="flex h-10 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
            <span className="sr-only">Cari</span>
            <input
              type="search"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Cari produk lokal berkualitas..."
            />
          </label>
        </div>

        <div className="relative ml-auto hidden md:block">
          <button
            type="button"
            onClick={() => toggleDropdown('theme')}
            className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:border-primary-300 hover:text-primary-700"
            aria-label="Pilih tema"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden lg:inline">Tema</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {openDropdown === 'theme' && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[330px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Tema tampilan</p>
              <div className="grid grid-cols-5 gap-2">
                {themes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTheme(item.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-[10px] font-semibold transition ${
                      theme === item.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`h-8 w-8 rounded-lg ${item.swatch}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link href="/cart" className="relative hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary-700 sm:block" aria-label="Keranjang">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>
        <button type="button" className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary-700 sm:block" aria-label="Notifikasi">
          <Bell className="h-5 w-5" />
        </button>

        {!loading && (
          isAuthenticated ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => toggleDropdown('user')}
                className="flex h-10 items-center gap-2 rounded-full px-2 transition hover:bg-primary-50"
                aria-label="Portal pengguna"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-sky-300 text-xs font-bold text-primary-900">
                  {initial}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-700 lg:block">
                  {displayName}
                </span>
                <span className="hidden rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 md:inline-block">
                  {roleLabels[activeRole] ?? activeRole}
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 lg:block" />
              </button>
              {openDropdown === 'user' && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[270px] rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                  <div className="mb-1 border-b border-gray-100 px-4 pb-3">
                    <p className="truncate text-sm font-semibold text-gray-800">{fullName}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {effectiveRoles.map((role) => (
                        <span key={role} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                          {roleLabels[role] ?? role}
                        </span>
                      ))}
                    </div>
                  </div>
                  {currentMenuItems.map(([label, href]) => (
                    <Link
                      key={`${label}-${href}`}
                      href={href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {label}
                    </Link>
                  ))}

                  {(isDevBypass || effectiveRoles.length > 1) && (
                    <div className="mx-4 my-1 border-t border-gray-100 pt-2">
                      <p className="mb-1.5 text-[10px] font-bold uppercase text-gray-400">
                        {isDevBypass ? 'Ganti Peran (Dev Mode)' : 'Pindah Peran'}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {allSwitchableRoles.map((item) => (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => handleSwitchRole(item.role, item.href)}
                            className={`rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition ${
                              activeRole === item.role
                                ? 'bg-primary-100 font-semibold text-primary-800'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-primary-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
          )
        )}

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-lg p-2 text-gray-600 md:hidden"
          aria-label="Buka menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            <Link href="/marketplace" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Marketplace</Link>
            <Link href="/articles" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Artikel</Link>
            <Link href="/articles/write" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Menulis artikel</Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Keranjang ({cartCount})</Link>
            {isAuthenticated && (
              <Link href={dashboardHome} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                Buka dashboard {roleLabels[activeRole] ?? activeRole}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
