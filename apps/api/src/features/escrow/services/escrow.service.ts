/**
 * escrow.service.ts — Escrow Fund Isolation Service
 * Handles escrow contract lifecycle per order. No-Wallet Architecture.
 * Ref: escrow-lifecycle.md §1, event-map.md
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class EscrowService {
  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async createContract(orderId: string, buyerId: string, sellerId: string, amount: number, channelType: string, tenantId: string) {
    const { data, error } = await this.supabase.admin
      .from('escrow_contracts')
      .insert({ order_id: orderId, buyer_id: buyerId, seller_id: sellerId, amount_total: amount, channel_type: channelType, status: 'payment_detected', tenant_id: tenantId })
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async lockFunds(escrowContractId: string, orderId: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('escrow_contracts').update({ status: 'locked', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
    await this.writeEscrowEvent(escrowContractId, tenantId, 'funds_locked', null);
    await this.eventBus.publish({ event_name: 'order.escrow_locked', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, lockedAt: new Date().toISOString() } });
  }

  async releaseToVendor(escrowContractId: string, orderId: string, tenantId: string): Promise<void> {
    const contract = await this.getByOrderId(orderId);
    await this.supabase.admin.from('escrow_contracts').update({ status: 'released', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
    await this.writeEscrowEvent(escrowContractId, tenantId, 'auto_release_triggered', null);
    await this.eventBus.publish({ event_name: 'escrow.milestone_released', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, trancheId: escrowContractId, vendorId: contract.seller_id, amount: contract.amount_total } });
  }

  async disputeContract(escrowContractId: string, orderId: string, reasonCode: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('escrow_contracts').update({ status: 'disputed', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
    await this.writeEscrowEvent(escrowContractId, tenantId, 'dispute_frozen', null);
    await this.eventBus.publish({ event_name: 'escrow.disputed', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, disputeId: escrowContractId, reasonCode } });
  }

  async refundBuyer(escrowContractId: string, orderId: string, reasonCode: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('escrow_contracts').update({ status: 'refunded', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
    await this.writeEscrowEvent(escrowContractId, tenantId, 'refund_executed', null);
    await this.eventBus.publish({ event_name: 'escrow.refund_executed', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, refundId: escrowContractId, amount: 0, reasonCode } });
  }

  async getByOrderId(orderId: string) {
    const { data, error } = await this.supabase.admin.from('escrow_contracts').select('*').eq('order_id', orderId).maybeSingle();
    if (error || !data) throw new NotFoundException('Escrow contract not found');
    return data;
  }

  private async writeEscrowEvent(escrowContractId: string, tenantId: string, eventType: string, actorId: string | null): Promise<void> {
    await this.supabase.admin.from('escrow_events').insert({ escrow_contract_id: escrowContractId, tenant_id: tenantId, event_type: eventType, actor_id: actorId });
  }
}
