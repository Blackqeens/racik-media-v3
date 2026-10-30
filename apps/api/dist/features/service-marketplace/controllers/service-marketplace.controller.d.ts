import { ServiceListingService } from '../services/service-listing.service';
import { CreateServiceListingDto } from '../dto/create-service-listing.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class ServiceMarketplaceController {
    private readonly serviceListingService;
    constructor(serviceListingService: ServiceListingService);
    createListing(req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: CreateServiceListingDto): Promise<ApiResponse<any>>;
    listActive(pagination: PaginationDto, q?: string, category?: string): Promise<ApiResponse<{
        id: any;
        title: any;
        description: any;
        category: any;
        delivery_method: any;
        base_price: any;
        status: any;
        provider_id: any;
        location_area: any;
        created_at: any;
    }[]>>;
    getDetail(id: string): Promise<ApiResponse<any>>;
}
