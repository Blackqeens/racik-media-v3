import { ConfigService } from '@nestjs/config';
export interface UpdateProfileDto {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    city?: string;
}
export declare class UserService {
    private readonly configService;
    private supabase;
    constructor(configService: ConfigService);
    getProfileById(userId: string): Promise<{
        id: any;
        status: any;
        kyc_tier: any;
        created_at: any;
        individual_profiles: any;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        status: string;
        kyc_tier: string;
        individual_profiles: any;
    }>;
    getUserRoles(userId: string): Promise<string[]>;
}
