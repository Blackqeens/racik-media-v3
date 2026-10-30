import { TicketService } from '../services/ticket.service';
import { ApiResponse } from '../../../core/shared/dto/api-response.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class ModerationController {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    listTickets(pagination: PaginationDto, queue?: string): Promise<ApiResponse<{
        id: any;
        entity_type: any;
        entity_id: any;
        queue_type: any;
        severity: any;
        status: any;
        sla_deadline: any;
        created_at: any;
    }[]>>;
    getStats(): Promise<ApiResponse<{
        activeUsers: number;
        pendingTickets: number;
        pendingProducts: number;
        pendingVerifications: number;
    }>>;
    getTicket(id: string): Promise<ApiResponse<any>>;
    decideTicket(id: string, req: {
        user: {
            id: string;
            tenant_id: string;
        };
    }, body: {
        decision: string;
        reason_code: string;
    }): Promise<ApiResponse<null>>;
}
