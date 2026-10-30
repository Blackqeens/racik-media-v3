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
var LogisticsWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const logistics_service_1 = require("../services/logistics.service");
const crypto_1 = require("crypto");
let LogisticsWebhookController = LogisticsWebhookController_1 = class LogisticsWebhookController {
    constructor(logisticsService, config) {
        this.logisticsService = logisticsService;
        this.config = config;
        this.logger = new common_1.Logger(LogisticsWebhookController_1.name);
    }
    async receiveWebhook(req, payload, signature) {
        this.logger.log('Logistics webhook received');
        if (!this.verifySignature(req, signature)) {
            this.logger.warn('Logistics webhook signature mismatch');
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        const orderId = payload['order_id'];
        const trackingId = payload['tracking_id'];
        const status = payload['status'];
        const carrier = (payload['carrier'] ?? '');
        await this.logisticsService.recordTrackingEvent(orderId, trackingId, status, carrier, 'platform');
        return { ok: true };
    }
    verifySignature(req, signature) {
        const secret = this.config.get('BITESHIP_WEBHOOK_SECRET', '');
        if (!secret) {
            this.logger.warn('BITESHIP_WEBHOOK_SECRET not set — skipping signature check');
            return false;
        }
        const rawBody = req.rawBody;
        if (!rawBody) {
            this.logger.warn('rawBody not available — cannot verify signature');
            return false;
        }
        const expected = (0, crypto_1.createHmac)('sha256', secret)
            .update(rawBody)
            .digest('hex');
        return expected === signature;
    }
};
exports.LogisticsWebhookController = LogisticsWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-webhook-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], LogisticsWebhookController.prototype, "receiveWebhook", null);
exports.LogisticsWebhookController = LogisticsWebhookController = LogisticsWebhookController_1 = __decorate([
    (0, common_1.Controller)('logistics'),
    __metadata("design:paramtypes", [logistics_service_1.LogisticsService,
        config_1.ConfigService])
], LogisticsWebhookController);
//# sourceMappingURL=logistics-webhook.controller.js.map