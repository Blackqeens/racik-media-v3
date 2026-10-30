/**
 * api.types.ts — Standard API response types matching NestJS backend.
 * Ref: api-standards.md, coding-standards.md
 */

/** Standard API response wrapper matching ApiResponseDto from the backend. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

/** Pagination metadata returned from list endpoints. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Standard paginated request params (matches PaginationDto). */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Generic API error shape. */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
