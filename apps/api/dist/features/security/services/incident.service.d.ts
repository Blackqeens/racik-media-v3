import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class IncidentService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    recordIncident(userId: string | null, incidentType: string, severityLevel: string, sourceIp: string | null, metadata: Record<string, unknown>, tenantId: string): Promise<void>;
    mitigateIncident(incidentId: string): Promise<void>;
}
