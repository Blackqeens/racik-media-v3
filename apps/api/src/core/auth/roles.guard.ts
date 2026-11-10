/**
 * roles.guard.ts — Guard untuk cek role user
 *
 * Bekerja bersama decorator @Roles().
 * JwtAuthGuard harus dipasang lebih dulu agar req.user tersedia.
 *
 * Contoh:
 *   @Roles('moderator')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('tickets')
 *   getTickets() { ... }
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { ROLES_KEY } from './roles.decorator';
import { AuthUser } from './jwt.strategy';
import { SupabaseClientService } from '../database/supabase.client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly supabase: SupabaseClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Ambil daftar role yang diizinkan dari decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada @Roles() di endpoint ini, izinkan semua user yang sudah login
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user: AuthUser;
      method: string;
      originalUrl?: string;
      url?: string;
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        `Akses ditolak. Dibutuhkan role: ${requiredRoles.join(', ')}`,
      );
    }

    const { data, error } = await this.supabase.admin
      .from('user_roles')
      .select('role_type')
      .eq('user_id', user.userId)
      .eq('status', 'active');

    if (error) {
      throw new InternalServerErrorException('Gagal memverifikasi role pengguna.');
    }

    const roles = (data ?? []).map((item) => item.role_type);
    if (roles.some((role) => requiredRoles.includes(role))) return true;

    if (roles.includes('master_admin')) {
      const { error: auditError } = await this.supabase.admin
        .from('security_audit_logs')
        .insert({
          tenant_id: user.tenant_id,
          correlation_id: randomUUID(),
          actor_id: user.userId,
          action_type: 'role_override_used',
          metadata: {
            required_roles: requiredRoles,
            method: request.method,
            path: request.originalUrl ?? request.url ?? '',
          },
        });

      if (auditError) {
        throw new InternalServerErrorException('Gagal mencatat override Master Admin.');
      }

      return true;
    }

    throw new ForbiddenException(
      `Akses ditolak. Dibutuhkan role: ${requiredRoles.join(', ')}`,
    );
  }
}
