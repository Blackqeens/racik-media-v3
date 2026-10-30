"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const notification_service_1 = require("./services/notification.service");
const whatsapp_adapter_1 = require("./adapters/whatsapp.adapter");
const email_adapter_1 = require("./adapters/email.adapter");
const push_adapter_1 = require("./adapters/push.adapter");
const identity_notification_consumer_1 = require("./consumers/identity-notification.consumer");
const commerce_notification_consumer_1 = require("./consumers/commerce-notification.consumer");
const catalog_service_notification_consumer_1 = require("./consumers/catalog-service-notification.consumer");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            event_bus_module_1.EventBusModule,
        ],
        providers: [
            notification_service_1.NotificationService,
            whatsapp_adapter_1.WhatsappAdapter,
            email_adapter_1.EmailAdapter,
            push_adapter_1.PushAdapter,
            identity_notification_consumer_1.IdentityNotificationConsumer,
            commerce_notification_consumer_1.CommerceNotificationConsumer,
            catalog_service_notification_consumer_1.CatalogServiceNotificationConsumer,
        ],
        exports: [
            notification_service_1.NotificationService,
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map