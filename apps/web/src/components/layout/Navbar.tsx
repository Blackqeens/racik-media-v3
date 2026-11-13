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
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, selectCartCount } from '@/stores/cart.store';

type DropdownName = 'theme' | 'user' | null;
type ThemeName = 'light' | 'forest' | 'ocean' | 'lavender';

const themes: { id: ThemeName; label: string; bgHex: string; accentHex: string; ringHex: string; desc: string }[] = [
  { id: 'light', label: 'Bersih', bgHex: '#f8fafc', accentHex: '#64748b', ringHex: '#cbd5e1', desc: 'Putih netral bersih & sederhana' },
  { id: 'forest', label: 'Sage', bgHex: '#eef5f0', accentHex: '#4d8b6f', ringHex: '#b7d4c3', desc: 'Hijau sage lembut & menenangkan' },
  { id: 'ocean', label: 'Langit', bgHex: '#eaf2fb', accentHex: '#4f83b8', ringHex: '#bdd2ea', desc: 'Biru langit sejuk & ringan' },
  { id: 'lavender', label: 'Iris', bgHex: '#f2effb', accentHex: '#8b5cf6', ringHex: '#d8d0f2', desc: 'Lavanda lembut & nyaman' },
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
  if (pathname.startsWith('/admin/moderation') || pathname.startsWith('/author')) return 'moderator';
  if (pathname.startsWith('/admin/administration') || pathname.startsWith('/admin/seller-verification')) return 'admin';
  if (pathname.startsWith('/admin')) return 'master_admin';
  if (pathname.startsWith('/seller')) return 'seller';
  if (pathname.startsWith('/distributor')) return 'distributor';
  if (pathname.startsWith('/service-provider')) return 'service_provider';
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
  const [hasDevMaster, setHasDevMaster] = useState(false);
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
      setHasDevMaster(window.localStorage.getItem('racik-dev-master') === 'true');
    }
    syncDevRole();
    window.addEventListener('racik-dev-role-change', syncDevRole);
    window.addEventListener('storage', syncDevRole);
    return () => {
      window.removeEventListener('racik-dev-role-change', syncDevRole);
      window.removeEventListener('storage', syncDevRole);
    };
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
    admin: '/admin/administration',
    master_admin: '/admin/dashboard',
  };
  const dashboardHome = dashboardHomeHref[activeRole] ?? '/dashboard';
  const isUserActive = isAuthenticated || (isDevBypass && !!devRole);
  const logoHref = isUserActive ? dashboardHome : '/';
  const logoTitle = isUserActive
    ? `Kembali ke Dashboard (${roleLabels[activeRole] ?? activeRole})`
    : 'Beranda Racik Media';

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
      const normalizedTarget =
        targetRole === 'service_provider' ? 'service-provider' : targetRole;
      const normalizedActive =
        activeRole === 'service_provider' ? 'service-provider' : activeRole;
      window.localStorage.setItem('racik-dev-role', targetRole);
      if (
        normalizedTarget === 'seller' ||
        normalizedTarget === 'distributor' ||
        normalizedTarget === 'service-provider'
      ) {
        window.localStorage.setItem('racik-partner-origin-role', normalizedTarget);
      } else if (normalizedTarget === 'member') {
        if (
          normalizedActive === 'seller' ||
          normalizedActive === 'distributor' ||
          normalizedActive === 'service-provider'
        ) {
          window.localStorage.setItem('racik-partner-origin-role', normalizedActive);
        } else if (
          !href.includes('from=seller') &&
          !href.includes('from=distributor') &&
          !href.includes('from=service-provider')
        ) {
          window.localStorage.removeItem('racik-partner-origin-role');
        }
      } else {
        window.localStorage.removeItem('racik-partner-origin-role');
      }
      if (
        targetRole === 'master_admin' ||
        activeRole === 'master_admin' ||
        effectiveRoles.includes('master_admin') ||
        window.localStorage.getItem('racik-dev-master') === 'true'
      ) {
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
      window.localStorage.removeItem('racik-partner-origin-role');
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // abaikan error koneksi saat sign out
    }
    setOpenDropdown(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  }

  const roleMenu: Record<string, readonly (readonly [string, string])[]> = {
    member: [
      ['Dashboard Member', '/dashboard'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
      ['Pesanan Saya', '/orders'],
      ['Artikel Tersimpan', '/bookmarks'],
    ],
    author: [
      ['Dashboard Author', '/author/dashboard'],
      ['Tulis Artikel', '/articles/write'],
      ['Riwayat Chat', '/chat'],
      ['Artikel Tersimpan', '/bookmarks'],
      ['Profil Saya', '/profile'],
    ],
    seller: [
      ['Dashboard Seller', '/seller/dashboard'],
      ['Pesanan Toko', '/seller/orders'],
      ['Keuangan / Saldo', '/seller/finance'],
      ['Dashboard Member', '/dashboard?layer=marketplace&from=seller'],
      ['Produk Saya', '/seller/products'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
    ],
    distributor: [
      ['Dashboard Distributor', '/distributor/dashboard'],
      ['Pesanan Toko', '/distributor/orders'],
      ['Keuangan / Saldo', '/distributor/finance'],
      ['Dashboard Member', '/dashboard?layer=marketplace&from=distributor'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
    ],
    service_provider: [
      ['Dashboard Penyedia Jasa', '/service-provider/dashboard'],
      ['Pesanan Toko', '/service-provider/orders'],
      ['Keuangan / Saldo', '/service-provider/finance'],
      ['Dashboard Member', '/dashboard?layer=marketplace&from=service-provider'],
      ['Katalog Layanan', '/services'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
    ],
    moderator: [
      ['Panel Moderasi', '/admin/moderation'],
      ['Live Chat ke Master Admin', '/admin/chat-master?role=moderator'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
    ],
    admin: [
      ['Dashboard Admin (Administrasi)', '/admin/administration'],
      ['Pusat Bantuan & Tiket Member', '/admin/helpdesk'],
      ['Pengajuan Seller & Distributor', '/admin/seller-verification'],
      ['Komplain & Penyelesaian Masalah', '/admin/administration?tab=complaints'],
      ['Dokumen & Legalitas Mitra', '/admin/administration?tab=legality'],
      ['Live Chat ke Master Admin', '/admin/chat-master'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
    ],
    master_admin: [
      ['Dashboard Master Admin', '/admin/dashboard'],
      ['Pengaturan Algoritma Penjualan (AI)', '/admin/algorithm-settings'],
      ['Akses Skill AI (Bantuan Admin)', '/admin/ai-skills'],
      ['Dashboard Admin (Administrasi & Legalitas)', '/admin/administration'],
      ['Panel Arsip & Moderasi', '/admin/moderation'],
      ['Live Chat Tim (Admin & Moderator)', '/admin/chat-master'],
      ['Verifikasi Pengajuan Mitra', '/admin/seller-verification'],
      ['Laporan Keuangan & Escrow', '/admin/financial-report'],
      ['Riwayat Chat', '/chat'],
      ['Profil Saya', '/profile'],
      ['Dashboard Seller', '/seller/dashboard'],
      ['Dashboard Penyedia Jasa', '/service-provider/dashboard'],
    ],
  };

  const currentMenuItems = roleMenu[activeRole] ?? roleMenu.member;

  const allSwitchableRoles: { role: string; label: string; href: string }[] = [
    { role: 'member', label: 'Member / Buyer', href: '/dashboard' },
    { role: 'author', label: 'Author (Ide & Cerita)', href: '/author/dashboard' },
    { role: 'seller', label: 'Seller', href: '/seller/dashboard' },
    { role: 'service_provider', label: 'Penyedia Jasa', href: '/service-provider/dashboard' },
    { role: 'distributor', label: 'Distributor', href: '/distributor/dashboard' },
    { role: 'moderator', label: 'Moderator (Naungan Penulis)', href: '/admin/moderation' },
    { role: 'admin', label: 'Admin (Administrasi & Legalitas)', href: '/admin/administration' },
    { role: 'master_admin', label: 'Master Admin', href: '/admin/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm" data-theme={theme}>
      <nav ref={navRef} className="flex h-[64px] w-full items-center gap-2 px-3">
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
        <Link
          href={logoHref}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="ml-1 mr-1 flex shrink-0 items-center select-none"
          title={logoTitle}
        >
          <img
            src="/images/racik-logo.png"
            alt="Racik Media"
            draggable={false}
            className="h-9 w-auto rounded-md bg-white/95 px-1.5 py-0.5 object-contain select-none"
          />
        </Link>

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
            <div className="theme-dropdown-panel absolute right-0 top-[calc(100%+8px)] w-[288px] rounded-2xl border border-gray-200/90 bg-white p-3 shadow-xl">
              <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-gray-500">Pilih Tema Tampilan</p>
              <div className="grid grid-cols-4 gap-2">
                {themes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.desc}
                    onClick={() => changeTheme(item.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] font-medium transition ${
                      theme === item.id
                        ? 'border-emerald-500/80 bg-emerald-50/70 text-emerald-800 shadow-sm'
                        : 'border-gray-200/80 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-end justify-end rounded-lg border p-1"
                      style={{ backgroundColor: item.bgHex, borderColor: item.ringHex }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.accentHex }} />
                    </span>
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

                  {(isDevBypass ||
                    effectiveRoles.length > 1 ||
                    effectiveRoles.includes('master_admin') ||
                    activeRole === 'master_admin' ||
                    hasDevMaster) && (
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
