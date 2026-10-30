'use client';

import { useAuthContext } from '@/app/providers';

/**
 * useAuth — thin wrapper atas AuthContext.
 *
 * Tidak duplikat fetch — cukup membaca dari AuthContext yang sudah
 * diinisialisasi oleh Providers di root layout.
 *
 * Ref: security-architecture.md, user-lifecycle.md
 */
export function useAuth() {
  return useAuthContext();
}
