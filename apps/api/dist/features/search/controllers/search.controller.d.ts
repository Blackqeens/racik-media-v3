import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { SearchService } from '../services/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: SearchQueryDto): Promise<ApiResponse<SearchResultDto>>;
}
