import { HttpStatus } from '@nestjs/common';
import { UserService, UpdateProfileDto } from '../services/user.service';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
export declare class UserController {
    private readonly userService;
    private readonly configService;
    private supabase;
    constructor(userService: UserService, configService: ConfigService);
    getMyProfile(req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: any;
            status: any;
            kyc_tier: any;
            created_at: any;
            individual_profiles: any;
        };
    }>;
    updateMe(req: any, dto: UpdateProfileDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            status: string;
            kyc_tier: string;
            individual_profiles: any;
        };
    }>;
    updateMyProfile(req: any, dto: UpdateProfileDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            status: string;
            kyc_tier: string;
            individual_profiles: any;
        };
    }>;
    getMyRoles(req: any): Promise<{
        statusCode: HttpStatus;
        data: {
            userId: any;
            roles: string[];
        };
    }>;
    getMyOrders(req: any, pagination: PaginationDto): Promise<ApiResponse<never[]> | {
        statusCode: HttpStatus;
        data: {
            items: {
                id: any;
                status: any;
                gross_amount: any;
                created_at: any;
            }[];
            total: number;
        };
    }>;
    getMyReputation(req: any): Promise<{
        statusCode: HttpStatus;
        data: {
            master_score: any;
        };
    }>;
    getMyContent(req: any, pagination: PaginationDto): Promise<{
        statusCode: HttpStatus;
        data: {
            total: number;
        };
    }>;
}
