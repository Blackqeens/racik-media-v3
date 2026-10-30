/**
 * catalog.service.ts — Marketplace Catalog Domain Service
 * Ref: domain-map.md §2.3, marketplace-lifecycle.md
 */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCatalogDto } from '../dto/create-catalog.dto';
import { UpdateCatalogDto } from '../dto/update-catalog.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Injectable()
export class CatalogService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * 1. listActive — GET /marketplace
   * Mengambil daftar produk/layanan yang aktif & sudah di-approve
   */
  async listActive(pagination: PaginationDto, filters?: {
    category?: string;
    itemType?: string;
    search?: string;
  }) {
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
      // jika ada kolom category atau fallback ke item_type
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
      throw new InternalServerErrorException(`Gagal memuat katalog: ${error.message}`);
    }

    const items = (data || []).map((item: any) => ({
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

  /**
   * 2. getById — GET /marketplace/:id
   * Mengambil detail produk berdasarkan ID
   */
  async getById(id: string) {
    const { data: item, error } = await this.supabase
      .from('catalog_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Gagal mengambil item: ${error.message}`);
    }
    if (!item) {
      throw new NotFoundException(`Produk dengan ID '${id}' tidak ditemukan`);
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

  /**
   * 3. createCatalogItem — POST /marketplace
   * Seller menambahkan produk baru (status: pending_review)
   */
  async createCatalogItem(userId: string, tenantId: string, dto: CreateCatalogDto) {
    const anyDto = dto as any;

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
      throw new InternalServerErrorException(`Gagal membuat produk: ${error.message}`);
    }

    return data;
  }

  async listByVendor(vendorId: string, pagination: PaginationDto) {
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
      throw new InternalServerErrorException(`Gagal memuat produk seller: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * 4. updateCatalogItem — PATCH /marketplace/:id
   * Seller mengupdate data produk (userId & tenantId untuk audit log future use)
   */
  async updateCatalogItem(id: string, userId: string, tenantId: string, dto: UpdateCatalogDto) {
    await this.getById(id); // validasi item ada

    const { data, error } = await this.supabase
      .from('catalog_items')
      .update({
        ...(dto as any),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Gagal memperbarui produk: ${error.message}`);
    }

    return data;
  }
}
