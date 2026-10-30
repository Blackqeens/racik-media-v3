/**
 * security.repository.ts — Security Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class SecurityRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findOpenIncidentsByUser(userId: string) {
    const { data } = await this.supabase.admin.from('security_incidents').select('*').eq('user_id', userId).in('incident_status', ['open', 'investigating']);
    return data ?? [];
  }
}
