/**
 * service-listing.service.ts — Service Listing CRUD + event publishing
 * Ref: service-lifecycle.md, event-map.md
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateServiceListingDto } from '../dto/create-service-listing.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

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
      .select('id, title, description, category, delivery_method, base_price, status, provider_id, location_area, created_at', { count: 'exact' })
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
    return { data: data ?? [], total: count ?? 0 };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.admin.from('service_listings').select('*').eq('id', id).maybeSingle();
    if (error || !data) throw new NotFoundException('Service listing not found');
    return data;
  }

  async approveListing(id: string, tenantId: string): Promise<void> {
    const existing = await this.getById(id);
    await this.supabase.admin.from('service_listings').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
    await this.eventBus.publish({ event_name: 'service.approved', tenant_id: tenantId, schema_version: 1, payload: { serviceId: id, providerId: existing.provider_id, approvedAt: new Date().toISOString() } });
  }
}
