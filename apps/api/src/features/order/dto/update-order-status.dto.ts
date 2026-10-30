/**
 * update-order-status.dto.ts
 */
import { IsString, IsIn } from 'class-validator';
export class UpdateOrderStatusDto {
  @IsString() @IsIn(['paid', 'in_fulfillment', 'completed', 'cancelled', 'disputed']) status: string;
}
