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
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../../core/auth/jwt.guard");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const vendor_service_1 = require("../services/vendor.service");
const register_vendor_dto_1 = require("../dto/register-vendor.dto");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
let VendorController = class VendorController {
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    async registerVendor(req, dto) {
        const vendor = await this.vendorService.registerVendor(req.user.id, req.user.tenant_id, dto);
        return api_response_dto_1.ApiResponse.ok(vendor, 'Vendor registered');
    }
    async getMyDashboard(req) {
        const stats = await this.vendorService.getSellerDashboard(req.user.id);
        return api_response_dto_1.ApiResponse.ok(stats);
    }
    async getVendorProfile(id) {
        const vendor = await this.vendorService.getById(id);
        return api_response_dto_1.ApiResponse.ok(vendor);
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, register_vendor_dto_1.RegisterVendorDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "registerVendor", null);
__decorate([
    (0, common_1.Get)('me/dashboard'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getMyDashboard", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getVendorProfile", null);
exports.VendorController = VendorController = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map