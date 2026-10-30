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
var ContentIndexConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentIndexConsumer = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const supabase_client_1 = require("../../../core/database/supabase.client");
const search_service_1 = require("../services/search.service");
let ContentIndexConsumer = ContentIndexConsumer_1 = class ContentIndexConsumer {
    constructor(eventBus, searchService, supabase) {
        this.eventBus = eventBus;
        this.searchService = searchService;
        this.supabase = supabase;
        this.logger = new common_1.Logger(ContentIndexConsumer_1.name);
    }
    async onModuleInit() {
        await this.subscribeContentPublished();
        await this.subscribeContentUpdated();
    }
    async subscribeContentPublished() {
        await this.eventBus.subscribe('search.queue.content-published', 'content.published', async (event) => {
            this.logger.debug(`Indexing content.published [${event.event_id}]`);
            await this.upsertContentDocument(event.payload.contentId);
        });
    }
    async subscribeContentUpdated() {
        await this.eventBus.subscribe('search.queue.content-updated', 'content.updated', async (event) => {
            this.logger.debug(`Re-indexing content.updated [${event.event_id}]`);
            await this.upsertContentDocument(event.payload.contentId);
        });
    }
    async upsertContentDocument(contentId) {
        const { data, error } = await this.supabase.admin
            .from('content_items')
            .select('id, title, summary, content_type, author_id, category, tags, published_at, updated_at, author:users(display_name)')
            .eq('id', contentId)
            .eq('status', 'published')
            .maybeSingle();
        if (error || !data) {
            this.logger.warn(`Content [${contentId}] not found or not published — skip index`);
            return;
        }
        const authorData = data.author;
        const doc = {
            id: data.id,
            index_type: 'content',
            title: data.title,
            summary: data.summary ?? '',
            content_type: data.content_type,
            author_id: data.author_id,
            author_name: authorData?.display_name ?? '',
            category: data.category ?? '',
            tags: data.tags ?? [],
            published_at: data.published_at,
            updated_at: data.updated_at,
        };
        await this.searchService.upsertDocument('content_items', doc);
    }
};
exports.ContentIndexConsumer = ContentIndexConsumer;
exports.ContentIndexConsumer = ContentIndexConsumer = ContentIndexConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        search_service_1.SearchService,
        supabase_client_1.SupabaseClientService])
], ContentIndexConsumer);
//# sourceMappingURL=content-index.consumer.js.map