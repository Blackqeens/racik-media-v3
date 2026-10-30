/**
 * settlement.service.ts — Escrow Split Settlement Service
 * Calculates and records platform fee splits. No-Wallet: direct bank disbursement.
 * Ref: escrow-lifecycle.md §3, pricing-sustainability.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
const GATEWAY_FEE_FLAT = 4500; // IDR

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(private readonly supabase: SupabaseClientService) {}

  async calculateAndRecord(escrowContractId: string, grossAmount: number, tenantId: string, trancheId?: string): Promise<void> {
    const platformFeeAmount = grossAmount * PLATFORM_FEE_PERCENTAGE;
    const vendorPayout = grossAmount - platformFeeAmount - GATEWAY_FEE_FLAT;

    const { error } = await this.supabase.admin.from('escrow_settlement_splits').insert({
      escrow_contract_id: escrowContractId, tenant_id: tenantId, tranche_id: trancheId ?? null,
      gross_amount: grossAmount, platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
      platform_fee_amount: platformFeeAmount, gateway_fee_amount: GATEWAY_FEE_FLAT,
      vendor_final_payout: vendorPayout,
    });
    if (error) this.logger.error(`Settlement record failed for escrow ${escrowContractId}: ${error.message}`);
  }
}
