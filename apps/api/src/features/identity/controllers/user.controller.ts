import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService, UpdateProfileDto } from '../services/user.service';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // Semua endpoint di bawah mewajibkan user login
export class UserController {
  private supabase;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  /**
   * GET /api/v1/users/me
   * Mengambil data profil akun saya (digunakan profile/page.tsx)
   */
  @Get('me')
  async getMyProfile(@Req() req: any) {
    const userId = req.user.userId;
    const profile = await this.userService.getProfileById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Berhasil memuat profil pengguna',
      data: profile,
    };
  }

  /**
   * PATCH /api/v1/users/me — alias untuk update profil (digunakan profile/page.tsx)
   * PATCH /api/v1/users/me/profile — endpoint asli (backward compat)
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;
    const updated = await this.userService.updateProfile(userId, dto);
    return { statusCode: HttpStatus.OK, message: 'Profil berhasil diperbarui', data: updated };
  }

  @Patch('me/profile')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;
    const updated = await this.userService.updateProfile(userId, dto);
    return { statusCode: HttpStatus.OK, message: 'Profil berhasil diperbarui', data: updated };
  }

  /**
   * GET /api/v1/users/me/roles
   * Mengambil list hak akses & role user yang aktif
   */
  @Get('me/roles')
  async getMyRoles(@Req() req: any) {
    const userId = req.user.userId;
    const roles = await this.userService.getUserRoles(userId);
    return { statusCode: HttpStatus.OK, data: { userId, roles } };
  }

  /**
   * GET /api/v1/users/me/orders
   * Pesanan terbaru user — untuk dashboard stats
   */
  @Get('me/orders')
  async getMyOrders(@Req() req: any, @Query() pagination: PaginationDto) {
    const userId = req.user.userId;
    const page  = pagination?.page  ? Number(pagination.page)  : 1;
    const limit = pagination?.limit ? Number(pagination.limit) : 5;
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase
      .from('orders')
      .select('id, status, gross_amount, created_at', { count: 'exact' })
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return ApiResponse.paginated([], 0, page, limit);
    }

    return {
      statusCode: HttpStatus.OK,
      data: { items: data || [], total: count || 0 },
    };
  }

  /**
   * GET /api/v1/users/me/reputation
   * Skor reputasi user — untuk dashboard stats
   */
  @Get('me/reputation')
  async getMyReputation(@Req() req: any) {
    const userId = req.user.userId;
    const { data } = await this.supabase
      .from('core_reputations')
      .select('master_score, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      statusCode: HttpStatus.OK,
      data: { master_score: data?.master_score ?? 100 },
    };
  }

  /**
   * GET /api/v1/users/me/content
   * Jumlah konten yang dibuat user — untuk dashboard stats
   */
  @Get('me/content')
  async getMyContent(@Req() req: any, @Query() pagination: PaginationDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const limit = pagination?.limit ? Number(pagination.limit) : 1;

    const query = this.supabase
      .from('content_items')
      .select('id, title, status, content_type, created_at, updated_at', { count: 'exact' })
      .eq('author_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    const { data, count, error } = await query;

    return {
      statusCode: HttpStatus.OK,
      data: {
        total: error ? 0 : (count || 0),
        items: error ? [] : (data || []),
      },
    };
  }
}
