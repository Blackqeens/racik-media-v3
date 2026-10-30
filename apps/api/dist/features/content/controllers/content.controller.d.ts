import { ContentService } from '../services/content.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    createContent(req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: CreateContentDto): Promise<ApiResponse<any>>;
    listPublished(pagination: PaginationDto, q?: string, status?: string, contentType?: string): Promise<ApiResponse<any[]>>;
    listEvents(pagination: PaginationDto, q?: string, tab?: string): Promise<ApiResponse<any[]>>;
    getDetail(id: string): Promise<ApiResponse<any>>;
    updateContent(id: string, req: {
        user: {
            id: string;
        };
    }, dto: UpdateContentDto): Promise<ApiResponse<any>>;
    submitForReview(id: string, req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }): Promise<ApiResponse<null>>;
}
