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
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(VerificationService_1.name);
    }
    async submitVerification(userId, dto) {
        const { data, error } = await this.supabase.admin
            .from('verifications')
            .insert({
            user_id: userId,
            tenant_id: dto.tenant_id,
            verification_type: dto.verification_type,
            status: 'pending',
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getLatestVerification(userId) {
        const { data } = await this.supabase.admin
            .from('verifications')
            .select('id, verification_type, status, submitted_at, reviewed_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        return data;
    }
    async recordDecision(verificationId, userId, verificationType, decision, tenantId) {
        await this.supabase.admin
            .from('verifications')
            .update({ status: decision === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
            .eq('id', verificationId);
        await this.eventBus.publish({
            event_name: 'identity.verification_decision_recorded',
            tenant_id: tenantId,
            schema_version: 1,
            payload: { userId, verificationId, verificationType, decision },
        });
        this.logger.log(`Verification ${verificationId} decision: ${decision}`);
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map