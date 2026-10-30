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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const whatsapp_adapter_1 = require("../adapters/whatsapp.adapter");
const email_adapter_1 = require("../adapters/email.adapter");
const push_adapter_1 = require("../adapters/push.adapter");
const TEMPLATE_MAP = {
    'identity.role_activated': [
        { channel: 'push', template_key: 'role_activated', priority: 'low' },
    ],
    'identity.password_changed': [
        { channel: 'whatsapp', template_key: 'password_changed_alert', priority: 'high' },
        { channel: 'email', template_key: 'password_changed_alert', priority: 'high' },
    ],
    'identity.verification_decision_recorded': [
        { channel: 'push', template_key: 'verification_decision', priority: 'high' },
        { channel: 'email', template_key: 'verification_decision', priority: 'high' },
    ],
    'membership.plan_changed': [
        { channel: 'email', template_key: 'membership_plan_changed', priority: 'low' },
    ],
    'content.published': [
        { channel: 'push', template_key: 'content_published', priority: 'low' },
    ],
    'catalog.approved': [
        { channel: 'push', template_key: 'catalog_approved', priority: 'low' },
        { channel: 'whatsapp', template_key: 'catalog_approved', priority: 'low' },
    ],
    'catalog.anomaly_detected': [
        { channel: 'whatsapp', template_key: 'catalog_anomaly_alert', priority: 'high' },
    ],
    'service.approved': [
        { channel: 'push', template_key: 'service_approved', priority: 'low' },
    ],
    'order.created': [
        { channel: 'whatsapp', template_key: 'order_created_buyer', priority: 'high' },
        { channel: 'push', template_key: 'order_created_buyer', priority: 'high' },
    ],
    'order.cancelled': [
        { channel: 'push', template_key: 'order_cancelled', priority: 'high' },
        { channel: 'email', template_key: 'order_cancelled', priority: 'high' },
    ],
    'order.completed': [
        { channel: 'push', template_key: 'order_completed', priority: 'low' },
    ],
    'payment.succeeded': [
        { channel: 'whatsapp', template_key: 'payment_succeeded', priority: 'high' },
        { channel: 'email', template_key: 'payment_receipt', priority: 'high' },
    ],
    'order.escrow_locked': [
        { channel: 'push', template_key: 'escrow_locked', priority: 'high' },
        { channel: 'whatsapp', template_key: 'escrow_locked', priority: 'high' },
    ],
    'escrow.disputed': [
        { channel: 'email', template_key: 'escrow_disputed', priority: 'high' },
        { channel: 'push', template_key: 'escrow_disputed', priority: 'high' },
    ],
    'logistics.manifested': [
        { channel: 'push', template_key: 'logistics_manifested', priority: 'low' },
    ],
    'logistics.in_transit': [
        { channel: 'push', template_key: 'logistics_in_transit', priority: 'low' },
    ],
    'logistics.delivered': [
        { channel: 'push', template_key: 'logistics_delivered', priority: 'high' },
        { channel: 'whatsapp', template_key: 'logistics_delivered', priority: 'high' },
    ],
    'security.incident_critical': [
        { channel: 'whatsapp', template_key: 'security_incident_alert', priority: 'high' },
        { channel: 'email', template_key: 'security_incident_alert', priority: 'high' },
    ],
};
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1_000;
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(db, eventBus, whatsappAdapter, emailAdapter, pushAdapter) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.supabase = this.db.admin;
        this.adapters = new Map([
            ['whatsapp', whatsappAdapter],
            ['email', emailAdapter],
            ['push', pushAdapter],
        ]);
    }
    async dispatchFromEvent(eventType, recipientUserId, templateVars, sourceEventId) {
        const templates = TEMPLATE_MAP[eventType];
        if (!templates || templates.length === 0) {
            this.logger.debug(`No notification template for event: ${eventType}`);
            return;
        }
        for (const tpl of templates) {
            const dto = {
                recipient_user_id: recipientUserId,
                channel: tpl.channel,
                template_key: tpl.template_key,
                template_vars: templateVars,
                priority: tpl.priority,
                source_event_id: sourceEventId,
                source_event_type: eventType,
            };
            await this.sendWithRetry(dto);
        }
    }
    async isAlreadyDelivered(sourceEventId, channel) {
        const { data } = await this.supabase
            .from('notification_delivery_logs')
            .select('id')
            .eq('source_event_id', sourceEventId)
            .eq('channel', channel)
            .eq('status', 'sent')
            .maybeSingle();
        return data !== null;
    }
    async sendWithRetry(dto) {
        const alreadySent = await this.isAlreadyDelivered(dto.source_event_id, dto.channel);
        if (alreadySent) {
            this.logger.debug(`Skipped duplicate: source_event_id=${dto.source_event_id} channel=${dto.channel}`);
            return;
        }
        const adapter = this.adapters.get(dto.channel);
        if (!adapter) {
            this.logger.error(`No adapter registered for channel: ${dto.channel}`);
            return;
        }
        const notificationId = (0, crypto_1.randomUUID)();
        let lastFailureCode = null;
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            const result = await adapter.send(notificationId, dto);
            await this.writeDeliveryLog({
                notificationId,
                dto,
                status: result.status,
                failureCode: result.failure_code,
                attempt,
                deliveredAt: result.delivered_at,
            });
            if (result.status === 'sent') {
                return;
            }
            lastFailureCode = result.failure_code;
            this.logger.warn(`Retry ${attempt}/${MAX_RETRY_ATTEMPTS} failed [${notificationId}]: ${lastFailureCode}`);
            if (attempt < MAX_RETRY_ATTEMPTS) {
                await this.sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1));
            }
        }
        await this.publishDeliveryFailed(notificationId, dto, lastFailureCode);
    }
    async writeDeliveryLog(params) {
        const { error } = await this.supabase.from('notification_delivery_logs').insert({
            id: params.notificationId,
            recipient_user_id: params.dto.recipient_user_id,
            channel: params.dto.channel,
            template_key: params.dto.template_key,
            source_event_id: params.dto.source_event_id,
            source_event_type: params.dto.source_event_type,
            priority: params.dto.priority,
            status: params.status,
            failure_code: params.failureCode,
            attempt: params.attempt,
            delivered_at: params.deliveredAt,
        });
        if (error) {
            this.logger.error(`Failed to write delivery log [${params.notificationId}]: ${error.message}`);
        }
    }
    async publishDeliveryFailed(notificationId, dto, failureCode) {
        try {
            await this.eventBus.publish({
                event_name: 'notification.delivery_failed',
                tenant_id: 'platform',
                schema_version: 1,
                payload: {
                    notificationId,
                    channel: dto.channel,
                    failureCode: failureCode ?? 'UNKNOWN',
                    attempt: MAX_RETRY_ATTEMPTS,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to publish notification.delivery_failed: ${err}`);
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService,
        whatsapp_adapter_1.WhatsappAdapter,
        email_adapter_1.EmailAdapter,
        push_adapter_1.PushAdapter])
], NotificationService);
//# sourceMappingURL=notification.service.js.map