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
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  Headphones,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Newspaper,
  Package,
  PackageSearch,
  PenLine,
  Plus,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  Truck,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { usePartnerChats } from '@/lib/partner-chat-store';

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
  useCustomIcon?: boolean;
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
    sidebarFrame: string;
    badgeClass: string;
    dotClass: string;
    orbAClass: string;
    orbBClass: string;
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
    sidebarFrame: 'border-2 border-emerald-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-emerald-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-emerald-300/50 backdrop-blur-sm',
    dotClass: 'bg-emerald-400',
    orbAClass: 'bg-emerald-400/30',
    orbBClass: 'bg-teal-400/30',
  },
  master_admin: {
    roleKey: 'master_admin',
    label: 'Dashboard Master Admin',
    shortDesc: 'Pusat kendali utama & otoritas penuh semua role',
    href: '/admin/dashboard',
    rowBg: 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100',
    rowActiveBg: 'bg-purple-100 text-purple-950 border border-purple-400 font-bold shadow-sm',
    iconBg: 'bg-purple-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-purple-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-purple-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-purple-300/50 backdrop-blur-sm',
    dotClass: 'bg-purple-400',
    orbAClass: 'bg-purple-400/30',
    orbBClass: 'bg-indigo-400/30',
  },
  admin: {
    roleKey: 'admin',
    label: 'Dashboard Admin',
    shortDesc: 'Administrasi dokumen, pengajuan seller/distributor, komplain & legalitas',
    href: '/admin/administration',
    rowBg: 'bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100',
    rowActiveBg: 'bg-violet-100 text-violet-950 border border-violet-400 font-bold shadow-sm',
    iconBg: 'bg-violet-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-violet-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-violet-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-violet-300/50 backdrop-blur-sm',
    dotClass: 'bg-violet-400',
    orbAClass: 'bg-violet-400/30',
    orbBClass: 'bg-indigo-400/30',
  },
  seller: {
    roleKey: 'seller',
    label: 'Dashboard Seller',
    shortDesc: 'Kelola produk, etalase toko & pesanan pembeli',
    href: '/seller/dashboard',
    rowBg: 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100',
    rowActiveBg: 'bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-sm',
    iconBg: 'bg-amber-500 text-white shadow-sm',
    sidebarFrame: 'border-2 border-amber-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-amber-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-amber-300/50 backdrop-blur-sm',
    dotClass: 'bg-amber-400',
    orbAClass: 'bg-amber-400/30',
    orbBClass: 'bg-emerald-400/30',
  },
  'service-provider': {
    roleKey: 'service-provider',
    label: 'Dashboard Penyedia Jasa',
    shortDesc: 'Kelola layanan keahlian & kontrak jasa',
    href: '/service-provider/dashboard',
    rowBg: 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100',
    rowActiveBg: 'bg-sky-100 text-sky-950 border border-sky-400 font-bold shadow-sm',
    iconBg: 'bg-sky-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-sky-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-sky-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-sky-300/50 backdrop-blur-sm',
    dotClass: 'bg-sky-400',
    orbAClass: 'bg-sky-400/30',
    orbBClass: 'bg-emerald-400/30',
  },
  author: {
    roleKey: 'author',
    label: 'Dashboard Author',
    shortDesc: 'Penulisan karya editorial, cerita & publikasi',
    href: '/author/dashboard',
    rowBg: 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100',
    rowActiveBg: 'bg-teal-100 text-teal-950 border border-teal-400 font-bold shadow-sm',
    iconBg: 'bg-teal-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-teal-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-teal-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-teal-300/50 backdrop-blur-sm',
    dotClass: 'bg-teal-400',
    orbAClass: 'bg-teal-400/30',
    orbBClass: 'bg-emerald-400/30',
  },
  distributor: {
    roleKey: 'distributor',
    label: 'Dashboard Distributor',
    shortDesc: 'Distribusi logistik, stok & pengiriman wilayah',
    href: '/distributor/dashboard',
    rowBg: 'bg-cyan-50 text-cyan-900 border border-cyan-200 hover:bg-cyan-100',
    rowActiveBg: 'bg-cyan-100 text-cyan-950 border border-cyan-400 font-bold shadow-sm',
    iconBg: 'bg-cyan-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-cyan-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-cyan-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-cyan-300/50 backdrop-blur-sm',
    dotClass: 'bg-cyan-400',
    orbAClass: 'bg-cyan-400/30',
    orbBClass: 'bg-emerald-400/30',
  },
  moderator: {
    roleKey: 'moderator',
    label: 'Dashboard Moderator',
    shortDesc: 'Naungan author, arsip tulisan, event & kurasi homepage',
    href: '/admin/moderation',
    rowBg: 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100',
    rowActiveBg: 'bg-indigo-100 text-indigo-950 border border-indigo-400 font-bold shadow-sm',
    iconBg: 'bg-indigo-600 text-white shadow-sm',
    sidebarFrame: 'border-2 border-indigo-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-indigo-300/40 backdrop-blur-sm',
    badgeClass: 'bg-slate-950/60 text-white border-indigo-300/50 backdrop-blur-sm',
    dotClass: 'bg-indigo-400',
    orbAClass: 'bg-indigo-400/30',
    orbBClass: 'bg-sky-400/30',
  },
};

