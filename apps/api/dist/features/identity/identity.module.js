"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../core/database/database.module");
const event_bus_module_1 = require("../../core/events/event-bus.module");
const user_controller_1 = require("./controllers/user.controller");
const verification_controller_1 = require("./controllers/verification.controller");
const auth_pages_controller_1 = require("./controllers/auth-pages.controller");
const user_service_1 = require("./services/user.service");
const role_service_1 = require("./services/role.service");
const verification_service_1 = require("./services/verification.service");
const user_repository_1 = require("./repositories/user.repository");
const verification_repository_1 = require("./repositories/verification.repository");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, event_bus_module_1.EventBusModule],
        controllers: [user_controller_1.UserController, verification_controller_1.VerificationController, auth_pages_controller_1.AuthPagesController],
        providers: [user_service_1.UserService, role_service_1.RoleService, verification_service_1.VerificationService, user_repository_1.UserRepository, verification_repository_1.VerificationRepository],
        exports: [user_service_1.UserService, role_service_1.RoleService, verification_service_1.VerificationService],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map