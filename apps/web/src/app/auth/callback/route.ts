import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';

/**
 * GET /auth/callback
 * Route handler untuk menukar OAuth code dari Google/Facebook (PKCE flow Supabase SSR)
 * menjadi session aktif di cookies, lalu mengarahkan pengguna ke dashboard sesuai role.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const response = NextResponse.redirect(`${origin}${next || '/dashboard'}`);

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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Jika tidak ada parameter ?next spesifik, arahkan ke dashboard sesuai role user
      if (!next) {
        const [{ data: userRoles }, { data: profile }] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role_type')
            .eq('user_id', data.user.id)
            .eq('status', 'active'),
          supabase
            .from('individual_profiles')
            .select('user_role, is_admin')
            .eq('user_id', data.user.id)
            .maybeSingle(),
        ]);

        const roles = new Set<string>(
          (userRoles ?? []).map((r) => r.role_type).filter(Boolean),
        );
        const prof = profile as { user_role?: string; is_admin?: boolean } | null;
        if (prof?.is_admin) roles.add('master_admin');
        if (prof?.user_role) roles.add(prof.user_role);

        let targetPath = '/dashboard';
        if (roles.has('master_admin') || roles.has('admin')) {
          targetPath = '/admin/dashboard';
        } else if (roles.has('moderator')) {
          targetPath = '/admin/moderation';
        } else if (roles.has('seller')) {
          targetPath = '/seller/dashboard';
        } else if (roles.has('service_provider') || roles.has('expert')) {
          targetPath = '/service-provider/dashboard';
        } else if (roles.has('distributor')) {
          targetPath = '/distributor/dashboard';
        }

        const roleRedirect = NextResponse.redirect(`${origin}${targetPath}`);
        response.cookies.getAll().forEach((cookie) => {
          roleRedirect.cookies.set(cookie);
        });
        return roleRedirect;
      }

      return response;
    }
  }

  // Jika gagal tukar code, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}

