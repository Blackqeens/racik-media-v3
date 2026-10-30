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
var ReputationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const SCORE_DELTAS = {
    knowledge_approved: 2,
    order_fulfilled: 5,
    provenance_verified: 3,
    tracking_number_invalid: -10,
    provenance_violation: -15,
    inactivity_decay: -5,
};
let ReputationService = ReputationService_1 = class ReputationService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(ReputationService_1.name);
    }
    async applyScoreDelta(userId, reasonCode, sourceEventId, sourceDomain, tenantId) {
        const delta = SCORE_DELTAS[reasonCode];
        if (delta === undefined) {
            this.logger.warn(`Unknown reason code: ${reasonCode}`);
            return;
        }
        const { data: existing } = await this.supabase.admin.from('reputation_events').select('id').eq('source_event_id', sourceEventId).maybeSingle();
        if (existing) {
            this.logger.debug(`Skip duplicate reputation event: ${sourceEventId}`);
            return;
        }
        await this.supabase.admin.from('reputation_events').insert({ user_id: userId, tenant_id: tenantId, reason_code: reasonCode, score_delta: delta, source_event_id: sourceEventId, source_domain: sourceDomain });
        const { data: events } = await this.supabase.admin.from('reputation_events').select('score_delta').eq('user_id', userId);
        const newScore = Math.min(1000, Math.max(0, (events ?? []).reduce((sum, e) => sum + Number(e.score_delta), 100)));
        await this.supabase.admin.from('core_reputations').upsert({ user_id: userId, tenant_id: tenantId, master_score: newScore, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        await this.eventBus.publish({ event_name: 'reputation.score_updated', tenant_id: tenantId, schema_version: 1, payload: { userId, score: newScore, reasonCode } });
        this.logger.debug(`Reputation updated for ${userId}: ${delta > 0 ? '+' : ''}${delta} (${reasonCode})`);
    }
    async getScore(userId) {
        const { data } = await this.supabase.admin.from('core_reputations').select('master_score, updated_at').eq('user_id', userId).maybeSingle();
        return data;
    }
};
exports.ReputationService = ReputationService;
exports.ReputationService = ReputationService = ReputationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], ReputationService);
//# sourceMappingURL=reputation.service.js.map