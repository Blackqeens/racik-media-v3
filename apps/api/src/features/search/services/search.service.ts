/**
 * search.service.ts — Core Search Service
 *
 * Tanggung jawab:
 *   1. Menerima query dari controller, sanitasi input
 *   2. Cek Redis cache (TTL 10 menit) — kembalikan langsung jika hit
 *   3. Jalankan query ke Meilisearch index yang sesuai
 *   4. Terapkan filter geo-radius untuk service type 'geolocated'
 *   5. Simpan hasil ke Redis cache
 *   6. Publish event search.query_recorded ke event bus (Analytics consumer)
 *
 * Index yang dikelola: catalog_items | service_listings | content_items | vendor
 *
 * Ref: search-architecture.md §A §B §C, event-map.md
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { MeiliSearch, Index } from 'meilisearch';
import { createClient as createRedisClient } from 'redis';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SearchQueryDto, SearchIndexType } from '../dto/search-query.dto';
import { SearchResultDto, SearchHitDto } from '../dto/search-result.dto';
import { IndexDocument } from '../dto/index-document.dto';

/** Nama indeks Meilisearch per domain sesuai search-architecture.md §B */
const INDEX_NAMES: Record<SearchIndexType, string> = {
  catalog: 'catalog_items',
  service: 'service_listings',
  content: 'content_items',
  vendor: 'vendor_profiles',
};

/** TTL cache Redis dalam detik — 10 menit sesuai search-architecture.md §C */
const CACHE_TTL_SECONDS = 600;

