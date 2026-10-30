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
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let GovernanceService = class GovernanceService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async recordDecision(actorId, decisionType, referenceId, previousValue, newValue, rationale, tenantId) {
        const { data, error } = await this.supabase.admin
            .from('governance_decisions')
            .insert({ actor_id: actorId, tenant_id: tenantId, decision_type: decisionType, reference_id: referenceId, previous_value: previousValue, new_value: newValue, rationale_statement: rationale })
            .select().single();
        if (error)
            throw new Error(error.message);
        if (decisionType === 'amend_parameter') {
            await this.eventBus.publish({ event_name: 'governance.parameter_amended', tenant_id: tenantId, schema_version: 1, payload: { decisionId: data.id, parameterKey: String(newValue), effectiveAt: new Date().toISOString() } });
        }
        return data;
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService, event_bus_service_1.EventBusService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map