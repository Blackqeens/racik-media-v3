/**
 * governance.repository.ts — Governance Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class GovernanceRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findRecentDecisions(limit: number = 20) {
    const { data } = await this.supabase.admin.from('governance_decisions').select('*').order('created_at', { ascending: false }).limit(limit);
    return data ?? [];
  }
}
