/**
 * moderation.repository.ts — Moderation Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class ModerationRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findTicketById(id: string) {
    const { data } = await this.supabase.admin.from('moderation_tickets').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async findOpenTicketByEntity(entityId: string) {
    const { data } = await this.supabase.admin.from('moderation_tickets').select('*').eq('entity_id', entityId).in('status', ['pending', 'assigned']).maybeSingle();
    return data;
  }
}
