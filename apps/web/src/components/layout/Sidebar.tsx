'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Newspaper,
  PackageSearch,
  PenLine,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export type DashboardRoleKey =
  | 'member'
  | 'user'
  | 'author'
  | 'seller'
  | 'distributor'
  | 'service-provider'
  | 'moderator'
  | 'admin'
  | 'master_admin';

interface SidebarProps {
  role?: DashboardRoleKey;
}

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  dashboardKey?: string;
};

/**
 * Skema warna background pembeda untuk setiap Dashboard.
 * Semua icon dashboard disamakan menggunakan LayoutDashboard,
 * dan dibedakan melalui warna background baris + kotak icon.
 */
const dashboardThemeByKey: Record<
  string,
  {
    roleKey: string;
    label: string;
    shortDesc: string;
    href: string;
    rowBg: string;
    rowActiveBg: string;
    iconBg: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  member: {
    roleKey: 'member',
    label: 'Dashboard Member',
    shortDesc: 'Dashboard umum pembeli, pesanan & koleksi',
    href: '/dashboard',
    rowBg: 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100',
    rowActiveBg: 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold shadow-sm',
    iconBg: 'bg-emerald-600 text-white shadow-sm',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  master_admin: {
    roleKey: 'master_admin',
    label: 'Dashboard Master Admin',
    shortDesc: 'Pusat kendali utama & otoritas penuh semua role',
    href: '/admin/dashboard',
    rowBg: 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100',
    rowActiveBg: 'bg-purple-100 text-purple-950 border border-purple-400 font-bold shadow-sm',
    iconBg: 'bg-purple-600 text-white shadow-sm',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    dotClass: 'bg-purple-600',
  },
  admin: {
    roleKey: 'admin',
    label: 'Dashboard Admin',
    shortDesc: 'Verifikasi mitra & laporan keuangan',
    href: '/admin/dashboard',
    rowBg: 'bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100',
    rowActiveBg: 'bg-violet-100 text-violet-950 border border-violet-400 font-bold shadow-sm',
    iconBg: 'bg-violet-600 text-white shadow-sm',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
    dotClass: 'bg-violet-500',
  },
  seller: {
    roleKey: 'seller',
    label: 'Dashboard Seller',
    shortDesc: 'Kelola produk, etalase toko & pesanan pembeli',
    href: '/seller/dashboard',
    rowBg: 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100',
    rowActiveBg: 'bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-sm',
    iconBg: 'bg-amber-500 text-white shadow-sm',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  'service-provider': {
    roleKey: 'service-provider',
    label: 'Dashboard Penyedia Jasa',
    shortDesc: 'Kelola layanan keahlian & kontrak jasa',
    href: '/service-provider/dashboard',
    rowBg: 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100',
    rowActiveBg: 'bg-sky-100 text-sky-950 border border-sky-400 font-bold shadow-sm',
    iconBg: 'bg-sky-600 text-white shadow-sm',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  author: {
    roleKey: 'author',
    label: 'Dashboard Author',
    shortDesc: 'Penulisan karya editorial, cerita & publikasi',
    href: '/author/dashboard',
    rowBg: 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100',
    rowActiveBg: 'bg-teal-100 text-teal-950 border border-teal-400 font-bold shadow-sm',
    iconBg: 'bg-teal-600 text-white shadow-sm',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    dotClass: 'bg-teal-500',
  },
  distributor: {
    roleKey: 'distributor',
    label: 'Dashboard Distributor',
    shortDesc: 'Distribusi logistik, stok & pengiriman wilayah',
    href: '/distributor/dashboard',
    rowBg: 'bg-cyan-50 text-cyan-900 border border-cyan-200 hover:bg-cyan-100',
    rowActiveBg: 'bg-cyan-100 text-cyan-950 border border-cyan-400 font-bold shadow-sm',
    iconBg: 'bg-cyan-600 text-white shadow-sm',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dotClass: 'bg-cyan-500',
  },
  moderator: {
    roleKey: 'moderator',
    label: 'Dashboard Moderator',
    shortDesc: 'Kurasi konten artikel & peninjauan produk',
    href: '/admin/moderation',
    rowBg: 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100',
    rowActiveBg: 'bg-indigo-100 text-indigo-950 border border-indigo-400 font-bold shadow-sm',
    iconBg: 'bg-indigo-600 text-white shadow-sm',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
};

const masterSwitchableDashboards = [
  dashboardThemeByKey.member,
  dashboardThemeByKey.seller,
  dashboardThemeByKey['service-provider'],
  dashboardThemeByKey.author,
  dashboardThemeByKey.distributor,
  dashboardThemeByKey.moderator,
];

const navByRole: Record<string, NavItem[]> = {
  member: [
    {
      label: 'Dashboard Member',
      href: '/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'member',
    },
    { label: 'Marketplace', href: '/marketplace', icon: Store },
    { label: 'Jasa', href: '/services', icon: BriefcaseBusiness },
    { label: 'Artikel', href: '/articles', icon: Newspaper },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: Truck },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  user: [
    {
      label: 'Dashboard Member',
      href: '/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'member',
    },
    { label: 'Marketplace', href: '/marketplace', icon: Store },
    { label: 'Jasa', href: '/services', icon: BriefcaseBusiness },
    { label: 'Artikel', href: '/articles', icon: Newspaper },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: Truck },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  author: [
    {
      label: 'Dashboard Author',
      href: '/author/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'author',
    },
    { label: 'Tulis Artikel', href: '/articles/write', icon: PenLine },
    { label: 'Koleksi Artikel', href: '/articles', icon: Newspaper },
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  seller: [
    {
      label: 'Dashboard Seller',
      href: '/seller/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'seller',
    },
    { label: 'Produk Saya', href: '/seller/products', icon: PackageSearch },
    { label: 'Tambah Produk', href: '/seller/products/new', icon: Plus },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  distributor: [
    {
      label: 'Dashboard Distributor',
      href: '/distributor/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'distributor',
    },
    { label: 'Pesanan & Pengiriman', href: '/orders', icon: Truck },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  'service-provider': [
    {
      label: 'Dashboard Penyedia Jasa',
      href: '/service-provider/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'service-provider',
    },
    { label: 'Katalog Layanan', href: '/services', icon: BriefcaseBusiness },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Profil Saya', href: '/profile', icon: UserRound },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  moderator: [
    {
      label: 'Dashboard Moderator',
      href: '/admin/moderation',
      icon: LayoutDashboard,
      dashboardKey: 'moderator',
    },
    { label: 'Koleksi Artikel', href: '/articles', icon: Newspaper },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  admin: [
    {
      label: 'Dashboard Admin',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'admin',
    },
    { label: 'Verifikasi Seller', href: '/admin/seller-verification', icon: BadgeCheck },
    { label: 'Laporan Keuangan', href: '/admin/financial-report', icon: CreditCard },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
  master_admin: [
    { label: 'Antrean Moderasi', href: '/admin/moderation', icon: ClipboardCheck },
    { label: 'Verifikasi Seller', href: '/admin/seller-verification', icon: BadgeCheck },
    { label: 'Laporan Keuangan', href: '/admin/financial-report', icon: CreditCard },
    { label: 'Tulis Ide & Cerita', href: '/articles/write', icon: PenLine },
    { label: 'Kebijakan', href: '/kebijakan', icon: ShieldCheck },
  ],
};

function normalizeRoleKey(rawRole: string | null | undefined): string {
  if (!rawRole || rawRole === 'user' || rawRole === 'buyer') return 'member';
  if (rawRole === 'service_provider' || rawRole === 'expert') return 'service-provider';
  if (rawRole === 'super_admin') return 'master_admin';
  return rawRole;
}

function detectStrictDashboardRoleFromPath(pathname: string): string | null {
  if (pathname.startsWith('/admin/moderation')) return 'moderator';
  if (pathname.startsWith('/admin')) return 'master_admin';
  if (pathname.startsWith('/seller') && !pathname.startsWith('/seller/register')) return 'seller';
  if (pathname.startsWith('/distributor')) return 'distributor';
  if (pathname.startsWith('/service-provider')) return 'service-provider';
  if (pathname.startsWith('/author')) return 'author';
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return 'member';
  return null;
}

function isAuthorizedForDashboard(verifiedRoles: string[], targetDashboardRole: string): boolean {
  if (targetDashboardRole === 'member') return true;
  if (verifiedRoles.includes('master_admin')) return true;
  if (targetDashboardRole === 'moderator' && verifiedRoles.includes('admin')) return true;
  return verifiedRoles.includes(targetDashboardRole);
}

function pickHighestVerifiedRole(roles: string[]): string {
  const priority = [
    'master_admin',
    'admin',
    'moderator',
    'seller',
    'distributor',
    'service-provider',
    'author',
    'member',
  ];
  return priority.find((candidate) => roles.includes(candidate)) ?? 'member';
}

export function Sidebar({ role = 'user' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;
  const popupRef = useRef<HTMLDivElement>(null);

  const isDevEnvironment =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: { id: string }[]; total: number }>('/users/me/bookmarks', {
        Authorization: `Bearer ${session?.access_token}`,
      }),
  });
  const bookmarkCount = bookmarksData?.data?.total ?? bookmarksData?.data?.items.length;

  const [expanded, setExpanded] = useState(true);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [activeRole, setActiveRole] = useState<string>(() => {
    return detectStrictDashboardRoleFromPath(pathname) ?? normalizeRoleKey(role);
  });
  const [verifiedRoles, setVerifiedRoles] = useState<string[]>(['member', 'master_admin']);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showMasterPopup, setShowMasterPopup] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('racik-sidebar-expanded');
    const narrowScreen = window.matchMedia('(max-width: 767px)').matches;
    if (narrowScreen) {
      setExpanded(false);
    } else if (saved === 'true' || saved === 'false') {
      setExpanded(saved === 'true');
    }

    const frameId = window.requestAnimationFrame(() => setSidebarReady(true));
    return () => window.cancelAnimationFrame(frameId);
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

  // Tutup pop-up saat klik di luar
  useEffect(() => {
    if (!showMasterPopup) return;
    function handleOutsideClick(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowMasterPopup(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMasterPopup]);

  useEffect(() => {
    const pathDashboardRole = detectStrictDashboardRoleFromPath(pathname);

    // 1. Mode Development Bypass (aktif di lokal saat NEXT_PUBLIC_DISABLE_AUTH=true)
    if (!userId || isDevEnvironment) {
      if (!isDevEnvironment && !userId) {
        setAccessDenied(Boolean(pathDashboardRole && pathDashboardRole !== 'member'));
        setActiveRole('member');
        setVerifiedRoles(['member']);
        return;
      }

      const syncDevelopmentRole = () => {
        const savedRaw = window.localStorage.getItem('racik-dev-role');
        const savedRole = savedRaw ? normalizeRoleKey(savedRaw) : null;

        // Di mode dev, otoritas Master Admin selalu disertakan agar pengguna dapat
        // berpindah antar dashboard dan kembali ke Dashboard Master Admin kapan saja.
        const owned = new Set<string>(['member', 'master_admin']);
        if (savedRole) owned.add(savedRole);
        if (pathDashboardRole) owned.add(pathDashboardRole);

        setVerifiedRoles(Array.from(owned));

        if (pathDashboardRole) {
          setActiveRole(pathDashboardRole);
        } else if (savedRole && savedRole in navByRole) {
          setActiveRole(savedRole);
        } else {
          setActiveRole(normalizeRoleKey(role));
        }
        setAccessDenied(false);
      };

      syncDevelopmentRole();
      window.addEventListener('racik-dev-role-change', syncDevelopmentRole);
      return () => window.removeEventListener('racik-dev-role-change', syncDevelopmentRole);
    }

    // 2. Pengguna Login Produksi: Verifikasi langsung ke Supabase (Anti-Crack)
    let cancelled = false;

    async function verifyAndLoadRole() {
      const [userCheck, rolesRes, profileRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('user_roles')
          .select('role_type, status')
          .eq('user_id', userId)
          .eq('status', 'active'),
        supabase
          .from('individual_profiles')
          .select('user_role, is_admin')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (userCheck.error || !userCheck.data.user) {
        setAccessDenied(true);
        router.replace('/login');
        return;
      }

      const collected = new Set<string>(['member']);
      for (const item of rolesRes.data ?? []) {
        if (item.role_type) {
          collected.add(normalizeRoleKey(item.role_type));
        }
      }
      const prof = profileRes.data as { user_role?: string; is_admin?: boolean } | null;
      if (prof?.is_admin) collected.add('master_admin');
      if (prof?.user_role) {
        collected.add(normalizeRoleKey(prof.user_role));
      }

      const dbRoles = Array.from(collected);
      setVerifiedRoles(dbRoles);

      const primaryRole = pickHighestVerifiedRole(dbRoles);

      if (pathDashboardRole) {
        const authorized = isAuthorizedForDashboard(dbRoles, pathDashboardRole);
        if (!authorized) {
          setAccessDenied(true);
          setActiveRole('member');
          const safeTarget =
            dashboardThemeByKey[primaryRole]?.href ?? '/dashboard';
          router.replace(safeTarget);
          return;
        }

        setAccessDenied(false);
        if (
          pathDashboardRole === 'master_admin' &&
          !dbRoles.includes('master_admin') &&
          dbRoles.includes('admin')
        ) {
          setActiveRole('admin');
        } else {
          setActiveRole(pathDashboardRole);
        }
      } else {
        setAccessDenied(false);
        setActiveRole(primaryRole);
      }
    }

    void verifyAndLoadRole();
    return () => {
      cancelled = true;
    };
  }, [userId, isDevEnvironment, role, pathname, router]);

  const hasMasterAuthority = verifiedRoles.includes('master_admin');
  const highestOwnedRole = pickHighestVerifiedRole(verifiedRoles);
  const items = navByRole[activeRole] ?? navByRole.member;
  const badgeMeta = dashboardThemeByKey[activeRole] ?? dashboardThemeByKey.member;

  const isMasterDashboardActive = pathname === '/admin/dashboard';

  function handleMasterSelectDashboard(targetRoleKey: string, href: string) {
    if (typeof window !== 'undefined') {
      const storageRole =
        targetRoleKey === 'service-provider' ? 'service_provider' : targetRoleKey;
      window.localStorage.setItem('racik-dev-role', storageRole);
      window.localStorage.setItem('racik-dev-master', 'true');
      window.dispatchEvent(new Event('racik-dev-role-change'));
    }
    setActiveRole(targetRoleKey);
    setShowMasterPopup(false);
    router.push(href);
  }

  async function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('racik-dev-role');
      window.localStorage.removeItem('racik-dev-master');
    }
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-[64px] z-30 shrink-0 overflow-visible border-r border-gray-200 bg-white shadow-lg ${
        sidebarReady ? 'transition-[width] duration-300 ease-in-out' : 'transition-none'
      } md:sticky md:top-[64px] md:z-auto md:h-[calc(100vh-64px)] md:self-start md:shadow-none ${
        expanded ? 'w-[228px]' : 'w-[68px]'
      }`}
    >
      <nav className="flex h-full flex-col px-1.5 pb-2 pt-2">
        {/* Header Status Role Dashboard Aktif */}
        <div
          className={`mb-2 flex items-center rounded-lg border px-2.5 py-1.5 ${badgeMeta.badgeClass} ${
            expanded ? 'justify-between gap-2' : 'justify-center px-1'
          }`}
          title={`Role Dashboard Aktif: ${badgeMeta.label}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${badgeMeta.dotClass}`} />
            {expanded && (
              <span className="truncate text-[11px] font-bold uppercase tracking-wider">
                {badgeMeta.label}
              </span>
            )}
          </div>
          {expanded && (
            <Lock
              className="h-3.5 w-3.5 shrink-0 opacity-75"
              aria-label="Proteksi Role Aktif"
            />
          )}
        </div>

        {accessDenied && !authLoading ? (
          <div className="my-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700">
            <ShieldAlert className="mx-auto mb-1.5 h-5 w-5 text-rose-600" />
            {expanded && (
              <p className="font-semibold">
                Akses Ditolak. Mengalihkan ke dashboard resmi Anda...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 overflow-visible pr-0.5">
            {/* ── BAGIAN ATAS: ICON DASHBOARD MASTER ADMIN (POP-UP PILIH ROLE) ── */}
            {(hasMasterAuthority ||
              (activeRole === 'member' &&
                highestOwnedRole !== 'member' &&
                Boolean(dashboardThemeByKey[highestOwnedRole]))) && (
              <div className="space-y-1.5 border-b border-gray-100 pb-2">
                {/* Icon Dashboard Master Admin + Pop-up Sidebar Pemilih Role Dashboard */}
                {hasMasterAuthority && (
                <div ref={popupRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMasterPopup((prev) => !prev)}
                    aria-expanded={showMasterPopup}
                    aria-label="Dashboard Master Admin — Buka Pop-up Pilih Role Dashboard"
                    className={`group relative flex h-10 w-full items-center rounded-lg text-left text-xs font-semibold transition ${
                      expanded ? 'gap-2.5 px-2' : 'justify-center px-1'
                    } ${
                      isMasterDashboardActive || showMasterPopup
                        ? dashboardThemeByKey.master_admin.rowActiveBg
                        : dashboardThemeByKey.master_admin.rowBg
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${dashboardThemeByKey.master_admin.iconBg}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                    </span>
                    {expanded && (
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                        <span className="truncate">Dashboard Master</span>
                        <span className="rounded bg-purple-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-tight text-purple-900">
                          Pilih
                        </span>
                      </div>
                    )}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        Dashboard Master Admin (Pilih Role)
                      </span>
                    )}
                  </button>

                  {/* POP-UP SIDEBAR ICON: Pilih Role Dashboard & Kembali ke Dashboard Master Admin */}
                  {showMasterPopup && (
                    <div className="fixed left-3 right-3 top-[120px] z-[90] overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-2xl md:absolute md:left-[calc(100%+10px)] md:right-auto md:top-0 md:w-[320px]">
                      {/* Header Pop-up */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 px-3.5 py-2.5 text-white">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                            <LayoutDashboard className="h-4 w-4 text-white" />
                          </span>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                              Menu Otoritas Master
                            </p>
                            <p className="text-xs font-bold">Pilih Role Dashboard</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMasterPopup(false)}
                          className="rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
                          aria-label="Tutup pop-up"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-2.5">
                        {/* Opsi Kembali ke Dashboard Master Admin */}
                        <button
                          type="button"
                          onClick={() =>
                            handleMasterSelectDashboard('master_admin', '/admin/dashboard')
                          }
                          className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                            activeRole === 'master_admin'
                              ? dashboardThemeByKey.master_admin.rowActiveBg
                              : 'border-2 border-purple-400 bg-purple-50 text-purple-950 hover:bg-purple-100'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${dashboardThemeByKey.master_admin.iconBg}`}
                            >
                              {activeRole === 'master_admin' ? (
                                <LayoutDashboard className="h-4 w-4" />
                              ) : (
                                <ArrowLeft className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-extrabold text-purple-950">
                                {activeRole === 'master_admin'
                                  ? 'Dashboard Master Admin'
                                  : 'Kembali ke Dashboard Master Admin'}
                              </p>
                              <p className="truncate text-[10px] text-purple-700">
                                Pusat kendali utama Master Admin
                              </p>
                            </div>
                          </div>
                          {activeRole === 'master_admin' ? (
                            <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-purple-700 shadow-sm">
                              <CheckCircle2 className="h-3 w-3" />
                              Aktif
                            </span>
                          ) : (
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-purple-700" />
                          )}
                        </button>

                        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Pindah ke Role Dashboard
                        </p>

                        {/* Daftar Role Dashboard dengan Icon Sama & Background Berbeda */}
                        <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-0.5">
                          {masterSwitchableDashboards.map((dash) => {
                            const isCurrent = activeRole === dash.roleKey;
                            return (
                              <button
                                key={dash.roleKey}
                                type="button"
                                onClick={() =>
                                  handleMasterSelectDashboard(dash.roleKey, dash.href)
                                }
                                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                                  isCurrent ? dash.rowActiveBg : dash.rowBg
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${dash.iconBg}`}
                                  >
                                    <LayoutDashboard className="h-4 w-4" />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold">{dash.label}</p>
                                    <p className="truncate text-[10px] opacity-80">
                                      {dash.shortDesc}
                                    </p>
                                  </div>
                                </div>
                                {isCurrent ? (
                                  <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 shadow-sm">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Aktif
                                  </span>
                                ) : (
                                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jika bukan Master Admin tapi punya role khusus (Seller/Author/dll) dan sedang di Dashboard Member */}
              {!hasMasterAuthority &&
                activeRole === 'member' &&
                highestOwnedRole !== 'member' &&
                dashboardThemeByKey[highestOwnedRole] && (
                  <Link
                    href={dashboardThemeByKey[highestOwnedRole].href}
                    className={`group relative flex h-10 items-center rounded-lg text-xs font-semibold transition ${
                      expanded ? 'gap-2.5 px-2' : 'justify-center px-1'
                    } ${dashboardThemeByKey[highestOwnedRole].rowBg}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${dashboardThemeByKey[highestOwnedRole].iconBg}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                    </span>
                    {expanded && (
                      <span className="truncate">
                        {dashboardThemeByKey[highestOwnedRole].label}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )}

            {/* ── DAFTAR MENU SESUAI ROLE DASHBOARD AKTIF ── */}
            <div className="space-y-1 pt-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                const isBookmarks = item.href === '/bookmarks';
                const bookmarkCountLabel =
                  bookmarkCount !== undefined
                    ? bookmarkCount > 99
                      ? '99+'
                      : bookmarkCount
                    : null;

                const dashTheme = item.dashboardKey
                  ? dashboardThemeByKey[item.dashboardKey]
                  : null;

                if (dashTheme) {
                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      aria-label={item.label}
                      className={`group relative flex h-10 items-center rounded-lg text-xs font-semibold transition ${
                        expanded ? 'gap-2.5 px-2' : 'justify-center px-1'
                      } ${active ? dashTheme.rowActiveBg : dashTheme.rowBg}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${dashTheme.iconBg}`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </span>
                      {expanded && <span className="truncate">{item.label}</span>}
                      {!expanded && (
                        <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    aria-label={
                      isBookmarks && bookmarkCount !== undefined
                        ? `${item.label}: ${bookmarkCount} tersimpan`
                        : item.label
                    }
                    className={`group relative flex h-9 items-center rounded-md text-sm transition ${
                      expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                    } ${
                      active
                        ? 'bg-primary-50 font-semibold text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        active ? 'text-primary-700' : 'text-gray-500'
                      }`}
                    />
                    {expanded && <span className="truncate">{item.label}</span>}
                    {isBookmarks && bookmarkCountLabel !== null && (
                      <span
                        aria-hidden="true"
                        className={`rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-700 ${
                          expanded ? 'ml-auto' : 'absolute right-0 top-0'
                        }`}
                      >
                        {bookmarkCountLabel}
                      </span>
                    )}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          type="button"
          aria-label="Keluar"
          className={`group relative mt-auto flex h-9 items-center rounded-md text-sm text-rose-600 transition hover:bg-rose-50 ${
            expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span>Keluar</span>}
          {!expanded && (
            <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              Keluar
            </span>
          )}
        </button>
      </nav>
    </aside>
  );
}
