/**
 * content.repository.ts — Content Repository raw queries
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class ContentRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(id: string) {
    const { data } = await this.supabase.admin.from('content_items').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.supabase.admin.from('content_items').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  }
}
