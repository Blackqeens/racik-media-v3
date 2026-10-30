import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';
export declare class VerificationService {
    private readonly supabase;
    private readonly eventBus;
    private readonly logger;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    submitVerification(userId: string, dto: SubmitVerificationDto): Promise<any>;
    getLatestVerification(userId: string): Promise<{
        id: any;
        verification_type: any;
        status: any;
        submitted_at: any;
        reviewed_at: any;
    } | null>;
    recordDecision(verificationId: string, userId: string, verificationType: string, decision: string, tenantId: string): Promise<void>;
}
