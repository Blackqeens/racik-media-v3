/**
 * user.repository.ts — Identity User Repository
 * Raw DB queries for users and profiles. Used by UserService.
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class UserRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(userId: string) {
    const { data } = await this.supabase.admin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }

  async findByEmail(email: string) {
    const { data } = await this.supabase.admin
      .from('users')
      .select('id, email, status, kyc_tier')
      .eq('email', email)
      .maybeSingle();
    return data;
  }

  async updateStatus(userId: string, status: string): Promise<void> {
    await this.supabase.admin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);
  }
}
