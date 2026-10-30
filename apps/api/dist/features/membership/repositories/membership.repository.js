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
exports.MembershipRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
let MembershipRepository = class MembershipRepository {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findByUserId(userId) {
        const { data, error } = await this.supabase.admin
            .from('user_roles')
            .select('id, role_type, status, granted_at, expires_at')
            .eq('user_id', userId)
            .eq('role_type', 'member')
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async upsertPlan(userId, tenantId, planId) {
        const { data, error } = await this.supabase.admin
            .from('user_roles')
            .upsert({
            user_id: userId,
            tenant_id: tenantId,
            role_type: 'member',
            status: 'active',
            granted_at: new Date().toISOString(),
            metadata: { plan_id: planId },
        }, { onConflict: 'user_id,role_type' })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.MembershipRepository = MembershipRepository;
exports.MembershipRepository = MembershipRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService])
], MembershipRepository);
//# sourceMappingURL=membership.repository.js.map