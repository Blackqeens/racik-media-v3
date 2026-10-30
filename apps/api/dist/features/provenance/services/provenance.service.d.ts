import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateProvenanceDto } from '../dto/create-provenance.dto';
export declare class ProvenanceService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    createProvenance(dto: CreateProvenanceDto, tenantId: string): Promise<any>;
    getByItemId(catalogItemId: string): Promise<any>;
    verifyProvenance(provenanceId: string, catalogItemId: string, tenantId: string): Promise<void>;
    rejectProvenance(provenanceId: string, catalogItemId: string, reasonCode: string, tenantId: string): Promise<void>;
}
