import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class OrderService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    createOrder(buyerId: string, tenantId: string, dto: CreateOrderDto): Promise<any>;
    getOrdersByBuyer(buyerId: string, pagination: PaginationDto): Promise<{
        data: {
            id: any;
            order_type: any;
            status: any;
            gross_amount: any;
            currency: any;
            created_at: any;
        }[];
        total: number;
    }>;
    getOrderById(id: string, userId: string): Promise<any>;
    buyerConfirm(orderId: string, buyerId: string, tenantId: string): Promise<void>;
    updateStatus(orderId: string, status: string, tenantId: string): Promise<void>;
}
