/**
 * search-query.dto.ts — DTO request pencarian publik
 *
 * Digunakan oleh SearchController untuk menerima dan memvalidasi
 * parameter query dari frontend.
 *
 * Ref: search-architecture.md §A (Search Flow), §C (Ranking Factors)
 */
import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Jenis indeks yang bisa dicari */
export type SearchIndexType = 'catalog' | 'service' | 'content' | 'vendor';

export class SearchQueryDto {
  /** Teks pencarian utama — wajib ada */
  @IsString()
  q: string;

  /**
   * Indeks yang dituju.
   * Default: 'catalog' jika tidak dikirim.
   */
  @IsOptional()
  @IsIn(['catalog', 'service', 'content', 'vendor'])
  index: SearchIndexType = 'catalog';

  /** Halaman ke berapa (mulai 1) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Jumlah hasil per halaman (max 50) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  /**
   * Filter kategori produk/jasa (opsional).
   * Contoh: 'makanan', 'desain-grafis'
   */
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * Filter harga minimum (opsional).
   * Sesuai search-architecture.md §C: dilarang menjadikan harga termurah
   * sebagai default ranking, tapi filter rentang diperbolehkan.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min?: number;

  /** Filter harga maksimum (opsional) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max?: number;

  /**
   * Latitude pengguna — dibutuhkan untuk filter geolocated service.
   * Ref: search-architecture.md §C "jasa geolocated difilter berdasarkan radius"
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  /** Longitude pengguna */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  /** Radius pencarian layanan fisik dalam kilometer (default 25km) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  radius_km?: number;
}
