"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const search_service_1 = require("./services/search.service");
const search_controller_1 = require("./controllers/search.controller");
const content_index_consumer_1 = require("./consumers/content-index.consumer");
const catalog_index_consumer_1 = require("./consumers/catalog-index.consumer");
const reputation_provenance_index_consumer_1 = require("./consumers/reputation-provenance-index.consumer");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            event_bus_module_1.EventBusModule,
        ],
        controllers: [
            search_controller_1.SearchController,
        ],
        providers: [
            search_service_1.SearchService,
            content_index_consumer_1.ContentIndexConsumer,
            catalog_index_consumer_1.CatalogIndexConsumer,
            reputation_provenance_index_consumer_1.ReputationProvenanceIndexConsumer,
        ],
        exports: [
            search_service_1.SearchService,
        ],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map