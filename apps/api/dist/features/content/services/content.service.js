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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let ContentService = class ContentService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseServiceKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    async createContent(userId, tenantId, dto) {
        const anyDto = dto;
        const payload = {
            tenant_id: tenantId || '00000000-0000-0000-0000-000000000001',
            author_id: userId,
            status: 'draft',
            content_type: anyDto.content_type || 'article',
            title: anyDto.title,
            slug: anyDto.slug || anyDto.title?.toLowerCase().replace(/\s+/g, '-'),
            excerpt: anyDto.excerpt || anyDto.summary,
            body: anyDto.body || anyDto.content || '',
            category: anyDto.category || 'Panduan Budidaya',
            cover_image: anyDto.coverImage || anyDto.cover_image,
            tags: anyDto.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from('content_items')
            .insert([payload])
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal membuat konten: ${error.message}`);
        }
        return data;
    }
    async listPublished(pagination, filters) {
        const page = pagination?.page ? Number(pagination.page) : 1;
        const limit = pagination?.limit ? Number(pagination.limit) : 9;
        const offset = (page - 1) * limit;
        const statusFilter = filters?.status || 'published';
        let query = this.supabase
            .from('content_items')
            .select('*', { count: 'exact' })
            .eq('status', statusFilter)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (filters?.contentType) {
            query = query.eq('content_type', filters.contentType);
        }
        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        const { data, count, error } = await query;
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memuat artikel: ${error.message}`);
        }
        const items = (data || []).map((item) => ({
            ...item,
            slug: item.slug ?? item.id,
            excerpt: item.excerpt ?? (item.body ? item.body.slice(0, 150) + '...' : ''),
            published_at: item.published_at ?? item.created_at,
            author_name: item.individual_profiles?.full_name ?? 'Tim Racik Media',
        }));
        return {
            data: items,
            total: count || 0,
            page,
            limit,
        };
    }
    async getById(id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = this.supabase.from('content_items').select('*');
        if (isUuid) {
            query = query.eq('id', id);
        }
        else {
            query = query.or(`title.ilike.%${id}%,id.eq.${id}`);
        }
        const { data: item, error } = await query.maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal mengambil konten: ${error.message}`);
        }
        if (!item) {
            throw new common_1.NotFoundException(`Konten dengan ID '${id}' tidak ditemukan`);
        }
        return {
            ...item,
            slug: item.slug ?? item.id,
            excerpt: item.excerpt ?? (item.body ? item.body.slice(0, 150) + '...' : ''),
            published_at: item.published_at ?? item.created_at,
            author_name: 'Tim Racik Media',
        };
    }
    async updateContent(id, userId, dto) {
        const item = await this.getById(id);
        if (item.author_id !== userId) {
            throw new common_1.NotFoundException('Konten tidak ditemukan atau bukan milik pengguna ini');
        }
        if (!['draft', 'revision_requested'].includes(item.status)) {
            throw new common_1.InternalServerErrorException('Konten yang sedang ditinjau tidak dapat diedit');
        }
        const updatePayload = {
            ...dto,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from('content_items')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memperbarui konten: ${error.message}`);
        }
        return data;
    }
    async submitForReview(id, userId, tenantId) {
        const item = await this.getById(id);
        if (item.author_id !== userId) {
            throw new common_1.NotFoundException('Konten tidak ditemukan atau bukan milik pengguna ini');
        }
        if (!['draft', 'revision_requested'].includes(item.status)) {
            throw new common_1.InternalServerErrorException('Konten hanya dapat diajukan dari status draft atau revisi');
        }
        const { data, error } = await this.supabase
            .from('content_items')
            .update({
            status: 'under_review',
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal mengajukan review konten: ${error.message}`);
        }
        const effectiveTenantId = tenantId || item.tenant_id;
        const { data: existingTicket } = await this.supabase
            .from('moderation_tickets')
            .select('id')
            .eq('entity_type', 'content_item')
            .eq('entity_id', id)
            .in('status', ['pending', 'assigned', 'under_panel_review'])
            .maybeSingle();
        if (!existingTicket) {
            const { error: ticketError } = await this.supabase
                .from('moderation_tickets')
                .insert({
                tenant_id: effectiveTenantId,
                entity_type: 'content_item',
                entity_id: id,
                queue_type: 'knowledge_queue',
                severity: 'standard',
                status: 'pending',
                sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            });
            if (ticketError) {
                throw new common_1.InternalServerErrorException(`Konten masuk review tetapi tiket gagal dibuat: ${ticketError.message}`);
            }
        }
        await this.supabase.from('content_lifecycle_logs').insert({
            tenant_id: effectiveTenantId,
            content_id: id,
            actor_id: userId,
            old_state: item.status,
            new_state: 'under_review',
            rationale_notes: 'Artikel diajukan oleh penulis untuk kurasi moderator',
        });
        return data;
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ContentService);
//# sourceMappingURL=content.service.js.map