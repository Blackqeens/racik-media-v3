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
var RoleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let RoleService = RoleService_1 = class RoleService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(RoleService_1.name);
    }
    async activateRole(userId, roleType, verificationId, tenantId) {
        const { error } = await this.supabase.admin
            .from('user_roles')
            .upsert({ user_id: userId, role_type: roleType, status: 'active', tenant_id: tenantId }, { onConflict: 'user_id,role_type' });
        if (error)
            throw new Error(error.message);
        await this.eventBus.publish({
            event_name: 'identity.role_activated',
            tenant_id: tenantId,
            schema_version: 1,
            payload: { userId, role: roleType, verificationId },
        });
        this.logger.log(`Role ${roleType} activated for user ${userId}`);
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = RoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], RoleService);
//# sourceMappingURL=role.service.js.map