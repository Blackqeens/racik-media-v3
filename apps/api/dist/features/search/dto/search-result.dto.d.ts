export interface SearchHitDto {
    id: string;
    index_type: string;
    title: string;
    description?: string;
    image_url?: string;
    _rankingScore?: number;
    meta: Record<string, unknown>;
}
export declare class SearchResultDto {
    hits: SearchHitDto[];
    total_hits: number;
    page: number;
    limit: number;
    total_pages: number;
    processing_time_ms: number;
    query: string;
}
