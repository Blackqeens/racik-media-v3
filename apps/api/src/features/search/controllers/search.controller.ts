/**
 * search.controller.ts — Search API Controller
 *
 * Endpoint publik untuk pencarian lintas domain.
 * Semua endpoint menggunakan @Public() — tidak wajib login untuk mencari.
 *
 * Endpoint:
 *   GET /api/v1/search?q=...&index=catalog&page=1&limit=20
 *
 * Aturan:
 *   - Controller hanya menerima input & melempar ke SearchService (Fat Service)
 *   - Dilarang menaruh logika bisnis di sini (coding-standards.md §D)
 *   - Dilarang mengekspos ranking_score ke response publik
 *
 * Ref: search-architecture.md §A, api-standards.md, coding-standards.md §D
 */
import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../core/auth/public.decorator';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { SearchService } from '../services/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';

@Controller('search')
@UseGuards(ThrottlerGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Pencarian universal lintas index.
   *
   * Query params:
   *   - q          : teks pencarian (wajib)
   *   - index      : catalog | service | content | vendor (default: catalog)
   *   - page       : nomor halaman (default: 1)
   *   - limit      : hasil per halaman max 50 (default: 20)
   *   - category   : filter kategori (opsional)
   *   - price_min  : filter harga minimum (opsional)
   *   - price_max  : filter harga maksimum (opsional)
   *   - lat, lng   : koordinat pengguna untuk filter geolocated service (opsional)
   *   - radius_km  : radius pencarian layanan fisik dalam km (opsional)
   *
   * Catatan: Urutan harga termurah BUKAN default ranking.
   * Ref: search-architecture.md §C
   */
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async search(
    @Query() query: SearchQueryDto,
  ): Promise<ApiResponse<SearchResultDto>> {
    const result = await this.searchService.search(query);
    return ApiResponse.ok(result);
  }
}
