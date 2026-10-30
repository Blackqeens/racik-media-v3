/**
 * create-provenance.dto.ts — DTO for creating catalog provenance
 * Ref: marketplace-lifecycle.md §3.1
 */
import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateProvenanceDto {
  @IsUUID() catalog_item_id: string;
  @IsString() @IsNotEmpty() producer_origin: string;
  @IsString() @IsNotEmpty() production_method: string;
  @IsString() @IsNotEmpty() regional_heritage_story: string;
  @IsOptional() cultural_attribution_meta?: Record<string, unknown>;
}
