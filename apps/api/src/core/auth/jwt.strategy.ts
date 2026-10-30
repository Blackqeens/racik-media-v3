/**
 * jwt.strategy.ts — Passport JWT Strategy
 *
 * Ekstrak dan validasi JWT payload dari header Authorization.
 * Payload yang valid dimasukkan ke req.user untuk digunakan controller.
 *
 * Struktur payload JWT (dari Supabase Auth):
 *   sub        → user_id (UUID)
 *   email      → email user
 *   tenant_id  → custom claim dari Supabase (wajib ada)
 *   role       → user role (dari custom claims)
 *   aud        → 'authenticated'
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;         // user_id
  email: string;
  tenant_id: string;
  role: string;
  aud: string;
  iat: number;
  exp: number;
}

/** Data user yang tersedia di req.user setelah auth */
export interface AuthUser {
  userId: string;
  user_id: string;
  id: string;
  email: string;
  tenant_id: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Ambil token dari header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Gunakan JWT secret dari Supabase (bukan secret internal)
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
    });
  }

  validate(payload: any): AuthUser {
    // Default tenant Racik Media untuk Phase 1 (single-tenant)
    const defaultTenantId = '00000000-0000-0000-0000-000000000001';
    const tenantId =
      payload.tenant_id ||
      payload.app_metadata?.tenant_id ||
      payload.user_metadata?.tenant_id ||
      defaultTenantId;

    const role =
      payload.role ||
      payload.app_metadata?.role ||
      payload.user_metadata?.role ||
      'member';

    return {
      userId: payload.sub,
      user_id: payload.sub,
      id: payload.sub,
      email: payload.email,
      tenant_id: tenantId,
      role,
    };
  }
}
