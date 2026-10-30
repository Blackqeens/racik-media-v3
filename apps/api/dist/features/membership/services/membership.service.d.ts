import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class MembershipService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    changePlan(userId: string, planId: string, tenantId: string): Promise<void>;
    getMembershipByUser(userId: string): Promise<{
        role_type: any;
        status: any;
        granted_at: any;
    } | null>;
}
