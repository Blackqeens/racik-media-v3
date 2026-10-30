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
var ReputationProvenanceIndexConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationProvenanceIndexConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const supabase_client_1 = require("../../../core/database/supabase.client");
const search_service_1 = require("../services/search.service");
let ReputationProvenanceIndexConsumer = ReputationProvenanceIndexConsumer_1 = class ReputationProvenanceIndexConsumer {
    constructor(eventBus, searchService, supabase) {
        this.eventBus = eventBus;
        this.searchService = searchService;
        this.supabase = supabase;
        this.logger = new common_1.Logger(ReputationProvenanceIndexConsumer_1.name);
    }
    async onModuleInit() {
        await Promise.all([
            this.subscribeReputationScoreUpdated(),
            this.subscribeProvenanceVerified(),
            this.subscribeProvenanceRejected(),
        ]);
    }
    async subscribeReputationScoreUpdated() {
        await this.eventBus.subscribe('search.queue.reputation-score-updated', 'reputation.score_updated', async (event) => {
            this.logger.debug(`Updating trust scores for user [${event.payload.userId}]`);
            await this.propagateTrustScore(event.payload.userId, event.payload.score);
        });
    }
    async propagateTrustScore(userId, newScore) {
        const { data: catalogs } = await this.supabase.admin
            .from('catalog_items')
            .select('id')
            .eq('vendor_id', userId)
            .eq('status', 'published');
        if (catalogs && catalogs.length > 0) {
            for (const catalog of catalogs) {
                await this.searchService.partialUpdateDocument('catalog_items', catalog.id, {
                    vendor_trust_score: newScore,
                });
            }
            this.logger.debug(`Updated vendor_trust_score for ${catalogs.length} catalog docs (user: ${userId})`);
        }
        const { data: services } = await this.supabase.admin
            .from('service_listings')
            .select('id')
            .eq('provider_id', userId)
            .eq('status', 'published');
        if (services && services.length > 0) {
            for (const service of services) {
                await this.searchService.partialUpdateDocument('service_listings', service.id, {
                    provider_trust_score: newScore,
                });
            }
            this.logger.debug(`Updated provider_trust_score for ${services.length} service docs (user: ${userId})`);
        }
    }
    async subscribeProvenanceVerified() {
        await this.eventBus.subscribe('search.queue.provenance-verified', 'provenance.verified', async (event) => {
            this.logger.debug(`Marking provenance_verified=true for catalog [${event.payload.catalogItemId}]`);
            await this.searchService.partialUpdateDocument('catalog_items', event.payload.catalogItemId, { provenance_verified: true, knowledge_multiplier: 1.5 });
        });
    }
    async subscribeProvenanceRejected() {
        await this.eventBus.subscribe('search.queue.provenance-rejected', 'provenance.rejected', async (event) => {
            this.logger.debug(`Marking provenance_verified=false for catalog [${event.payload.catalogItemId}]`);
            await this.searchService.partialUpdateDocument('catalog_items', event.payload.catalogItemId, { provenance_verified: false, knowledge_multiplier: 1.0 });
        });
    }
};
exports.ReputationProvenanceIndexConsumer = ReputationProvenanceIndexConsumer;
exports.ReputationProvenanceIndexConsumer = ReputationProvenanceIndexConsumer = ReputationProvenanceIndexConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        search_service_1.SearchService,
        supabase_client_1.SupabaseClientService])
], ReputationProvenanceIndexConsumer);
//# sourceMappingURL=reputation-provenance-index.consumer.js.map