"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_guard_1 = require("./jwt.guard");
const roles_guard_1 = require("./roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.getOrThrow('SUPABASE_JWT_SECRET'),
                    signOptions: {
                        expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRES', '15m'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [jwt_strategy_1.JwtStrategy, jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
        exports: [jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, jwt_1.JwtModule, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map