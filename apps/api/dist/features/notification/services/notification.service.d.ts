import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { WhatsappAdapter } from '../adapters/whatsapp.adapter';
import { EmailAdapter } from '../adapters/email.adapter';
import { PushAdapter } from '../adapters/push.adapter';
export declare class NotificationService {
    private readonly db;
    private readonly eventBus;
    private readonly logger;
    private readonly supabase;
    private readonly adapters;
    constructor(db: SupabaseClientService, eventBus: EventBusService, whatsappAdapter: WhatsappAdapter, emailAdapter: EmailAdapter, pushAdapter: PushAdapter);
    dispatchFromEvent(eventType: string, recipientUserId: string, templateVars: Record<string, string>, sourceEventId: string): Promise<void>;
    private isAlreadyDelivered;
    private sendWithRetry;
    private writeDeliveryLog;
    private publishDeliveryFailed;
    private sleep;
}
