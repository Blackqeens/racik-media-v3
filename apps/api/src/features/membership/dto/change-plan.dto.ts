/**
 * change-plan.dto.ts — DTO untuk mengubah membership plan user
 * Ref: membership-architecture.md
 */
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class ChangePlanDto {
  @IsUUID()
  @IsNotEmpty()
  plan_id!: string;
}

export class MembershipResponseDto {
  role_type!: string;
  status!: string;
  granted_at!: string;
}
