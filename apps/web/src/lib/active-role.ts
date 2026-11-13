'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export type ActiveUiRole =
  | 'member'
  | 'author'
  | 'seller'
  | 'distributor'
  | 'service-provider'
  | 'moderator'
  | 'admin'
  | 'master_admin';

export const ROLE_DASHBOARD_ROUTES: Record<ActiveUiRole, string> = {
  member: '/dashboard',
  author: '/author/dashboard',
  seller: '/seller/dashboard',
  distributor: '/distributor/dashboard',
  'service-provider': '/service-provider/dashboard',
  moderator: '/admin/moderation',
  admin: '/admin/administration',
  master_admin: '/admin/dashboard',
};

export const ROLE_DISPLAY_NAMES: Record<ActiveUiRole, string> = {
  member: 'Member',
  author: 'Author',
  seller: 'Seller',
  distributor: 'Distributor',
  'service-provider': 'Penyedia Jasa',
  moderator: 'Moderator',
  admin: 'Admin',
  master_admin: 'Master Admin',
};

export function normalizeRole(raw: string | null | undefined): ActiveUiRole {
  if (!raw || raw === 'user' || raw === 'buyer') return 'member';
  if (raw === 'service_provider' || raw === 'expert') return 'service-provider';
  if (raw === 'super_admin') return 'master_admin';
  if (
    raw === 'author' ||
    raw === 'seller' ||
    raw === 'distributor' ||
    raw === 'service-provider' ||
    raw === 'moderator' ||
    raw === 'admin' ||
    raw === 'master_admin'
  ) {
    return raw;
  }
  return 'member';
}

export function useCurrentActiveRole(): ActiveUiRole {
  const [role, setRole] = useState<ActiveUiRole>('member');

  useEffect(() => {
    const sync = () => {
      if (typeof window === 'undefined') return;
      const saved = window.localStorage.getItem('racik-dev-role');
      setRole(normalizeRole(saved));
    };
    sync();
    window.addEventListener('racik-dev-role-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('racik-dev-role-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return role;
}

/**
 * useDashboardHomeUrl — Menentukan URL logo "Racik Media" agar saat pengguna berada dalam sesi login
 * (atau dev mode), klik logo mengarahkan kembali ke dashboard peran aktif mereka (Anti-Keluar Mendadak),
 * dan hanya mengarahkan ke homepage ('/') saat pengguna adalah pengunjung umum (tamu / belum login).
 */
export function useDashboardHomeUrl(): {
  href: string;
  role: ActiveUiRole;
  roleLabel: string;
  isAuthenticated: boolean;
} {
  const { isAuthenticated, session, loading } = useAuth();
  const pathname = usePathname() || '';
  const [role, setRole] = useState<ActiveUiRole>('member');
  const [hasDevActive, setHasDevActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncRole() {
      // 1. Cek dari pathname jika sedang di dalam area dashboard khusus
      if (pathname.startsWith('/admin/dashboard')) {
        if (!cancelled) {
          setRole('master_admin');
          setHasDevActive(true);
        }
        return;
      }
      if (
        pathname.startsWith('/admin/administration') ||
        pathname.startsWith('/admin/seller-verification')
      ) {
        if (!cancelled) {
          setRole('admin');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname.startsWith('/admin/moderation')) {
        if (!cancelled) {
          setRole('moderator');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname.startsWith('/seller')) {
        if (!cancelled) {
          setRole('seller');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname.startsWith('/distributor')) {
        if (!cancelled) {
          setRole('distributor');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname.startsWith('/service-provider')) {
        if (!cancelled) {
          setRole('service-provider');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname.startsWith('/author')) {
        if (!cancelled) {
          setRole('author');
          setHasDevActive(true);
        }
        return;
      }
      if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
        if (!cancelled) {
          setRole('member');
          setHasDevActive(true);
        }
        return;
      }

      // 2. Cek localStorage (Dev Mode / Session Storage)
      if (typeof window !== 'undefined') {
        const hasDevMaster = window.localStorage.getItem('racik-dev-master') === 'true';
        const savedRole = window.localStorage.getItem('racik-dev-role');
        if (hasDevMaster) {
          if (!cancelled) {
            setRole('master_admin');
            setHasDevActive(true);
          }
          return;
        }
        if (savedRole) {
          if (!cancelled) {
            setRole(normalizeRole(savedRole));
            setHasDevActive(true);
          }
          return;
        }
        if (!cancelled) {
          setHasDevActive(false);
        }
      }

      // 3. Jika login dengan Supabase sesungguhnya
      if (session?.user?.id) {
        try {
          const [rolesRes, profileRes] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role_type, status')
              .eq('user_id', session.user.id)
              .eq('status', 'active'),
            supabase
              .from('individual_profiles')
              .select('user_role, is_admin')
              .eq('user_id', session.user.id)
              .maybeSingle(),
          ]);

          if (cancelled) return;

          const prof = profileRes.data as { user_role?: string; is_admin?: boolean } | null;
          if (prof?.is_admin) {
            setRole('master_admin');
            return;
          }

          const roleList = (rolesRes.data ?? []).map((r) => r.role_type);
          if (roleList.includes('master_admin') || roleList.includes('super_admin')) {
            setRole('master_admin');
            return;
          }
          if (roleList.includes('admin')) {
            setRole('admin');
            return;
          }
          if (roleList.includes('moderator')) {
            setRole('moderator');
            return;
          }
          if (roleList.includes('seller')) {
            setRole('seller');
            return;
          }
          if (roleList.includes('distributor')) {
            setRole('distributor');
            return;
          }
          if (roleList.includes('service_provider') || roleList.includes('expert')) {
            setRole('service-provider');
            return;
          }
          if (roleList.includes('author')) {
            setRole('author');
            return;
          }
          if (prof?.user_role) {
            setRole(normalizeRole(prof.user_role));
            return;
          }
        } catch {
          // Abaikan kendala jaringan
        }
      }

      if (!cancelled) setRole('member');
    }

    void syncRole();

    const handleStorage = () => {
      void syncRole();
    };

    window.addEventListener('racik-dev-role-change', handleStorage);
    window.addEventListener('storage', handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('racik-dev-role-change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [pathname, session?.user?.id]);

  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  const userLoggedIn =
    !loading && (isAuthenticated || (isDevBypass && hasDevActive) || !!session);

  const href = userLoggedIn ? (ROLE_DASHBOARD_ROUTES[role] ?? '/dashboard') : '/';
  const roleLabel = ROLE_DISPLAY_NAMES[role] ?? 'Member';

  return {
    href,
    role,
    roleLabel,
    isAuthenticated: userLoggedIn,
  };
}


