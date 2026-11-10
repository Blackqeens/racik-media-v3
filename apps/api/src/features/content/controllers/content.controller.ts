/**
 * content.controller.ts — Content Domain Controller
 * Endpoints: POST create, GET list, GET detail, PATCH update, POST submit-for-review
 * Ref: content-lifecycle.md, api-standards.md
 */
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { Public } from '../../../core/auth/public.decorator';
import { ContentService } from '../services/content.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createContent(@Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: CreateContentDto) {
    const content = await this.contentService.createContent(req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(content, 'Content created');
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async listPublished(
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
    @Query('content_type') contentType?: string,
  ) {
    const result = await this.contentService.listPublished(pagination, {
      search: q,
      contentType,
    });
    return ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 9);
  }

  /**
   * GET /api/v1/content/events — list konten bertipe event
   * Digunakan oleh events/page.tsx
   */
  @Get('events')
  @Public()
  @HttpCode(HttpStatus.OK)
  async listEvents(
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
    @Query('tab') tab?: string,
  ) {
    const result = await this.contentService.listPublished(pagination, {
      search: q,
      contentType: 'event',
    });
    return ApiResponse.paginated(result.data, result.total, pagination.page || 1, pagination.limit || 12);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id') id: string) {
    const content = await this.contentService.getById(id);
    return ApiResponse.ok(content);
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyContent(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    const content = await this.contentService.getOwnedById(id, req.user.id);
    return ApiResponse.ok(content);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateContent(@Param('id') id: string, @Request() req: { user: { id: string } }, @Body() dto: UpdateContentDto) {
    const updated = await this.contentService.updateContent(id, req.user.id, dto);
    return ApiResponse.ok(updated);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitForReview(@Param('id') id: string, @Request() req: { user: { id: string; tenant_id: string } }) {
    await this.contentService.submitForReview(id, req.user.id, req.user.tenant_id);
    return ApiResponse.ok(null, 'Content submitted for review');
  }
}