const masterSwitchableDashboards = [
  dashboardThemeByKey.admin,
  dashboardThemeByKey.moderator,
  dashboardThemeByKey.seller,
  dashboardThemeByKey['service-provider'],
  dashboardThemeByKey.distributor,
  dashboardThemeByKey.member,
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
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: Truck },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=member', icon: ShieldCheck },
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
    { label: 'Bookmark', href: '/bookmarks', icon: Bookmark },
    { label: 'Pesanan Saya', href: '/orders', icon: Truck },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=member', icon: ShieldCheck },
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
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=moderator', icon: ShieldCheck },
  ],
  seller: [
    {
      label: 'Dashboard Seller',
      href: '/seller/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'seller',
    },
    {
      label: 'Dashboard Member',
      href: '/dashboard?layer=marketplace&from=seller',
      icon: LayoutDashboard,
      dashboardKey: 'member',
    },
    { label: 'Produk Saya', href: '/seller/products', icon: PackageSearch },
    { label: 'Pesanan Toko', href: '/seller/orders', icon: Package },
    { label: 'Keuangan / Saldo', href: '/seller/finance', icon: Wallet },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=seller', icon: ShieldCheck },
  ],
  distributor: [
    {
      label: 'Dashboard Distributor',
      href: '/distributor/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'distributor',
    },
    {
      label: 'Dashboard Member',
      href: '/dashboard?layer=marketplace&from=distributor',
      icon: LayoutDashboard,
      dashboardKey: 'member',
    },
    { label: 'Pesanan Toko', href: '/distributor/orders', icon: Package },
    { label: 'Keuangan / Saldo', href: '/distributor/finance', icon: Wallet },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=distributor', icon: ShieldCheck },
  ],
  'service-provider': [
    {
      label: 'Dashboard Penyedia Jasa',
      href: '/service-provider/dashboard',
      icon: LayoutDashboard,
      dashboardKey: 'service-provider',
    },
    {
      label: 'Dashboard Member',
      href: '/dashboard?layer=marketplace&from=service-provider',
      icon: LayoutDashboard,
      dashboardKey: 'member',
    },
    { label: 'Kelola Jasa Saya', href: '/service-provider/services', icon: Wrench },
    { label: 'Tambah Jasa Baru', href: '/service-provider/services/new', icon: Plus },
    { label: 'Pesanan Toko', href: '/service-provider/orders', icon: Package },
    { label: 'Keuangan / Saldo', href: '/service-provider/finance', icon: Wallet },
    { label: 'Katalog Layanan', href: '/services', icon: BriefcaseBusiness },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=service-provider', icon: ShieldCheck },
  ],
  moderator: [
    {
      label: 'Dashboard Moderator',
      href: '/admin/moderation',
      icon: LayoutDashboard,
      dashboardKey: 'moderator',
    },
    { label: 'Koleksi Artikel', href: '/articles', icon: Newspaper },
    { label: 'Koleksi Event', href: '/events', icon: Calendar },
    { label: 'Live Chat ke Master Admin', href: '/admin/chat-master?role=moderator', icon: Radio },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=moderator', icon: ShieldCheck },
  ],
  admin: [
    {
      label: 'Dashboard Admin',
      href: '/admin/administration',
      icon: LayoutDashboard,
      dashboardKey: 'admin',
    },
    { label: 'Pusat Bantuan & Tiket Member', href: '/admin/helpdesk', icon: Headphones },
    { label: 'Siklus Akun & KYB', href: '/admin/seller-verification', icon: BadgeCheck },
    { label: 'Sengketa & Eskalasi', href: '/admin/administration?tab=complaints', icon: Scale },
    { label: 'Legalitas & Retensi 2 Thn', href: '/admin/administration?tab=legality', icon: FileCheck2 },
    { label: 'B2B & Armada STNK/KIR', href: '/admin/administration?tab=b2b_fleet', icon: Truck },
    { label: 'Hold Escrow & Royalti Bot', href: '/admin/administration?tab=escrow_royalty', icon: CreditCard },
    { label: 'Audit Trail Permanen', href: '/admin/administration?tab=audit_trail', icon: ShieldAlert },
    { label: 'Live Chat ke Master Admin', href: '/admin/chat-master', icon: Radio },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=admin', icon: ShieldCheck },
  ],
  master_admin: [
    { label: 'Laporan Keuangan & Escrow', href: '/admin/financial-report', icon: CreditCard },
    { label: 'Pengaturan Algoritma Penjualan (AI)', href: '/admin/algorithm-settings', icon: Sliders },
    { label: 'Akses Skill AI (Bantuan Admin)', href: '/admin/ai-skills', icon: Sparkles },
    { label: 'Pantau Administrasi (Admin)', href: '/admin/administration', icon: BadgeCheck },
    { label: 'Pantau Moderasi (Moderator)', href: '/admin/moderation', icon: ClipboardCheck },
    { label: 'Live Chat Tim (Admin & Moderator)', href: '/admin/chat-master', icon: Radio },
    { label: 'Riwayat Chat', href: '/chat', icon: MessageSquare },
    { label: 'Kebijakan', href: '/kebijakan?role=master_admin', icon: ShieldCheck },
  ],
};

