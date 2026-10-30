import { CatalogService } from '../services/catalog.service';
import { CreateCatalogDto } from '../dto/create-catalog.dto';
import { UpdateCatalogDto } from '../dto/update-catalog.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class MarketplaceController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    createCatalogItem(req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: CreateCatalogDto): Promise<ApiResponse<any>>;
    listActive(pagination: PaginationDto, category?: string, q?: string, search?: string, itemType?: string): Promise<ApiResponse<any[]>>;
    getMyProducts(req: {
        user: {
            id: string;
        };
    }, pagination: PaginationDto): Promise<ApiResponse<any[]>>;
    getDetail(id: string): Promise<ApiResponse<any>>;
    updateCatalog(id: string, req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: UpdateCatalogDto): Promise<ApiResponse<any>>;
}
