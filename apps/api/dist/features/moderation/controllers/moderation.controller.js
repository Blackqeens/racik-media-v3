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
exports.ModerationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../../core/auth/jwt.guard");
const ticket_service_1 = require("../services/ticket.service");
const api_response_dto_1 = require("../../../core/shared/dto/api-response.dto");
const pagination_dto_1 = require("../../../core/shared/dto/pagination.dto");
let ModerationController = class ModerationController {
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async listTickets(pagination, queue) {
        const result = await this.ticketService.listTickets(pagination, queue);
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, pagination.page, pagination.limit);
    }
    async getStats() {
        const stats = await this.ticketService.getDashboardStats();
        return api_response_dto_1.ApiResponse.ok(stats);
    }
    async getTicket(id) {
        const ticket = await this.ticketService.getTicketById(id);
        return api_response_dto_1.ApiResponse.ok(ticket);
    }
    async decideTicket(id, req, body) {
        await this.ticketService.recordDecision(id, req.user.id, body.decision, body.reason_code, req.user.tenant_id);
        return api_response_dto_1.ApiResponse.ok(null, 'Decision recorded');
    }
};
exports.ModerationController = ModerationController;
__decorate([
    (0, common_1.Get)('tickets'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('queue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "listTickets", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/decide'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "decideTicket", null);
exports.ModerationController = ModerationController = __decorate([
    (0, common_1.Controller)('moderation'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ticket_service_1.TicketService])
], ModerationController);
//# sourceMappingURL=moderation.controller.js.map