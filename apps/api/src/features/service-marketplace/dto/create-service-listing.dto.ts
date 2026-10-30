/**
 * create-service-listing.dto.ts
 */
import { IsString, IsIn, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';
export class CreateServiceListingDto {
  @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsIn(['remote', 'geolocated']) delivery_method: string;
  @IsNumber() @Min(0) base_price: number;
}
