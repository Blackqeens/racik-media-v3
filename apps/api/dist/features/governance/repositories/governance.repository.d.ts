import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class GovernanceRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findRecentDecisions(limit?: number): Promise<any[]>;
}
