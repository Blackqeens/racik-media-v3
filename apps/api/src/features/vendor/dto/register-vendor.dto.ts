/**
 * register-vendor.dto.ts — DTO Pendaftaran Toko / Vendor
 * Ref: vendor-architecture.md, api-standards.md
 */
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class RegisterVendorDto {
  /** Nama toko yang ditampilkan ke publik */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  storeName: string;

  /** Nama legal usaha (opsional, default = storeName) */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  /** Jenis usaha: perorangan | koperasi | cv | pt */
  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() description?: string;
}
