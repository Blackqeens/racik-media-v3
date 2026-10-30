import { ConfigService } from '@nestjs/config';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class PaymentService {
    private readonly eventBus;
    private readonly config;
    private readonly supabase;
    private readonly logger;
    constructor(eventBus: EventBusService, config: ConfigService, supabase: SupabaseClientService);
    processWebhook(payload: Record<string, unknown>, signature: string): Promise<void>;
    private verifySignature;
    private verifyMidtrans;
    private verifyXendit;
}
