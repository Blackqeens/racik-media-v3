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
var CommerceNotificationConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceNotificationConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const notification_service_1 = require("../services/notification.service");
let CommerceNotificationConsumer = CommerceNotificationConsumer_1 = class CommerceNotificationConsumer {
    constructor(eventBus, notificationService) {
        this.eventBus = eventBus;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(CommerceNotificationConsumer_1.name);
    }
    async onModuleInit() {
        await Promise.all([
            this.subscribeOrderCreated(),
            this.subscribeOrderCancelled(),
            this.subscribeOrderCompleted(),
            this.subscribePaymentSucceeded(),
            this.subscribeEscrowLocked(),
            this.subscribeEscrowDisputed(),
            this.subscribeLogisticsManifested(),
            this.subscribeLogisticsInTransit(),
            this.subscribeLogisticsDelivered(),
        ]);
    }
    async subscribeOrderCreated() {
        await this.eventBus.subscribe('notification.queue.order-created', 'order.created', async (event) => {
            this.logger.debug(`Handling order.created [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('order.created', event.payload.buyerId, { order_id: event.payload.orderId, order_type: event.payload.orderType }, event.event_id);
        });
    }
    async subscribeOrderCancelled() {
        await this.eventBus.subscribe('notification.queue.order-cancelled', 'order.cancelled', async (event) => {
            this.logger.debug(`Handling order.cancelled [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('order.cancelled', event.payload.buyerId, { order_id: event.payload.orderId, reason: event.payload.reasonCode }, event.event_id);
        });
    }
    async subscribeOrderCompleted() {
        await this.eventBus.subscribe('notification.queue.order-completed', 'order.completed', async (event) => {
            this.logger.debug(`Handling order.completed [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('order.completed', event.payload.buyerId, { order_id: event.payload.orderId, completed_at: event.payload.completedAt }, event.event_id);
        });
    }
    async subscribePaymentSucceeded() {
        await this.eventBus.subscribe('notification.queue.payment-succeeded', 'payment.succeeded', async (event) => {
            this.logger.debug(`Handling payment.succeeded [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('payment.succeeded', event.payload.buyerId, {
                order_id: event.payload.orderId,
                transaction_ref: event.payload.transactionRef,
                amount: String(event.payload.amount),
            }, event.event_id);
        });
    }
    async subscribeEscrowLocked() {
        await this.eventBus.subscribe('notification.queue.order-escrow-locked', 'order.escrow_locked', async (event) => {
            this.logger.debug(`Handling order.escrow_locked [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('order.escrow_locked', event.payload.orderId, { order_id: event.payload.orderId, locked_at: event.payload.lockedAt }, event.event_id);
        });
    }
    async subscribeEscrowDisputed() {
        await this.eventBus.subscribe('notification.queue.escrow-disputed', 'escrow.disputed', async (event) => {
            this.logger.debug(`Handling escrow.disputed [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('escrow.disputed', event.payload.orderId, {
                order_id: event.payload.orderId,
                dispute_id: event.payload.disputeId,
                reason: event.payload.reasonCode,
            }, event.event_id);
        });
    }
    async subscribeLogisticsManifested() {
        await this.eventBus.subscribe('notification.queue.logistics-manifested', 'logistics.manifested', async (event) => {
            this.logger.debug(`Handling logistics.manifested [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('logistics.manifested', event.payload.orderId, { order_id: event.payload.orderId, carrier: event.payload.carrier ?? '' }, event.event_id);
        });
    }
    async subscribeLogisticsInTransit() {
        await this.eventBus.subscribe('notification.queue.logistics-in-transit', 'logistics.in_transit', async (event) => {
            this.logger.debug(`Handling logistics.in_transit [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('logistics.in_transit', event.payload.orderId, {
                order_id: event.payload.orderId,
                occurred_at: event.payload.occurredAt ?? '',
            }, event.event_id);
        });
    }
    async subscribeLogisticsDelivered() {
        await this.eventBus.subscribe('notification.queue.logistics-delivered', 'logistics.delivered', async (event) => {
            this.logger.debug(`Handling logistics.delivered [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('logistics.delivered', event.payload.orderId, {
                order_id: event.payload.orderId,
                delivered_at: event.payload.deliveredAt ?? '',
            }, event.event_id);
        });
    }
};
exports.CommerceNotificationConsumer = CommerceNotificationConsumer;
exports.CommerceNotificationConsumer = CommerceNotificationConsumer = CommerceNotificationConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        notification_service_1.NotificationService])
], CommerceNotificationConsumer);
//# sourceMappingURL=commerce-notification.consumer.js.map