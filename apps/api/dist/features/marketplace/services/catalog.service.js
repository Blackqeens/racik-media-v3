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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let CatalogService = class CatalogService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseServiceKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    async listActive(pagination, filters) {
        const page = pagination?.page ? Number(pagination.page) : 1;
        const limit = pagination?.limit ? Number(pagination.limit) : 12;
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('catalog_items')
            .select('*', { count: 'exact' })
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (filters?.category && filters.category !== 'all') {
            query = query.or(`category.eq.${filters.category},item_type.eq.${filters.category}`);
        }
        if (filters?.itemType) {
            query = query.eq('item_type', filters.itemType);
        }
        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        const { data, count, error } = await query;
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memuat katalog: ${error.message}`);
        }
        const items = (data || []).map((item) => ({
            ...item,
            price: Number(item.price_fixed ?? item.price ?? 0),
            stock: item.stock_quantity ?? item.stock ?? 0,
            images: item.images ?? (item.image_url ? [item.image_url] : []),
            category: item.category ?? item.item_type ?? 'bibit',
            vendor: {
                id: item.vendor_id ?? 'racik-official',
                storeName: 'Racik Official Store',
                rating: 5.0,
                isVerified: true,
            },
            createdAt: item.created_at,
        }));
        return {
            data: items,
            total: count || 0,
            page,
            limit,
        };
    }
    async getById(id) {
        const { data: item, error } = await this.supabase
            .from('catalog_items')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal mengambil item: ${error.message}`);
        }
        if (!item) {
            throw new common_1.NotFoundException(`Produk dengan ID '${id}' tidak ditemukan`);
        }
        return {
            ...item,
            price: Number(item.price_fixed ?? item.price ?? 0),
            stock: item.stock_quantity ?? item.stock ?? 0,
            images: item.images ?? (item.image_url ? [item.image_url] : []),
            category: item.category ?? item.item_type ?? 'bibit',
            vendor: {
                id: item.vendor_id ?? 'racik-official',
                storeName: 'Racik Official Store',
                rating: 5.0,
                isVerified: true,
            },
            createdAt: item.created_at,
        };
    }
    async createCatalogItem(userId, tenantId, dto) {
        const anyDto = dto;
        const payload = {
            tenant_id: tenantId || '00000000-0000-0000-0000-000000000001',
            status: 'pending_review',
            item_type: anyDto.item_type || 'retail',
            title: anyDto.title,
            description: anyDto.description,
            category: anyDto.category,
            price_fixed: anyDto.price_fixed,
            stock_quantity: anyDto.stock_quantity ?? 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from('catalog_items')
            .insert([payload])
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal membuat produk: ${error.message}`);
        }
        return data;
    }
    async listByVendor(vendorId, pagination) {
        const page = pagination?.page ? Number(pagination.page) : 1;
        const limit = pagination?.limit ? Number(pagination.limit) : 20;
        const offset = (page - 1) * limit;
        const { data, count, error } = await this.supabase
            .from('catalog_items')
            .select('*', { count: 'exact' })
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memuat produk seller: ${error.message}`);
        }
        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
        };
    }
    async updateCatalogItem(id, userId, tenantId, dto) {
        await this.getById(id);
        const { data, error } = await this.supabase
            .from('catalog_items')
            .update({
            ...dto,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memperbarui produk: ${error.message}`);
        }
        return data;
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map