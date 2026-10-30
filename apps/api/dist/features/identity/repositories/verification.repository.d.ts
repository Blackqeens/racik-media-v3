import { SupabaseClientService } from '../../../core/database/supabase.client';
export declare class VerificationRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClientService);
    findById(verificationId: string): Promise<any>;
    findPendingByUser(userId: string): Promise<any[]>;
}
