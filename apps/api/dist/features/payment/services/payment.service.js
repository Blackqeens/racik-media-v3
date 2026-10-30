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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const crypto_1 = require("crypto");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(eventBus, config, supabase) {
        this.eventBus = eventBus;
        this.config = config;
        this.supabase = supabase;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async processWebhook(payload, signature) {
        const gateway = this.config.get('PAYMENT_GATEWAY', 'midtrans');
        if (!this.verifySignature(gateway, payload, signature)) {
            this.logger.warn(`Payment webhook signature mismatch [gateway=${gateway}]`);
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        const orderId = payload['order_id'];
        const transactionRef = payload['transaction_id'];
        const amount = Number(payload['gross_amount'] ?? 0);
        const status = payload['transaction_status'];
        if (!['settlement', 'capture'].includes(status)) {
            this.logger.debug(`Skipping webhook status: ${status}`);
            return;
        }
        const { data: order } = await this.supabase.admin
            .from('orders')
            .select('buyer_id, tenant_id')
            .eq('id', orderId)
            .maybeSingle();
        const buyerId = order?.buyer_id ?? '';
        const tenantId = order?.tenant_id ?? 'platform';
        await this.supabase.admin
            .from('orders')
            .update({ status: 'escrow_held', updated_at: new Date().toISOString() })
            .eq('id', orderId);
        await this.eventBus.publish({
            event_name: 'payment.succeeded',
            tenant_id: tenantId,
            schema_version: 1,
            payload: { paymentId: (0, crypto_1.randomUUID)(), orderId, buyerId, transactionRef, amount },
        });
        this.logger.log(`payment.succeeded processed & order ${orderId} updated to escrow_held`);
    }
    verifySignature(gateway, payload, signature) {
        if (gateway === 'midtrans') {
            return this.verifyMidtrans(payload, signature);
        }
        if (gateway === 'xendit') {
            return this.verifyXendit(signature);
        }
        this.logger.warn(`Unknown PAYMENT_GATEWAY value: "${gateway}" — rejecting webhook`);
        return false;
    }
    verifyMidtrans(payload, signature) {
        const serverKey = this.config.get('MIDTRANS_SERVER_KEY', '');
        if (!serverKey) {
            this.logger.warn('MIDTRANS_SERVER_KEY not set — skipping signature check');
            return false;
        }
        const raw = String(payload['order_id'] ?? '') +
            String(payload['status_code'] ?? '') +
            String(payload['gross_amount'] ?? '') +
            serverKey;
        const expected = (0, crypto_1.createHash)('sha512').update(raw).digest('hex');
        return expected === signature;
    }
    verifyXendit(signature) {
        const token = this.config.get('XENDIT_WEBHOOK_TOKEN', '');
        if (!token) {
            this.logger.warn('XENDIT_WEBHOOK_TOKEN not set — skipping signature check');
            return false;
        }
        return token === signature;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        config_1.ConfigService,
        supabase_client_1.SupabaseClientService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map