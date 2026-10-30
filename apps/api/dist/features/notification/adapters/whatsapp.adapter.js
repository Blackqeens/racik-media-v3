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
var WhatsappAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsappAdapter = WhatsappAdapter_1 = class WhatsappAdapter {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(WhatsappAdapter_1.name);
    }
    async send(notificationId, dto) {
        const gatewayUrl = this.config.getOrThrow('WHATSAPP_GATEWAY_URL');
        const apiToken = this.config.getOrThrow('WHATSAPP_API_TOKEN');
        const base = {
            notification_id: notificationId,
            channel: 'whatsapp',
            attempt: 1,
            delivered_at: new Date().toISOString(),
        };
        try {
            const response = await fetch(`${gatewayUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    recipient_id: dto.recipient_user_id,
                    template: dto.template_key,
                    variables: dto.template_vars,
                    idempotency_key: notificationId,
                }),
            });
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.warn(`WhatsApp delivery failed [${notificationId}]: ${response.status} ${errorBody}`);
                return { ...base, status: 'failed', failure_code: `HTTP_${response.status}` };
            }
            this.logger.debug(`WhatsApp sent [${notificationId}] to user ${dto.recipient_user_id}`);
            return { ...base, status: 'sent', failure_code: null };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
            this.logger.error(`WhatsApp adapter error [${notificationId}]: ${message}`);
            return { ...base, status: 'failed', failure_code: 'ADAPTER_ERROR' };
        }
    }
};
exports.WhatsappAdapter = WhatsappAdapter;
exports.WhatsappAdapter = WhatsappAdapter = WhatsappAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappAdapter);
//# sourceMappingURL=whatsapp.adapter.js.map