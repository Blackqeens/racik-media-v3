import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class LogisticsService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    recordTrackingEvent(orderId: string, trackingRecordId: string, status: string, carrier: string, tenantId: string): Promise<void>;
}
