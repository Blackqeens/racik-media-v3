/**
 * vendor.service.ts — Vendor Domain Service
 * Ref: vendor-architecture.md, domain-map.md §2.4
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisterVendorDto } from '../dto/register-vendor.dto';

@Injectable()
export class VendorService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Pendaftaran Toko / Vendor Baru
   */
  async registerVendor(userId: string, tenantId: string, dto: RegisterVendorDto) {
    // 1. Cek apakah user sudah memiliki toko
    const existing = await this.getVendorByUserId(userId);
    if (existing) {
      throw new BadRequestException('User ini sudah terdaftar sebagai pemilik toko');
    }

    // 2. Simpan data toko ke tabel organization_profiles
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
      throw new InternalServerErrorException(`Gagal membuat profil toko: ${orgError.message}`);
    }

    // 3. Hubungkan user sebagai owner di tabel organization_representatives
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
      throw new InternalServerErrorException(`Gagal mengaitkan pemilik toko: ${repError.message}`);
    }

    return {
      message: 'Pendaftaran toko berhasil diajukan',
      vendor: organization,
    };
  }

  /**
   * Mengambil data toko berdasarkan ID toko (organization_profiles.id)
   * Dipakai oleh: GET /api/v1/vendors/:id (publik)
   */
  async getById(id: string) {
    const { data: vendor, error } = await this.supabase
      .from('organization_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Gagal mengambil profil toko: ${error.message}`);
    }
    if (!vendor) {
      throw new NotFoundException(`Toko dengan ID '${id}' tidak ditemukan`);
    }

    return vendor;
  }

  /**
   * Mengambil data toko yang dimiliki oleh user
   */
  async getVendorByUserId(userId: string) {
    const { data: rep, error: repError } = await this.supabase
      .from('organization_representatives')
      .select('organization_id, role, organization_profiles(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (repError || !rep) {
      return null;
    }

    return (rep as any).organization_profiles;
  }

  /**
   * Mengambil ringkasan statistik Dashboard Seller / Expert
   */
  async getSellerDashboard(userId: string) {
    const vendor = await this.getVendorByUserId(userId);
    if (!vendor) {
      throw new NotFoundException('Anda belum memiliki profil toko');
    }

    // Hitung total produk aktif
    const { count: totalProducts } = await this.supabase
      .from('catalog_items')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', vendor.id);

    // Hitung total pesanan masuk
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
}