navByRole.service_provider = navByRole['service-provider'];

function normalizeRoleKey(rawRole: string | null | undefined): string {
  if (!rawRole || rawRole === 'user' || rawRole === 'buyer' || rawRole === 'author') return 'member';
  if (rawRole === 'service_provider' || rawRole === 'expert') return 'service-provider';
  if (rawRole === 'super_admin') return 'master_admin';
  return rawRole;
}

function detectStrictDashboardRoleFromPath(pathname: string): string | null {
  if (pathname.startsWith('/admin/moderation')) return 'moderator';
  if (pathname.startsWith('/author')) return 'author';
  if (
    pathname.startsWith('/admin/administration') ||
    pathname.startsWith('/admin/seller-verification') ||
    pathname.startsWith('/admin/helpdesk')
  ) {
    return 'admin';
  }
  if (pathname.startsWith('/admin/ai-skills')) return 'master_admin';
  if (pathname.startsWith('/admin/chat-master')) return null;
  if (pathname.startsWith('/admin')) return 'master_admin';
  if (pathname.startsWith('/seller') && !pathname.startsWith('/seller/register')) return 'seller';
  if (pathname.startsWith('/distributor')) return 'distributor';
  if (pathname.startsWith('/service-provider')) return 'service-provider';
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return 'member';
  return null;
}

function isPartnerDashboardRole(roleKey: string | null | undefined): roleKey is 'seller' | 'distributor' | 'service-provider' {
  return roleKey === 'seller' || roleKey === 'distributor' || roleKey === 'service-provider';
}

