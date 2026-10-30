/**
 * index-document.dto.ts — DTO dokumen yang dimasukkan ke Meilisearch index
 *
 * Digunakan oleh consumers saat melakukan upsert ke Meilisearch.
 * Setiap index type memiliki shape dokumen yang berbeda; type ini
 * mencakup field wajib yang ada di semua index.
 *
 * Ref: search-architecture.md §B (Indexing Scope)
 * PENTING: Dilarang memasukkan data pribadi (email, phone, NIK, rekening).
 */

/** Shape dokumen catalog_items index */
export interface CatalogIndexDocument {
  id: string;
  index_type: 'catalog';
  title: string;
  description: string;
  category: string;
  vendor_id: string;
  vendor_name: string;
  price_min: number;
  price_max: number;
  is_available: boolean;
  provenance_verified: boolean;
  /** Trust/reputation score vendor untuk ranking multiplier */
  vendor_trust_score: number;
  /** Knowledge-backed multiplier: 1.0–2.0 jika vendor punya konten terverifikasi */
  knowledge_multiplier: number;
  image_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Shape dokumen service_listings index */
export interface ServiceIndexDocument {
  id: string;
  index_type: 'service';
  title: string;
  description: string;
  category: string;
  provider_id: string;
  provider_name: string;
  price_min: number;
  price_max: number;
  is_available: boolean;
  service_type: 'remote' | 'geolocated';
  /** Koordinat pusat operasi — wajib untuk tipe geolocated */
  base_lat?: number;
  base_lng?: number;
  /** Radius layanan dalam kilometer */
  operation_radius_km?: number;
  provider_trust_score: number;
  image_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Shape dokumen content_items index */
export interface ContentIndexDocument {
  id: string;
  index_type: 'content';
  title: string;
  summary: string;
  content_type: 'article' | 'paper' | 'journal' | 'event';
  author_id: string;
  author_name: string;
  category: string;
  tags: string[];
  published_at: string;
  updated_at: string;
}

/** Shape dokumen vendor index (profil publik) */
export interface VendorIndexDocument {
  id: string;
  index_type: 'vendor';
  name: string;
  description: string;
  category: string;
  trust_score: number;
  is_verified: boolean;
  specializations: string[];
  created_at: string;
}

/** Union type semua dokumen yang bisa diindex */
export type IndexDocument =
  | CatalogIndexDocument
  | ServiceIndexDocument
  | ContentIndexDocument
  | VendorIndexDocument;
