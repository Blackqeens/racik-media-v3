import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class EscrowRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findById(id: string): Promise<any>;
    findByOrderId(orderId: string): Promise<any>;
}
