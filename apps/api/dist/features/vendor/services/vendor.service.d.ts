import { ConfigService } from '@nestjs/config';
import { RegisterVendorDto } from '../dto/register-vendor.dto';
export declare class VendorService {
    private readonly configService;
    private supabase;
    constructor(configService: ConfigService);
    registerVendor(userId: string, tenantId: string, dto: RegisterVendorDto): Promise<{
        message: string;
        vendor: any;
    }>;
    getById(id: string): Promise<any>;
    getVendorByUserId(userId: string): Promise<any>;
    getSellerDashboard(userId: string): Promise<{
        store: {
            id: any;
            name: any;
            legalName: any;
            status: any;
            rating: any;
        };
        stats: {
            totalProducts: number;
            totalOrders: number;
            revenueEstimate: number;
            pendingOrders: number;
        };
    }>;
}
