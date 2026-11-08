import { createBrowserClient } from '@supabase/ssr';

/**
 * supabase.ts — Supabase browser client singleton.
 * Ref: security-architecture.md, data-ownership.md
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
