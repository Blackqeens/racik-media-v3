import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class TicketService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    createTicket(entityType: string, entityId: string, queueType: string, severity: string, tenantId: string): Promise<any>;
    listTickets(pagination: PaginationDto, queueType?: string): Promise<{
        data: {
            id: any;
            entity_type: any;
            entity_id: any;
            queue_type: any;
            severity: any;
            status: any;
            sla_deadline: any;
            created_at: any;
        }[];
        total: number;
    }>;
    getTicketById(id: string): Promise<any>;
    recordDecision(ticketId: string, moderatorId: string, decision: string, reasonCode: string, tenantId: string): Promise<void>;
    getDashboardStats(): Promise<{
        activeUsers: number;
        pendingTickets: number;
        pendingProducts: number;
        pendingVerifications: number;
    }>;
}
