import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { SearchService } from '../services/search.service';
export declare class ContentIndexConsumer implements OnModuleInit {
    private readonly eventBus;
    private readonly searchService;
    private readonly supabase;
    private readonly logger;
    constructor(eventBus: EventBusService, searchService: SearchService, supabase: SupabaseClientService);
    onModuleInit(): Promise<void>;
    private subscribeContentPublished;
    private subscribeContentUpdated;
    private upsertContentDocument;
}
