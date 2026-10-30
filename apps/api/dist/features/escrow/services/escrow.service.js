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
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let EscrowService = class EscrowService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async createContract(orderId, buyerId, sellerId, amount, channelType, tenantId) {
        const { data, error } = await this.supabase.admin
            .from('escrow_contracts')
            .insert({ order_id: orderId, buyer_id: buyerId, seller_id: sellerId, amount_total: amount, channel_type: channelType, status: 'payment_detected', tenant_id: tenantId })
            .select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async lockFunds(escrowContractId, orderId, tenantId) {
        await this.supabase.admin.from('escrow_contracts').update({ status: 'locked', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
        await this.writeEscrowEvent(escrowContractId, tenantId, 'funds_locked', null);
        await this.eventBus.publish({ event_name: 'order.escrow_locked', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, lockedAt: new Date().toISOString() } });
    }
    async releaseToVendor(escrowContractId, orderId, tenantId) {
        const contract = await this.getByOrderId(orderId);
        await this.supabase.admin.from('escrow_contracts').update({ status: 'released', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
        await this.writeEscrowEvent(escrowContractId, tenantId, 'auto_release_triggered', null);
        await this.eventBus.publish({ event_name: 'escrow.milestone_released', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, trancheId: escrowContractId, vendorId: contract.seller_id, amount: contract.amount_total } });
    }
    async disputeContract(escrowContractId, orderId, reasonCode, tenantId) {
        await this.supabase.admin.from('escrow_contracts').update({ status: 'disputed', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
        await this.writeEscrowEvent(escrowContractId, tenantId, 'dispute_frozen', null);
        await this.eventBus.publish({ event_name: 'escrow.disputed', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, disputeId: escrowContractId, reasonCode } });
    }
    async refundBuyer(escrowContractId, orderId, reasonCode, tenantId) {
        await this.supabase.admin.from('escrow_contracts').update({ status: 'refunded', updated_at: new Date().toISOString() }).eq('id', escrowContractId);
        await this.writeEscrowEvent(escrowContractId, tenantId, 'refund_executed', null);
        await this.eventBus.publish({ event_name: 'escrow.refund_executed', tenant_id: tenantId, schema_version: 1, payload: { escrowContractId, orderId, refundId: escrowContractId, amount: 0, reasonCode } });
    }
    async getByOrderId(orderId) {
        const { data, error } = await this.supabase.admin.from('escrow_contracts').select('*').eq('order_id', orderId).maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Escrow contract not found');
        return data;
    }
    async writeEscrowEvent(escrowContractId, tenantId, eventType, actorId) {
        await this.supabase.admin.from('escrow_events').insert({ escrow_contract_id: escrowContractId, tenant_id: tenantId, event_type: eventType, actor_id: actorId });
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map