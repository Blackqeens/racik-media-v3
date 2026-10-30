import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class ProvenanceRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findById(id: string): Promise<any>;
    findByCatalogItemId(catalogItemId: string): Promise<any>;
}
