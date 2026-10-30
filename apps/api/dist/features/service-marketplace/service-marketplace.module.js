"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceMarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const service_marketplace_controller_1 = require("./controllers/service-marketplace.controller");
const service_listing_service_1 = require("./services/service-listing.service");
const milestone_service_1 = require("./services/milestone.service");
let ServiceMarketplaceModule = class ServiceMarketplaceModule {
};
exports.ServiceMarketplaceModule = ServiceMarketplaceModule;
exports.ServiceMarketplaceModule = ServiceMarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        controllers: [service_marketplace_controller_1.ServiceMarketplaceController],
        providers: [service_listing_service_1.ServiceListingService, milestone_service_1.MilestoneService],
        exports: [service_listing_service_1.ServiceListingService, milestone_service_1.MilestoneService],
    })
], ServiceMarketplaceModule);
//# sourceMappingURL=service-marketplace.module.js.map