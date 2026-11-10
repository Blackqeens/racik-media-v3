/**
 * roles.decorator.ts — Decorator @Roles() untuk otorisasi berbasis peran
 *
 * Digunakan bersama RolesGuard untuk membatasi akses endpoint berdasarkan role.
 *
 * Contoh:
 *   @Roles('admin', 'moderator')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Delete('user/:id')
 *   deleteUser() { ... }
 *
 * Daftar role valid sesuai user-lifecycle.md dan ADR-001 D2:
 *   member, seller, distributor, service_provider, moderator, admin, master_admin
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator untuk menandai endpoint butuh role tertentu.
 * Bisa pakai satu atau lebih role: @Roles('admin', 'moderator')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
