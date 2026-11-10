/**
 * service-listing.service.ts — Service Listing CRUD + event publishing
 * Ref: service-lifecycle.md, event-map.md
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateServiceListingDto } from '../dto/create-service-listing.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

interface ServiceListingRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  delivery_method: string;
  base_price: number | string;
  status: string;
  provider_id: string;
  location_area: string;
  price_unit: string;
  cover_image: string | null;
  has_milestones: boolean;
  duration_estimate: string | null;
  created_at: string;
}

interface ProviderProfile {
  full_name: string;
  bio: string | null;
}

@Injectable()
export class ServiceListingService {
  constructor(private readonly supabase: SupabaseClientService, private readonly eventBus: EventBusService) {}

  async createListing(providerId: string, tenantId: string, dto: CreateServiceListingDto) {
    const { data, error } = await this.supabase.admin
      .from('service_listings')
      .insert({ provider_id: providerId, tenant_id: tenantId, title: dto.title, description: dto.description, delivery_method: dto.delivery_method, base_price: dto.base_price, status: 'under_review' })
      .select().single();
    if (error) throw new Error(error.message);
    await this.eventBus.publish({ event_name: 'service.submitted', tenant_id: tenantId, schema_version: 1, payload: { serviceId: data.id, providerId } });
    return data;
  }

  async listActive(pagination: PaginationDto, filters?: {
    search?: string;
    category?: string;
  }) {
    let query = this.supabase.admin
      .from('service_listings')
      .select('id, title, description, category, delivery_method, base_price, status, provider_id, location_area, price_unit, cover_image, has_milestones, duration_estimate, created_at', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const listings = (data ?? []) as ServiceListingRecord[];
    const providerIds = Array.from(new Set(listings.map((listing) => listing.provider_id)));
    const { data: profiles, error: profilesError } = providerIds.length
      ? await this.supabase.admin
          .from('individual_profiles')
          .select('user_id, full_name, bio')
          .in('user_id', providerIds)
      : { data: [], error: null };
    if (profilesError) throw new Error(profilesError.message);

    const profilesByUserId = new Map<string, ProviderProfile>(
      (profiles ?? []).map((profile) => [
        profile.user_id,
        { full_name: profile.full_name, bio: profile.bio },
      ]),
    );

    return {
      data: listings.map((listing) =>
        this.toPublicListing(listing, profilesByUserId.get(listing.provider_id)),
      ),
      total: count ?? 0,
    };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.admin.from('service_listings').select('*').eq('id', id).maybeSingle();
    if (error || !data) throw new NotFoundException('Service listing not found');

    const { data: profile, error: profileError } = await this.supabase.admin
      .from('individual_profiles')
      .select('user_id, full_name, bio')
      .eq('user_id', data.provider_id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    return this.toPublicListing(data as ServiceListingRecord, profile ?? undefined);
  }

  async approveListing(id: string, tenantId: string): Promise<void> {
    const existing = await this.getById(id);
    await this.supabase.admin.from('service_listings').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
    await this.eventBus.publish({ event_name: 'service.approved', tenant_id: tenantId, schema_version: 1, payload: { serviceId: id, providerId: existing.provider_id, approvedAt: new Date().toISOString() } });
  }

  private toPublicListing(listing: ServiceListingRecord, profile?: ProviderProfile) {
    return {
      ...listing,
      priceStartingFrom: Number(listing.base_price),
      priceUnit: listing.price_unit,
      coverImage: listing.cover_image ?? undefined,
      locationArea: listing.location_area,
      durationEstimate: listing.duration_estimate ?? undefined,
      maxRevisions: 3,
      provider: {
        id: listing.provider_id,
        name: profile?.full_name ?? 'Praktisi Agribisnis',
        titleExpertise: listing.category,
        rating: 5,
        completedProjects: 0,
        bio: profile?.bio ?? undefined,
        isVerified: false,
      },
      createdAt: listing.created_at,
    };
  }
}
