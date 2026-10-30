import { ConfigService } from '@nestjs/config';
import { CreateCatalogDto } from '../dto/create-catalog.dto';
import { UpdateCatalogDto } from '../dto/update-catalog.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class CatalogService {
    private readonly configService;
    private supabase;
    constructor(configService: ConfigService);
    listActive(pagination: PaginationDto, filters?: {
        category?: string;
        itemType?: string;
        search?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<any>;
    createCatalogItem(userId: string, tenantId: string, dto: CreateCatalogDto): Promise<any>;
    listByVendor(vendorId: string, pagination: PaginationDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateCatalogItem(id: string, userId: string, tenantId: string, dto: UpdateCatalogDto): Promise<any>;
}
