import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class RoleService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    activateRole(userId: string, roleType: string, verificationId: string, tenantId: string): Promise<void>;
}
