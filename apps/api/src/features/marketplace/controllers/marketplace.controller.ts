/**
 * marketplace.controller.ts — Marketplace Catalog Controller
 * Endpoints: POST catalog, GET catalog list (public), GET catalog detail (public), PATCH catalog
 * Ref: marketplace-lifecycle.md, api-standards.md
 */
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { Public } from '../../../core/auth/public.decorator';
import { CatalogService } from '../services/catalog.service';
import { CreateCatalogDto } from '../dto/create-catalog.dto';
import { UpdateCatalogDto } from '../dto/update-catalog.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Controller(['catalog', 'marketplace/catalog'])
export class MarketplaceController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCatalogItem(@Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: CreateCatalogDto) {
    const item = await this.catalogService.createCatalogItem(req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(item, 'Catalog item created');
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async listActive(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('itemType') itemType?: string,
  ) {
    const result = await this.catalogService.listActive(pagination, {
      category: category === 'all' ? undefined : category,
      search: q || search,
      itemType,
    });
    return ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 12);
  }

  @Get('vendor/mine')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyProducts(@Request() req: { user: { id: string } }, @Query() pagination: PaginationDto) {
    const result = await this.catalogService.listByVendor(req.user.id, pagination);
    return ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 20);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id') id: string) {
    const item = await this.catalogService.getById(id);
    return ApiResponse.ok(item);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateCatalog(@Param('id') id: string, @Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: UpdateCatalogDto) {
    const updated = await this.catalogService.updateCatalogItem(id, req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(updated);
  }
}
