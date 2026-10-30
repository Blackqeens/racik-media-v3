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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const user_service_1 = require("../services/user.service");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
const pagination_dto_1 = require("../../../core/shared/dto/pagination.dto");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
let UserController = class UserController {
    constructor(userService, configService) {
        this.userService = userService;
        this.configService = configService;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_SERVICE_ROLE_KEY'));
    }
    async getMyProfile(req) {
        const userId = req.user.userId;
        const profile = await this.userService.getProfileById(userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Berhasil memuat profil pengguna',
            data: profile,
        };
    }
    async updateMe(req, dto) {
        const userId = req.user.userId;
        const updated = await this.userService.updateProfile(userId, dto);
        return { statusCode: common_1.HttpStatus.OK, message: 'Profil berhasil diperbarui', data: updated };
    }
    async updateMyProfile(req, dto) {
        const userId = req.user.userId;
        const updated = await this.userService.updateProfile(userId, dto);
        return { statusCode: common_1.HttpStatus.OK, message: 'Profil berhasil diperbarui', data: updated };
    }
    async getMyRoles(req) {
        const userId = req.user.userId;
        const roles = await this.userService.getUserRoles(userId);
        return { statusCode: common_1.HttpStatus.OK, data: { userId, roles } };
    }
    async getMyOrders(req, pagination) {
        const userId = req.user.userId;
        const page = pagination?.page ? Number(pagination.page) : 1;
        const limit = pagination?.limit ? Number(pagination.limit) : 5;
        const offset = (page - 1) * limit;
        const { data, count, error } = await this.supabase
            .from('orders')
            .select('id, status, gross_amount, created_at', { count: 'exact' })
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            return api_response_dto_1.ApiResponse.paginated([], 0, page, limit);
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            data: { items: data || [], total: count || 0 },
        };
    }
    async getMyReputation(req) {
        const userId = req.user.userId;
        const { data } = await this.supabase
            .from('core_reputations')
            .select('master_score, updated_at')
            .eq('user_id', userId)
            .maybeSingle();
        return {
            statusCode: common_1.HttpStatus.OK,
            data: { master_score: data?.master_score ?? 100 },
        };
    }
    async getMyContent(req, pagination) {
        const userId = req.user.userId;
        const limit = pagination?.limit ? Number(pagination.limit) : 1;
        const { count, error } = await this.supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('author_id', userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            data: { total: error ? 0 : (count || 0) },
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Patch)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Get)('me/roles'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyRoles", null);
__decorate([
    (0, common_1.Get)('me/orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)('me/reputation'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyReputation", null);
__decorate([
    (0, common_1.Get)('me/content'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyContent", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [user_service_1.UserService,
        config_1.ConfigService])
], UserController);
//# sourceMappingURL=user.controller.js.map