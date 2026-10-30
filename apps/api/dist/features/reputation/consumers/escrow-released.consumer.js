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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowReleasedConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const reputation_service_1 = require("../services/reputation.service");
let EscrowReleasedConsumer = class EscrowReleasedConsumer {
    constructor(eventBus, reputationService) {
        this.eventBus = eventBus;
        this.reputationService = reputationService;
    }
    async onModuleInit() {
        await this.eventBus.subscribe('reputation.queue.escrow-released', 'escrow.milestone_released', async (event) => {
            await this.reputationService.applyScoreDelta(event.payload.vendorId, 'order_fulfilled', event.event_id, 'escrow', event.tenant_id);
        });
    }
};
exports.EscrowReleasedConsumer = EscrowReleasedConsumer;
exports.EscrowReleasedConsumer = EscrowReleasedConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService, reputation_service_1.ReputationService])
], EscrowReleasedConsumer);
//# sourceMappingURL=escrow-released.consumer.js.map