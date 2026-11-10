/**
 * create-content.dto.ts
 */
import { IsString, IsIn, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateContentDto {
  @IsString() @IsIn(['article', 'paper', 'journal', 'event']) content_type: string;
  @IsString() @IsNotEmpty() @MaxLength(500) title: string;
  @IsString() @IsNotEmpty() body: string;
  @IsOptional() @IsString() cover_image?: string;
}
