import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class ReputationService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    applyScoreDelta(userId: string, reasonCode: string, sourceEventId: string, sourceDomain: string, tenantId: string): Promise<void>;
    getScore(userId: string): Promise<{
        master_score: any;
        updated_at: any;
    } | null>;
}
