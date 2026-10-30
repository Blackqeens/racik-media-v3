"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const governance_service_1 = require("./services/governance.service");
const governance_repository_1 = require("./repositories/governance.repository");
let GovernanceModule = class GovernanceModule {
};
exports.GovernanceModule = GovernanceModule;
exports.GovernanceModule = GovernanceModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        providers: [governance_service_1.GovernanceService, governance_repository_1.GovernanceRepository],
        exports: [governance_service_1.GovernanceService],
    })
], GovernanceModule);
//# sourceMappingURL=governance.module.js.map