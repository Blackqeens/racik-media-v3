import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';

/**
 * middleware.ts — Route protection via Supabase SSR session.
 *
 * Aturan akses (sesuai permission-matrix.md):
 *   /dashboard/*        → wajib login (semua role)
 *   /seller/*           → wajib login + role seller/vendor aktif
 *   /admin/*            → wajib login + role admin/moderator aktif
 *   /login, /register   → redirect ke /dashboard jika sudah login
 *
 * Ref: security-architecture.md, permission-matrix.md, user-lifecycle.md
 */

// Route yang memerlukan autentikasi (paling tidak harus login)
const AUTH_REQUIRED = ['/dashboard', '/profile', '/bookmarks', '/orders', '/checkout'];

// Route yang memerlukan role seller atau vendor
const SELLER_ROUTES = ['/seller/dashboard', '/seller/products', '/seller/orders', '/seller/reports'];

// Route yang memerlukan role admin atau moderator
const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/moderation',
  '/admin/seller-verification',
  '/admin/financial-report',
];

// Route yang hanya bisa diakses kalau BELUM login (redirect ke dashboard jika sudah login)
const GUEST_ONLY = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Buat response mutable agar Supabase SSR bisa refresh cookies
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Buat server-side Supabase client (baca session dari cookie)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Ambil session — ini juga auto-refresh token expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;

  // ── 1. Guest-only pages: redirect ke /dashboard jika sudah login ──────────
  if (GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // ── 2. Route yang butuh login ─────────────────────────────────────────────
  const needsAuth =
    AUTH_REQUIRED.some((p) => pathname.startsWith(p)) ||
    SELLER_ROUTES.some((p) => pathname.startsWith(p)) ||
    ADMIN_ROUTES.some((p) => pathname.startsWith(p));

  if (needsAuth && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // simpan tujuan asal
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Role check untuk seller routes ────────────────────────────────────
  if (isLoggedIn && SELLER_ROUTES.some((p) => pathname.startsWith(p))) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type, status')
      .eq('user_id', session.user.id)
      .in('role_type', ['seller', 'vendor'])
      .eq('status', 'active');

    if (!roles || roles.length === 0) {
      // Arahkan ke halaman pendaftaran seller jika belum punya role
      return NextResponse.redirect(new URL('/seller/register', request.url));
    }
  }

  // ── 4. Role check untuk admin/moderator routes ────────────────────────────
  if (isLoggedIn && ADMIN_ROUTES.some((p) => pathname.startsWith(p))) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type, status')
      .eq('user_id', session.user.id)
      .in('role_type', ['admin', 'master_admin', 'moderator'])
      .eq('status', 'active');

    if (!roles || roles.length === 0) {
      // Tidak punya akses — redirect ke dashboard biasa
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

/**
 * Matcher — middleware hanya jalan di path ini, bukan di asset/_next/api internal.
 * Pola ini exclude: _next/static, _next/image, favicon.ico, file di public/
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
