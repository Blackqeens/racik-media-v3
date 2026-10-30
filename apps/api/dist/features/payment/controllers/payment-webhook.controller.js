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
var PaymentWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const payment_service_1 = require("../services/payment.service");
let PaymentWebhookController = PaymentWebhookController_1 = class PaymentWebhookController {
    constructor(paymentService) {
        this.paymentService = paymentService;
        this.logger = new common_1.Logger(PaymentWebhookController_1.name);
    }
    async receiveWebhook(payload, headers) {
        this.logger.log(`Payment webhook received`);
        const signature = payload['signature_key'] ||
            headers['x-callback-token'] ||
            headers['x-signature'] ||
            '';
        await this.paymentService.processWebhook(payload, signature);
        return { ok: true };
    }
};
exports.PaymentWebhookController = PaymentWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "receiveWebhook", null);
exports.PaymentWebhookController = PaymentWebhookController = PaymentWebhookController_1 = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentWebhookController);
//# sourceMappingURL=payment-webhook.controller.js.map