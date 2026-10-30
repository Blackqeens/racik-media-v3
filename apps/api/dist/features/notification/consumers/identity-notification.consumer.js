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
var IdentityNotificationConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityNotificationConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const notification_service_1 = require("../services/notification.service");
let IdentityNotificationConsumer = IdentityNotificationConsumer_1 = class IdentityNotificationConsumer {
    constructor(eventBus, notificationService) {
        this.eventBus = eventBus;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(IdentityNotificationConsumer_1.name);
    }
    async onModuleInit() {
        await this.subscribeRoleActivated();
        await this.subscribePasswordChanged();
        await this.subscribeVerificationDecision();
    }
    async subscribeRoleActivated() {
        await this.eventBus.subscribe('notification.queue.identity-role-activated', 'identity.role_activated', async (event) => {
            this.logger.debug(`Handling identity.role_activated [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('identity.role_activated', event.payload.userId, { role: event.payload.role }, event.event_id);
        });
    }
    async subscribePasswordChanged() {
        await this.eventBus.subscribe('notification.queue.identity-password-changed', 'identity.password_changed', async (event) => {
            this.logger.debug(`Handling identity.password_changed [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('identity.password_changed', event.payload.userId, { occurred_at: event.payload.occurredAt }, event.event_id);
        });
    }
    async subscribeVerificationDecision() {
        await this.eventBus.subscribe('notification.queue.identity-verification-decision', 'identity.verification_decision_recorded', async (event) => {
            this.logger.debug(`Handling identity.verification_decision_recorded [${event.event_id}]`);
            await this.notificationService.dispatchFromEvent('identity.verification_decision_recorded', event.payload.userId, {
                verification_type: event.payload.verificationType,
                decision: event.payload.decision,
            }, event.event_id);
        });
    }
};
exports.IdentityNotificationConsumer = IdentityNotificationConsumer;
exports.IdentityNotificationConsumer = IdentityNotificationConsumer = IdentityNotificationConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        notification_service_1.NotificationService])
], IdentityNotificationConsumer);
//# sourceMappingURL=identity-notification.consumer.js.map