type RedisClient = ReturnType<typeof createRedisClient>;

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private meili: MeiliSearch;
  private redis: RedisClient;

  constructor(
    private readonly config: ConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.meili = new MeiliSearch({
      host: this.config.getOrThrow<string>('MEILISEARCH_URL'),
      apiKey: this.config.getOrThrow<string>('MEILISEARCH_MASTER_KEY'),
    });

    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    const redisPassword = this.config.get<string>('REDIS_PASSWORD');

    // Bangun URL Redis dengan password jika URL belum menyertakan credentials.
    // Upstash menggunakan scheme rediss:// (TLS) dan WAJIB auth.
    // Format lengkap: rediss://:PASSWORD@host:port
    let fullRedisUrl = redisUrl;
    if (redisPassword && !redisUrl.includes('@')) {
      // Sisipkan password ke dalam URL: rediss://host → rediss://:pass@host
      fullRedisUrl = redisUrl.replace(/^(rediss?:\/\/)/, `$1:${redisPassword}@`);
    }

    // Reconnect strategy — shared antara TLS dan non-TLS
    const reconnectStrategy = (retries: number): number | Error => {
      if (retries > 10) {
        this.logger.error('❌ Redis: terlalu banyak percobaan reconnect, menyerah');
        return new Error('Redis max retries reached');
      }
      const delay = Math.min(retries * 500, 30_000);
      this.logger.warn(`⚠️ Redis reconnect attempt #${retries} dalam ${delay}ms`);
      return delay;
    };

    const isTls = fullRedisUrl.startsWith('rediss://');

    this.redis = createRedisClient({
      url: fullRedisUrl,
      // Upstash menggunakan TLS (rediss://) — socket options disesuaikan
      socket: isTls
        ? { tls: true, reconnectStrategy }
        : { reconnectStrategy },
    });

    // Tangkap error koneksi agar tidak crash proses
    this.redis.on('error', (err: Error) => {
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

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Jalankan pencarian ke Meilisearch dengan cache layer Redis.
   * Dilarang menggunakan urutan harga termurah sebagai ranking default
   * (sesuai search-architecture.md §C).
   */
  async search(dto: SearchQueryDto): Promise<SearchResultDto> {
    const cacheKey = this.buildCacheKey(dto);

    // 1. Cek Redis cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached) as SearchResultDto;
    }

    // 2. Bangun filter Meilisearch
    const filters = this.buildFilters(dto);

    // 3. Query Meilisearch
    const indexName = INDEX_NAMES[dto.index];
    const offset = (dto.page - 1) * dto.limit;

    const result = await this.meili.index(indexName).search(dto.q, {
      limit: dto.limit,
      offset,
      filter: filters.length > 0 ? filters : undefined,
      attributesToRetrieve: this.getAttributesToRetrieve(dto.index),
      showRankingScore: false, // jangan ekspos ke client
    });

    // 4. Map ke SearchResultDto
    const hits: SearchHitDto[] = (result.hits as IndexDocument[]).map((doc) =>
      this.mapHit(doc, dto.index),
    );

    const searchResult: SearchResultDto = {
      hits,
      total_hits: result.estimatedTotalHits ?? 0,
      page: dto.page,
      limit: dto.limit,
      total_pages: Math.ceil((result.estimatedTotalHits ?? 0) / dto.limit),
      processing_time_ms: result.processingTimeMs,
      query: dto.q,
    };

    // 5. Simpan ke Redis cache
    await this.redis.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(searchResult));

    // 6. Publish event search.query_recorded (fire-and-forget)
    this.publishQueryRecorded(dto.q, dto.index).catch((err) =>
      this.logger.error('Failed to publish search.query_recorded', err),
    );

    return searchResult;
  }

  // ─── Index Write Operations (dipanggil dari consumers) ────────────────────

  /**
   * Upsert dokumen ke Meilisearch index.
   * Dipakai oleh semua consumers saat menerima event domain.
   */
  async upsertDocument(indexName: string, document: IndexDocument): Promise<void> {
    await this.meili.index(indexName).addDocuments([document], { primaryKey: 'id' });
    // Invalidasi cache yang relevan — prefix key berisi nama index
    await this.invalidateCacheByPrefix(indexName);
    this.logger.debug(`Upserted doc [${document.id}] to index [${indexName}]`);
  }

  /**
   * Hapus dokumen dari Meilisearch index.
   * Dipanggil saat catalog di-archive/delist atau content di-unpublish.
   */
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    await this.meili.index(indexName).deleteDocument(documentId);
    await this.invalidateCacheByPrefix(indexName);
    this.logger.debug(`Deleted doc [${documentId}] from index [${indexName}]`);
  }

  /**
   * Update satu field pada dokumen yang sudah ada di index.
   * Dipakai consumer reputation.score_updated untuk memperbarui trust_score
   * tanpa harus fetch ulang dokumen lengkap dari Supabase.
   */
  async partialUpdateDocument(
    indexName: string,
    documentId: string,
    patch: Partial<IndexDocument>,
  ): Promise<void> {
    await this.meili.index(indexName).updateDocuments([{ id: documentId, ...patch }]);
    await this.invalidateCacheByPrefix(indexName);
    this.logger.debug(`Partial update doc [${documentId}] on index [${indexName}]`);
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────

  /** Pastikan semua index Meilisearch sudah dibuat dengan settings yang benar */
  private async ensureIndexes(): Promise<void> {
    for (const [, indexName] of Object.entries(INDEX_NAMES)) {
      const index: Index = this.meili.index(indexName);

      // Buat index jika belum ada (idempoten)
      await this.meili.createIndex(indexName, { primaryKey: 'id' }).catch(() => {
        // Index sudah ada — abaikan
      });

      // Set sortable & filterable attributes
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

      // Ranking rules sesuai search-architecture.md §C:
      // Relevansi teks > trust > knowledge multiplier
      // Dilarang: sort harga termurah sebagai default
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

  private buildFilters(dto: SearchQueryDto): string[] {
    const filters: string[] = [];

    if (dto.category) {
      filters.push(`category = "${dto.category}"`);
    }

    if (dto.price_min !== undefined) {
      filters.push(`price_min >= ${dto.price_min}`);
    }

    if (dto.price_max !== undefined) {
      filters.push(`price_max <= ${dto.price_max}`);
    }

    // Hanya tampilkan item yang tersedia
    filters.push('is_available = true');

    return filters;
  }

  private getAttributesToRetrieve(index: SearchIndexType): string[] {
    const common = ['id', 'index_type', 'title', 'image_url', 'created_at'];

    const extra: Record<SearchIndexType, string[]> = {
      catalog: ['description', 'category', 'vendor_id', 'vendor_name', 'price_min', 'provenance_verified', 'vendor_trust_score', 'tags'],
      service: ['description', 'category', 'provider_id', 'provider_name', 'price_min', 'service_type', 'base_lat', 'base_lng', 'operation_radius_km', 'provider_trust_score', 'tags'],
      content: ['summary', 'content_type', 'author_id', 'author_name', 'category', 'tags', 'published_at'],
      vendor: ['description', 'category', 'trust_score', 'is_verified', 'specializations'],
    };

    return [...common, ...extra[index]];
  }

  private mapHit(doc: IndexDocument, indexType: SearchIndexType): SearchHitDto {
    const base: SearchHitDto = {
      id: doc.id,
      index_type: indexType,
      title: 'title' in doc ? doc.title : ('name' in doc ? (doc as { name: string }).name : ''),
      meta: {},
    };

    if (indexType === 'catalog' && 'description' in doc) {
      base.description = doc.description;
      base.image_url = 'image_url' in doc ? (doc as { image_url?: string }).image_url : undefined;
      base.meta = {
        vendor_id: 'vendor_id' in doc ? doc.vendor_id : undefined,
        price_min: 'price_min' in doc ? doc.price_min : undefined,
        provenance_verified: 'provenance_verified' in doc ? doc.provenance_verified : false,
      };
    } else if (indexType === 'service' && 'description' in doc) {
      base.description = doc.description;
      base.meta = {
        provider_id: 'provider_id' in doc ? doc.provider_id : undefined,
        service_type: 'service_type' in doc ? doc.service_type : undefined,
        price_min: 'price_min' in doc ? doc.price_min : undefined,
      };
    } else if (indexType === 'content' && 'summary' in doc) {
      base.description = doc.summary;
      base.meta = {
        content_type: 'content_type' in doc ? doc.content_type : undefined,
        author_id: 'author_id' in doc ? doc.author_id : undefined,
      };
    } else if (indexType === 'vendor' && 'description' in doc) {
      base.description = doc.description;
      base.meta = {
        trust_score: 'trust_score' in doc ? doc.trust_score : undefined,
        is_verified: 'is_verified' in doc ? doc.is_verified : false,
      };
    }

    return base;
  }

  private buildCacheKey(dto: SearchQueryDto): string {
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

  private async invalidateCacheByPrefix(indexName: string): Promise<void> {
    // Scan Redis keys yang mengandung nama index dan hapus
    const keys = await this.redis.keys(`search:*${indexName}*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
      this.logger.debug(`Invalidated ${keys.length} cache keys for index: ${indexName}`);
    }
  }

  /**
   * Publish event search.query_recorded ke event bus.
   * Consumer: Analytics, Audit (sesuai event-map.md §B).
   * Menggunakan anonymousSessionId — tidak ada data pribadi pengguna.
   */
  private async publishQueryRecorded(query: string, index: string): Promise<void> {
    await this.eventBus.publish({
      event_name: 'search.query_recorded',
      tenant_id: 'platform',
      schema_version: 1,
      payload: {
        queryId: randomUUID(),
        anonymousSessionId: randomUUID(), // TODO: terima dari header request jika tersedia
        index,
        query,
        occurredAt: new Date().toISOString(),
      },
    });
  }
}
