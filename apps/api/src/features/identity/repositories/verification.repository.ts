/**
 * verification.repository.ts — Identity Verification Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class VerificationRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(verificationId: string) {
    const { data } = await this.supabase.admin
      .from('verifications')
      .select('*')
      .eq('id', verificationId)
      .maybeSingle();
    return data;
  }

  async findPendingByUser(userId: string) {
    const { data } = await this.supabase.admin
      .from('verifications')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'under_review'])
      .order('created_at', { ascending: false });
    return data ?? [];
  }
}
