/**
 * verification.controller.ts — KYC/KYB Verification Controller
 * Endpoints: POST submit verification, GET verification status
 * Ref: user-lifecycle.md, permission-matrix.md
 */
import { Controller, Get, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { VerificationService } from '../services/verification.service';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';

@Controller('verifications')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitVerification(
    @Request() req: { user: { id: string } },
    @Body() dto: SubmitVerificationDto,
  ) {
    const verification = await this.verificationService.submitVerification(req.user.id, dto);
    return ApiResponse.ok(verification, 'Verification submitted successfully');
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyVerification(@Request() req: { user: { id: string } }) {
    const verification = await this.verificationService.getLatestVerification(req.user.id);
    return ApiResponse.ok(verification);
  }
}
