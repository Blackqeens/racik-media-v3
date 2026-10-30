import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class AuditWriterService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseClientService);
    writeIdentityLog(tenantId: string, correlationId: string, userId: string, actorId: string | null, actionType: string, oldValue: unknown, newValue: unknown, rationaleCode: string): Promise<void>;
    writeSecurityLog(tenantId: string, correlationId: string, incidentId: string | null, actorId: string | null, actionType: string, metadata: unknown): Promise<void>;
    writeModerationLog(tenantId: string, correlationId: string, ticketId: string, entityType: string, entityId: string, actorId: string | null, actionType: string, rationaleNotes: string | null): Promise<void>;
    writeFinancialLog(tenantId: string, correlationId: string, escrowContractId: string, orderId: string, amountLocked: number | null, feeDeducted: number | null, releaseState: string | null, actorId: string | null, actionType: string): Promise<void>;
}
