import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class SecurityRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findOpenIncidentsByUser(userId: string): Promise<any[]>;
}
