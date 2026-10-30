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
exports.MilestoneService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
let MilestoneService = class MilestoneService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async createMilestone(orderId, serviceListingId, title, description, milestoneOrder, tenantId) {
        const { data, error } = await this.supabase.admin
            .from('service_milestones')
            .insert({ order_id: orderId, service_listing_id: serviceListingId, title, description, milestone_order: milestoneOrder, tenant_id: tenantId, status: 'pending', revision_count: 0 })
            .select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async requestRevision(milestoneId) {
        const { data } = await this.supabase.admin.from('service_milestones').select('revision_count, status').eq('id', milestoneId).single();
        if (!data)
            throw new common_1.NotFoundException('Milestone not found');
        if (data.revision_count >= 3)
            throw new common_1.BadRequestException('Maximum revision count (3) reached');
        await this.supabase.admin.from('service_milestones').update({ revision_count: data.revision_count + 1, status: 'amendment_requested', updated_at: new Date().toISOString() }).eq('id', milestoneId);
    }
};
exports.MilestoneService = MilestoneService;
exports.MilestoneService = MilestoneService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService])
], MilestoneService);
//# sourceMappingURL=milestone.service.js.map