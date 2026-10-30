/**
 * update-catalog.dto.ts
 */
import { IsString, IsOptional, IsNumber, IsInt, Min, MaxLength } from 'class-validator';
export class UpdateCatalogDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) price_fixed?: number;
  @IsOptional() @IsInt() @Min(0) stock_quantity?: number;
}
