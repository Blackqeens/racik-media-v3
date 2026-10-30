/**
 * reputation-provenance-index.consumer.ts — Consumer untuk update skor reputasi
 *                                            & provenance di Meilisearch index
 *
 * Mendengarkan event Reputation dan Provenance yang berdampak pada ranking
 * dokumen yang sudah terindex.
 *
 * Event yang ditangani (dari event-map.md — consumer: Search):
 *   - reputation.score_updated → partial update trust_score pada catalog_items
 *                                 dan service_listings index
 *   - provenance.verified      → partial update provenance_verified = true
 *                                 pada catalog_items index
 *   - provenance.rejected      → partial update provenance_verified = false
 *
 * Pola: partial update hanya field yang berubah, tidak fetch ulang dokumen penuh.
 * Ref: event-map.md §B, search-architecture.md §C (Ranking Factors)
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { SearchService } from '../services/search.service';

interface ReputationScoreUpdatedPayload {
  userId: string;
  score: number;
  reasonCode: string;
}

interface ProvenanceVerifiedPayload {
  catalogItemId: string;
  provenanceId: string;
  verifiedAt: string;
}

interface ProvenanceRejectedPayload {
  catalogItemId: string;
  provenanceId: string;
  reasonCode: string;
}

@Injectable()
export class ReputationProvenanceIndexConsumer implements OnModuleInit {
  private readonly logger = new Logger(ReputationProvenanceIndexConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly searchService: SearchService,
    private readonly supabase: SupabaseClientService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.subscribeReputationScoreUpdated(),
      this.subscribeProvenanceVerified(),
      this.subscribeProvenanceRejected(),
    ]);
  }

  // ─── Reputation ───────────────────────────────────────────────────────────

  /**
   * Saat skor reputasi user berubah, perbarui trust_score pada semua dokumen
   * catalog_items dan service_listings milik user tersebut di Meilisearch.
   *
   * Menggunakan partial update agar tidak perlu fetch ulang dokumen lengkap.
   * Ref: search-architecture.md §C "Trust: skor reputasi tervalidasi memengaruhi peringkat"
   */
  private async subscribeReputationScoreUpdated(): Promise<void> {
    await this.eventBus.subscribe<ReputationScoreUpdatedPayload>(
      'search.queue.reputation-score-updated',
      'reputation.score_updated',
      async (event: DomainEvent<ReputationScoreUpdatedPayload>) => {
        this.logger.debug(`Updating trust scores for user [${event.payload.userId}]`);
        await this.propagateTrustScore(event.payload.userId, event.payload.score);
      },
    );
  }

  /**
   * Fetch semua catalog & service milik user tersebut lalu partial update
   * trust_score di masing-masing dokumen index.
   */
  private async propagateTrustScore(userId: string, newScore: number): Promise<void> {
    // Update catalog_items index — vendor_trust_score
    const { data: catalogs } = await this.supabase.admin
      .from('catalog_items')
      .select('id')
      .eq('vendor_id', userId)
      .eq('status', 'published');

    if (catalogs && catalogs.length > 0) {
      for (const catalog of catalogs) {
        await this.searchService.partialUpdateDocument('catalog_items', catalog.id, {
          vendor_trust_score: newScore,
        } as never);
      }
      this.logger.debug(
        `Updated vendor_trust_score for ${catalogs.length} catalog docs (user: ${userId})`,
      );
    }

    // Update service_listings index — provider_trust_score
    const { data: services } = await this.supabase.admin
      .from('service_listings')
      .select('id')
      .eq('provider_id', userId)
      .eq('status', 'published');

    if (services && services.length > 0) {
      for (const service of services) {
        await this.searchService.partialUpdateDocument('service_listings', service.id, {
          provider_trust_score: newScore,
        } as never);
      }
      this.logger.debug(
        `Updated provider_trust_score for ${services.length} service docs (user: ${userId})`,
      );
    }
  }

  // ─── Provenance ───────────────────────────────────────────────────────────

  /**
   * Saat provenance produk diverifikasi, set provenance_verified = true.
   * Ini memberi knowledge-backed multiplier pada ranking katalog.
   * Ref: search-architecture.md §C "provenance_verified memberi faktor 1.00–2.00"
   */
  private async subscribeProvenanceVerified(): Promise<void> {
    await this.eventBus.subscribe<ProvenanceVerifiedPayload>(
      'search.queue.provenance-verified',
      'provenance.verified',
      async (event: DomainEvent<ProvenanceVerifiedPayload>) => {
        this.logger.debug(
          `Marking provenance_verified=true for catalog [${event.payload.catalogItemId}]`,
        );
        await this.searchService.partialUpdateDocument(
          'catalog_items',
          event.payload.catalogItemId,
          { provenance_verified: true, knowledge_multiplier: 1.5 } as never,
        );
      },
    );
  }

  /**
   * Saat provenance ditolak, cabut status verified dari index.
   */
  private async subscribeProvenanceRejected(): Promise<void> {
    await this.eventBus.subscribe<ProvenanceRejectedPayload>(
      'search.queue.provenance-rejected',
      'provenance.rejected',
      async (event: DomainEvent<ProvenanceRejectedPayload>) => {
        this.logger.debug(
          `Marking provenance_verified=false for catalog [${event.payload.catalogItemId}]`,
        );
        await this.searchService.partialUpdateDocument(
          'catalog_items',
          event.payload.catalogItemId,
          { provenance_verified: false, knowledge_multiplier: 1.0 } as never,
        );
      },
    );
  }
}
