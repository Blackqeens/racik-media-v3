import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Injectable()
export class ContentService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * 1. createContent (POST /api/v1/content)
   */
  async createContent(userId: string, tenantId: string, dto: CreateContentDto) {
    const anyDto = dto as any;

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
      throw new InternalServerErrorException(`Gagal membuat konten: ${error.message}`);
    }

    return data;
  }

  /**
   * 2. listPublished (GET /api/v1/content)
   * Support filter: search (q), status, content_type
   */
  async listPublished(pagination: PaginationDto, filters?: {
    search?: string;
    status?: string;
    contentType?: string;
  }) {
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
      throw new InternalServerErrorException(`Gagal memuat artikel: ${error.message}`);
    }

    // Map fields agar cocok dengan interface frontend tanpa tergantung kolom tambahan
    const items = (data || []).map((item: any) => ({
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

  /**
   * 3. getById (GET /api/v1/content/:id)
   */
  async getById(id: string) {
    // Cek apakah parameter berupa UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = this.supabase.from('content_items').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.or(`title.ilike.%${id}%,id.eq.${id}`);
    }

    const { data: item, error } = await query.maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Gagal mengambil konten: ${error.message}`);
    }

    if (!item) {
      throw new NotFoundException(`Konten dengan ID '${id}' tidak ditemukan`);
    }

    return {
      ...item,
      slug: item.slug ?? item.id,
      excerpt: item.excerpt ?? (item.body ? item.body.slice(0, 150) + '...' : ''),
      published_at: item.published_at ?? item.created_at,
      author_name: 'Tim Racik Media',
    };
  }

  /**
   * 4. updateContent (PATCH /api/v1/content/:id)
   */
  async updateContent(id: string, userId: string, dto: UpdateContentDto) {
    const item = await this.getById(id);
    if ((item as any).author_id !== userId) {
      throw new NotFoundException('Konten tidak ditemukan atau bukan milik pengguna ini');
    }
    if (!['draft', 'revision_requested'].includes((item as any).status)) {
      throw new InternalServerErrorException('Konten yang sedang ditinjau tidak dapat diedit');
    }

    const updatePayload = {
      ...(dto as any),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('content_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Gagal memperbarui konten: ${error.message}`);
    }

    return data;
  }

  /**
   * 5. submitForReview (POST /api/v1/content/:id/submit)
   */
  async submitForReview(id: string, userId: string, tenantId: string) {
    const item = await this.getById(id);
    if ((item as any).author_id !== userId) {
      throw new NotFoundException('Konten tidak ditemukan atau bukan milik pengguna ini');
    }
    if (!['draft', 'revision_requested'].includes((item as any).status)) {
      throw new InternalServerErrorException('Konten hanya dapat diajukan dari status draft atau revisi');
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
      throw new InternalServerErrorException(`Gagal mengajukan review konten: ${error.message}`);
    }

    const effectiveTenantId = tenantId || (item as any).tenant_id;
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
        throw new InternalServerErrorException(`Konten masuk review tetapi tiket gagal dibuat: ${ticketError.message}`);
      }
    }

    await this.supabase.from('content_lifecycle_logs').insert({
      tenant_id: effectiveTenantId,
      content_id: id,
      actor_id: userId,
      old_state: (item as any).status,
      new_state: 'under_review',
      rationale_notes: 'Artikel diajukan oleh penulis untuk kurasi moderator',
    });

    return data;
  }
}
