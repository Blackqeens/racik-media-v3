import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, dto: CreateOrderDto): Promise<ApiResponse<any>>;
    getMyOrders(req: {
        user: {
            id: string;
        };
    }, pagination: PaginationDto): Promise<ApiResponse<{
        id: any;
        order_type: any;
        status: any;
        gross_amount: any;
        currency: any;
        created_at: any;
    }[]>>;
    getOrderDetail(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<ApiResponse<any>>;
    confirmOrder(id: string, req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }): Promise<ApiResponse<null>>;
}
