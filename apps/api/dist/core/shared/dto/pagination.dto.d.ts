export declare class PaginationDto {
    page: number;
    limit: number;
    sort: string;
    order: 'asc' | 'desc';
    get offset(): number;
}
