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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const meilisearch_1 = require("meilisearch");
const redis_1 = require("redis");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const INDEX_NAMES = {
    catalog: 'catalog_items',
    service: 'service_listings',
    content: 'content_items',
    vendor: 'vendor_profiles',
};
const CACHE_TTL_SECONDS = 600;
let SearchService = SearchService_1 = class SearchService {
    constructor(config, eventBus) {
        this.config = config;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async onModuleInit() {
        this.meili = new meilisearch_1.MeiliSearch({
            host: this.config.getOrThrow('MEILISEARCH_URL'),
            apiKey: this.config.getOrThrow('MEILISEARCH_MASTER_KEY'),
        });
        const redisUrl = this.config.getOrThrow('REDIS_URL');
        const redisPassword = this.config.get('REDIS_PASSWORD');
        let fullRedisUrl = redisUrl;
        if (redisPassword && !redisUrl.includes('@')) {
            fullRedisUrl = redisUrl.replace(/^(rediss?:\/\/)/, `$1:${redisPassword}@`);
        }
        const reconnectStrategy = (retries) => {
            if (retries > 10) {
                this.logger.error('❌ Redis: terlalu banyak percobaan reconnect, menyerah');
                return new Error('Redis max retries reached');
            }
            const delay = Math.min(retries * 500, 30_000);
            this.logger.warn(`⚠️ Redis reconnect attempt #${retries} dalam ${delay}ms`);
            return delay;
        };
        const isTls = fullRedisUrl.startsWith('rediss://');
        this.redis = (0, redis_1.createClient)({
            url: fullRedisUrl,
            socket: isTls
                ? { tls: true, reconnectStrategy }
                : { reconnectStrategy },
        });
        this.redis.on('error', (err) => {
            this.logger.error(`❌ Redis connection error: ${err.message}`);
        });
        this.redis.on('reconnecting', () => {
            this.logger.warn('🔄 Redis sedang reconnect...');
        });
        this.redis.on('ready', () => {
            this.logger.log('✅ Redis terhubung');
        });
        await this.redis.connect();
        await this.ensureIndexes();
        this.logger.log('✅ SearchService siap (Meilisearch + Redis)');
    }
    async search(dto) {
        const cacheKey = this.buildCacheKey(dto);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit: ${cacheKey}`);
            return JSON.parse(cached);
        }
        const filters = this.buildFilters(dto);
        const indexName = INDEX_NAMES[dto.index];
        const offset = (dto.page - 1) * dto.limit;
        const result = await this.meili.index(indexName).search(dto.q, {
            limit: dto.limit,
            offset,
            filter: filters.length > 0 ? filters : undefined,
            attributesToRetrieve: this.getAttributesToRetrieve(dto.index),
            showRankingScore: false,
        });
        const hits = result.hits.map((doc) => this.mapHit(doc, dto.index));
        const searchResult = {
            hits,
            total_hits: result.estimatedTotalHits ?? 0,
            page: dto.page,
            limit: dto.limit,
            total_pages: Math.ceil((result.estimatedTotalHits ?? 0) / dto.limit),
            processing_time_ms: result.processingTimeMs,
            query: dto.q,
        };
        await this.redis.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(searchResult));
        this.publishQueryRecorded(dto.q, dto.index).catch((err) => this.logger.error('Failed to publish search.query_recorded', err));
        return searchResult;
    }
    async upsertDocument(indexName, document) {
        await this.meili.index(indexName).addDocuments([document], { primaryKey: 'id' });
        await this.invalidateCacheByPrefix(indexName);
        this.logger.debug(`Upserted doc [${document.id}] to index [${indexName}]`);
    }
    async deleteDocument(indexName, documentId) {
        await this.meili.index(indexName).deleteDocument(documentId);
        await this.invalidateCacheByPrefix(indexName);
        this.logger.debug(`Deleted doc [${documentId}] from index [${indexName}]`);
    }
    async partialUpdateDocument(indexName, documentId, patch) {
        await this.meili.index(indexName).updateDocuments([{ id: documentId, ...patch }]);
        await this.invalidateCacheByPrefix(indexName);
        this.logger.debug(`Partial update doc [${documentId}] on index [${indexName}]`);
    }
    async ensureIndexes() {
        for (const [, indexName] of Object.entries(INDEX_NAMES)) {
            const index = this.meili.index(indexName);
            await this.meili.createIndex(indexName, { primaryKey: 'id' }).catch(() => {
            });
            await index.updateFilterableAttributes([
                'category',
                'is_available',
                'vendor_id',
                'provider_id',
                'content_type',
                'service_type',
                'provenance_verified',
                'price_min',
                'price_max',
            ]);
            await index.updateSortableAttributes([
                'created_at',
                'vendor_trust_score',
                'provider_trust_score',
                'trust_score',
            ]);
            await index.updateRankingRules([
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'exactness',
            ]);
        }
        this.logger.log('Meilisearch indexes verified/created');
    }
    buildFilters(dto) {
        const filters = [];
        if (dto.category) {
            filters.push(`category = "${dto.category}"`);
        }
        if (dto.price_min !== undefined) {
            filters.push(`price_min >= ${dto.price_min}`);
        }
        if (dto.price_max !== undefined) {
            filters.push(`price_max <= ${dto.price_max}`);
        }
        filters.push('is_available = true');
        return filters;
    }
    getAttributesToRetrieve(index) {
        const common = ['id', 'index_type', 'title', 'image_url', 'created_at'];
        const extra = {
            catalog: ['description', 'category', 'vendor_id', 'vendor_name', 'price_min', 'provenance_verified', 'vendor_trust_score', 'tags'],
            service: ['description', 'category', 'provider_id', 'provider_name', 'price_min', 'service_type', 'base_lat', 'base_lng', 'operation_radius_km', 'provider_trust_score', 'tags'],
            content: ['summary', 'content_type', 'author_id', 'author_name', 'category', 'tags', 'published_at'],
            vendor: ['description', 'category', 'trust_score', 'is_verified', 'specializations'],
        };
        return [...common, ...extra[index]];
    }
    mapHit(doc, indexType) {
        const base = {
            id: doc.id,
            index_type: indexType,
            title: 'title' in doc ? doc.title : ('name' in doc ? doc.name : ''),
            meta: {},
        };
        if (indexType === 'catalog' && 'description' in doc) {
            base.description = doc.description;
            base.image_url = 'image_url' in doc ? doc.image_url : undefined;
            base.meta = {
                vendor_id: 'vendor_id' in doc ? doc.vendor_id : undefined,
                price_min: 'price_min' in doc ? doc.price_min : undefined,
                provenance_verified: 'provenance_verified' in doc ? doc.provenance_verified : false,
            };
        }
        else if (indexType === 'service' && 'description' in doc) {
            base.description = doc.description;
            base.meta = {
                provider_id: 'provider_id' in doc ? doc.provider_id : undefined,
                service_type: 'service_type' in doc ? doc.service_type : undefined,
                price_min: 'price_min' in doc ? doc.price_min : undefined,
            };
        }
        else if (indexType === 'content' && 'summary' in doc) {
            base.description = doc.summary;
            base.meta = {
                content_type: 'content_type' in doc ? doc.content_type : undefined,
                author_id: 'author_id' in doc ? doc.author_id : undefined,
            };
        }
        else if (indexType === 'vendor' && 'description' in doc) {
            base.description = doc.description;
            base.meta = {
                trust_score: 'trust_score' in doc ? doc.trust_score : undefined,
                is_verified: 'is_verified' in doc ? doc.is_verified : false,
            };
        }
        return base;
    }
    buildCacheKey(dto) {
        const parts = [
            `search`,
            dto.index,
            encodeURIComponent(dto.q.trim().toLowerCase()),
            `p${dto.page}`,
            `l${dto.limit}`,
            dto.category ?? 'all',
            dto.price_min !== undefined ? `min${dto.price_min}` : '',
            dto.price_max !== undefined ? `max${dto.price_max}` : '',
        ];
        return parts.filter(Boolean).join(':');
    }
    async invalidateCacheByPrefix(indexName) {
        const keys = await this.redis.keys(`search:*${indexName}*`);
        if (keys.length > 0) {
            await this.redis.del(keys);
            this.logger.debug(`Invalidated ${keys.length} cache keys for index: ${indexName}`);
        }
    }
    async publishQueryRecorded(query, index) {
        await this.eventBus.publish({
            event_name: 'search.query_recorded',
            tenant_id: 'platform',
            schema_version: 1,
            payload: {
                queryId: (0, crypto_1.randomUUID)(),
                anonymousSessionId: (0, crypto_1.randomUUID)(),
                index,
                query,
                occurredAt: new Date().toISOString(),
            },
        });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_bus_service_1.EventBusService])
], SearchService);
//# sourceMappingURL=search.service.js.map