'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@/types/user.types';

/**
 * providers.tsx — Client-side provider tree.
 *
 * Menyediakan:
 *   1. TanStack Query  — data fetching & caching
 *   2. AuthContext     — session Supabase + user object global
 *
 * Cara pakai di komponen:
 *   const { user, session, loading } = useAuthContext();
 *
 * Ref: security-architecture.md, user-lifecycle.md, coding-standards.md
 */

// ─── TanStack Query client ───────────────────────────────────────────────────
// Dibuat di dalam fungsi agar tidak di-share antar request (SSR safety)
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data dianggap fresh selama 30 detik
        staleTime: 30 * 1000,
        // Tidak retry otomatis saat 401/403
        retry: (failureCount, error: unknown) => {
          const status = (error as { status?: number })?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

// Singleton query client di sisi browser (bukan SSR)
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: selalu buat baru agar tidak bocor antar request
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Paksa refresh session (misal: setelah update profil) */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  refresh: async () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback((s: Session | null) => {
    setSession(s);
    setUser(
      s?.user
        ? {
            id: s.user.id,
            email: s.user.email ?? '',
            // Metadata tambahan dari JWT custom claims (diisi setelah fetch profil)
          }
        : null,
    );
  }, []);

  const refresh = useCallback(async () => {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase.auth.getSession();
    syncSession(data.session);
  }, [syncSession]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('@/lib/supabase').then(({ supabase }) => {
      // Ambil session awal
      supabase.auth.getSession().then(({ data }) => {
        syncSession(data.session);
        setLoading(false);
      });

      // Subscribe perubahan auth state (login, logout, token refresh)
      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        syncSession(newSession);
      });

      unsubscribe = () => listener.subscription.unsubscribe();
    });

    return () => unsubscribe?.();
  }, [syncSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!session,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Root Providers ───────────────────────────────────────────────────────────
/**
 * Providers — wrapper utama yang dibungkus di root layout.
 *
 * Penggunaan di layout.tsx:
 *   <Providers>{children}</Providers>
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
