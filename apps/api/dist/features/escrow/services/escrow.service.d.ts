import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class EscrowService {
    private readonly supabase;
    private readonly eventBus;
    constructor(supabase: SupabaseClientService, eventBus: EventBusService);
    createContract(orderId: string, buyerId: string, sellerId: string, amount: number, channelType: string, tenantId: string): Promise<any>;
    lockFunds(escrowContractId: string, orderId: string, tenantId: string): Promise<void>;
    releaseToVendor(escrowContractId: string, orderId: string, tenantId: string): Promise<void>;
    disputeContract(escrowContractId: string, orderId: string, reasonCode: string, tenantId: string): Promise<void>;
    refundBuyer(escrowContractId: string, orderId: string, reasonCode: string, tenantId: string): Promise<void>;
    getByOrderId(orderId: string): Promise<any>;
    private writeEscrowEvent;
}
