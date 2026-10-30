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
var IncidentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let IncidentService = IncidentService_1 = class IncidentService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(IncidentService_1.name);
    }
    async recordIncident(userId, incidentType, severityLevel, sourceIp, metadata, tenantId) {
        const { data, error } = await this.supabase.admin
            .from('security_incidents')
            .insert({ user_id: userId, tenant_id: tenantId, incident_type: incidentType, severity_level: severityLevel, incident_status: 'open', source_ip: sourceIp, metadata })
            .select().single();
        if (error) {
            this.logger.error('Failed to record incident', error);
            return;
        }
        if (severityLevel === 'critical') {
            await this.eventBus.publish({ event_name: 'security.incident_critical', tenant_id: tenantId, schema_version: 1, payload: { incidentId: data.id, userId: userId ?? '', reasonCode: incidentType } });
        }
    }
    async mitigateIncident(incidentId) {
        await this.supabase.admin.from('security_incidents').update({ incident_status: 'mitigated', updated_at: new Date().toISOString() }).eq('id', incidentId);
    }
};
exports.IncidentService = IncidentService;
exports.IncidentService = IncidentService = IncidentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService, event_bus_service_1.EventBusService])
], IncidentService);
//# sourceMappingURL=incident.service.js.map