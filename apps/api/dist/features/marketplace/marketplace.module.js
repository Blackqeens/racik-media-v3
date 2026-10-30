"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const marketplace_controller_1 = require("./controllers/marketplace.controller");
const catalog_service_1 = require("./services/catalog.service");
const price_anomaly_service_1 = require("./services/price-anomaly.service");
const catalog_repository_1 = require("./repositories/catalog.repository");
let MarketplaceModule = class MarketplaceModule {
};
exports.MarketplaceModule = MarketplaceModule;
exports.MarketplaceModule = MarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        controllers: [marketplace_controller_1.MarketplaceController],
        providers: [catalog_service_1.CatalogService, price_anomaly_service_1.PriceAnomalyService, catalog_repository_1.CatalogRepository],
        exports: [catalog_service_1.CatalogService, price_anomaly_service_1.PriceAnomalyService],
    })
], MarketplaceModule);
//# sourceMappingURL=marketplace.module.js.map