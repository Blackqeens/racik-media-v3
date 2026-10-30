/**
 * provenance.service.ts — Provenance Domain Service
 * Manages catalog item origin stories. Publishes provenance.verified / provenance.rejected.
 * Ref: marketplace-lifecycle.md §3.1, event-map.md
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateProvenanceDto } from '../dto/create-provenance.dto';

@Injectable()
export class ProvenanceService {
  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async createProvenance(dto: CreateProvenanceDto, tenantId: string) {
    const { data, error } = await this.supabase.admin
      .from('catalog_provenances')
      .insert({ catalog_item_id: dto.catalog_item_id, producer_origin: dto.producer_origin, production_method: dto.production_method, regional_heritage_story: dto.regional_heritage_story, cultural_attribution_meta: dto.cultural_attribution_meta ?? {}, tenant_id: tenantId })
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getByItemId(catalogItemId: string) {
    const { data } = await this.supabase.admin.from('catalog_provenances').select('*').eq('catalog_item_id', catalogItemId).maybeSingle();
    if (!data) throw new NotFoundException('Provenance not found');
    return data;
  }

  async verifyProvenance(provenanceId: string, catalogItemId: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('catalog_provenances').update({ validation_status: 'verified', verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', provenanceId);
    await this.eventBus.publish({ event_name: 'provenance.verified', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, provenanceId, verifiedAt: new Date().toISOString() } });
  }

  async rejectProvenance(provenanceId: string, catalogItemId: string, reasonCode: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('catalog_provenances').update({ validation_status: 'rejected', updated_at: new Date().toISOString() }).eq('id', provenanceId);
    await this.eventBus.publish({ event_name: 'provenance.rejected', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, provenanceId, reasonCode } });
  }
}
