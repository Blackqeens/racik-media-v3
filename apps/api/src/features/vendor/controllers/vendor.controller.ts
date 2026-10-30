/**
 * vendor.controller.ts — Vendor Profile Controller
 * Ref: vendor-architecture.md, api-standards.md
 */
import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { Public } from '../../../core/auth/public.decorator';
import { VendorService } from '../services/vendor.service';
import { RegisterVendorDto } from '../dto/register-vendor.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerVendor(@Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: RegisterVendorDto) {
    const vendor = await this.vendorService.registerVendor(req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(vendor, 'Vendor registered');
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyDashboard(@Request() req: { user: { id: string } }) {
    const stats = await this.vendorService.getSellerDashboard(req.user.id);
    return ApiResponse.ok(stats);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getVendorProfile(@Param('id') id: string) {
    const vendor = await this.vendorService.getById(id);
    return ApiResponse.ok(vendor);
  }
}
