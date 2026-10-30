import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class UserRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findById(userId: string): Promise<any>;
    findByEmail(email: string): Promise<{
        id: any;
        email: any;
        status: any;
        kyc_tier: any;
    } | null>;
    updateStatus(userId: string, status: string): Promise<void>;
}
