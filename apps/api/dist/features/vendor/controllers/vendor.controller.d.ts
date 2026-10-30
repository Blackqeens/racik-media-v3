import { VendorService } from '../services/vendor.service';
import { RegisterVendorDto } from '../dto/register-vendor.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    registerVendor(req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: RegisterVendorDto): Promise<ApiResponse<{
        message: string;
        vendor: any;
    }>>;
    getMyDashboard(req: {
        user: {
            id: string;
        };
    }): Promise<ApiResponse<{
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
    }>>;
    getVendorProfile(id: string): Promise<ApiResponse<any>>;
}
