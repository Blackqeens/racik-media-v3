import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class ModerationRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findTicketById(id: string): Promise<any>;
    findOpenTicketByEntity(entityId: string): Promise<any>;
}
