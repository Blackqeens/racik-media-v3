import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class GovernanceService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    recordDecision(actorId: string, decisionType: string, referenceId: string | null, previousValue: unknown, newValue: unknown, rationale: string, tenantId: string): Promise<any>;
}