function getRegistrationTargetForDashboard(targetDashboardRole: string): string {
  if (targetDashboardRole === 'seller') return '/seller/register';
  if (targetDashboardRole === 'distributor') return '/seller/register?role=distributor';
  if (targetDashboardRole === 'service-provider') return '/services/apply';
  return '/dashboard';
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
  const isLoggingOutRef = useRef(false);

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
  const { threads: chatThreads } = usePartnerChats();

  const [expanded, setExpanded] = useState(true);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [activeRole, setActiveRole] = useState<string>(() => {
    return detectStrictDashboardRoleFromPath(pathname) ?? normalizeRoleKey(role);
  });
  const [verifiedRoles, setVerifiedRoles] = useState<string[]>(['member']);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showMasterPopup, setShowMasterPopup] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [hasDevMasterStorage, setHasDevMasterStorage] = useState(false);
  const [savedPartnerRole, setSavedPartnerRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsLivePreview(params.get('mode') === 'live-preview');

    function syncDevMaster() {
      const hasMaster = window.localStorage.getItem('racik-dev-master') === 'true';
      setHasDevMasterStorage(hasMaster);

      const pathRole = detectStrictDashboardRoleFromPath(pathname);
      const fromParamRaw = new URLSearchParams(window.location.search).get('from');
      const fromParam = fromParamRaw ? normalizeRoleKey(fromParamRaw) : null;
      const rawDevRole = window.localStorage.getItem('racik-dev-role');
      const normDev = rawDevRole ? normalizeRoleKey(rawDevRole) : null;

      if (isPartnerDashboardRole(pathRole) && !(normDev === 'member' && !hasMaster)) {
        window.localStorage.setItem('racik-partner-origin-role', pathRole);
        setSavedPartnerRole(pathRole);
        return;
      }

      if (isPartnerDashboardRole(fromParam) && !(normDev === 'member' && !hasMaster)) {
        window.localStorage.setItem('racik-partner-origin-role', fromParam);
        setSavedPartnerRole(fromParam);
        return;
      }

      const originStored = normalizeRoleKey(
        window.localStorage.getItem('racik-partner-origin-role'),
      );
      if (isPartnerDashboardRole(originStored)) {
        setSavedPartnerRole(originStored);
      } else if (isPartnerDashboardRole(normDev)) {
        setSavedPartnerRole(normDev);
      } else {
        setSavedPartnerRole(null);
      }
    }
    syncDevMaster();
    window.addEventListener('racik-dev-role-change', syncDevMaster);
    window.addEventListener('storage', syncDevMaster);
    return () => {
      window.removeEventListener('racik-dev-role-change', syncDevMaster);
      window.removeEventListener('storage', syncDevMaster);
    };
  }, [pathname]);

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
    if (isLoggingOutRef.current) return;
    const pathDashboardRole = detectStrictDashboardRoleFromPath(pathname);

    // 1. Mode Development Bypass (aktif di lokal saat NEXT_PUBLIC_DISABLE_AUTH=true)
    if (!userId || isDevEnvironment) {
      if (!isDevEnvironment && !userId) {
        const denied = Boolean(pathDashboardRole && pathDashboardRole !== 'member');
        setAccessDenied(denied);
        setActiveRole('member');
        setVerifiedRoles(['member']);
        if (denied && pathDashboardRole) {
          router.replace('/');
        }
        return;
      }

      const syncDevelopmentRole = () => {
        if (isLoggingOutRef.current) return;

        const hasDevMaster = window.localStorage.getItem('racik-dev-master') === 'true';
        const savedRaw = window.localStorage.getItem('racik-dev-role');
        const savedRole = savedRaw ? normalizeRoleKey(savedRaw) : null;

        // Tidak boleh ada bypass dari parameter URL (?role=...) maupun saat sesi belum login (!savedRole).
        const owned = new Set<string>(['member']);
        if (hasDevMaster || savedRole === 'master_admin') {
          owned.add('master_admin');
          if (savedRole) owned.add(savedRole);
          if (pathDashboardRole) owned.add(pathDashboardRole);
        } else if (savedRole) {
          owned.add(savedRole);
        }

        const ownedList = Array.from(owned);
        setVerifiedRoles(ownedList);

        if (pathDashboardRole && !isAuthorizedForDashboard(ownedList, pathDashboardRole)) {
          setAccessDenied(true);
          setActiveRole('member');
          router.replace('/');
          return;
        }

        if (pathDashboardRole) {
          setActiveRole(pathDashboardRole);
        } else if (savedRole && savedRole in navByRole) {
          setActiveRole(savedRole);
        } else {
          setActiveRole('member');
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
        router.replace('/');
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
          const safeTarget = isPartnerDashboardRole(pathDashboardRole)
            ? getRegistrationTargetForDashboard(pathDashboardRole)
            : (dashboardThemeByKey[primaryRole]?.href ?? '/dashboard');
          router.replace(safeTarget);
          return;
        }

        if (isPartnerDashboardRole(pathDashboardRole) && typeof window !== 'undefined') {
          window.localStorage.setItem('racik-partner-origin-role', pathDashboardRole);
          setSavedPartnerRole(pathDashboardRole);
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

  const hasMasterAuthority =
    verifiedRoles.includes('master_admin') ||
    activeRole === 'master_admin' ||
    hasDevMasterStorage;
  const highestOwnedRole = pickHighestVerifiedRole(verifiedRoles);
  const items = navByRole[activeRole] ?? navByRole.member;
  const badgeMeta = dashboardThemeByKey[activeRole] ?? dashboardThemeByKey.member;

  const isMasterDashboardActive = pathname === '/admin/dashboard';

  function handleMasterSelectDashboard(targetRoleKey: string, href: string) {
    if (typeof window !== 'undefined') {
      const storageRole =
        targetRoleKey === 'service-provider' ? 'service_provider' : targetRoleKey;
      if (isPartnerDashboardRole(targetRoleKey)) {
        window.localStorage.setItem('racik-partner-origin-role', targetRoleKey);
      } else if (targetRoleKey === 'member') {
        if (isPartnerDashboardRole(activeRole)) {
          window.localStorage.setItem('racik-partner-origin-role', activeRole);
        } else {
          window.localStorage.removeItem('racik-partner-origin-role');
        }
      } else {
        window.localStorage.removeItem('racik-partner-origin-role');
      }
      window.localStorage.setItem('racik-dev-role', storageRole);
      window.localStorage.setItem('racik-dev-master', 'true');
      window.dispatchEvent(new Event('racik-dev-role-change'));
    }
    setActiveRole(targetRoleKey);
    setShowMasterPopup(false);
    router.push(href);
  }

  async function handleLogout() {
    isLoggingOutRef.current = true;
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
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  }

  // Anti-Crack: Pada Mode Live Homepage (Mode Preview) atau Penampil PDF Terisolasi, Sidebar tidak dirender sama sekali di DOM
  if (isLivePreview || pathname.startsWith('/admin/document-viewer')) {
    return null;
  }

  return (
    <aside
      className={`dashboard-hero-slow select-none relative isolate fixed bottom-0 left-0 top-[64px] z-30 shrink-0 overflow-visible border-r border-white/20 text-white shadow-xl ${
        sidebarReady ? 'transition-[width] duration-300 ease-in-out' : 'transition-none'
      } md:sticky md:top-[64px] md:z-auto md:h-[calc(100vh-64px)] md:self-start ${
        expanded ? 'w-[236px]' : 'w-[68px]'
      }`}
    >
      {/* Lapisan Animasi Hero Dashboard (terklip rapi di dalam sidebar agar tooltip & popup tetap terlihat) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className={`dashboard-hero-orb-a absolute -left-16 -top-16 h-60 w-60 rounded-full blur-3xl ${badgeMeta.orbAClass}`}
        />
        <div
          className={`dashboard-hero-orb-b absolute -bottom-20 -right-12 h-64 w-64 rounded-full blur-3xl ${badgeMeta.orbBClass}`}
        />
        <div className="dashboard-hero-grid-drift absolute inset-0 opacity-20" />
      </div>

      <nav className="relative z-10 flex h-full flex-col px-2 pb-3 pt-2.5">
        {/* Header Status Role Dashboard Aktif */}
        <div
          className={`mb-2.5 flex items-center rounded-lg border px-2.5 py-1.5 ${badgeMeta.badgeClass} ${
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
          <div className="my-4 rounded-lg border border-rose-500/40 bg-rose-950/60 p-3 text-center text-xs text-rose-200">
            <ShieldAlert className="mx-auto mb-1.5 h-5 w-5 text-rose-400" />
            {expanded && (
              <p className="font-semibold">
                Akses Ditolak. Mengalihkan ke dashboard resmi Anda...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 overflow-visible pr-0.5">
            {/* ── BAGIAN ATAS: ICON DASHBOARD MASTER ADMIN / KEMBALI KE DASHBOARD MITRA ── */}
            {(hasMasterAuthority ||
              (activeRole === 'member' &&
                ((highestOwnedRole !== 'member' &&
                  Boolean(dashboardThemeByKey[highestOwnedRole])) ||
                  Boolean(savedPartnerRole && dashboardThemeByKey[savedPartnerRole])))) && (
              <div className="space-y-1 border-b border-white/20 pb-2">
                {/* Icon Dashboard Master Admin + Pop-up Sidebar Pemilih Role Dashboard */}
                {hasMasterAuthority && (
                <div ref={popupRef} className="relative">
                  <button
                    type="button"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => setShowMasterPopup((prev) => !prev)}
                    aria-expanded={showMasterPopup}
                    aria-label="Dashboard Master Admin — Buka Pop-up Pilih Role Dashboard"
                    className={`select-none group relative flex w-full items-center rounded-xl text-left text-xs transition ${
                      expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center px-1.5 py-2'
                    } ${
                      isMasterDashboardActive
                        ? dashboardThemeByKey.master_admin.sidebarFrame
                        : showMasterPopup
                          ? 'bg-white/15 text-white'
                          : 'border border-transparent text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {isMasterDashboardActive ? (
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/25 ${dashboardThemeByKey.master_admin.iconBg}`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </span>
                    ) : (
                      <LayoutDashboard className="h-5 w-5 shrink-0 text-purple-300" />
                    )}
                    {expanded && (
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                        <span className="min-w-0 truncate font-semibold">Dashboard Master</span>
                        <span className="rounded bg-purple-500/30 border border-purple-400/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-tight text-purple-100">
                          Pilih
                        </span>
                      </div>
                    )}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {isMasterDashboardActive
                          ? 'Dashboard Master'
                          : 'Dashboard Master Admin (Pilih Role)'}
                      </span>
                    )}
                  </button>

                  {/* POP-UP SIDEBAR ICON: Pilih Role Dashboard & Kembali ke Dashboard Master Admin */}
                  {showMasterPopup && (
                    <div className="fixed left-3 right-3 top-[120px] z-[90] overflow-hidden rounded-2xl border border-purple-200 bg-white text-slate-900 shadow-2xl md:absolute md:left-[calc(100%+10px)] md:right-auto md:top-0 md:w-[320px]">
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
                        <Link
                          href="/admin/dashboard"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMasterSelectDashboard('master_admin', '/admin/dashboard');
                          }}
                          className={`select-none mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
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
                        </Link>

                        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Pindah ke Role Dashboard
                        </p>

                        {/* Daftar Role Dashboard dengan Icon Sama & Background Berbeda */}
                        <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-0.5">
                          {masterSwitchableDashboards.map((dash) => {
                            const isCurrent = activeRole === dash.roleKey;
                            return (
                              <Link
                                key={dash.roleKey}
                                href={dash.href}
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleMasterSelectDashboard(dash.roleKey, dash.href);
                                }}
                                className={`select-none flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
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
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jika punya role mitra (Seller/Distributor/Penyedia Jasa) dan sedang di Mode Member */}
              {activeRole === 'member' &&
                (() => {
                  const returnPartnerRole =
                    savedPartnerRole ??
                    (highestOwnedRole !== 'member' && highestOwnedRole !== 'master_admin'
                      ? highestOwnedRole
                      : null);
                  if (!returnPartnerRole || !dashboardThemeByKey[returnPartnerRole]) {
                    return null;
                  }
                  const partnerTheme = dashboardThemeByKey[returnPartnerRole];
                  return (
                    <Link
                      href={partnerTheme.href}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.localStorage.setItem('racik-dev-role', returnPartnerRole);
                          window.localStorage.setItem(
                            'racik-partner-origin-role',
                            returnPartnerRole,
                          );
                          window.dispatchEvent(new Event('racik-dev-role-change'));
                        }
                      }}
                      title={`Kembali ke ${partnerTheme.label}`}
                      className={`select-none group relative flex h-9 items-center rounded-lg border border-transparent text-xs font-semibold text-white/90 transition hover:bg-white/15 hover:text-white ${
                        expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                      }`}
                    >
                      <ArrowLeft className="h-5 w-5 shrink-0 text-amber-300" />
                      {expanded && (
                        <span className="truncate">Kembali ke {partnerTheme.label}</span>
                      )}
                      {!expanded && (
                        <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                          Kembali ke {partnerTheme.label}
                        </span>
                      )}
                    </Link>
                  );
                })()}
              </div>
            )}

            {/* ── DAFTAR MENU SESUAI ROLE DASHBOARD AKTIF ── */}
            <div className="space-y-1 pt-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const baseHref = item.href.split('?')[0];
                const active =
                  pathname === item.href ||
                  (pathname === baseHref && !item.href.includes('?tab=')) ||
                  (baseHref === '/seller/products' && pathname.startsWith('/seller/products')) ||
                  (baseHref === '/service-provider/services' &&
                    pathname.startsWith('/service-provider/services')) ||
                  (baseHref === '/kebijakan' && pathname === '/kebijakan') ||
                  (baseHref === '/chat' && pathname.startsWith('/chat'));
                const isBookmarks = baseHref === '/bookmarks';
                const isChat = baseHref === '/chat';
                const bookmarkCountLabel =
                  bookmarkCount !== undefined
                    ? bookmarkCount > 99
                      ? '99+'
                      : bookmarkCount
                    : null;

                const partnerChatRole =
                  activeRole === 'seller'
                    ? 'seller'
                    : activeRole === 'distributor'
                      ? 'distributor'
                      : activeRole === 'service-provider'
                        ? 'service_provider'
                        : null;
                const chatUnreadCount = isChat
                  ? chatThreads.reduce((sum, thread) => {
                      const partnerUnread =
                        partnerChatRole && thread.partnerRole === partnerChatRole
                          ? thread.unreadByPartner
                          : 0;
                      return sum + thread.unreadByMember + partnerUnread;
                    }, 0)
                  : 0;
                const chatUnreadLabel =
                  isChat && chatUnreadCount > 0
                    ? chatUnreadCount > 99
                      ? '99+'
                      : chatUnreadCount
                    : null;

                const dashTheme = item.dashboardKey
                  ? dashboardThemeByKey[item.dashboardKey]
                  : null;
                const isDashboardEntry = Boolean(item.dashboardKey && !item.useCustomIcon);
                const DisplayIcon = isDashboardEntry ? LayoutDashboard : Icon;
                const activeFrameClass = dashTheme
                  ? dashTheme.sidebarFrame
                  : 'border-2 border-emerald-300 bg-slate-950/55 text-white shadow-lg ring-1 ring-emerald-300/40 backdrop-blur-sm';
                const activeIconBoxClass = dashTheme
                  ? dashTheme.iconBg
                  : 'bg-emerald-600 text-white shadow-sm';

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => {
                      if (
                        typeof window !== 'undefined' &&
                        item.dashboardKey === 'member' &&
                        activeRole !== 'member'
                      ) {
                        if (isPartnerDashboardRole(activeRole)) {
                          window.localStorage.setItem('racik-partner-origin-role', activeRole);
                        }
                        window.localStorage.setItem('racik-dev-role', 'member');
                        window.dispatchEvent(new Event('racik-dev-role-change'));
                      }
                    }}
                    aria-current={active ? 'page' : undefined}
                    aria-label={
                      isBookmarks && bookmarkCount !== undefined
                        ? `${item.label}: ${bookmarkCount} tersimpan`
                        : isChat && chatUnreadCount > 0
                          ? `${item.label}: ${chatUnreadCount} pesan belum dibaca`
                          : item.label
                    }
                    title={
                      item.dashboardKey === 'member' && activeRole !== 'member'
                        ? 'Buka Dashboard Member untuk proses pembelian'
                        : item.label
                    }
                    className={`select-none group relative flex items-center rounded-xl transition ${
                      expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center px-1.5 py-2'
                    } ${
                      active
                        ? `${activeFrameClass} font-bold`
                        : item.dashboardKey === 'member' && activeRole !== 'member'
                          ? 'border border-transparent text-sm font-medium text-emerald-200 hover:bg-white/15 hover:text-white'
                          : 'border border-transparent text-sm font-medium text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {active ? (
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/30 ${activeIconBoxClass}`}
                      >
                        <DisplayIcon className="h-4 w-4" />
                      </span>
                    ) : (
                      <DisplayIcon
                        className={`h-5 w-5 shrink-0 ${
                          item.dashboardKey === 'member' && activeRole !== 'member'
                            ? 'text-emerald-300'
                            : 'text-white/80 group-hover:text-white'
                        }`}
                      />
                    )}
                    {expanded && (
                      <span className="min-w-0 flex-1 truncate text-xs sm:text-[13px] leading-tight">
                        {item.label}
                      </span>
                    )}
                    {isBookmarks && bookmarkCountLabel !== null && (
                      <span
                        aria-hidden="true"
                        className={`rounded-full bg-emerald-500/25 border border-emerald-400/40 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-200 ${
                          expanded ? 'ml-auto' : 'absolute right-0 top-0'
                        }`}
                      >
                        {bookmarkCountLabel}
                      </span>
                    )}
                    {isChat && chatUnreadLabel !== null && (
                      <span
                        aria-hidden="true"
                        className={`rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ${
                          expanded ? 'ml-auto' : 'absolute right-0 top-0'
                        }`}
                      >
                        {chatUnreadLabel}
                      </span>
                    )}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
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
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          aria-label="Keluar"
          className={`select-none group relative mt-auto flex h-9 items-center rounded-lg text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25 hover:text-white ${
            expanded ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span>Keluar</span>}
          {!expanded && (
            <span className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              Keluar
            </span>
          )}
        </button>
      </nav>
    </aside>
  );
}
