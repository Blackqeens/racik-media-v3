/**
 * update-content.dto.ts
 */
import { IsString, IsOptional, MaxLength } from 'class-validator';
export class UpdateContentDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() cover_image?: string;
}
