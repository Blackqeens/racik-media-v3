/**
 * order.repository.ts — Order Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class OrderRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(id: string) {
    const { data } = await this.supabase.admin.from('orders').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.supabase.admin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  }
}
