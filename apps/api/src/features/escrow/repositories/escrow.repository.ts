/**
 * escrow.repository.ts — Escrow Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class EscrowRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(id: string) {
    const { data } = await this.supabase.admin.from('escrow_contracts').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async findByOrderId(orderId: string) {
    const { data } = await this.supabase.admin.from('escrow_contracts').select('*').eq('order_id', orderId).maybeSingle();
    return data;
  }
}
