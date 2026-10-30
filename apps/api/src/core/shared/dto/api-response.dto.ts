/**
 * api-response.dto.ts — Wrapper standar untuk semua response API
 *
 * Semua endpoint WAJIB menggunakan wrapper ini agar frontend konsisten.
 *
 * Format sukses:
 *   { success: true, data: {...}, meta: { page, limit, total } }
 *
 * Format error:
 *   { success: false, error: { code: 'VALIDATION_ERROR', message: '...' } }
 *
 * Ref: coding-standards.md §Response Format
 */

/** Meta pagination untuk response list */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/** Response sukses dengan data */
export class ApiResponse<T> {
  success: true = true;
  data: T;
  meta?: PaginationMeta;
  message?: string;

  constructor(data: T, meta?: PaginationMeta, message?: string) {
    this.data = data;
    this.meta = meta;
    this.message = message;
  }

  /** Helper: buat response sukses sederhana */
  static ok<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, undefined, message);
  }

  /** Helper: buat response sukses dengan pagination */
  static paginated<T>(
    data: T,
    total: number,
    page: number,
    limit: number,
  ): ApiResponse<T> {
    return new ApiResponse(data, {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    });
  }
}

/** Response error standar */
export class ApiErrorResponse {
  success: false = false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };

  constructor(code: string, message: string, details?: unknown) {
    this.error = { code, message, details };
  }
}
