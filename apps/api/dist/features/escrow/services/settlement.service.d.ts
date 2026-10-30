import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class SettlementService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseClientService);
    calculateAndRecord(escrowContractId: string, grossAmount: number, tenantId: string, trancheId?: string): Promise<void>;
}
