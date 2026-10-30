/**
 * roles.guard.ts — Guard untuk cek role user
 *
 * Bekerja bersama decorator @Roles().
 * JwtAuthGuard harus dipasang lebih dulu agar req.user tersedia.
 *
 * Contoh:
 *   @Roles('moderator', 'admin')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('tickets')
 *   getTickets() { ... }
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthUser } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil daftar role yang diizinkan dari decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada @Roles() di endpoint ini, izinkan semua user yang sudah login
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Akses ditolak. Dibutuhkan role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
