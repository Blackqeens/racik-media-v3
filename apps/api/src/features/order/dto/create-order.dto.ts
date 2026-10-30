/**
 * create-order.dto.ts
 */
import { IsString, IsIn, IsUUID, IsNumber, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString() @IsIn(['catalog_item', 'service_listing']) entity_type: string;
  @IsUUID() entity_id: string;
  @IsInt() @Min(1) quantity: number;
  @IsNumber() @Min(0) unit_price: number;
}

export class CreateOrderDto {
  @IsUUID() seller_id: string;
  @IsString() @IsIn(['product_retail', 'product_wholesale', 'service_remote', 'service_geolocated']) order_type: string;
  @IsNumber() @Min(0) gross_amount: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items?: OrderItemDto[];
}
