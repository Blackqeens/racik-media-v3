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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let AppController = class AppController {
    constructor(configService) {
        this.configService = configService;
    }
    getRoot() {
        return {
            status: 'ok',
            service: 'Racik Media V3 API',
            timestamp: new Date().toISOString(),
        };
    }
    async checkHealth() {
        const timestamp = new Date().toISOString();
        let dbStatus = 'checking';
        try {
            const supabaseUrl = this.configService.get('SUPABASE_URL');
            const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
            const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            const { error } = await supabase.from('individual_profiles').select('id').limit(1);
            dbStatus = error ? `degraded: ${error.message}` : 'up';
        }
        catch (err) {
            dbStatus = `down: ${err.message}`;
        }
        return {
            status: dbStatus === 'up' ? 'ok' : 'degraded',
            timestamp,
            services: {
                database: dbStatus,
                api: 'up',
            },
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppController);
//# sourceMappingURL=app.controller.js.map