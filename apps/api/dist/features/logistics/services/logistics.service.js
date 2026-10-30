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
var LogisticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let LogisticsService = LogisticsService_1 = class LogisticsService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(LogisticsService_1.name);
    }
    async recordTrackingEvent(orderId, trackingRecordId, status, carrier, tenantId) {
        const correlationId = (0, crypto_1.randomUUID)();
        await this.supabase.admin.from('logistics_change_logs').insert({
            order_id: orderId, tracking_record_id: trackingRecordId, current_status: status,
            correlation_id: correlationId, tenant_id: tenantId,
        });
        const eventNameMap = {
            manifested: 'logistics.manifested',
            in_transit: 'logistics.in_transit',
            delivered: 'logistics.delivered',
            tracking_invalid: 'logistics.tracking_invalid',
        };
        const eventName = eventNameMap[status];
        if (!eventName) {
            this.logger.warn(`Unknown logistics status: ${status}`);
            return;
        }
        const payloadMap = {
            'logistics.manifested': { orderId, trackingRecordId, carrier },
            'logistics.in_transit': { orderId, trackingRecordId, occurredAt: new Date().toISOString() },
            'logistics.delivered': { orderId, trackingRecordId, deliveredAt: new Date().toISOString() },
            'logistics.tracking_invalid': { orderId, trackingRecordId, vendorId: '', reasonCode: 'INVALID_TRACKING' },
        };
        await this.eventBus.publish({ event_name: eventName, tenant_id: tenantId, schema_version: 1, payload: payloadMap[eventName] });
        this.logger.log(`${eventName} published for order ${orderId}`);
    }
};
exports.LogisticsService = LogisticsService;
exports.LogisticsService = LogisticsService = LogisticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], LogisticsService);
//# sourceMappingURL=logistics.service.js.map