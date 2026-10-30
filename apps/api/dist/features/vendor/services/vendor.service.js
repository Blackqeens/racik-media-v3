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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let VendorService = class VendorService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseServiceKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    async registerVendor(userId, tenantId, dto) {
        const existing = await this.getVendorByUserId(userId);
        if (existing) {
            throw new common_1.BadRequestException('User ini sudah terdaftar sebagai pemilik toko');
        }
        const orgPayload = {
            tenant_id: tenantId || '00000000-0000-0000-0000-000000000001',
            trade_name: dto.storeName,
            legal_name: dto.legalName || dto.storeName,
            business_type: dto.businessType || 'perorangan',
            phone: dto.phone,
            email: dto.email,
            address_line1: dto.address,
            city: dto.city || 'Bandung',
            province: dto.province || 'Jawa Barat',
            description: dto.description,
            status: 'pending_verification',
            rating: 5.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data: organization, error: orgError } = await this.supabase
            .from('organization_profiles')
            .insert([orgPayload])
            .select()
            .single();
        if (orgError) {
            throw new common_1.InternalServerErrorException(`Gagal membuat profil toko: ${orgError.message}`);
        }
        const repPayload = {
            organization_id: organization.id,
            user_id: userId,
            role: 'owner',
            is_primary: true,
            created_at: new Date().toISOString(),
        };
        const { error: repError } = await this.supabase
            .from('organization_representatives')
            .insert([repPayload]);
        if (repError) {
            throw new common_1.InternalServerErrorException(`Gagal mengaitkan pemilik toko: ${repError.message}`);
        }
        return {
            message: 'Pendaftaran toko berhasil diajukan',
            vendor: organization,
        };
    }
    async getById(id) {
        const { data: vendor, error } = await this.supabase
            .from('organization_profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal mengambil profil toko: ${error.message}`);
        }
        if (!vendor) {
            throw new common_1.NotFoundException(`Toko dengan ID '${id}' tidak ditemukan`);
        }
        return vendor;
    }
    async getVendorByUserId(userId) {
        const { data: rep, error: repError } = await this.supabase
            .from('organization_representatives')
            .select('organization_id, role, organization_profiles(*)')
            .eq('user_id', userId)
            .maybeSingle();
        if (repError || !rep) {
            return null;
        }
        return rep.organization_profiles;
    }
    async getSellerDashboard(userId) {
        const vendor = await this.getVendorByUserId(userId);
        if (!vendor) {
            throw new common_1.NotFoundException('Anda belum memiliki profil toko');
        }
        const { count: totalProducts } = await this.supabase
            .from('catalog_items')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', vendor.id);
        const { count: totalOrders } = await this.supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', vendor.id);
        return {
            store: {
                id: vendor.id,
                name: vendor.trade_name,
                legalName: vendor.legal_name,
                status: vendor.status,
                rating: vendor.rating || 5.0,
            },
            stats: {
                totalProducts: totalProducts || 0,
                totalOrders: totalOrders || 0,
                revenueEstimate: 0,
                pendingOrders: 0,
            },
        };
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map