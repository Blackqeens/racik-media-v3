/**
 * jwt.guard.ts — JWT Authentication Guard
 *
 * Memvalidasi JWT token dari header Authorization: Bearer <token>
 * Token bisa berasal dari Supabase Auth atau JWT internal NestJS.
 *
 * Cara pakai di controller:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Request() req) { return req.user; }
 *
 * Ref: security-architecture.md §JWT, ADR-001 D2 (Single Account Policy)
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Cek apakah endpoint ini ditandai @Public() — skip auth jika iya
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      this.logger.warn('Akses ditolak: token JWT tidak valid atau tidak ada');
      throw err || new UnauthorizedException('Token tidak valid');
    }
    return user;
  }
}
