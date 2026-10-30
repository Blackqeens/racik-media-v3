/**
 * membership.repository.ts — Data access layer untuk Membership
 * Ref: coding-standards.md §E (Fat Service, Skinny Repo)
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class MembershipRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findByUserId(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('user_roles')
      .select('id, role_type, status, granted_at, expires_at')
      .eq('user_id', userId)
      .eq('role_type', 'member')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async upsertPlan(userId: string, tenantId: string, planId: string) {
    const { data, error } = await this.supabase.admin
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          tenant_id: tenantId,
          role_type: 'member',
          status: 'active',
          granted_at: new Date().toISOString(),
          metadata: { plan_id: planId },
        },
        { onConflict: 'user_id,role_type' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
