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
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let TicketService = class TicketService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async createTicket(entityType, entityId, queueType, severity, tenantId) {
        const slaHours = { knowledge_queue: 48, catalog_queue: 24, service_queue: 24, identity_queue: 72, default: 48 };
        const slaMs = (slaHours[queueType] ?? slaHours['default']) * 3600 * 1000;
        const { data, error } = await this.supabase.admin
            .from('moderation_tickets')
            .insert({ entity_type: entityType, entity_id: entityId, queue_type: queueType, severity, tenant_id: tenantId, sla_deadline: new Date(Date.now() + slaMs).toISOString() })
            .select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async listTickets(pagination, queueType) {
        let query = this.supabase.admin.from('moderation_tickets').select('id, entity_type, entity_id, queue_type, severity, status, sla_deadline, created_at', { count: 'exact' }).in('status', ['pending', 'assigned']);
        if (queueType)
            query = query.eq('queue_type', queueType);
        const { data, count, error } = await query.order('created_at', { ascending: true }).range(pagination.offset, pagination.offset + pagination.limit - 1);
        if (error)
            throw new Error(error.message);
        return { data: data ?? [], total: count ?? 0 };
    }
    async getTicketById(id) {
        const { data, error } = await this.supabase.admin.from('moderation_tickets').select('*').eq('id', id).maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Ticket not found');
        return data;
    }
    async recordDecision(ticketId, moderatorId, decision, reasonCode, tenantId) {
        const ticket = await this.getTicketById(ticketId);
        const normalizedDecision = decision.toLowerCase();
        const newStatus = normalizedDecision === 'approve' || normalizedDecision === 'approved'
            ? 'approved'
            : normalizedDecision === 'revision_requested' || normalizedDecision === 'revision'
                ? 'revision_requested'
                : 'rejected';
        await this.supabase.admin.from('moderation_tickets').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', ticketId);
        if (ticket.entity_type === 'content_item') {
            const contentStatus = newStatus === 'approved'
                ? 'approved'
                : newStatus === 'revision_requested'
                    ? 'revision_requested'
                    : 'rejected';
            await this.supabase.admin
                .from('content_items')
                .update({
                status: contentStatus,
                updated_at: new Date().toISOString(),
            })
                .eq('id', ticket.entity_id);
            await this.supabase.admin.from('content_lifecycle_logs').insert({
                tenant_id: tenantId,
                content_id: ticket.entity_id,
                actor_id: moderatorId,
                old_state: 'under_review',
                new_state: contentStatus,
                rationale_notes: reasonCode,
            });
        }
        await this.eventBus.publish({
            event_name: 'moderation.decision_made', tenant_id: tenantId, schema_version: 1,
            payload: { ticketId, entityType: ticket.entity_type, entityId: ticket.entity_id, decision, reasonCode },
        });
    }
    async getDashboardStats() {
        const [{ count: totalUsers }, { count: pendingTickets }, { count: pendingProducts }, { count: pendingVerifications },] = await Promise.all([
            this.supabase.admin.from('users').select('id', { count: 'exact', head: true }),
            this.supabase.admin.from('moderation_tickets').select('id', { count: 'exact', head: true }).in('status', ['pending', 'assigned']),
            this.supabase.admin.from('catalog_items').select('id', { count: 'exact', head: true }).in('status', ['under_review', 'pending_review']),
            this.supabase.admin.from('organization_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        ]);
        return {
            activeUsers: totalUsers ?? 0,
            pendingTickets: pendingTickets ?? 0,
            pendingProducts: pendingProducts ?? 0,
            pendingVerifications: pendingVerifications ?? 0,
        };
    }
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], TicketService);
//# sourceMappingURL=ticket.service.js.map