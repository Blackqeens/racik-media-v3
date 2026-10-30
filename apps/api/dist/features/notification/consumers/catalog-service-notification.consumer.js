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
var CatalogServiceNotificationConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogServiceNotificationConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const notification_service_1 = require("../services/notification.service");
let CatalogServiceNotificationConsumer = CatalogServiceNotificationConsumer_1 = class CatalogServiceNotificationConsumer {
    constructor(eventBus, notificationService) {
        this.eventBus = eventBus;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(CatalogServiceNotificationConsumer_1.name);
    }
    async onModuleInit() {
        await Promise.all([
            this.subscribeCatalogApproved(),
            this.subscribeCatalogAnomalyDetected(),
            this.subscribeServiceApproved(),
            this.subscribeSecurityIncidentCritical(),
            this.subscribeMembershipPlanChanged(),
            this.subscribeContentPublished(),
        ]);
    }
    async subscribeCatalogApproved() {
        await this.eventBus.subscribe('notification.queue.catalog-approved', 'catalog.approved', async (event) => {
            this.logger.debug(`Handling catalog.approved [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('catalog.approved', event.payload.vendorId, {
                catalog_item_id: event.payload.catalogItemId,
                approved_at: event.payload.approvedAt,
            }, event.event_id);
        });
    }
    async subscribeCatalogAnomalyDetected() {
        await this.eventBus.subscribe('notification.queue.catalog-anomaly-detected', 'catalog.anomaly_detected', async (event) => {
            this.logger.debug(`Handling catalog.anomaly_detected [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('catalog.anomaly_detected', event.payload.vendorId, {
                catalog_item_id: event.payload.catalogItemId,
                anomaly_id: event.payload.anomalyId,
                severity: event.payload.severity,
            }, event.event_id);
        });
    }
    async subscribeServiceApproved() {
        await this.eventBus.subscribe('notification.queue.service-approved', 'service.approved', async (event) => {
            this.logger.debug(`Handling service.approved [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('service.approved', event.payload.providerId, {
                service_id: event.payload.serviceId,
                approved_at: event.payload.approvedAt,
            }, event.event_id);
        });
    }
    async subscribeSecurityIncidentCritical() {
        await this.eventBus.subscribe('notification.queue.security-incident-critical', 'security.incident_critical', async (event) => {
            this.logger.debug(`Handling security.incident_critical [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('security.incident_critical', event.payload.userId, {
                incident_id: event.payload.incidentId,
                reason: event.payload.reasonCode,
            }, event.event_id);
        });
    }
    async subscribeContentPublished() {
        await this.eventBus.subscribe('notification.queue.content-published', 'content.published', async (event) => {
            this.logger.debug(`Handling content.published [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('content.published', event.payload.authorId, { content_id: event.payload.contentId, published_at: event.payload.publishedAt }, event.event_id);
        });
    }
    async subscribeMembershipPlanChanged() {
        await this.eventBus.subscribe('notification.queue.membership-plan-changed', 'membership.plan_changed', async (event) => {
            this.logger.debug(`Handling membership.plan_changed [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('membership.plan_changed', event.payload.userId, {
                plan_id: event.payload.planId,
                occurred_at: event.payload.occurredAt,
            }, event.event_id);
        });
    }
};
exports.CatalogServiceNotificationConsumer = CatalogServiceNotificationConsumer;
exports.CatalogServiceNotificationConsumer = CatalogServiceNotificationConsumer = CatalogServiceNotificationConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        notification_service_1.NotificationService])
], CatalogServiceNotificationConsumer);
//# sourceMappingURL=catalog-service-notification.consumer.js.map