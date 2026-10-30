/**
 * update-profile.dto.ts — Update individual profile DTO
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(255) full_name?: string;
  @IsOptional() @IsString() @MaxLength(100) display_name?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() city?: string;
}
