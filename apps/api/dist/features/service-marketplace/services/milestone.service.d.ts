import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class MilestoneService {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    createMilestone(orderId: string, serviceListingId: string, title: string, description: string, milestoneOrder: number, tenantId: string): Promise<any>;
    requestRevision(milestoneId: string): Promise<void>;
}
