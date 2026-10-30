export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}
export declare class ApiResponse<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
    message?: string;
    constructor(data: T, meta?: PaginationMeta, message?: string);
    static ok<T>(data: T, message?: string): ApiResponse<T>;
    static paginated<T>(data: T, total: number, page: number, limit: number): ApiResponse<T>;
}
export declare class ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    constructor(code: string, message: string, details?: unknown);
}
