/**
 * search.module.ts — Search Domain Module
 *
 * Search adalah pure read model domain:
 *   - Tidak punya tabel master data di Supabase (hanya index di Meilisearch)
 *   - Diisi dari event owner domain via consumers
 *   - Dapat di-rebuild ulang kapan saja dari PostgreSQL + event history
 *
 * Mendaftarkan:
 *   - SearchService       : query ke Meilisearch + Redis cache layer
 *   - SearchController    : endpoint GET /api/v1/search
 *   - Consumers           : indexing dari Content, Catalog, Service, Reputation, Provenance
 *
 * Ref: search-architecture.md, data-ownership.md §B (Search domain)
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';

import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { ContentIndexConsumer } from './consumers/content-index.consumer';
import { CatalogIndexConsumer } from './consumers/catalog-index.consumer';
import { ReputationProvenanceIndexConsumer } from './consumers/reputation-provenance-index.consumer';

@Module({
  imports: [
    DatabaseModule,   // Supabase client untuk fetch dokumen lengkap saat indexing
    EventBusModule,   // RabbitMQ subscriber untuk semua index consumers
  ],
  controllers: [
    SearchController, // GET /api/v1/search
  ],
  providers: [
    // ─── Core Service ─────────────────────────────────────────────────────
    SearchService,

    // ─── Index Consumers ──────────────────────────────────────────────────
    ContentIndexConsumer,
    CatalogIndexConsumer,
    ReputationProvenanceIndexConsumer,
  ],
  exports: [
    // Ekspor SearchService agar domain lain bisa query search jika diperlukan
    SearchService,
  ],
})
export class SearchModule {}
