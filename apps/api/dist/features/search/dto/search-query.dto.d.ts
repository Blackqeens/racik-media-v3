export type SearchIndexType = 'catalog' | 'service' | 'content' | 'vendor';
export declare class SearchQueryDto {
    q: string;
    index: SearchIndexType;
    page: number;
    limit: number;
    category?: string;
    price_min?: number;
    price_max?: number;
    lat?: number;
    lng?: number;
    radius_km?: number;
}
