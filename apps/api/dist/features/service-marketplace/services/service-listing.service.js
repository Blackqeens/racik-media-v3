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
exports.ServiceListingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let ServiceListingService = class ServiceListingService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
    }
    async createListing(providerId, tenantId, dto) {
        const { data, error } = await this.supabase.admin
            .from('service_listings')
            .insert({ provider_id: providerId, tenant_id: tenantId, title: dto.title, description: dto.description, delivery_method: dto.delivery_method, base_price: dto.base_price, status: 'under_review' })
            .select().single();
        if (error)
            throw new Error(error.message);
        await this.eventBus.publish({ event_name: 'service.submitted', tenant_id: tenantId, schema_version: 1, payload: { serviceId: data.id, providerId } });
        return data;
    }
    async listActive(pagination, filters) {
        let query = this.supabase.admin
            .from('service_listings')
            .select('id, title, description, category, delivery_method, base_price, status, provider_id, location_area, created_at', { count: 'exact' })
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(pagination.offset, pagination.offset + pagination.limit - 1);
        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        const { data, count, error } = await query;
        if (error)
            throw new Error(error.message);
        return { data: data ?? [], total: count ?? 0 };
    }
    async getById(id) {
        const { data, error } = await this.supabase.admin.from('service_listings').select('*').eq('id', id).maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Service listing not found');
        return data;
    }
    async approveListing(id, tenantId) {
        const existing = await this.getById(id);
        await this.supabase.admin.from('service_listings').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
        await this.eventBus.publish({ event_name: 'service.approved', tenant_id: tenantId, schema_version: 1, payload: { serviceId: id, providerId: existing.provider_id, approvedAt: new Date().toISOString() } });
    }
};
exports.ServiceListingService = ServiceListingService;
exports.ServiceListingService = ServiceListingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService, event_bus_service_1.EventBusService])
], ServiceListingService);
//# sourceMappingURL=service-listing.service.js.map