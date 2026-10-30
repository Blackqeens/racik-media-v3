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
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../../core/auth/jwt.guard");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const catalog_service_1 = require("../services/catalog.service");
const create_catalog_dto_1 = require("../dto/create-catalog.dto");
const update_catalog_dto_1 = require("../dto/update-catalog.dto");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
const pagination_dto_1 = require("../../../core/shared/dto/pagination.dto");
let MarketplaceController = class MarketplaceController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async createCatalogItem(req, dto) {
        const item = await this.catalogService.createCatalogItem(req.user.id, req.user.tenant_id, dto);
        return api_response_dto_1.ApiResponse.ok(item, 'Catalog item created');
    }
    async listActive(pagination, category, q, search, itemType) {
        const result = await this.catalogService.listActive(pagination, {
            category: category === 'all' ? undefined : category,
            search: q || search,
            itemType,
        });
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 12);
    }
    async getMyProducts(req, pagination) {
        const result = await this.catalogService.listByVendor(req.user.id, pagination);
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 20);
    }
    async getDetail(id) {
        const item = await this.catalogService.getById(id);
        return api_response_dto_1.ApiResponse.ok(item);
    }
    async updateCatalog(id, req, dto) {
        const updated = await this.catalogService.updateCatalogItem(id, req.user.id, req.user.tenant_id, dto);
        return api_response_dto_1.ApiResponse.ok(updated);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_catalog_dto_1.CreateCatalogDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "createCatalogItem", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('itemType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listActive", null);
__decorate([
    (0, common_1.Get)('vendor/mine'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getMyProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_catalog_dto_1.UpdateCatalogDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "updateCatalog", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, common_1.Controller)(['catalog', 'marketplace/catalog']),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map