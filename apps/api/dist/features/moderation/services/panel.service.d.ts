import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class PanelService {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    createPanelReview(ticketId: string, tenantId: string): Promise<any>;
    castVote(panelReviewId: string, moderatorId: string, vote: string, rationale: string, tenantId: string): Promise<void>;
}
