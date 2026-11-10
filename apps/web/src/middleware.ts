import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';

/**
 * middleware.ts — Route protection & Anti-Crack Guard via Supabase SSR.
 *
 * Aturan akses (sesuai permission-matrix.md):
 *   /dashboard/*        → wajib login (semua role)
 *   /author/*           → wajib login + role author / master_admin
 *   /seller/*           → wajib login + role seller / master_admin (kecuali /seller/register)
 *   /distributor/*      → wajib login + role distributor / master_admin
 *   /service-provider/* → wajib login + role service_provider / expert / master_admin
 *   /admin/moderation/* → wajib login + role moderator / admin / master_admin
 *   /admin/* lainnya    → wajib login + role admin / master_admin
 *   /login, /register   → redirect ke /dashboard jika sudah login
 */

const AUTH_REQUIRED = [
  '/dashboard',
  '/profile',
  '/bookmarks',
  '/orders',
  '/checkout',
  '/articles/write',
  '/author',
  '/distributor',
  '/service-provider',
];

const AUTHOR_ROUTES = ['/author'];
const SELLER_ROUTES = ['/seller/dashboard', '/seller/products', '/seller/orders', '/seller/reports'];
const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/seller-verification',
  '/admin/financial-report',
];
const MODERATION_ROUTES = ['/admin/moderation'];
const DISTRIBUTOR_ROUTES = ['/distributor'];
const SERVICE_PROVIDER_ROUTES = ['/service-provider'];

const GUEST_ONLY = ['/login', '/register', '/forgot-password'];

function normalizeDbRole(role: string | null | undefined): string | null {
  if (!role) return null;
  if (role === 'expert' || role === 'service-provider') return 'service_provider';
  if (role === 'super_admin') return 'master_admin';
  if (role === 'buyer' || role === 'user') return 'member';
  return role;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authDisabledForDevelopment =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  if (authDisabledForDevelopment) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
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

  // Gunakan getUser() (bukan getSession()) untuk memverifikasi keaslian token JWT ke server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  // 1. Guest-only pages: redirect ke /dashboard jika sudah login
  if (GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // 2. Route yang butuh login
  const isProtectedSellerRoute =
    SELLER_ROUTES.some((p) => pathname.startsWith(p)) ||
    (pathname.startsWith('/seller') && !pathname.startsWith('/seller/register'));
  const isProtectedAdminRoute =
    ADMIN_ROUTES.some((p) => pathname.startsWith(p)) ||
    (pathname.startsWith('/admin') && !MODERATION_ROUTES.some((p) => pathname.startsWith(p)));
  const isProtectedModerationRoute = MODERATION_ROUTES.some((p) => pathname.startsWith(p));
  const isProtectedDistributorRoute = DISTRIBUTOR_ROUTES.some((p) => pathname.startsWith(p));
  const isProtectedServiceProviderRoute = SERVICE_PROVIDER_ROUTES.some((p) =>
    pathname.startsWith(p),
  );
  const isProtectedAuthorRoute = AUTHOR_ROUTES.some((p) => pathname.startsWith(p));

  const needsAuth =
    AUTH_REQUIRED.some((p) => pathname.startsWith(p)) ||
    isProtectedSellerRoute ||
    isProtectedAdminRoute ||
    isProtectedModerationRoute ||
    isProtectedDistributorRoute ||
    isProtectedServiceProviderRoute ||
    isProtectedAuthorRoute;

  if (needsAuth && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ambil role terverifikasi dari user_roles + individual_profiles jika mengakses rute khusus role
  const needsRoleVerification =
    isLoggedIn &&
    (isProtectedSellerRoute ||
      isProtectedAdminRoute ||
      isProtectedModerationRoute ||
      isProtectedDistributorRoute ||
      isProtectedServiceProviderRoute ||
      isProtectedAuthorRoute);

  if (needsRoleVerification && user) {
    const [rolesRes, profileRes] = await Promise.all([
      supabase
        .from('user_roles')
        .select('role_type, status')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      supabase
        .from('individual_profiles')
        .select('user_role, is_admin')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    const verifiedRoles = new Set<string>(['member']);
    for (const item of rolesRes.data ?? []) {
      const normalized = normalizeDbRole(item.role_type);
      if (normalized) verifiedRoles.add(normalized);
    }
    const prof = profileRes.data as { user_role?: string; is_admin?: boolean } | null;
    if (prof?.is_admin) verifiedRoles.add('master_admin');
    const profRole = normalizeDbRole(prof?.user_role);
    if (profRole) verifiedRoles.add(profRole);

    const hasAnyRole = (allowed: string[]) => allowed.some((r) => verifiedRoles.has(r));

    if (isProtectedSellerRoute && !hasAnyRole(['seller', 'master_admin'])) {
      return NextResponse.redirect(new URL('/seller/register', request.url));
    }

    if (isProtectedDistributorRoute && !hasAnyRole(['distributor', 'master_admin'])) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isProtectedServiceProviderRoute && !hasAnyRole(['service_provider', 'master_admin'])) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isProtectedAuthorRoute && !hasAnyRole(['author', 'master_admin'])) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isProtectedAdminRoute && !hasAnyRole(['admin', 'master_admin'])) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isProtectedModerationRoute && !hasAnyRole(['moderator', 'admin', 'master_admin'])) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
