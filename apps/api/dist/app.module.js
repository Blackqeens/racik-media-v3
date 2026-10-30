"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const database_module_1 = require("./core/database/database.module");
const event_bus_module_1 = require("./core/events/event-bus.module");
const auth_module_1 = require("./core/auth/auth.module");
const identity_module_1 = require("./features/identity/identity.module");
const membership_module_1 = require("./features/membership/membership.module");
const content_module_1 = require("./features/content/content.module");
const marketplace_module_1 = require("./features/marketplace/marketplace.module");
const provenance_module_1 = require("./features/provenance/provenance.module");
const service_marketplace_module_1 = require("./features/service-marketplace/service-marketplace.module");
const order_module_1 = require("./features/order/order.module");
const payment_module_1 = require("./features/payment/payment.module");
const escrow_module_1 = require("./features/escrow/escrow.module");
const logistics_module_1 = require("./features/logistics/logistics.module");
const moderation_module_1 = require("./features/moderation/moderation.module");
const reputation_module_1 = require("./features/reputation/reputation.module");
const security_module_1 = require("./features/security/security.module");
const governance_module_1 = require("./features/governance/governance.module");
const audit_module_1 = require("./features/audit/audit.module");
const notification_module_1 = require("./features/notification/notification.module");
const search_module_1 = require("./features/search/search.module");
const vendor_module_1 = require("./features/vendor/vendor.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60_000,
                    limit: 100,
                },
            ]),
            database_module_1.DatabaseModule,
            event_bus_module_1.EventBusModule,
            auth_module_1.AuthModule,
            identity_module_1.IdentityModule,
            membership_module_1.MembershipModule,
            content_module_1.ContentModule,
            marketplace_module_1.MarketplaceModule,
            provenance_module_1.ProvenanceModule,
            service_marketplace_module_1.ServiceMarketplaceModule,
            order_module_1.OrderModule,
            payment_module_1.PaymentModule,
            escrow_module_1.EscrowModule,
            logistics_module_1.LogisticsModule,
            moderation_module_1.ModerationModule,
            reputation_module_1.ReputationModule,
            security_module_1.SecurityModule,
            governance_module_1.GovernanceModule,
            audit_module_1.AuditModule,
            notification_module_1.NotificationModule,
            search_module_1.SearchModule,
            vendor_module_1.VendorModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map