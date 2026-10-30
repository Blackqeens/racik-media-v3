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
exports.ProvenanceService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let ProvenanceService = class ProvenanceService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async createProvenance(dto, tenantId) {
        const { data, error } = await this.supabase.admin
            .from('catalog_provenances')
            .insert({ catalog_item_id: dto.catalog_item_id, producer_origin: dto.producer_origin, production_method: dto.production_method, regional_heritage_story: dto.regional_heritage_story, cultural_attribution_meta: dto.cultural_attribution_meta ?? {}, tenant_id: tenantId })
            .select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getByItemId(catalogItemId) {
        const { data } = await this.supabase.admin.from('catalog_provenances').select('*').eq('catalog_item_id', catalogItemId).maybeSingle();
        if (!data)
            throw new common_1.NotFoundException('Provenance not found');
        return data;
    }
    async verifyProvenance(provenanceId, catalogItemId, tenantId) {
        await this.supabase.admin.from('catalog_provenances').update({ validation_status: 'verified', verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', provenanceId);
        await this.eventBus.publish({ event_name: 'provenance.verified', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, provenanceId, verifiedAt: new Date().toISOString() } });
    }
    async rejectProvenance(provenanceId, catalogItemId, reasonCode, tenantId) {
        await this.supabase.admin.from('catalog_provenances').update({ validation_status: 'rejected', updated_at: new Date().toISOString() }).eq('id', provenanceId);
        await this.eventBus.publish({ event_name: 'provenance.rejected', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, provenanceId, reasonCode } });
    }
};
exports.ProvenanceService = ProvenanceService;
exports.ProvenanceService = ProvenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], ProvenanceService);
//# sourceMappingURL=provenance.service.js.map