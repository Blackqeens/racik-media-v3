import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { CreateServiceListingDto } from '../dto/create-service-listing.dto';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
export declare class ServiceListingService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    createListing(providerId: string, tenantId: string, dto: CreateServiceListingDto): Promise<any>;
    listActive(pagination: PaginationDto, filters?: {
        search?: string;
        category?: string;
    }): Promise<{
        data: {
            id: any;
            title: any;
            description: any;
            category: any;
            delivery_method: any;
            base_price: any;
            status: any;
            provider_id: any;
            location_area: any;
            created_at: any;
        }[];
        total: number;
    }>;
    getById(id: string): Promise<any>;
    approveListing(id: string, tenantId: string): Promise<void>;
}
