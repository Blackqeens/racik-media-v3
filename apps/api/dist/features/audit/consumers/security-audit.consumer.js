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
exports.SecurityAuditConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const audit_writer_service_1 = require("../services/audit-writer.service");
const crypto_1 = require("crypto");
let SecurityAuditConsumer = class SecurityAuditConsumer {
    constructor(eventBus, auditWriter) {
        this.eventBus = eventBus;
        this.auditWriter = auditWriter;
    }
    async onModuleInit() {
        await this.eventBus.subscribe('audit.queue.security-incident-critical', 'security.incident_critical', async (event) => {
            await this.auditWriter.writeSecurityLog(event.tenant_id, (0, crypto_1.randomUUID)(), event.payload['incidentId'], (event.payload['userId'] ?? null), 'incident_detected', event.payload);
        });
    }
};
exports.SecurityAuditConsumer = SecurityAuditConsumer;
exports.SecurityAuditConsumer = SecurityAuditConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService, audit_writer_service_1.AuditWriterService])
], SecurityAuditConsumer);
//# sourceMappingURL=security-audit.consumer.js.map