import { ConfigService } from '@nestjs/config';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class ContentService {
    private readonly configService;
    private supabase;
    constructor(configService: ConfigService);
    createContent(userId: string, tenantId: string, dto: CreateContentDto): Promise<any>;
    listPublished(pagination: PaginationDto, filters?: {
        search?: string;
        status?: string;
        contentType?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<any>;
    updateContent(id: string, userId: string, dto: UpdateContentDto): Promise<any>;
    submitForReview(id: string, userId: string, tenantId: string): Promise<any>;
}
