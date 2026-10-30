/**
 * submit-verification.dto.ts — KYC/KYB verification submission DTO
 */
import { IsString, IsIn, IsUUID } from 'class-validator';

export class SubmitVerificationDto {
  @IsUUID() tenant_id: string;
  @IsString() @IsIn(['kyc', 'kyb']) verification_type: 'kyc' | 'kyb';
}
