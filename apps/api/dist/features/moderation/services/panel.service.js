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
exports.PanelService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
let PanelService = class PanelService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async createPanelReview(ticketId, tenantId) {
        const { data, error } = await this.supabase.admin.from('moderation_panel_reviews').insert({ ticket_id: ticketId, tenant_id: tenantId, required_votes: 3 }).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async castVote(panelReviewId, moderatorId, vote, rationale, tenantId) {
        await this.supabase.admin.from('moderation_panel_votes').insert({ panel_review_id: panelReviewId, moderator_id: moderatorId, vote, rationale_notes: rationale, tenant_id: tenantId });
        const { data } = await this.supabase.admin.from('moderation_panel_votes').select('vote').eq('panel_review_id', panelReviewId);
        const votes = data ?? [];
        const approved = votes.filter(v => v.vote === 'approve').length;
        const rejected = votes.filter(v => v.vote === 'reject').length;
        if (approved >= 3 || rejected >= 3) {
            const decision = approved >= 3 ? 'approved' : 'rejected';
            await this.supabase.admin.from('moderation_panel_reviews').update({ final_decision: decision, votes_approved: approved, votes_rejected: rejected, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', panelReviewId);
        }
    }
};
exports.PanelService = PanelService;
exports.PanelService = PanelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService])
], PanelService);
//# sourceMappingURL=panel.service.js.map