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
exports.ServiceMarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../../core/auth/jwt.guard");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const service_listing_service_1 = require("../services/service-listing.service");
const create_service_listing_dto_1 = require("../dto/create-service-listing.dto");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
const pagination_dto_1 = require("../../../core/shared/dto/pagination.dto");
let ServiceMarketplaceController = class ServiceMarketplaceController {
    constructor(serviceListingService) {
        this.serviceListingService = serviceListingService;
    }
    async createListing(req, dto) {
        const listing = await this.serviceListingService.createListing(req.user.id, req.user.tenant_id, dto);
        return api_response_dto_1.ApiResponse.ok(listing, 'Service listing created');
    }
    async listActive(pagination, q, category) {
        const result = await this.serviceListingService.listActive(pagination, {
            search: q,
            category: category === 'all' ? undefined : category,
        });
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page, pagination.limit);
    }
    async getDetail(id) {
        const listing = await this.serviceListingService.getById(id);
        return api_response_dto_1.ApiResponse.ok(listing);
    }
};
exports.ServiceMarketplaceController = ServiceMarketplaceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_service_listing_dto_1.CreateServiceListingDto]),
    __metadata("design:returntype", Promise)
], ServiceMarketplaceController.prototype, "createListing", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String, String]),
    __metadata("design:returntype", Promise)
], ServiceMarketplaceController.prototype, "listActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceMarketplaceController.prototype, "getDetail", null);
exports.ServiceMarketplaceController = ServiceMarketplaceController = __decorate([
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [service_listing_service_1.ServiceListingService])
], ServiceMarketplaceController);
//# sourceMappingURL=service-marketplace.controller.js.map