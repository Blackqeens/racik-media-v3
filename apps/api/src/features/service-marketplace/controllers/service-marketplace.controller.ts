/**
 * service-marketplace.controller.ts — Service Listing Controller
 * Ref: service-lifecycle.md, api-standards.md
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { Public } from '../../../core/auth/public.decorator';
import { ServiceListingService } from '../services/service-listing.service';
import { CreateServiceListingDto } from '../dto/create-service-listing.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Controller('services')
export class ServiceMarketplaceController {
  constructor(private readonly serviceListingService: ServiceListingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createListing(@Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: CreateServiceListingDto) {
    const listing = await this.serviceListingService.createListing(req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(listing, 'Service listing created');
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async listActive(
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
    @Query('category') category?: string,
  ) {
    const result = await this.serviceListingService.listActive(pagination, {
      search: q,
      category: category === 'all' ? undefined : category,
    });
    return ApiResponse.paginated(result.data, result.total, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id') id: string) {
    const listing = await this.serviceListingService.getById(id);
    return ApiResponse.ok(listing);
  }
}
