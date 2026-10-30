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
var CatalogIndexConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogIndexConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const supabase_client_1 = require("../../../core/database/supabase.client");
const search_service_1 = require("../services/search.service");
let CatalogIndexConsumer = CatalogIndexConsumer_1 = class CatalogIndexConsumer {
    constructor(eventBus, searchService, supabase) {
        this.eventBus = eventBus;
        this.searchService = searchService;
        this.supabase = supabase;
        this.logger = new common_1.Logger(CatalogIndexConsumer_1.name);
    }
    async onModuleInit() {
        await Promise.all([
            this.subscribeCatalogApproved(),
            this.subscribeCatalogUpdated(),
            this.subscribeCatalogArchived(),
            this.subscribeCatalogDelisted(),
            this.subscribeServiceApproved(),
            this.subscribeServiceUpdated(),
        ]);
    }
    async subscribeCatalogApproved() {
        await this.eventBus.subscribe('search.queue.catalog-approved', 'catalog.approved', async (event) => {
            this.logger.debug(`Indexing catalog.approved [${event.event_id}]`);
            await this.upsertCatalogDocument(event.payload.catalogItemId);
        });
    }
    async subscribeCatalogUpdated() {
        await this.eventBus.subscribe('search.queue.catalog-updated', 'catalog.updated', async (event) => {
            this.logger.debug(`Re-indexing catalog.updated [${event.event_id}]`);
            await this.upsertCatalogDocument(event.payload.catalogItemId);
        });
    }
    async subscribeCatalogArchived() {
        await this.eventBus.subscribe('search.queue.catalog-archived', 'catalog.archived', async (event) => {
            this.logger.debug(`Removing archived catalog [${event.event_id}]`);
            await this.searchService.deleteDocument('catalog_items', event.payload.catalogItemId);
        });
    }
    async subscribeCatalogDelisted() {
        await this.eventBus.subscribe('search.queue.catalog-delisted', 'catalog.delisted', async (event) => {
            this.logger.debug(`Removing delisted catalog [${event.event_id}]`);
            await this.searchService.deleteDocument('catalog_items', event.payload.catalogItemId);
        });
    }
    async subscribeServiceApproved() {
        await this.eventBus.subscribe('search.queue.service-approved', 'service.approved', async (event) => {
            this.logger.debug(`Indexing service.approved [${event.event_id}]`);
            await this.upsertServiceDocument(event.payload.serviceId);
        });
    }
    async subscribeServiceUpdated() {
        await this.eventBus.subscribe('search.queue.service-updated', 'service.updated', async (event) => {
            this.logger.debug(`Re-indexing service.updated [${event.event_id}]`);
            await this.upsertServiceDocument(event.payload.serviceId);
        });
    }
    async upsertCatalogDocument(catalogItemId) {
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
        const vendor = data.vendor;
        const provenance = data.provenance;
        const doc = {
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
            knowledge_multiplier: 1.0,
            image_url: data.image_url ?? undefined,
            tags: data.tags ?? [],
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
        await this.searchService.upsertDocument('catalog_items', doc);
    }
    async upsertServiceDocument(serviceId) {
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
        const provider = data.provider;
        const trustScore = provider?.trust_score?.[0]?.total_score ?? 0;
        const doc = {
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
};
exports.CatalogIndexConsumer = CatalogIndexConsumer;
exports.CatalogIndexConsumer = CatalogIndexConsumer = CatalogIndexConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        search_service_1.SearchService,
        supabase_client_1.SupabaseClientService])
], CatalogIndexConsumer);
//# sourceMappingURL=catalog-index.consumer.js.map