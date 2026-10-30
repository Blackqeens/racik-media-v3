import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
}

@Injectable()
export class UserService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;

    // Menggunakan service role key untuk operasi database internal
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Mengambil profil lengkap user berdasarkan ID dari JWT
   * Response shape: { id, status, kyc_tier, individual_profiles: {...} }
   * sesuai dengan yang diharapkan ProfilePage frontend
   */
  async getProfileById(userId: string) {
    // 1. Ambil data user dari tabel users (status, kyc_tier, dll)
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, status, kyc_tier, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      throw new InternalServerErrorException(`Gagal mengambil data user: ${userError.message}`);
    }

    // 2. Ambil data individual_profiles
    const { data: profile, error: profileError } = await this.supabase
      .from('individual_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(`Gagal mengambil profil: ${profileError.message}`);
    }

    // 3. Jika profil belum ada, buat default record
    let resolvedProfile = profile;
    if (!resolvedProfile) {
      const { data: newProfile, error: insertError } = await this.supabase
        .from('individual_profiles')
        .insert([
          {
            user_id: userId,
            full_name: 'Pengguna Racik Media',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new InternalServerErrorException(`Gagal inisialisasi profil: ${insertError.message}`);
      }
      resolvedProfile = newProfile;
    }

    // 4. Return shape yang cocok dengan ProfileData interface di frontend
    return {
      id: user?.id ?? userId,
      status: user?.status ?? 'active',
      kyc_tier: user?.kyc_tier ?? 'basic',
      created_at: user?.created_at,
      individual_profiles: resolvedProfile,
    };
  }

  /**
   * Update data profil pengguna
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const fullName = dto.fullName ?? (dto as any).full_name;
    const phone = dto.phone ?? (dto as any).phone;
    const avatarUrl = dto.avatarUrl ?? (dto as any).avatar_url;
    const bio = dto.bio ?? (dto as any).bio;
    const city = dto.city ?? (dto as any).city;
    const province = (dto as any).province;

    if (fullName !== undefined) updatePayload.full_name = fullName;
    if (phone !== undefined) updatePayload.phone = phone;
    if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;
    if (bio !== undefined) updatePayload.bio = bio;
    if (city !== undefined) updatePayload.city = city;
    if (province !== undefined) updatePayload.province = province;

    const { data: updated, error } = await this.supabase
      .from('individual_profiles')
      .update(updatePayload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Gagal memperbarui profil: ${error.message}`);
    }

    // Return shape konsisten dengan getProfileById
    return {
      id: userId,
      status: 'active',
      kyc_tier: 'basic',
      individual_profiles: updated,
    };
  }

  /**
   * Mengambil role aktif pengguna
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const { data: profile, error } = await this.supabase
      .from('individual_profiles')
      .select('user_role, kyc_tier, is_verified')
      .eq('user_id', userId)
      .maybeSingle();
    // Default semua akun minimal memiliki hak dasar sebagai 'buyer'
    const roleList = ['buyer'];
    if (error || !profile) {
      return roleList;
    }
    // Identifikasi peran mitra: Seller produk atau Expert jasa
    if (profile.user_role === 'expert') {
      roleList.push('expert');
    } else if (profile.user_role === 'seller') {
      roleList.push('seller');
    } else if (profile.user_role === 'admin') {
      roleList.push('admin');
    }
    return roleList;
  }
}
