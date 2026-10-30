"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../../core/auth/jwt.guard");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const content_service_1 = require("../services/content.service");
const create_content_dto_1 = require("../dto/create-content.dto");
const update_content_dto_1 = require("../dto/update-content.dto");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
const pagination_dto_1 = require("../../../core/shared/dto/pagination.dto");
let ContentController = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    async createContent(req, dto) {
        const content = await this.contentService.createContent(req.user.id, req.user.tenant_id, dto);
        return api_response_dto_1.ApiResponse.ok(content, 'Content created');
    }
    async listPublished(pagination, q, status, contentType) {
        const result = await this.contentService.listPublished(pagination, {
            search: q,
            status: status || 'published',
            contentType,
        });
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 9);
    }
    async listEvents(pagination, q, tab) {
        const result = await this.contentService.listPublished(pagination, {
            search: q,
            status: 'published',
            contentType: 'event',
        });
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 12);
    }
    async getDetail(id) {
        const content = await this.contentService.getById(id);
        return api_response_dto_1.ApiResponse.ok(content);
    }
    async updateContent(id, req, dto) {
        const updated = await this.contentService.updateContent(id, req.user.id, dto);
        return api_response_dto_1.ApiResponse.ok(updated);
    }
    async submitForReview(id, req) {
        await this.contentService.submitForReview(id, req.user.id, req.user.tenant_id);
        return api_response_dto_1.ApiResponse.ok(null, 'Content submitted for review');
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_content_dto_1.CreateContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createContent", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('content_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "listPublished", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('tab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_content_dto_1.UpdateContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "submitForReview", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('content'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map