import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class PriceAnomalyService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    detectAnomaly(category: string, price: number): Promise<boolean>;
    recordAnomaly(catalogItemId: string, detectedPrice: number, category: string, tenantId: string, vendorId: string): Promise<void>;
}
