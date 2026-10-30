/**
 * search-result.dto.ts — DTO hasil pencarian dari Meilisearch
 *
 * Digunakan oleh SearchService untuk membungkus hasil sebelum dikembalikan
 * ke controller, konsisten dengan ApiResponse wrapper.
 *
 * Ref: search-architecture.md §A, coding-standards.md §Response Format
 */

/** Satu dokumen hasil pencarian — shape disesuaikan per index type */
export interface SearchHitDto {
  /** ID dokumen asli di Supabase (UUID) */
  id: string;

  /** Jenis indeks: catalog | service | content | vendor */
  index_type: string;

  /** Judul / nama item */
  title: string;

  /** Deskripsi singkat (snippet) */
  description?: string;

  /** URL thumbnail / gambar utama */
  image_url?: string;

  /**
   * Skor relevansi dari Meilisearch (0–1).
   * Hanya untuk keperluan debugging internal; jangan ekspos ke frontend publik.
   */
  _rankingScore?: number;

  /** Data tambahan spesifik per index type (harga, lokasi, dll.) */
  meta: Record<string, unknown>;
}

/** Wrapper hasil pencarian dengan metadata pagination */
export class SearchResultDto {
  /** Daftar dokumen yang cocok */
  hits: SearchHitDto[];

  /** Total dokumen yang cocok di Meilisearch (sebelum pagination) */
  total_hits: number;

  /** Halaman saat ini */
  page: number;

  /** Jumlah hasil per halaman */
  limit: number;

  /** Total halaman */
  total_pages: number;

  /** Durasi eksekusi query di Meilisearch (ms) */
  processing_time_ms: number;

  /** Query string yang digunakan */
  query: string;
}
