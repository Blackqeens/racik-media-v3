import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class ContentRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findById(id: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<void>;
}
