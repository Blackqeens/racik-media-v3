/**
 * public.decorator.ts — Decorator @Public() untuk endpoint tanpa auth
 *
 * Endpoint yang ditandai @Public() akan di-skip oleh JwtAuthGuard.
 *
 * Contoh:
 *   @Public()
 *   @Post('auth/register')
 *   register(@Body() dto: RegisterDto) { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Tandai endpoint sebagai publik — tidak butuh JWT token */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
