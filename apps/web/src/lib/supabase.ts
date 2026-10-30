import { createBrowserClient } from '@supabase/ssr';

/**
 * supabase.ts — Supabase browser client singleton.
 * Ref: security-architecture.md, data-ownership.md
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
