/**
 * moderation.controller.ts — Moderation Panel Controller
 * Admin/Moderator only endpoints.
 * Ref: moderation-lifecycle.md, permission-matrix.md
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { TicketService } from '../services/ticket.service';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('tickets')
  @HttpCode(HttpStatus.OK)
  async listTickets(@Query() pagination: PaginationDto, @Query('queue') queue?: string) {
    const result = await this.ticketService.listTickets(pagination, queue);
    return ApiResponse.paginated(result.data, result.total, pagination.page, pagination.limit);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    const stats = await this.ticketService.getDashboardStats();
    return ApiResponse.ok(stats);
  }

  @Get('tickets/:id')
  @HttpCode(HttpStatus.OK)
  async getTicket(@Param('id') id: string) {
    const ticket = await this.ticketService.getTicketById(id);
    return ApiResponse.ok(ticket);
  }

  @Post('tickets/:id/decide')
  @HttpCode(HttpStatus.OK)
  async decideTicket(
    @Param('id') id: string,
    @Request() req: { user: { id: string; tenant_id: string } },
    @Body() body: { decision: string; reason_code: string },
  ) {
    await this.ticketService.recordDecision(id, req.user.id, body.decision, body.reason_code, req.user.tenant_id);
    return ApiResponse.ok(null, 'Decision recorded');
  }
}
