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
var SupabaseClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseClientService = SupabaseClientService_1 = class SupabaseClientService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(SupabaseClientService_1.name);
        const url = this.config.getOrThrow('SUPABASE_URL');
        const anonKey = this.config.getOrThrow('SUPABASE_ANON_KEY');
        const serviceRoleKey = this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY');
        this.anon = (0, supabase_js_1.createClient)(url, anonKey);
        this.admin = (0, supabase_js_1.createClient)(url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        this.logger.log('✅ Supabase client siap (anon + admin)');
    }
};
exports.SupabaseClientService = SupabaseClientService;
exports.SupabaseClientService = SupabaseClientService = SupabaseClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseClientService);
//# sourceMappingURL=supabase.client.js.map