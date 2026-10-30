/**
 * order.service.ts — Order Domain Service
 * Handles order creation, status transitions, publishes order domain events.
 * Ref: escrow-lifecycle.md, event-map.md, coding-standards.md §D
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async createOrder(buyerId: string, tenantId: string, dto: CreateOrderDto) {
    const { data, error } = await this.supabase.admin
      .from('orders')
      .insert({ buyer_id: buyerId, seller_id: dto.seller_id, tenant_id: tenantId, order_type: dto.order_type, gross_amount: dto.gross_amount, currency: 'IDR', notes: dto.notes, status: 'pending_payment' })
      .select().single();
    if (error) throw new Error(error.message);

    if (dto.items?.length) {
      await this.supabase.admin.from('order_items').insert(
        dto.items.map(item => ({ order_id: data.id, tenant_id: tenantId, entity_type: item.entity_type, entity_id: item.entity_id, quantity: item.quantity, unit_price: item.unit_price, subtotal: item.quantity * item.unit_price }))
      );
    }

    await this.eventBus.publish({ event_name: 'order.created', tenant_id: tenantId, schema_version: 1, payload: { orderId: data.id, buyerId, sellerId: dto.seller_id, orderType: dto.order_type } });
    return data;
  }

  async getOrdersByBuyer(buyerId: string, pagination: PaginationDto) {
    const { data, count, error } = await this.supabase.admin
      .from('orders')
      .select('id, order_type, status, gross_amount, currency, created_at', { count: 'exact' })
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);
    if (error) throw new Error(error.message);
    return { data: data ?? [], total: count ?? 0 };
  }

  async getOrderById(id: string, userId: string) {
    const { data, error } = await this.supabase.admin.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
    if (error || !data) throw new NotFoundException('Order not found');
    if (data.buyer_id !== userId && data.seller_id !== userId) throw new ForbiddenException('Access denied');
    return data;
  }

  async buyerConfirm(orderId: string, buyerId: string, tenantId: string): Promise<void> {
    const order = await this.getOrderById(orderId, buyerId);
    if (order.buyer_id !== buyerId) throw new ForbiddenException('Not your order');
    await this.supabase.admin.from('orders').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', orderId);
    await this.eventBus.publish({ event_name: 'order.buyer_confirmed', tenant_id: tenantId, schema_version: 1, payload: { orderId, buyerId, confirmedAt: new Date().toISOString() } });
  }

  async updateStatus(orderId: string, status: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);

    // Fetch buyerId so consumers can dispatch notification to the right user
    const { data: order } = await this.supabase.admin
      .from('orders')
      .select('buyer_id')
      .eq('id', orderId)
      .maybeSingle();
    const buyerId: string = order?.buyer_id ?? '';

    if (status === 'completed') {
      await this.eventBus.publish({
        event_name: 'order.completed',
        tenant_id: tenantId,
        schema_version: 1,
        payload: { orderId, buyerId, completedAt: new Date().toISOString() },
      });
    } else if (status === 'cancelled') {
      await this.eventBus.publish({
        event_name: 'order.cancelled',
        tenant_id: tenantId,
        schema_version: 1,
        payload: { orderId, buyerId, reasonCode: 'SYSTEM_CANCEL' },
      });
    }
  }
}
