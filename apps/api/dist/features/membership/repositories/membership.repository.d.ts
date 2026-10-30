import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class MembershipRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findByUserId(userId: string): Promise<{
        id: any;
        role_type: any;
        status: any;
        granted_at: any;
        expires_at: any;
    } | null>;
    upsertPlan(userId: string, tenantId: string, planId: string): Promise<any>;
}
