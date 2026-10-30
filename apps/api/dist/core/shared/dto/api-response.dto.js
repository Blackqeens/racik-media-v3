"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponse = exports.ApiResponse = void 0;
class ApiResponse {
    constructor(data, meta, message) {
        this.success = true;
        this.data = data;
        this.meta = meta;
        this.message = message;
    }
    static ok(data, message) {
        return new ApiResponse(data, undefined, message);
    }
    static paginated(data, total, page, limit) {
        return new ApiResponse(data, {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit),
        });
    }
}
exports.ApiResponse = ApiResponse;
class ApiErrorResponse {
    constructor(code, message, details) {
        this.success = false;
        this.error = { code, message, details };
    }
}
exports.ApiErrorResponse = ApiErrorResponse;
//# sourceMappingURL=api-response.dto.js.map