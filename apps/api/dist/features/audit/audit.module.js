"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const audit_writer_service_1 = require("./services/audit-writer.service");
const identity_audit_consumer_1 = require("./consumers/identity-audit.consumer");
const financial_audit_consumer_1 = require("./consumers/financial-audit.consumer");
const moderation_audit_consumer_1 = require("./consumers/moderation-audit.consumer");
const security_audit_consumer_1 = require("./consumers/security-audit.consumer");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        providers: [audit_writer_service_1.AuditWriterService, identity_audit_consumer_1.IdentityAuditConsumer, financial_audit_consumer_1.FinancialAuditConsumer, moderation_audit_consumer_1.ModerationAuditConsumer, security_audit_consumer_1.SecurityAuditConsumer],
        exports: [audit_writer_service_1.AuditWriterService],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map