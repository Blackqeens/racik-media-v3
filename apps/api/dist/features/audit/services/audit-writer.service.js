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
var AuditWriterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditWriterService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
let AuditWriterService = AuditWriterService_1 = class AuditWriterService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(AuditWriterService_1.name);
    }
    async writeIdentityLog(tenantId, correlationId, userId, actorId, actionType, oldValue, newValue, rationaleCode) {
        const { error } = await this.supabase.admin.from('identity_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, user_id: userId, actor_id: actorId, action_type: actionType, old_value: oldValue, new_value: newValue, rationale_code: rationaleCode });
        if (error)
            this.logger.error(`identity_audit_logs write failed: ${error.message}`);
    }
    async writeSecurityLog(tenantId, correlationId, incidentId, actorId, actionType, metadata) {
        const { error } = await this.supabase.admin.from('security_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, incident_id: incidentId, actor_id: actorId, action_type: actionType, metadata });
        if (error)
            this.logger.error(`security_audit_logs write failed: ${error.message}`);
    }
    async writeModerationLog(tenantId, correlationId, ticketId, entityType, entityId, actorId, actionType, rationaleNotes) {
        const { error } = await this.supabase.admin.from('moderation_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, moderation_ticket_id: ticketId, entity_type: entityType, entity_id: entityId, actor_id: actorId, action_type: actionType, rationale_notes: rationaleNotes });
        if (error)
            this.logger.error(`moderation_audit_logs write failed: ${error.message}`);
    }
    async writeFinancialLog(tenantId, correlationId, escrowContractId, orderId, amountLocked, feeDeducted, releaseState, actorId, actionType) {
        const { error } = await this.supabase.admin.from('financial_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, escrow_contract_id: escrowContractId, order_id: orderId, amount_locked: amountLocked, fee_deducted: feeDeducted, release_state: releaseState, actor_id: actorId, action_type: actionType });
        if (error)
            this.logger.error(`financial_audit_logs write failed: ${error.message}`);
    }
};
exports.AuditWriterService = AuditWriterService;
exports.AuditWriterService = AuditWriterService = AuditWriterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService])
], AuditWriterService);
//# sourceMappingURL=audit-writer.service.js.map