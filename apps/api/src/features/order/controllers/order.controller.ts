/**
 * order.controller.ts — Order Domain Controller
 * Endpoints: POST create order, GET my orders, GET detail
 * Ref: escrow-lifecycle.md, api-standards.md
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt.guard';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req: { user: { id: string; tenant_id: string } }, @Body() dto: CreateOrderDto) {
    const order = await this.orderService.createOrder(req.user.id, req.user.tenant_id, dto);
    return ApiResponse.ok(order, 'Order created');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyOrders(@Request() req: { user: { id: string } }, @Query() pagination: PaginationDto) {
    const result = await this.orderService.getOrdersByBuyer(req.user.id, pagination);
    return ApiResponse.paginated(result.data, result.total, pagination.page, pagination.limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrderDetail(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    const order = await this.orderService.getOrderById(id, req.user.id);
    return ApiResponse.ok(order);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmOrder(@Param('id') id: string, @Request() req: { user: { id: string; tenant_id: string } }) {
    await this.orderService.buyerConfirm(id, req.user.id, req.user.tenant_id);
    return ApiResponse.ok(null, 'Order confirmed');
  }
}
