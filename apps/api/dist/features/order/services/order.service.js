"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let OrderService = class OrderService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async createOrder(buyerId, tenantId, dto) {
        const { data, error } = await this.supabase.admin
            .from('orders')
            .insert({ buyer_id: buyerId, seller_id: dto.seller_id, tenant_id: tenantId, order_type: dto.order_type, gross_amount: dto.gross_amount, currency: 'IDR', notes: dto.notes, status: 'pending_payment' })
            .select().single();
        if (error)
            throw new Error(error.message);
        if (dto.items?.length) {
            await this.supabase.admin.from('order_items').insert(dto.items.map(item => ({ order_id: data.id, tenant_id: tenantId, entity_type: item.entity_type, entity_id: item.entity_id, quantity: item.quantity, unit_price: item.unit_price, subtotal: item.quantity * item.unit_price })));
        }
        await this.eventBus.publish({ event_name: 'order.created', tenant_id: tenantId, schema_version: 1, payload: { orderId: data.id, buyerId, sellerId: dto.seller_id, orderType: dto.order_type } });
        return data;
    }
    async getOrdersByBuyer(buyerId, pagination) {
        const { data, count, error } = await this.supabase.admin
            .from('orders')
            .select('id, order_type, status, gross_amount, currency, created_at', { count: 'exact' })
            .eq('buyer_id', buyerId)
            .order('created_at', { ascending: false })
            .range(pagination.offset, pagination.offset + pagination.limit - 1);
        if (error)
            throw new Error(error.message);
        return { data: data ?? [], total: count ?? 0 };
    }
    async getOrderById(id, userId) {
        const { data, error } = await this.supabase.admin.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Order not found');
        if (data.buyer_id !== userId && data.seller_id !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return data;
    }
    async buyerConfirm(orderId, buyerId, tenantId) {
        const order = await this.getOrderById(orderId, buyerId);
        if (order.buyer_id !== buyerId)
            throw new common_1.ForbiddenException('Not your order');
        await this.supabase.admin.from('orders').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', orderId);
        await this.eventBus.publish({ event_name: 'order.buyer_confirmed', tenant_id: tenantId, schema_version: 1, payload: { orderId, buyerId, confirmedAt: new Date().toISOString() } });
    }
    async updateStatus(orderId, status, tenantId) {
        await this.supabase.admin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
        const { data: order } = await this.supabase.admin
            .from('orders')
            .select('buyer_id')
            .eq('id', orderId)
            .maybeSingle();
        const buyerId = order?.buyer_id ?? '';
        if (status === 'completed') {
            await this.eventBus.publish({
                event_name: 'order.completed',
                tenant_id: tenantId,
                schema_version: 1,
                payload: { orderId, buyerId, completedAt: new Date().toISOString() },
            });
        }
        else if (status === 'cancelled') {
            await this.eventBus.publish({
                event_name: 'order.cancelled',
                tenant_id: tenantId,
                schema_version: 1,
                payload: { orderId, buyerId, reasonCode: 'SYSTEM_CANCEL' },
            });
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], OrderService);
//# sourceMappingURL=order.service.js.map