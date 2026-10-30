import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseClientService {
    private readonly config;
    private readonly logger;
    readonly anon: SupabaseClient;
    readonly admin: SupabaseClient;
    constructor(config: ConfigService);
}
