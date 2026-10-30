/**
 * pagination.dto.ts — DTO untuk pagination request
 *
 * Digunakan di semua endpoint yang mengembalikan list/array.
 * Validasi otomatis via class-validator + class-transformer.
 *
 * Contoh query: GET /api/v1/products?page=2&limit=20&sort=created_at&order=desc
 */
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  /** Halaman ke berapa (mulai dari 1) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus bilangan bulat' })
  @Min(1, { message: 'page minimal 1' })
  page: number = 1;

  /** Jumlah item per halaman (max 100) */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus bilangan bulat' })
  @Min(1, { message: 'limit minimal 1' })
  @Max(100, { message: 'limit maksimal 100' })
  limit: number = 20;

  /** Nama kolom untuk sorting */
  @IsOptional()
  @IsString()
  sort: string = 'created_at';

  /** Arah sorting: asc atau desc */
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order harus asc atau desc' })
  order: 'asc' | 'desc' = 'desc';

  /** Hitung offset untuk query DB: skip item sebelumnya */
  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
