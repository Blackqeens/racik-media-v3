"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const reputation_service_1 = require("./services/reputation.service");
const content_published_consumer_1 = require("./consumers/content-published.consumer");
const escrow_released_consumer_1 = require("./consumers/escrow-released.consumer");
let ReputationModule = class ReputationModule {
};
exports.ReputationModule = ReputationModule;
exports.ReputationModule = ReputationModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        providers: [reputation_service_1.ReputationService, content_published_consumer_1.ContentPublishedConsumer, escrow_released_consumer_1.EscrowReleasedConsumer],
        exports: [reputation_service_1.ReputationService],
    })
], ReputationModule);
//# sourceMappingURL=reputation.module.js.map