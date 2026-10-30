/**
 * catalog-index.consumer.ts — Consumer untuk indexing katalog & jasa ke Meilisearch
 *
 * Mendengarkan event Marketplace dan Service-Marketplace yang berdampak pada search index.
 *
 * Event yang ditangani (dari event-map.md — consumer: Search):
 *   Marketplace:
 *     - catalog.approved  → upsert ke catalog_items index
 *     - catalog.updated   → upsert ulang (refresh)
 *     - catalog.archived  → hapus dari index
 *     - catalog.delisted  → hapus dari index
 *   Service-Marketplace:
 *     - service.approved  → upsert ke service_listings index
 *     - service.updated   → upsert ulang (refresh)
 *
 * Ref: event-map.md §B, search-architecture.md §B
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { SearchService } from '../services/search.service';
import { CatalogIndexDocument, ServiceIndexDocument } from '../dto/index-document.dto';

interface CatalogApprovedPayload { catalogItemId: string; vendorId: string; approvedAt: string; }
interface CatalogUpdatedPayload  { catalogItemId: string; vendorId: string; changeType: string; }
interface CatalogRemovedPayload  { catalogItemId: string; vendorId: string; reasonCode: string; }
interface ServiceApprovedPayload { serviceId: string; providerId: string; approvedAt: string; }
interface ServiceUpdatedPayload  { serviceId: string; providerId: string; changeType: string; }

@Injectable()
export class CatalogIndexConsumer implements OnModuleInit {
  private readonly logger = new Logger(CatalogIndexConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly searchService: SearchService,
    private readonly supabase: SupabaseClientService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.subscribeCatalogApproved(),
      this.subscribeCatalogUpdated(),
      this.subscribeCatalogArchived(),
      this.subscribeCatalogDelisted(),
      this.subscribeServiceApproved(),
      this.subscribeServiceUpdated(),
    ]);
  }

  // ─── Catalog (Marketplace) ────────────────────────────────────────────────

  private async subscribeCatalogApproved(): Promise<void> {
    await this.eventBus.subscribe<CatalogApprovedPayload>(
      'search.queue.catalog-approved',
      'catalog.approved',
      async (event: DomainEvent<CatalogApprovedPayload>) => {
        this.logger.debug(`Indexing catalog.approved [${event.event_id}]`);
        await this.upsertCatalogDocument(event.payload.catalogItemId);
      },
    );
  }

  private async subscribeCatalogUpdated(): Promise<void> {
    await this.eventBus.subscribe<CatalogUpdatedPayload>(
      'search.queue.catalog-updated',
      'catalog.updated',
      async (event: DomainEvent<CatalogUpdatedPayload>) => {
        this.logger.debug(`Re-indexing catalog.updated [${event.event_id}]`);
        await this.upsertCatalogDocument(event.payload.catalogItemId);
      },
    );
  }

  private async subscribeCatalogArchived(): Promise<void> {
    await this.eventBus.subscribe<CatalogRemovedPayload>(
      'search.queue.catalog-archived',
      'catalog.archived',
      async (event: DomainEvent<CatalogRemovedPayload>) => {
        this.logger.debug(`Removing archived catalog [${event.event_id}]`);
        await this.searchService.deleteDocument('catalog_items', event.payload.catalogItemId);
      },
    );
  }

  private async subscribeCatalogDelisted(): Promise<void> {
    await this.eventBus.subscribe<CatalogRemovedPayload>(
      'search.queue.catalog-delisted',
      'catalog.delisted',
      async (event: DomainEvent<CatalogRemovedPayload>) => {
        this.logger.debug(`Removing delisted catalog [${event.event_id}]`);
        await this.searchService.deleteDocument('catalog_items', event.payload.catalogItemId);
      },
    );
  }

  // ─── Service (Service-Marketplace) ───────────────────────────────────────

  private async subscribeServiceApproved(): Promise<void> {
    await this.eventBus.subscribe<ServiceApprovedPayload>(
      'search.queue.service-approved',
      'service.approved',
      async (event: DomainEvent<ServiceApprovedPayload>) => {
        this.logger.debug(`Indexing service.approved [${event.event_id}]`);
        await this.upsertServiceDocument(event.payload.serviceId);
      },
    );
  }

  private async subscribeServiceUpdated(): Promise<void> {
    await this.eventBus.subscribe<ServiceUpdatedPayload>(
      'search.queue.service-updated',
      'service.updated',
      async (event: DomainEvent<ServiceUpdatedPayload>) => {
        this.logger.debug(`Re-indexing service.updated [${event.event_id}]`);
        await this.upsertServiceDocument(event.payload.serviceId);
      },
    );
  }

  // ─── Fetch & Index Helpers ────────────────────────────────────────────────

  private async upsertCatalogDocument(catalogItemId: string): Promise<void> {
    const { data, error } = await this.supabase.admin
      .from('catalog_items')
      .select(`
        id, title, description, category, vendor_id, price_min, price_max,
        is_available, image_url, tags, created_at, updated_at,
        vendor:vendor_profiles(name, trust_score),
        provenance:catalog_provenances(is_verified)
      `)
      .eq('id', catalogItemId)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) {
      this.logger.warn(`Catalog [${catalogItemId}] not found or not published — skip index`);
      return;
    }

    const vendor = data.vendor as { name?: string; trust_score?: number } | null;
    const provenance = data.provenance as { is_verified?: boolean } | null;

    const doc: CatalogIndexDocument = {
      id: data.id,
      index_type: 'catalog',
      title: data.title,
      description: data.description ?? '',
      category: data.category ?? '',
      vendor_id: data.vendor_id,
      vendor_name: vendor?.name ?? '',
      price_min: data.price_min ?? 0,
      price_max: data.price_max ?? 0,
      is_available: data.is_available ?? true,
      provenance_verified: provenance?.is_verified ?? false,
      vendor_trust_score: vendor?.trust_score ?? 0,
      knowledge_multiplier: 1.0, // akan diperbarui oleh reputation consumer
      image_url: data.image_url ?? undefined,
      tags: data.tags ?? [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    await this.searchService.upsertDocument('catalog_items', doc);
  }

  private async upsertServiceDocument(serviceId: string): Promise<void> {
    const { data, error } = await this.supabase.admin
      .from('service_listings')
      .select(`
        id, title, description, category, provider_id, price_min, price_max,
        is_available, service_type, base_lat, base_lng, operation_radius_km,
        image_url, tags, created_at, updated_at,
        provider:users(display_name, trust_score:core_reputations(total_score))
      `)
      .eq('id', serviceId)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) {
      this.logger.warn(`Service [${serviceId}] not found or not published — skip index`);
      return;
    }

    const provider = data.provider as { display_name?: string; trust_score?: { total_score?: number }[] } | null;
    const trustScore = provider?.trust_score?.[0]?.total_score ?? 0;

    const doc: ServiceIndexDocument = {
      id: data.id,
      index_type: 'service',
      title: data.title,
      description: data.description ?? '',
      category: data.category ?? '',
      provider_id: data.provider_id,
      provider_name: provider?.display_name ?? '',
      price_min: data.price_min ?? 0,
      price_max: data.price_max ?? 0,
      is_available: data.is_available ?? true,
      service_type: data.service_type ?? 'remote',
      base_lat: data.base_lat ?? undefined,
      base_lng: data.base_lng ?? undefined,
      operation_radius_km: data.operation_radius_km ?? undefined,
      provider_trust_score: trustScore,
      image_url: data.image_url ?? undefined,
      tags: data.tags ?? [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    await this.searchService.upsertDocument('service_listings', doc);
  }
}
