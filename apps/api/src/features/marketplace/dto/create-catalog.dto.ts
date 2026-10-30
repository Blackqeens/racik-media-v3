/**
 * create-catalog.dto.ts
 */
import { IsString, IsIn, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, MaxLength } from 'class-validator';
export class CreateCatalogDto {
  @IsString() @IsIn(['retail', 'wholesale', 'online_service', 'local_service']) item_type: string;
  @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() @Min(0) price_fixed?: number;
  @IsOptional() @IsInt() @Min(0) stock_quantity?: number;
}
