import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';
import { IndexDocument } from '../dto/index-document.dto';
export declare class SearchService implements OnModuleInit {
    private readonly config;
    private readonly eventBus;
    private readonly logger;
    private meili;
    private redis;
    constructor(config: ConfigService, eventBus: EventBusService);
    onModuleInit(): Promise<void>;
    search(dto: SearchQueryDto): Promise<SearchResultDto>;
    upsertDocument(indexName: string, document: IndexDocument): Promise<void>;
    deleteDocument(indexName: string, documentId: string): Promise<void>;
    partialUpdateDocument(indexName: string, documentId: string, patch: Partial<IndexDocument>): Promise<void>;
    private ensureIndexes;
    private buildFilters;
    private getAttributesToRetrieve;
    private mapHit;
    private buildCacheKey;
    private invalidateCacheByPrefix;
    private publishQueryRecorded;
}
