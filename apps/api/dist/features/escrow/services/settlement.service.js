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
var SettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const PLATFORM_FEE_PERCENTAGE = 0.025;
const GATEWAY_FEE_FLAT = 4500;
let SettlementService = SettlementService_1 = class SettlementService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(SettlementService_1.name);
    }
    async calculateAndRecord(escrowContractId, grossAmount, tenantId, trancheId) {
        const platformFeeAmount = grossAmount * PLATFORM_FEE_PERCENTAGE;
        const vendorPayout = grossAmount - platformFeeAmount - GATEWAY_FEE_FLAT;
        const { error } = await this.supabase.admin.from('escrow_settlement_splits').insert({
            escrow_contract_id: escrowContractId, tenant_id: tenantId, tranche_id: trancheId ?? null,
            gross_amount: grossAmount, platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
            platform_fee_amount: platformFeeAmount, gateway_fee_amount: GATEWAY_FEE_FLAT,
            vendor_final_payout: vendorPayout,
        });
        if (error)
            this.logger.error(`Settlement record failed for escrow ${escrowContractId}: ${error.message}`);
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = SettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map