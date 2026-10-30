/**
 * content-index.consumer.ts — Consumer untuk indexing konten ke Meilisearch
 *
 * Mendengarkan event Content domain yang berdampak pada search index.
 *
 * Event yang ditangani (dari event-map.md — consumer: Search):
 *   - content.published → upsert ke content_items index
 *   - content.updated   → upsert ulang (refresh) dokumen di index
 *
 * Idempoten: Meilisearch addDocuments bersifat upsert by primary key (id),
 * sehingga memproses event yang sama berkali-kali tetap aman.
 *
 * CATATAN: Content domain menyimpan data lengkap di Supabase.
 * Consumer ini hanya membaca data minimum dari payload event (sesuai
 * event-map.md §C — payload hanya memuat ID rujukan), lalu fetch
 * detail ke Supabase sebelum index.
 *
 * Ref: event-map.md §B, search-architecture.md §B
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { SearchService } from '../services/search.service';
import { ContentIndexDocument } from '../dto/index-document.dto';

interface ContentPublishedPayload {
  contentId: string;
  authorId: string;
  publishedAt: string;
}

interface ContentUpdatedPayload {
  contentId: string;
  authorId: string;
  changeType: string;
}

@Injectable()
export class ContentIndexConsumer implements OnModuleInit {
  private readonly logger = new Logger(ContentIndexConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly searchService: SearchService,
    private readonly supabase: SupabaseClientService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribeContentPublished();
    await this.subscribeContentUpdated();
  }

  private async subscribeContentPublished(): Promise<void> {
    await this.eventBus.subscribe<ContentPublishedPayload>(
      'search.queue.content-published',
      'content.published',
      async (event: DomainEvent<ContentPublishedPayload>) => {
        this.logger.debug(`Indexing content.published [${event.event_id}]`);
        await this.upsertContentDocument(event.payload.contentId);
      },
    );
  }

  private async subscribeContentUpdated(): Promise<void> {
    await this.eventBus.subscribe<ContentUpdatedPayload>(
      'search.queue.content-updated',
      'content.updated',
      async (event: DomainEvent<ContentUpdatedPayload>) => {
        this.logger.debug(`Re-indexing content.updated [${event.event_id}]`);
        await this.upsertContentDocument(event.payload.contentId);
      },
    );
  }

  /** Fetch detail dari Supabase dan upsert ke Meilisearch */
  private async upsertContentDocument(contentId: string): Promise<void> {
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

    const authorData = data.author as { display_name?: string } | null;

    const doc: ContentIndexDocument = {
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
}
